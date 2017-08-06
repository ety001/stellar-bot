import StellarSdk from 'stellar-sdk';

export default {
  generateKeypair: (privateKey, cb, cbErr) => {
    let res = null;
    try {
      res = StellarSdk.Keypair.fromSecret(privateKey);
    } catch (err) {
      cbErr(err);
    }
    if (res) {
      cb(res);
    }
  },
};
