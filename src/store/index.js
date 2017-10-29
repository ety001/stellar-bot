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
    orderBook: [],
    exchangeVals: [],
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
    updateOrderBook(state, data) {
      window.Sconsole(['update orderBook']);
      const skey = data.skey;
      const orderBook = data.orderBook;
      let existIndex = null;
      const tmp = state.orderBook.filter((val, index) => {
        if (val.skey === skey) {
          existIndex = index;
          return true;
        }
        return false;
      });
      if (tmp.length > 0) {
        state.orderBook[existIndex] = orderBook;
      } else {
        state.orderBook.push(data);
      }
    },
    updateExchangeVals(state, data) {
      window.Sconsole(['update exchangeVals']);
      const skey = data.skey;
      const exchangeVal = data.exchangeVal;
      let existIndex = null;
      const tmp = state.exchangeVals.filter((val, index) => {
        if (val.skey === skey) {
          existIndex = index;
          return true;
        }
        return false;
      });
      if (tmp.length > 0) {
        state.exchangeVals[existIndex] = exchangeVal;
      } else {
        state.exchangeVals.push(data);
      }
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
    orderBook(state) {
      return state.orderBook;
    },
    exchangeVals(state) {
      return state.exchangeVals;
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
