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
  addTrustline: (server, privateKey, code, issuer, cb, cbErr) => {
    const asset = new StellarSdk.Asset(code, issuer);
    const keyPair = StellarSdk.Keypair.fromSecret(privateKey);
    try {
      server.loadAccount(keyPair.publicKey())
      .then(
        (account) => {
          const transaction = new StellarSdk.TransactionBuilder(account)
              .addOperation(StellarSdk.Operation.changeTrust({ asset }))
              .build();
          transaction.sign(keyPair);
          return transaction;
        })
      .then((transaction) => {
        server.submitTransaction(transaction)
            .then(function (transactionResult) {
                cb(transactionResult);
            })
            .catch(function (err) {
                cbErr(err);
            });
      });
    } catch (err) {
      cbErr(err);
    }
  },
  removeTrustline: (server, privateKey, code, issuer, cb, cbErr) => {
    const asset = new StellarSdk.Asset(code, issuer);
    const keyPair = StellarSdk.Keypair.fromSecret(privateKey);
    try {
      server.loadAccount(keyPair.publicKey())
      .then(
        (account) => {
          const transaction = new StellarSdk.TransactionBuilder(account)
              .addOperation(StellarSdk.Operation.changeTrust({ asset, limit: '0'}))
              .build();
          transaction.sign(keyPair);
          return transaction;
        })
      .then((transaction) => {
        server.submitTransaction(transaction)
            .then(function (transactionResult) {
                cb(transactionResult);
            })
            .catch(function (err) {
                cbErr(err);
            });
      });
    } catch (err) {
      cbErr(err);
    }
  },
};
