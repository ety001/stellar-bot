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

Vue.config.productionTip = false;
const version = 'v0.0.5';

// init Vuex
Vue.use(Vuex);
const store = new Vuex.Store();

// init VueMaterial
Vue.use(VueMaterial);

// to config I18n
Vue.use(vuexI18n.plugin, store);
// add translations directly to the application
Vue.i18n.add('en', transEn);
Vue.i18n.add('zh-CN', transZhCn);

// set the start locale to use
Vue.i18n.set('zh-CN');

/* eslint-disable no-new */
const app = new Vue({
  el: '#app',
  data: {
    debugStellarBot: false,
  },
  router,
  template: '<App/>',
  components: { App },
  methods: {
    console(resultArrOrStr, msgType = 'debug') {
      if (msgType === 'msg'
        || (msgType === 'debug' && this.debugStellarBot === true)) {
        console.log(resultArrOrStr);
      }
    },
  },
  mounted() {
    console.log(StellarSdk);
  },
});

app.console(`version: ${version}`, 'msg');
