// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import StellarSdk from 'stellar-sdk';
import VueMaterial from 'vue-material';
import 'vue-material/dist/vue-material.css';
import Vuex from 'vuex';
import vuexI18n from 'vuex-i18n';
import App from './App';
import router from './router';
import transEn from './i18n/en.json';
import transZhCn from './i18n/zh-CN.json';

const VERSION = '0.0.5';
window.debugStellarBot = !(process.env.NODE_ENV === 'production');
window.Sconsole = (resultArrOrStr, msgType = 'debug') => {
  if (msgType === 'msg'
    || (msgType === 'debug' && window.debugStellarBot === true)) {
    console.log(resultArrOrStr);
  }
};
Vue.config.productionTip = false;

// init Vuex
Vue.use(Vuex);
const store = new Vuex.Store({
  state: {
    walletAddress: null,
  },
  mutations: {
    setWalletAddress(str) {
      window.Sconsole(`set wallet address ${str}`);
      this.state.walletAddress = str;
    },
  },
});

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
  },
  router,
  template: '<App :version="version"/>',
  components: { App },
  methods: {
  },
  mounted() {
    console.log(StellarSdk);
    window.Sconsole(`version: ${VERSION}`, 'msg');
  },
});
