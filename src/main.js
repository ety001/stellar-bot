// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import StellarSdk from 'stellar-sdk';
import VueMaterial from 'vue-material';
import 'vue-material/dist/vue-material.css';
import vuexI18n from 'vuex-i18n';
import App from './App';
import router from './router';
import store from './store';
import transEn from './i18n/en.json';
import transZhCn from './i18n/zh-CN.json';
import Api from './lib/Api';

const VERSION = '0.0.10';
const intervalTime = 5;
// const robotIntervalTime = 20;
const priceSensitivity = 4;

window.progress = 0;
// Debug
window.debugStellarBot = !(process.env.NODE_ENV === 'production');
window.Sconsole = (resultArrOrStr, msgType = 'debug') => {
  if (msgType === 'msg'
    || (msgType === 'debug' && window.debugStellarBot === true)) {
    console.log(resultArrOrStr);
  }
};

// Global Func
window.fixNumCustom = (number, fixed = 7) => Number(number).toFixed(fixed);

// init VueMaterial
Vue.use(VueMaterial);
Vue.material.registerTheme('default', {
  primary: 'teal',
  accent: 'red',
  warn: 'orange',
});

// to config I18n
Vue.use(vuexI18n.plugin, store);
// add translations directly to the application
Vue.i18n.add('en', transEn);
Vue.i18n.add('zh-CN', transZhCn);
// set the start locale
if (store.getters.lang) {
  Vue.i18n.set(store.getters.lang);
} else {
  Vue.i18n.set('en');
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  data: {
    version: VERSION,
    serverUrl: 'https://horizon.stellar.org',
    server: null,
    robotInterval: null,
  },
  router,
  store,
  template: '<App :version="version"/>',
  components: { App },
  methods: {
    intervalFunc() {
      window.Sconsole('run interval func');
      // update wallet information
      this.updateBalances();
    },
    updateBalances() {
      window.Sconsole(['update wallet info']);
      if (this.$store.getters.publicKey) {
        // loadAccount
        this.server.loadAccount(this.$store.getters.publicKey)
          .then((account) => {
            const balanceRes = Api.splitBalance(account.balances);
            window.Sconsole(['splitBalance success', balanceRes]);
            this.$store.commit('updateBalances', balanceRes.balances); // except XLM balance
            this.$store.commit('updateNativeBalance', balanceRes.nativeBalance); // XLM balance
            // update all issuers
            const allIssuers = [];
            if (balanceRes.balances.length > 0) {
              balanceRes.balances.forEach((val) => {
                allIssuers.push(val.asset_issuer);
              });
            }
            this.$store.commit('updateAllIssuers', allIssuers);
            return null;
          }).then(() => {
            // running other actions must be after updating balance
            this.updatePrice();
            this.updateOffers();
            this.robot();
            return null;
          }).catch(e => window.Sconsole(['update account info fail', e], 'msg'));
      }
    },
    updatePrice() {
      window.Sconsole(['update price']);
      // get balances from store
      const balances = this.$store.getters.balances;
      window.Sconsole(['get balances in updatePrice', balances]);
      if (balances.length >= 1) {
        balances.forEach((detail) => {
          // base
          const sellingAsset = {
            asset_code: detail.asset_code,
            asset_issuer: detail.asset_issuer,
          };
          // counter
          const buyingAsset = { asset_code: 'XLM' };
          // get orderbook
          Api.getOrderBook(this.server, sellingAsset, buyingAsset)
            .then((res) => {
              const skey = `${detail.asset_code}_${detail.asset_issuer}`; // format: asset_issuer
              const bids = res.bids; // buy base, sell counter
              const asks = res.asks; // sell base, buy counter
              // update price for exchanging between ONE ASSET and XLM
              const assetPrice = {
                skey,
                bidPrice: 0, // buy base price
                askPrice: 0, // sell base price
              };
              if (bids[0]) {
                assetPrice.bidPrice = bids[0].price;
                // FOO ASSET 's value(XLM) -- sell XLM and get FOO ASSET
                this.$store.commit(
                  'updateAssetVals',
                  {
                    skey,
                    assetVal: window.fixNumCustom(detail.balance * bids[0].price),
                  },
                );
              }
              if (asks[0]) {
                assetPrice.askPrice = asks[0].price;
              }
              // update feed price (FOO/XLM)
              this.$store.commit('updateAssetPrices', assetPrice);
              return null;
            })
            .catch(
              (errRes) => {
                window.Sconsole(['updatePrice fail', errRes], 'msg');
              });
        });
      }
    },
    updateOffers() {
      window.Sconsole(['updateOffers start']);
      Api.getOffers(this.server, this.$store.getters.privateKey).then((res) => {
        window.Sconsole(['updateOffers success', res]);
        this.$store.commit('updateOffers', res.records);
        return null;
      }).catch((errRes) => {
        window.Sconsole(['updateOffers fail', errRes], 'msg');
      });
    },
    robot() {
      if (this.$store.getters.robotStatus === false) {
        return false;
      }
      window.Sconsole(['get in robot']);
      const privateKey = this.$store.getters.privateKey;
      const allPairs = this.$store.getters.exchangePairs;
      if (allPairs.length === 0) {
        window.Sconsole(['there is no exchange pair']);
        return false;
      }
      // loadAccount
      this.server.loadAccount(this.$store.getters.publicKey)
        .then((account) => {
          allPairs.forEach((pair) => {
            const baseInfo = {
              code: pair.baseAsset,
              issuer: pair.baseIssuer,
            };
            const counterInfo = {
              code: pair.counterAsset,
              issuer: pair.counterIssuer,
            };
            const baseAssetMax = Api.getBaseAssetMax(this.$store, pair);
            const counterAssetMax = Api.getCounterAssetMax(this.$store, pair);
            const baseAssetBalance = Api.getAssetBalance(this.$store, baseInfo);
            const counterAssetBalance = Api.getAssetBalance(this.$store, counterInfo);
            const baseAssetVal = Api.getAssetVal(this.$store, pair, 'base');
            const counterAssetVal = Api.getAssetVal(this.$store, pair, 'counter');
            window.Sconsole(['pair:', pair, baseAssetMax, counterAssetMax, baseAssetVal, counterAssetVal]);
            // To find whether this pair has orders
            Api.findOrder(this.$store.getters.offers, pair, (orders) => {
              window.Sconsole(['findOrdersResult:', orders]);
              // buy base asset
              if (orders.bidOrders.length === 0) {
                window.Sconsole([`${pair.baseAsset}/${pair.counterAsset} has no buying-base-asset order`]);
                // asset MAX limit
                if (baseAssetVal - baseAssetMax > 0) {
                  window.Sconsole([`${pair.baseAsset} is top to MAX limit.`, baseAssetVal, baseAssetMax], 'msg');
                  // cancel all bids order
                  orders.bidOrders.forEach((order) => {
                    Api.cancelOrder(this.server, account, privateKey, order, (transResult) => {
                      window.Sconsole(['cancel all bids order result', transResult]);
                    }, (errRes) => {
                      window.Sconsole(['cancel all bids order err', errRes, errRes.message], 'msg');
                    });
                  });
                } else {
                  // add bid order, (Buying base asset and selling counter asset.)
                  Api.getCurrentPrice(this.server, pair, 'bids', (bidPrice) => {
                    if (bidPrice !== null) {
                      const orderPrice = bidPrice * (1 - (pair.baseRate / 100));
                      let amount; // selling counter amount
                      let feedPrice = [];
                      if (pair.baseAsset === 'XLM') {
                        feedPrice[0] = { bidPrice: 1, askPrice: 1 };
                      } else {
                        feedPrice = Api.getAssetPrice(
                          this.$store,
                          {
                            code: pair.baseAsset,
                            issuer: pair.baseIssuer,
                          });
                      }
                      if (feedPrice[0] !== undefined) {
                        // (1/orderPrice)*counter_amount*feedPrice.askPrice=pair.baseValue
                        amount = (pair.baseValue / feedPrice[0].askPrice) * orderPrice;
                      } else {
                        amount = 0;
                      }

                      if (amount === 0) {
                        window.Sconsole([
                          `make buy ${pair.baseAsset}/${pair.counterAsset} order failed, there is no feed price`,
                          orderPrice,
                          pair,
                          amount,
                          feedPrice], 'msg');
                      } else if (amount > counterAssetBalance) {
                        window.Sconsole([
                          `make buy ${pair.baseAsset}/${pair.counterAsset} order,
                          counter asset balance is not enough for the order.`,
                          pair,
                          amount,
                          baseAssetVal], 'msg');
                      } else {
                        window.Sconsole([`make buy ${pair.baseAsset}/${pair.counterAsset} order`, orderPrice, pair, amount]);
                        Api.makeOrder(
                          'buy',
                          this.server,
                          this.$store,
                          account,
                          privateKey,
                          counterInfo, // selling
                          baseInfo, // buying
                          amount, // selling amount
                          (1 / orderPrice), // buying / selling
                          (res) => {
                            window.Sconsole(['buy_order', res], 'msg');
                          }, (err) => {
                            window.Sconsole(['buy_order_err', err], 'msg');
                          });
                      }
                    }
                  }, (err) => {
                    window.Sconsole(['create_buy_order', err], 'msg');
                  });
                }
              } else {
                // make sure there is only one buy order
                let tmp;
                while (orders.bidOrders.length > 1) {
                  tmp = orders.bidOrders.shift();
                  Api.cancelOrder(this.server, account, privateKey, tmp, (transResult) => {
                    window.Sconsole(['cancel buy order result', transResult]);
                  }, (errRes) => {
                    window.Sconsole(['cancel buy order err', errRes, errRes.message], 'msg');
                  });
                }
                // check if the current order price is fitting
                Api.getCurrentPrice(this.server, pair, 'bids', (bidPrice) => {
                  if (bidPrice !== null) {
                    window.Sconsole([
                      'check if the currentOrder price is fitting',
                      orders,
                      bidPrice]);
                    // current order
                    const currentOrder = orders.bidOrders[0];
                    // new price
                    const orderPrice = bidPrice * (1 - (pair.baseRate / 100));
                    if (
                      Number(orderPrice).toFixed(priceSensitivity)
                      - Number(1 / Number(currentOrder.price)).toFixed(priceSensitivity)
                      > 0) {
                      // cancel current order
                      Api.cancelOrder(
                        this.server,
                        account,
                        privateKey,
                        currentOrder,
                        (transResult) => {
                          window.Sconsole(['cancel buy base order result', transResult], 'msg');
                        }, (errRes) => {
                          window.Sconsole(['cancel buy base order err', errRes, errRes.message], 'msg');
                        });
                    }
                  }
                }, (err) => {
                  window.Sconsole([`buy ${pair.baseAsset} order cancel error`, err], 'msg');
                });
              }
              // ========
              // askOrder
              if (orders.askOrders.length === 0) {
                // make order
                window.Sconsole([`${pair.baseAsset}/${pair.counterAsset} has no selling-base-asset`]);
                // asset MAX limit
                if (counterAssetVal - counterAssetMax > 0) {
                  window.Sconsole([
                    `${pair.counterAsset} is top to Max limit`,
                    counterAssetVal,
                    counterAssetMax], 'msg');
                  // cancel all sell order
                  orders.askOrders.forEach((order) => {
                    Api.cancelOrder(this.server, account, privateKey, order, (transResult) => {
                      window.Sconsole(['cancel all sell base asset order result', transResult]);
                    }, (errRes) => {
                      window.Sconsole(['cancel all sell base asset order err', errRes, errRes.message], 'msg');
                    });
                  });
                } else {
                  // make order
                  Api.getCurrentPrice(this.server, pair, 'asks', (askPrice) => {
                    if (askPrice !== null) {
                      const orderPrice = askPrice * (1 + (pair.counterRate / 100));
                      let amount; // selling base asset amount
                      let feedPrice = [];
                      if (pair.counterAsset === 'XLM') {
                        feedPrice[0] = { bidPrice: 1, askPrice: 1 };
                      } else {
                        feedPrice = Api.getAssetPrice(
                          this.$store,
                          {
                            code: pair.counterAsset,
                            issuer: pair.counterIssuer,
                          });
                      }
                      if (feedPrice[0] !== undefined) {
                        // orderPrice*base_amount*feedPrice.bidPrice=pair.counterValue
                        amount = (pair.counterValue / feedPrice[0].bidPrice) / orderPrice;
                      } else {
                        amount = 0;
                      }

                      if (amount === 0) {
                        window.Sconsole([
                          'make sell base asset order faild, there is no feed price',
                          orderPrice,
                          pair,
                          amount,
                          feedPrice], 'msg');
                      } else if (amount > baseAssetBalance) {
                        window.Sconsole([
                          'make sell base asset order failed, base asset balance is not enough for the order.',
                          pair,
                          amount,
                          baseAssetBalance], 'msg');
                      } else {
                        window.Sconsole(['make sell order', orderPrice, pair, amount, feedPrice]);
                        Api.makeOrder(
                          'sell',
                          this.server,
                          this.$store,
                          account,
                          privateKey,
                          baseInfo,
                          counterInfo,
                          amount, // selling amount
                          orderPrice, // buying / selling
                          (res) => {
                            window.Sconsole(['sell_order', res], 'msg');
                          }, (err) => {
                            window.Sconsole(['sell_order_err', err], 'msg');
                          });
                      }
                    }
                  }, (err) => {
                    window.Sconsole(['create_sell_order|current_price', err], 'msg');
                  });
                }
              } else {
                // make sure there is only one sell order
                let tmp;
                while (orders.askOrders.length > 1) {
                  tmp = orders.askOrders.shift();
                  Api.cancelOrder(this.server, account, privateKey, tmp, (transResult) => {
                    window.Sconsole([`cancel sell ${pair.baseAsset} order result`, transResult]);
                  }, (errRes) => {
                    window.Sconsole([`cancel sell ${pair.baseAsset} order err`, errRes, errRes.message], 'msg');
                  });
                }
                // check if the current order price is fitting
                Api.getCurrentPrice(this.server, pair, 'asks', (askPrice) => {
                  if (askPrice !== null) {
                    window.Sconsole([
                      'check if the currentOrder price is fitting',
                      orders,
                      askPrice]);
                    // current order
                    const currentOrder = orders.askOrders[0];
                    // new price
                    const orderPrice = askPrice * (1 + (pair.baseRate / 100));
                    if (
                      Number(orderPrice).toFixed(priceSensitivity)
                      - Number(currentOrder.price).toFixed(priceSensitivity)
                      < 0) {
                      // cancel current order
                      Api.cancelOrder(
                        this.server,
                        account,
                        privateKey,
                        currentOrder,
                        (transResult) => {
                          window.Sconsole([`cancel sell ${pair.baseAsset} order result`, transResult]);
                        }, (errRes) => {
                          window.Sconsole([`cancel sell ${pair.baseAsset} order err`, errRes, errRes.message], 'msg');
                        });
                    }
                  }
                }, (err) => {
                  window.Sconsole([`sell ${pair.baseAsset} order cancel error`, err], 'msg');
                });
              }
            });
          });
          return null;
        }).catch(e => window.Sconsole(['load account info fail', e], 'msg'));
      return null;
    }, // robot end
  },
  mounted() {
    this.$store.commit('updateRobotStatus', false);
    window.Sconsole(`version: ${VERSION}`, 'msg');
    // connect server
    this.server = new StellarSdk.Server(this.serverUrl);
    window.server = this.server;
    StellarSdk.Network.usePublicNetwork();
    // interval function
    this.intervalFunc();
    this.interval = setInterval(() => {
      this.intervalFunc();
    }, intervalTime * 1000);
    // this.robotInterval = setInterval(() => {
    //   this.robot();
    // }, robotIntervalTime * 1000);
    this.$store.commit('intervalTime', intervalTime);
  },
});
