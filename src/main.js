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

const VERSION = '0.0.8';
const intervalTime = 5;
const robotIntervalTime = 20;
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
    serverTestUrl: 'https://horizon-testnet.stellar.org',
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
        Api.getWalletInfo(this.server, this.$store.getters.publicKey, (res) => {
          window.Sconsole(['getWalletInfo success', res]);
          this.$store.commit('updateBalances', res.balances);
          this.$store.commit('updateNativeBalance', res.nativeBalance);
          const allIssuers = [];
          if (res.balances.length > 0) {
            res.balances.forEach((val) => {
              allIssuers.push(val.asset_issuer);
            });
          }
          // update all issuers
          this.$store.commit('updateAllIssuers', allIssuers);
          // other actions must be after updating balance
          this.updateOrderbookPrice();
          this.updateOffers();
          // this.robot();
        }, (errRes) => {
          window.Sconsole(['update wallet info fail', errRes], 'msg');
        });
      }
    },
    updateOrderbookPrice() {
      window.Sconsole(['update orderbook and price']);
      // get balances from vuex store
      const balances = this.$store.getters.balances;
      if (balances.length >= 1) {
        balances.forEach((detail) => {
          const sellingAsset = { asset_code: detail.asset_code, asset_issuer: detail.asset_issuer };
          const buyingAsset = { asset_code: 'XLM' };
          Api.getOrderBook(this.server, sellingAsset, buyingAsset, (res) => {
            const skey = `${detail.asset_code}_${detail.asset_issuer}`;
            const bids = res.bids; // buy xlm from these orders
            const asks = res.asks; // sell xlm from these orders
            // update price for exchanging between ONE ASSET and XLM
            const exchangePrice = {
              skey,
              bidPrice: 0, // buy price
              askPrice: 0, // sell price
            };
            if (bids[0]) {
              exchangePrice.bidPrice = bids[0].price;
              // ONE ASSET 's value(XLM), sell XLM and get ONE ASSET
              this.$store.commit('updateExchangeVals', { skey, exchangeVal: window.fixNumCustom(detail.balance * bids[0].price) });
            }
            if (asks[0]) {
              exchangePrice.askPrice = asks[0].price;
            }
            this.$store.commit('updateExchangePrices', exchangePrice);
          }, (errRes) => {
            window.Sconsole(['updateOrderbookPrice fail', errRes], 'msg');
          });
        });
      }
    },
    updateOffers() {
      window.Sconsole(['updateOffers']);
      Api.getOffers(this.server, this.$store.getters.privateKey, (res) => {
        window.Sconsole(['updateOffers success', res]);
        this.$store.commit('updateOffers', res.records);
      }, (errRes) => {
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
        window.Sconsole(['there is no pair']);
        return false;
      }
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
        const baseExchangeVal = Api.getExchangeVal(this.$store, pair, 'base');
        const counterExchangeVal = Api.getExchangeVal(this.$store, pair, 'counter');
        window.Sconsole(['pair:', pair, baseInfo, counterInfo, baseAssetMax, counterAssetMax]);
        // To find whether this pair has orders
        Api.findOrder(this.$store.getters.offers, pair, (orders) => {
          window.Sconsole(['findOrdersResult:', orders]);
          // buyOrder
          if (orders.buyOrders.length === 0) {
            window.Sconsole([`${pair.baseAsset}/${pair.counterAsset} has no buy order`]);
            // max limit
            if (baseExchangeVal - baseAssetMax > 0) {
              window.Sconsole([`${pair.baseAsset} max limit`, baseExchangeVal, baseAssetMax]);
              // cancel all buy order
              orders.buyOrders.forEach((order) => {
                Api.cancelOrder(this.server, privateKey, order, (transResult) => {
                  window.Sconsole(['cancel all buy order result', transResult]);
                }, (errRes) => {
                  window.Sconsole(['cancel all buy order err', errRes, errRes.message], 'msg');
                });
              });
              return;
            }
            // make order
            Api.getCurrentPrice(this.server, pair, 'base', (buyPrice) => {
              const orderPrice = (1 / buyPrice) * (1 - (pair.baseRate / 100));
              let amount;
              let price;
              if (pair.baseAsset === 'XLM') {
                amount = pair.baseValue * orderPrice;
              } else {
                price = Api.getExchangePrice(this.$store, pair, 'base');
                if (price[0]) {
                  amount = pair.baseValue * (1 / price[0].bidPrice);
                } else {
                  amount = 0;
                }
              }
              window.Sconsole(['make buy order', orderPrice, pair, amount]);
              Api.makeOrder(
                'buy',
                this.server,
                this.$store,
                privateKey,
                baseInfo,
                counterInfo,
                amount, // selling amount
                (1 / orderPrice), // selling / buying
                (res) => {
                  window.Sconsole(['buy_order', res], 'msg');
                }, (err) => {
                  window.Sconsole(['buy_order_err', err], 'msg');
                });
            }, (err) => {
              window.Sconsole(['create_buy_order', err], 'msg');
            });
          } else {
            // make sure there is only one buy order
            let tmp;
            while (orders.buyOrders.length > 1) {
              tmp = orders.buyOrders.shift();
              Api.cancelOrder(this.server, privateKey, tmp, (transResult) => {
                window.Sconsole(['cancel buy order result', transResult]);
              }, (errRes) => {
                window.Sconsole(['cancel buy order err', errRes, errRes.message], 'msg');
              });
            }
            // check if the current order price is fitting
            Api.getCurrentPrice(this.server, pair, 'base', (buyPrice) => {
              // current order
              const currentOrder = orders.buyOrders[0];
              // new price
              const orderPrice = (1 / buyPrice) * (1 - (pair.baseRate / 100));
              if (
                Math.round(orderPrice, priceSensitivity)
                - Math.round((1 / currentOrder.price), priceSensitivity)
                > 0) {
                // cancel current order
                Api.cancelOrder(this.server, privateKey, currentOrder, (transResult) => {
                  window.Sconsole(['cancel buy order result', transResult]);
                }, (errRes) => {
                  window.Sconsole(['cancel buy order err', errRes, errRes.message], 'msg');
                });
              }
            }, (err) => {
              window.Sconsole(['cancel current order| get current price', err], 'msg');
            });
            window.Sconsole([`${pair.baseAsset} cancel orders`, orders.buyOrders]);
          }
          // sellOrder
          if (orders.sellOrders.length === 0) {
            // make order
            window.Sconsole([`${pair.baseAsset}/${pair.counterAsset} has no sell order`]);
            // max limit
            if (counterExchangeVal - counterAssetMax > 0) {
              window.Sconsole([`${pair.counterAsset} max limit`, counterExchangeVal, counterAssetMax]);
              // cancel all sell order
              orders.sellOrders.forEach((order) => {
                Api.cancelOrder(this.server, privateKey, order, (transResult) => {
                  window.Sconsole(['cancel all sell order result', transResult]);
                }, (errRes) => {
                  window.Sconsole(['cancel all sell order err', errRes, errRes.message], 'msg');
                });
              });
              return;
            }
            // make order
            Api.getCurrentPrice(this.server, pair, 'counter', (sellPrice) => {
              const orderPrice = sellPrice * (1 + (pair.baseRate / 100));
              let amount;
              let price;
              if (pair.counterAsset === 'XLM') {
                amount = pair.counterValue * orderPrice;
              } else {
                price = Api.getExchangePrice(this.$store, pair, 'counter');
                if (price[0]) {
                  amount = pair.counterValue;
                } else {
                  amount = 0;
                }
              }
              window.Sconsole(['make sell order', orderPrice, pair, amount, price]);
              Api.makeOrder(
                'sell',
                this.server,
                this.$store,
                privateKey,
                counterInfo,
                baseInfo,
                amount, // selling amount
                orderPrice, // selling / buying
                (res) => {
                  window.Sconsole(['sell_order', res], 'msg');
                }, (err) => {
                  window.Sconsole(['sell_order_err', err], 'msg');
                });
            }, (err) => {
              window.Sconsole(['create_buy_order', err], 'msg');
            });
          } else {
            // make sure there is only one sell order
            let tmp;
            while (orders.sellOrders.length > 1) {
              tmp = orders.sellOrders.shift();
              Api.cancelOrder(this.server, privateKey, tmp, (transResult) => {
                window.Sconsole(['cancel buy order result', transResult]);
              }, (errRes) => {
                window.Sconsole(['cancel buy order err', errRes, errRes.message], 'msg');
              });
            }
            // check if the current order price is fitting
            Api.getCurrentPrice(this.server, pair, 'counter', (sellPrice) => {
              // current order
              const currentOrder = orders.sellOrders[0];
              // new price
              const orderPrice = sellPrice * (1 + (pair.baseRate / 100));
              if (
                Math.round(orderPrice, priceSensitivity)
                - Math.round(currentOrder.price, priceSensitivity)
                < 0) {
                // cancel current order
                Api.cancelOrder(this.server, privateKey, currentOrder, (transResult) => {
                  window.Sconsole(['cancel sell order result', transResult]);
                }, (errRes) => {
                  window.Sconsole(['cancel sell order err', errRes, errRes.message], 'msg');
                });
              }
            }, (err) => {
              window.Sconsole(['cancel current order| get current price', err], 'msg');
            });
            window.Sconsole([`${pair.baseAsset} cancel orders`, orders.sellOrders]);
          }
        });
      });
      return false;
    },
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
    this.robotInterval = setInterval(() => {
      this.robot();
    }, robotIntervalTime * 1000);
    this.$store.commit('intervalTime', intervalTime);
  },
});
