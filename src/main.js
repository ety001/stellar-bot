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

const VERSION = '0.0.5';
const intervalTime = 20;

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
window.fixNumCustom = (number, fixed = 6) => Number(number).toFixed(fixed);

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
          this.$store.commit('updateAllIssuers', allIssuers);
          // other Actions
          this.updateOrderbookPrice();
          this.updateOffers();
        }, (errRes) => {
          window.Sconsole(['update wallet info fail', errRes]);
        });
      }
    },
    updateOrderbookPrice() {
      window.Sconsole(['update orderbook and price']);
      // get balances from vuex store
      const balances = this.$store.getters.balances;
      if (balances.length > 1) {
        balances.forEach((detail) => {
          const sellingAsset = { asset_code: detail.asset_code, asset_issuer: detail.asset_issuer };
          const buyingAsset = { asset_code: 'XLM' };
          Api.getOrderBook(this.server, sellingAsset, buyingAsset, (res) => {
            const skey = `${detail.asset_code}_${detail.asset_issuer}`;
            // this.$store.commit('updateOrderBook', { skey, orderBook: res });
            const bids = res.bids; // buy xlm from these orders
            const asks = res.asks; // sell xlm from these orders
            const exchangePrice = {
              skey,
              bidPrice: 0,
              askPrice: 0,
            };
            if (bids[0]) {
              exchangePrice.bidPrice = bids[0].price;
            }
            if (asks[0]) {
              this.$store.commit('updateExchangeVals', { skey, exchangeVal: window.fixNumCustom(detail.balance * asks[0].price) });
              exchangePrice.askPrice = asks[0].price;
            }
            this.$store.commit('updateExchangePrices', exchangePrice);
          }, (errRes) => {
            window.Sconsole(['updateOrderbookPrice fail', errRes]);
          });
        });
      }
    },
    updateOffers() {
      window.Sconsole(['updateOffers']);
      Api.getOffers(this.server, this.$store.getters.privateKey, (res) => {
        window.Sconsole(['updateOffers success', res]);
        this.$store.commit('updateOffers', res.records);
        this.robot();
      }, (errRes) => {
        window.Sconsole(['updateOffers fail', errRes]);
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
        window.Sconsole(['pair:', privateKey, pair, baseInfo, counterInfo, baseAssetMax, counterAssetMax]);
        // To find whether this pair has orders
        Api.findOrder(this.$store.getters.offers, pair, (orders) => {
          window.Sconsole(['findOrdersResult:', orders]);
          // buyOrder
          if (orders.buyOrders.length === 0) {
            window.Sconsole([`${pair.baseAsset} has no buy order`]);
            // max limit
            if (baseExchangeVal > baseAssetMax) {
              window.Sconsole([`${pair.baseAsset} max limit`]);
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
              window.Sconsole([orderPrice, pair, amount]);
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
                  console.log('buy_order', res);
                }, (err) => {
                  console.log(err);
                });
            }, (err) => {
              window.Sconsole(['create_buy_order', err]);
            });
          } else {
            // charge current order
            // TODO: cancel order
            window.Sconsole([`${pair.baseAsset} has buy orders`, orders.buyOrders]);
          }
          // sellOrder
          if (orders.sellOrders.length === 0) {
            // make order
            window.Sconsole([`${pair.counterAsset} has no sell order`]);
            // max limit
            if (counterExchangeVal > counterAssetMax) {
              window.Sconsole([`${pair.counterAsset} max limit`]);
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
              window.Sconsole([orderPrice, pair, amount, price]);
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
                  console.log('buy_order', res);
                }, (err) => {
                  console.log(err);
                });
            }, (err) => {
              window.Sconsole(['create_buy_order', err]);
            });
          } else {
            // charge current order
            window.Sconsole([`${pair.baseAsset} has sell orders`, orders.buyOrders]);
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
    this.$store.commit('intervalTime', intervalTime);
  },
});
