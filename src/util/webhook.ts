import fetch from 'node-fetch';
import { IStore } from '../models/Store';
import Logger from '../service/logger';

const log = new Logger();

interface WebhookData {
  sku: string;
  name: string;
  url: string;
  price: string;
  image: string;
  options: webhookOptions[];
}

interface webhookOptions {
  sku: string;
  name: string;
  inStock: boolean;
}

export const sendWebhook = async (data: WebhookData, store: IStore) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (process.env.webhook) {
        const formattedOptions = [];
        for (let index = 0; index < data.options.length; index++) {
          const option = data.options[index];
          formattedOptions.push(option.name);
        }
        const options = formattedOptions.join('\n');
        const embed = {
          username: process.env.avatarName ? process.env.avatarName : 'XMonitors',
          avatar_url: process.env.avatarURL
            ? process.env.avatarURL
            : 'https://cdn.discordapp.com/avatars/207152457036464130/ad8eb26fb33b4d451b492636187b8065.png?size=256',
          embeds: [
            {
              title: `[${store.region}] ${data.name}`,
              url: data.url,
              color: process.env.embedColor ? process.env.embedColor : '000000',
              fields: [
                {
                  name: '**SKU**',
                  value: data.sku,
                },
                {
                  name: '**Price**',
                  value: data.price.toString(),
                  inline: true,
                },
                {
                  name: '**Type**',
                  value: 'Restock',
                  inline: true,
                },
                {
                  name: 'Sizes',
                  value: options,
                },
                {
                  name: 'Useful links',
                  value: `[IT](https://www.zalando.it/catalogo/?q=${data.sku}) - [DE](https://www.zalando.de/damen/?q=${data.sku}) - [FR](https://www.zalando.fr/catalogue/?q=${data.sku}) - [AT](https://www.zalando.at/katalog/?q=${data.sku}) - [CZ](https://www.zalando.cz/katalog/?q=${data.sku}) - [NO](https://www.zalando.no/catalogo/?q=${data.sku})`,
                },
              ],
              thumbnail: {
                url: data.image,
              },
              footer: {
                text: process.env.footerText ? process.env.footerText : 'XMonitors Zaldno',
                icon_url: process.env.footerURL
                  ? process.env.footerURL
                  : 'https://cdn.discordapp.com/avatars/207152457036464130/ad8eb26fb33b4d451b492636187b8065.png?size=256',
              },
            },
          ],
        };
        await fetch(process.env.zalandoWebhook as string, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(embed),
        })
          .then((response) => {
            log.success('Send webhook for product ' + data.sku);
            resolve;
          })
          .catch((e) => {
            reject('Something went wrong sending the webhook');
          });
      }
    } catch (err) {
      reject(err);
    }
  });
};
