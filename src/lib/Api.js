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
  getWalletInfo: (server, publicKey, cb, cbErr) => {
    const res = {
      nativeBalance: 0,
      balances: [],
    };
    try {
      server.loadAccount(publicKey).then(
        (account) => {
          account.balances.forEach((detail) => {
            if (detail.asset_type === 'native') {
              res.nativeBalance = detail.balance;
            } else {
              res.balances.push(detail);
            }
          });
          window.Sconsole(['api getWalletInfo', account]);
          cb(res);
        });
    } catch (err) {
      cbErr(err);
    }
  },
  getOrderBook: (server, selling, buying, cb, cbErr) => {
    const sellingAsset = selling.asset_code === 'XLM' ?
          new StellarSdk.Asset.native() :
          new StellarSdk.Asset(selling.asset_code, selling.asset_issuer);
    const buyingAsset = buying.asset_code === 'XLM' ?
          new StellarSdk.Asset.native() :
          new StellarSdk.Asset(buying.asset_code, buying.asset_issuer);
    server.orderbook(sellingAsset, buyingAsset)
      .call()
      .then(function(resp) { cb(resp); })
      .catch(function(err) { cbErr(err); });
  },
  removeTrustline: (server, code, issuer, cb, cbErr) => {
    const asset = StellarSdk.Asset(code, issuer);
    server.operations()
      .call()
      .then(function(resp) { cb(resp); })
      .catch(function(err) { cbErr(err); });
  },
};
