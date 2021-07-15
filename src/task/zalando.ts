import Logger from '../service/logger';
import { IStore } from '../models/Store';
import { IProduct, Product } from '../models/Product';
import { ProductOption } from '../models/ProductOption';
import { genSig } from '../util/request';
import { getRandomProxy } from '../util/proxy';
import { v4 as uuidv4 } from 'uuid';
import * as rp from 'request-promise-native';
import { setIntervalAsync } from 'set-interval-async/dynamic';
import { sendWebhook } from '../util/webhook';

const log = new Logger();

interface ZalandoTask {
  _product: string;
  _dbProduct: IProduct | null;
  _store: IStore;
  _startTime: Date;
  _proxies: string[];
  _errorCount: number;
  _monitoring: any | null;
}

interface webhookOptions {
  sku: string;
  name: string;
  inStock: boolean;
}

class ZalandoTask {
  constructor(product: string, store: IStore, proxies: string[]) {
    // init vars
    this._store = store;
    this._product = product;
    this._dbProduct = null;
    this._proxies = proxies;
    this._errorCount = 0;
    this._monitoring = null;
  }

  async fetchProduct() {
    return new Promise(async (resolve, reject) => {
      try {
        // Get random proxy
        const randProxy = getRandomProxy(this._proxies);
        // Set basic URL used to gen required sig/ts headers
        const url: string = `/api/mobile/v3/article/${this._product}.json`;
        // Get sig/ts headers
        const signatureHeaders: { sig: string; ts: number } = await genSig(url);
        // Set URL propery to gen host header later
        const storeURL = new URL(this._store.url);
        // Set headers for request
        const headers = {
          'x-sig': signatureHeaders.sig.toString(),
          'x-ts': signatureHeaders.ts.toString(),
          'x-uuid': uuidv4().toString(),
          'X-App-Domain': this._store.appDomain?.toString(),
          'User-Agent':
            'Zalando/4.69.2 (Linux; Android 7.1.2; ASUS_Z01QD/Asus-user 7.1.2 20171130.276299 release-keys)',
          'X-App-Version': '4.69.2',
          'X-Os-Version': '7.1.2',
          'X-Logged-In': true,
          'X-Zalando-Mobile-App': '1166c0792788b3f3a',
          'X-Device-Os': 'android',
          'X-Device-Platform': 'android',
          Host: storeURL.host,
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Accept-Encoding': 'gzip, defalte, br',
          'Accept-Language': '*',
          Connection: 'keep-alive',
        };
        // Set request options
        const options = {
          uri:
            this._store.url +
            `/api/mobile/v3/article/${this._product}.json?ts=${signatureHeaders.ts}&sig=${signatureHeaders.sig}`,
          headers: headers,
          secureProtocol: 'TLSv1_2_method',
          rejectUnauthorized: false,
          resolveWithFullResponse: true,
          gzip: true,
          json: true,
          proxy: randProxy !== null ? randProxy : undefined,
        };
        await rp
          .get(options)
          .then(async (response) => {
            // Verify product is correctly fetched
            if (response.statusCode === 200) {
              resolve(response.body);
            } else {
              reject(
                'Something went wrong fetch product ' +
                  this._product +
                  ' with status code' +
                  response.statusCode +
                  ' in region ' +
                  this._store.region
              );
            }
            log.success(`Fetched product ${this._product} in region ${this._store.region}`);
            resolve;
          })
          .catch(async (err) => {
            console.dir(err);
            reject(
              'Something went wrong fetch product ' +
                this._product +
                ' in region ' +
                this._store.region
            );
          });
      } catch (e) {
        reject(
          'Something went wrong fetch product ' + this._product + ' in region ' + this._store.region
        );
      }
    });
  }

  async init() {
    log.success(`Started task for ${this._product}`);
    try {
      // Get product from DB.
      const dbProduct = await Product.findOne({
        sku: this._product,
        storeId: this._store._id,
      }).populate('productOptions');
      // Fetch initial state of product from Zalando
      const prod: any = await this.fetchProduct();
      if (dbProduct === null) {
        // If there is no product in our DB, add it.
        const productData = {
          name: prod.label,
          sku: prod.sku,
          storeId: this._store._id,
          price: prod.price,
          image: prod.media_items[0] ? prod.media_items[0].thumb_url : null,
          url: prod.shareUrl,
        };
        const newProduct = new Product(productData);
        await newProduct.save();
        // Save all options of the product
        prod.simples.forEach(async (simple: any) => {
          const simpleData = {
            sku: simple.simpleSku,
            name: simple.size,
            store: this._store._id,
            product: newProduct._id,
            inStock: simple.availableQuantity > 0 ? true : false,
          };
          const newOption = new ProductOption(simpleData);
          await newOption.save();
          newProduct.productOptions.push(newOption);
        });
        await newProduct.save();
        // Set product globally in task for easy access
        this._dbProduct = newProduct;
      } else {
        // Set product globally in task for easy access
        this._dbProduct = dbProduct;
      }
      // Finally start monitor for this product.
      this.start();
    } catch (e) {
      this._errorCount++;
      log.error(e);
      if (this._errorCount < 5) {
        log.info(`Fetching product failed ${this._errorCount + 1} times. Retrying...`);
        setTimeout(() => {
          this.init();
        }, 1000 * this._errorCount);
      } else {
        log.error(
          'Fetching product failed more than 5 times. Stopping to prevent proxy bans or false products.'
        );
      }
    }
  }

  async monitorProduct() {
    return new Promise(async (resolve, reject) => {
      try {
        const prod: any = await this.fetchProduct();
        let options: webhookOptions[] = [];
        // Use for loop because its faster than forEach
        for (let index = 0; index < prod.simples.length; index++) {
          const productOption = prod.simples[index];
          const stockStatus = productOption.availableQuantity > 0 ? true : false;
          let dbOption = await ProductOption.findOne({
            sku: productOption.simpleSku,
            store: this._store._id,
          });
          if (dbOption !== null && dbOption.inStock !== stockStatus) {
            dbOption.inStock = stockStatus;
            if (stockStatus === true) {
              const optionData = {
                sku: dbOption.sku,
                name: dbOption.name,
                inStock: true,
              };
              options.push(optionData);
            }
            await dbOption.save();
          }
        }
        if (this._dbProduct !== null && options.length) {
          log.success(`Product ${this._dbProduct.sku} restocked!`);
          const webhookData = {
            sku: this._dbProduct.sku,
            name: this._dbProduct.name,
            url: this._dbProduct.url,
            price: this._dbProduct.price,
            image: this._dbProduct.image,
            options: options,
          };
          await sendWebhook(webhookData, this._store);
          resolve;
        } else {
          resolve;
        }
      } catch (e) {
        this._errorCount++;
        log.error(e);
        if (this._errorCount < 5) {
          log.info(`Fetching product failed ${this._errorCount} times. Retrying...`);
          setTimeout(() => {
            resolve;
          }, 1000 * this._errorCount);
        } else {
          log.error(
            'Fetching product failed more than 5 times. Retrying again in 5 minutes to prevent proxy bans or false products.'
          );
          this._monitoring = null;
          setTimeout(() => {
            this.start();
          }, 300000);
          resolve;
        }
      }
    });
  }

  async start() {
    this._errorCount = 0;
    log.info(`Started monitoring product ${this._product}`);
    // Check product every second. Lowering is possible, use good proxies.
    this._monitoring = setIntervalAsync(async () => {
      await this.monitorProduct();
    }, 1000);
  }
}

export default ZalandoTask;
