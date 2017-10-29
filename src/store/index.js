import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  strict: debug,
  state: {
    snackmsg: null,
    publicKey: null,
    privateKey: null,
    lang: 'en',
    nativeBalance: 0,
    balances: [],
    issuers: [],
  },
  mutations: {
    updatePublicKey(state, publicKey) {
      window.Sconsole(['update publicKey']);
      state.publicKey = publicKey;
    },
    updatePrivateKey(state, privateKey) {
      window.Sconsole(['update privateKey']);
      state.privateKey = privateKey;
    },
    updateSnackmsg(state, msg) {
      window.Sconsole(['update snackmsg']);
      state.snackmsg = msg;
    },
    updateLang(state, lang) {
      window.Sconsole(['update lang']);
      state.lang = lang;
    },
    updateNativeBalance(state, nativeBalance) {
      window.Sconsole(['update native balances']);
      state.nativeBalance = nativeBalance;
    },
    updateBalances(state, balances) {
      window.Sconsole(['update balances']);
      state.balances = balances;
    },
    updateAllIssuers(state, issuers) {
      window.Sconsole(['update issuers']);
      state.issuers = issuers;
    },
  },
  getters: {
    publicKey(state) {
      return state.publicKey;
    },
    lang(state) {
      return state.lang;
    },
    nativeBalance(state) {
      return state.nativeBalance;
    },
    balances(state) {
      return state.balances;
    },
    issuers(state) {
      return state.issuers;
    },
  },
  plugins: [
    createPersistedState({
      storage: {
        getItem: key => localStorage.getItem(key),
        setItem: (key, value) => localStorage.setItem(key, value),
        removeItem: key => localStorage.removeItem(key),
      },
    }),
  ],
});
