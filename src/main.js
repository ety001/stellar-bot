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
const intervalTime = 5;
// Debug
window.debugStellarBot = !(process.env.NODE_ENV === 'production');
window.Sconsole = (resultArrOrStr, msgType = 'debug') => {
  if (msgType === 'msg'
    || (msgType === 'debug' && window.debugStellarBot === true)) {
    console.log(resultArrOrStr);
  }
};

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
        }, (res) => {
          window.Sconsole(['update wallet info fail', res]);
        });
      }
    },
    updateOrderbookPrice() {
      window.Sconsole(['update orderbook and price']);
      const balances = this.$store.getters.balances;
      if (balances.length > 1) {
        console.log(123);
      }
    },
  },
  mounted() {
    window.Sconsole(`version: ${VERSION}`, 'msg');
    // connect server
    this.server = new StellarSdk.Server(this.serverUrl);
    StellarSdk.Network.usePublicNetwork();
    // interval function
    this.intervalFunc();
    // this.interval = setInterval(() => {
    //   this.intervalFunc();
    // }, intervalTime * 1000);
    console.log(intervalTime);
  },
});
