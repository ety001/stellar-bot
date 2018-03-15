import StellarSdk from 'stellar-sdk';

export default {
  generateKeypair: function (privateKey, cb, cbErr) {
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
  getWalletInfo: function (server, publicKey, cb, cbErr) {
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
  getOrderBook: function (server, selling, buying, cb, cbErr) {
    const sellingAsset = selling.asset_code === 'XLM' ?
          new StellarSdk.Asset.native() :
          new StellarSdk.Asset(selling.asset_code, selling.asset_issuer);
    const buyingAsset = buying.asset_code === 'XLM' ?
          new StellarSdk.Asset.native() :
          new StellarSdk.Asset(buying.asset_code, buying.asset_issuer);
    server.orderbook(sellingAsset, buyingAsset)
      .call()
      .then(function(resp) { cb(resp); return; })
      .catch(function(err) { cbErr(err); });
  },
  addTrustline: function (server, privateKey, code, issuer, cb, cbErr) {
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
                return;
            })
            .catch(function (err) {
                cbErr(err);
            });
      });
    } catch (err) {
      cbErr(err);
    }
  },
  removeTrustline: function (server, privateKey, code, issuer, cb, cbErr) {
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
                return;
            })
            .catch(function (err) {
                cbErr(err);
            });
      });
    } catch (err) {
      cbErr(err);
    }
  },
  getOffers: function (server, privateKey, cb, cbErr) {
    const keyPair = StellarSdk.Keypair.fromSecret(privateKey);
    try {
      server.offers('accounts', keyPair.publicKey())
      .call()
      .then((offerResult) => {
        cb(offerResult);
        return;
      });
    } catch (err) {
      cbErr(err);
    }
  },
  makeOrder: function (orderType, server, store, privateKey, baseInfo, counterInfo, amount, price, cb, cbErr) {
    const skey = `${baseInfo.code}${baseInfo.issuer}_${counterInfo.code}${counterInfo.issuer}_${orderType}`;
    const offerLocks = store.getters.offerLocks;
    const lockStatus = offerLocks.filter(detail => detail.skey === skey);
    store.commit('updateOrderLock', {skey, lock: false});
    if ((lockStatus.length > 0 && lockStatus[0].lock === false) || lockStatus.length === 0) {
      // unlocked , so can go on.
      const keyPair = StellarSdk.Keypair.fromSecret(privateKey);
      let baseAsset, counterAsset;
      if (baseInfo.code === 'XLM') {
        baseAsset = StellarSdk.Asset.native();
      } else {
        baseAsset = new StellarSdk.Asset(baseInfo.code, baseInfo.issuer);
      }
      if (counterInfo.code === 'XLM') {
        counterAsset = StellarSdk.Asset.native();
      } else {
        counterAsset = new StellarSdk.Asset(counterInfo.code, counterInfo.issuer);
      }
      server.loadAccount(keyPair.publicKey())
        .then(function(account) {
          const op = StellarSdk.Operation.manageOffer({
            buying: baseAsset,
            selling: counterAsset,
            amount: Number(amount).toFixed(7), // The total amount you're selling
            price : Number(price).toFixed(7) // The exchange rate ratio (selling / buying)
          })
          const tx = new StellarSdk.TransactionBuilder(account).addOperation(op).build();
          tx.sign(keyPair);
          // lock
          store.commit('updateOrderLock', {skey, lock: true});
          return server.submitTransaction(tx);
        }).then(function(transactionResult) {
          window.Sconsole(['transactionResult', transactionResult]);
          // unlock
          store.commit('updateOrderLock', {skey, lock: false});
          return;
        }).catch(function(e) {
          // unlock
          store.commit('updateOrderLock', {skey, lock: false});
          cbErr(e);
        });
    } else {
      window.Sconsole(['lock', lockStatus]);
    }
  },
  cancelOrder: function(server, privateKey, order, cb, cbErr) {
    const keyPair = StellarSdk.Keypair.fromSecret(privateKey);
    let buying, selling;
    if (order.buying.asset_type === 'native') {
      buying = StellarSdk.Asset.native();
    } else {
      buying = new StellarSdk.Asset(order.buying.asset_code, order.buying.asset_issuer);
    }
    if (order.selling.asset_type === 'native') {
      selling = StellarSdk.Asset.native();
    } else {
      selling = new StellarSdk.Asset(order.selling.asset_code, order.selling.asset_issuer);
    }
    server.loadAccount(keyPair.publicKey())
      .then((account) => {
        const op = StellarSdk.Operation.manageOffer({
          selling: selling,
          buying: buying,
          amount: '0',
          price : Number(order.price).toFixed(7),
          offerId: order.id,
        });
        const tx = new StellarSdk.TransactionBuilder(account).addOperation(op).build();
        tx.sign(keyPair);
        return server.submitTransaction(tx);
      }).then(function(transactionResult) {
        window.Sconsole(['cancel transaction result', transactionResult]);
        cb(transactionResult);
        return;
      }).catch(function(e) {
        cbErr(e);
      });
  },
  findOrder: function (offers, pair, cb) {
    const buyOrders = offers.filter((detail) => {
      const buyingAsset = {
        code: detail.buying.asset_type === 'native' ? 'XLM' : detail.buying.asset_code,
        issuer: detail.buying.asset_type === 'native' ? null : detail.buying.asset_issuer,
      };
      const sellingAsset = {
        code: detail.selling.asset_type === 'native' ? 'XLM' : detail.selling.asset_code,
        issuer: detail.selling.asset_type === 'native' ? null : detail.selling.asset_issuer,
      };
      window.Sconsole(['findBuyOrder:', buyingAsset, sellingAsset]);
      if (pair.baseAsset === buyingAsset.code
        && pair.baseIssuer === buyingAsset.issuer
        && pair.counterAsset === sellingAsset.code
        && pair.counterIssuer === sellingAsset.issuer) {
        return true;
      }
      return false;
    });
    const sellOrders = offers.filter((detail) => {
      const buyingAsset = {
        code: detail.selling.asset_type === 'native' ? 'XLM' : detail.selling.asset_code,
        issuer: detail.selling.asset_type === 'native' ? null : detail.selling.asset_issuer,
      };
      const sellingAsset = {
        code: detail.buying.asset_type === 'native' ? 'XLM' : detail.buying.asset_code,
        issuer: detail.buying.asset_type === 'native' ? null : detail.buying.asset_issuer,
      };
      window.Sconsole(['findSellOrder:', buyingAsset, sellingAsset]);
      if (pair.baseAsset === buyingAsset.code
        && pair.baseIssuer === buyingAsset.issuer
        && pair.counterAsset === sellingAsset.code
        && pair.counterIssuer === sellingAsset.issuer) {
        return true;
      }
      return false;
    });
    return cb({buyOrders, sellOrders});
  },
  getBaseAssetMax: function (store, pair) {
    if (pair.baseAsset === 'XLM') {
      return store.getters.nativeMax;
    } else {
      const skey = `${pair.baseAsset}_${pair.baseIssuer}`;
      const tmp = store.getters.maxes.filter(detail => detail.skey === skey);
      if (tmp.length > 0) {
        return Number(tmp[0].max);
      } else {
        return 0;
      }
    }
  },
  getCounterAssetMax: function (store, pair) {
    if (pair.counterAsset === 'XLM') {
      return store.getters.nativeMax;
    } else {
      const skey = `${pair.counterAsset}_${pair.counterIssuer}`;
      const tmp = store.getters.maxes.filter(detail => detail.skey === skey);
      if (tmp.length > 0) {
        return Number(tmp[0].max);
      } else {
        return 0;
      }
    }
  },
  getBalance: function (store, pair, t) {
    if (t === 'base') {
      if (pair.baseAsset === 'XLM') {
        return store.getters.nativeBalance;
      } else {
        const res = store.getters.balances.filter((detail) => {
          return detail.asset_code === pair.baseAsset && detail.asset_issuer === pair.baseIssuer;
        });
        if (res.length > 0) {
          return res[0].balance;
        } else {
          return 0;
        }
      }
    } else if (t === 'counter') {
      if (pair.counterAsset === 'XLM') {
        return store.getters.nativeBalance;
      } else {
        const res = store.getters.balances.filter((detail) => {
          return detail.asset_code === pair.counterAsset && detail.asset_issuer === pair.counterIssuer;
        });
        if (res.length > 0) {
          return res[0].balance;
        } else {
          return 0;
        }
      }
    }
  },
  getExchangeVal: function (store, pair, t) {
    if (t === 'base') {
      if (pair.baseAsset === 'XLM') {
        return store.getters.nativeBalance;
      } else {
        const skey = `${pair.baseAsset}_${pair.baseIssuer}`;
        const res = store.getters.exchangeVals.filter(detail => detail.skey === skey);
        if (res.length > 0) {
          return Number(res[0].exchangeVal);
        } else {
          return 0;
        }
      }
    } else if (t === 'counter') {
      if (pair.counterAsset === 'XLM') {
        return store.getters.nativeBalance;
      } else {
        const skey = `${pair.counterAsset}_${pair.counterIssuer}`;
        const res = store.getters.exchangeVals.filter(detail => detail.skey === skey);
        if (res.length > 0) {
          return Number(res[0].exchangeVal);
        } else {
          return 0;
        }
      }
    }
  },
  getCurrentPrice: function (server, pair, t, cb, cbErr) {
    let buying, selling;
    if (t === 'base') {
      buying = {asset_code: pair.baseAsset, asset_issuer: pair.baseIssuer};
      selling = {asset_code: pair.counterAsset, asset_issuer: pair.counterIssuer};
    } else {
      selling = {asset_code: pair.baseAsset, asset_issuer: pair.baseIssuer};
      buying = {asset_code: pair.counterAsset, asset_issuer: pair.counterIssuer};
    }
    this.getOrderBook(server, selling, buying, (res) => {
      const bids = res.bids; // buy 'buying' from these orders
      const asks = res.asks; // sell 'buying' from these orders
      if (t === 'base') {
        if (asks[0]) {
          cb(asks[0].price);
        } else {
          window.Sconsole(['no_asks_order_in_getCurrentPrice']);
        }
      } else {
        if (bids[0]) {
          cb(bids[0].price);
        } else {
          window.Sconsole(['no_bids_order_in_getCurrentPrice']);
        }
      }
    }, (err) => {
      cbErr(err);
    });
  },
  getExchangePrice: function (store, pair, t) {
    let skey;
    if (t === 'base') {
      skey = `${pair.baseAsset}_${pair.baseIssuer}`;
    } else {
      skey = `${pair.counterAsset}_${pair.counterIssuer}`;
    }
    const tmp = store.getters.exchangePrices.filter(detail => detail.skey === skey);
    return tmp;
  },
};
