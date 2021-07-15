import crypto from 'crypto';

interface Sig {
  sig: string;
  ts: number;
}

export const genSig = async (url: string): Promise<Sig> => {
  return new Promise(async (resolve, reject) => {
    try {
      let b: string = '9bde64a09e825d35a4128c813a05b5eff24b6ab6';
      let ts: number = Date.now();

      let plainString = url + b + ts;
      let hashedString = await sha1(plainString);
      resolve({
        sig: hashedString,
        ts: ts,
      });
    } catch (err) {
      reject(err);
    }
  });
};

async function sha1(data: string) {
  const hashed: string = crypto.createHash('sha1').update(data).digest('hex');
  return hashed;
}
