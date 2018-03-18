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
  splitBalance: function (balances) {
    const res = {
      nativeBalance: 0,
      balances: [],
    };
    balances.forEach((detail) => {
      if (detail.asset_type === 'native') {
        res.nativeBalance = detail.balance;
      } else {
        res.balances.push(detail);
      }
    });
    return res;
  },
  /**
   * OrderBook
   * selling    <==>  base asset
   * buying     <==>  counter asset
   * bids       <==>  buy base, sell counter
   * asks       <==>  sell base, buy counter
   */
  getOrderBook: function (server, selling, buying) {
    const sellingAsset = selling.asset_code === 'XLM' ?
          StellarSdk.Asset.native() :
          new StellarSdk.Asset(selling.asset_code, selling.asset_issuer);
    const buyingAsset = buying.asset_code === 'XLM' ?
          StellarSdk.Asset.native() :
          new StellarSdk.Asset(buying.asset_code, buying.asset_issuer);
    return server.orderbook(sellingAsset, buyingAsset).call();
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
  getOffers: function (server, privateKey) {
    const keyPair = StellarSdk.Keypair.fromSecret(privateKey);
    return server.offers('accounts', keyPair.publicKey()).call();
  },
  makeOrder: function (orderType, server, store, account, privateKey, baseInfo, counterInfo, amount, price, cb, cbErr) {
    const skey = `${baseInfo.code}${baseInfo.issuer}_${counterInfo.code}${counterInfo.issuer}_${orderType}`;
    const offerLocks = store.getters.offerLocks; // get all offer lockStatus
    const lockStatus = offerLocks.filter(detail => detail.skey === skey); // find current pair lockStatus
    // store.commit('updateOrderLock', {skey, lock: false}); // this line is for testing.
    if ((lockStatus.length > 0 && lockStatus[0].lock === false) || lockStatus.length === 0) {
      // status is unlocked , so we can go on.
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
      // make order start
      const op = StellarSdk.Operation.manageOffer({
        selling: baseAsset,
        buying: counterAsset,
        amount: Number(amount).toFixed(7), // The total of selling amount
        price : Number(price).toFixed(7) // The exchange rate ratio (buying / selling)
      });
      const tx = new StellarSdk.TransactionBuilder(account)
                      .addOperation(op)
                      .build();
      tx.sign(StellarSdk.Keypair.fromSecret(privateKey));
      // lock it and send transaction
      store.commit('updateOrderLock', {skey, lock: true});
      server.submitTransaction(tx)
        .then(transactionResult => {
          window.Sconsole(['transactionResult', transactionResult]);
          // unlock when transaction created
          store.commit('updateOrderLock', {skey, lock: false});
          cb(transactionResult);
          return;
        }).catch(e => {
          cbErr(e);
          // unlock when transaction failed
          store.commit('updateOrderLock', {skey, lock: false});
        });
    } else {
      window.Sconsole(['make order lock status', lockStatus]);
    }
  },
  cancelOrder: function(server, account, privateKey, order, cb, cbErr) {
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
    // cancel an order
    const op = StellarSdk.Operation.manageOffer({
      selling: selling,
      buying: buying,
      amount: '0',
      price : Number(order.price).toFixed(7),
      offerId: order.id,
    });
    const tx = new StellarSdk.TransactionBuilder(account).addOperation(op).build();
    tx.sign(StellarSdk.Keypair.fromSecret(privateKey));
    server.submitTransaction(tx).then(function(transactionResult) {
      window.Sconsole(['cancel transaction result', transactionResult]);
      cb(transactionResult);
      return null;
    }).catch(e => cbErr(e));
  },
  findOrder: function (offers, pair, cb) {
    const bidOrders = offers.filter((detail) => {
      const buyingAsset = {
        code: detail.buying.asset_type === 'native' ? 'XLM' : detail.buying.asset_code,
        issuer: detail.buying.asset_type === 'native' ? null : detail.buying.asset_issuer,
      };
      const sellingAsset = {
        code: detail.selling.asset_type === 'native' ? 'XLM' : detail.selling.asset_code,
        issuer: detail.selling.asset_type === 'native' ? null : detail.selling.asset_issuer,
      };
      window.Sconsole(['findBidsOrder in findOrder api:', buyingAsset, sellingAsset]);
      if (pair.baseAsset === buyingAsset.code
        && pair.baseIssuer === buyingAsset.issuer
        && pair.counterAsset === sellingAsset.code
        && pair.counterIssuer === sellingAsset.issuer) {
        return true;
      }
      return false;
    });
    const askOrders = offers.filter((detail) => {
      const buyingAsset = {
        code: detail.buying.asset_type === 'native' ? 'XLM' : detail.buying.asset_code,
        issuer: detail.buying.asset_type === 'native' ? null : detail.buying.asset_issuer,
      };
      const sellingAsset = {
        code: detail.selling.asset_type === 'native' ? 'XLM' : detail.selling.asset_code,
        issuer: detail.selling.asset_type === 'native' ? null : detail.selling.asset_issuer,
      };
      window.Sconsole(['findAsksOrder in findOrder api:', buyingAsset, sellingAsset]);
      if (pair.baseAsset === sellingAsset.code
        && pair.baseIssuer === sellingAsset.issuer
        && pair.counterAsset === buyingAsset.code
        && pair.counterIssuer === buyingAsset.issuer) {
        return true;
      }
      return false;
    });
    return cb({bidOrders, askOrders});
  },
  getBaseAssetMax: function (store, pair) {
    if (pair.baseAsset === 'XLM') {
      return Number(store.getters.nativeMax);
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
  getAssetVal: function (store, pair, t) {
    if (t === 'base') {
      if (pair.baseAsset === 'XLM') {
        return Number(store.getters.nativeBalance);
      } else {
        const skey = `${pair.baseAsset}_${pair.baseIssuer}`;
        const res = store.getters.assetVals.filter(detail => detail.skey === skey);
        if (res.length > 0) {
          return Number(res[0].assetVal);
        } else {
          return 0;
        }
      }
    } else if (t === 'counter') {
      if (pair.counterAsset === 'XLM') {
        return store.getters.nativeBalance;
      } else {
        const skey = `${pair.counterAsset}_${pair.counterIssuer}`;
        const res = store.getters.assetVals.filter(detail => detail.skey === skey);
        if (res.length > 0) {
          return Number(res[0].assetVal);
        } else {
          return 0;
        }
      }
    }
  },
  getCurrentPrice: function (server, pair, t, cb, cbErr) {
    const selling = {asset_code: pair.baseAsset, asset_issuer: pair.baseIssuer};
    const buying = {asset_code: pair.counterAsset, asset_issuer: pair.counterIssuer};
    this.getOrderBook(server, selling, buying).then(res => {
      const bids = res.bids; // buy base asset
      const asks = res.asks; // sell base asset
      if (t === 'bids') {
        if (bids[0] !== undefined) {
          cb(Number(bids[0].price));
        } else {
          cb(null);
          window.Sconsole(['no_bids_order_in_getCurrentPrice']);
        }
      } else {
        if (asks[0] !== undefined) {
          cb(Number(asks[0].price));
        } else {
          cb(null);
          window.Sconsole(['no_asks_order_in_getCurrentPrice']);
        }
      }
      return null;
    }).catch(err => cbErr(err));
  },
  getAssetPrice: function (store, asset) {
    const skey = `${asset.code}_${asset.issuer}`;
    const tmp = store.getters.assetPrices.filter(detail => detail.skey === skey);
    return tmp;
  },
  getAssetBalance: function (store, asset) {
    if (asset.code !== 'XLM') {
      const balances = store.getters.balances;
      const balance = balances.filter(balance => {
        return balance.asset_code === asset.code && balance.asset_issuer === asset.issuer;
      });
      if (balance[0] !== undefined) {
        return Number(balance[0].balance);
      } else {
        return 0;
      }
    } else {
      return Number(store.getters.nativeBalance);
    }
  }
};
