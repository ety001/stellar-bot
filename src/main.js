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
// set the start locale to use
Vue.i18n.set('en');
/* eslint-disable no-new */
new Vue({
  el: '#app',
  data: {
    debugStellarBot: false,
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
    save() {
      window.Sconsole('save config');
      // const mem = {
      //   myAddress: this.myAddress,
      //   primaryKey: this.primaryKey,
      //   gateway: this.gateway,
      // };
      // localStorage.mem = JSON.stringify(mem);

      this.$store.dispatch('updateSnackmsg', 'hello');
    },
    intervalFunc() {
      window.Sconsole('run interval func');
    },
  },
  mounted() {
    window.Sconsole(`version: ${VERSION}`, 'msg');
    // load config if exist
    if (localStorage.mem !== undefined) {
      const localMem = JSON.parse(localStorage.mem);
      if (localMem.version === true) {
        // new version after v0.0.5(include v0.0.5)
        console.log(store.state);
      } else {
        // old version before v0.0.5
        localStorage.removeItem('mem');
      }
      this.primaryKey = localMem.primaryKey;
    }
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
