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
    nativeMax: 0,
    balances: [],
    issuers: [],
    orderBook: [],
    exchangeVals: [],
    maxes: [],
    isloading: false,
    exchangePairs: [],
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
    updateNativeMax(state, nativeMax) {
      window.Sconsole(['update native max']);
      state.nativeMax = nativeMax;
    },
    updateBalances(state, balances) {
      window.Sconsole(['update balances']);
      // update balances
      state.balances = balances;
      // init maxes
      balances.forEach((detail) => {
        const key = `${detail.asset_code}_${detail.asset_issuer}`;
        const tmp = state.maxes.filter(val => val.skey === key);
        if (tmp.length === 0) {
          state.maxes.push({ skey: key, max: 0 });
        }
      });
    },
    updateAllIssuers(state, issuers) {
      window.Sconsole(['update issuers']);
      state.issuers = issuers;
    },
    updateOrderBook(state, data) {
      window.Sconsole(['update orderBook']);
      const skey = data.skey;
      let existIndex = null;
      const tmp = state.orderBook.filter((val, index) => {
        window.Sconsole(['test updateOrderBook', val, index]);
        if (val.skey === skey) {
          existIndex = index;
          return true;
        }
        return false;
      });
      if (tmp.length > 0) {
        state.orderBook[existIndex] = data;
      } else {
        state.orderBook.push(data);
      }
    },
    updateExchangeVals(state, data) {
      window.Sconsole(['update exchangeVals']);
      const skey = data.skey;
      let existIndex = null;
      const tmp = state.exchangeVals.filter((val, index) => {
        if (val.skey === skey) {
          existIndex = index;
          return true;
        }
        return false;
      });
      if (tmp.length > 0) {
        state.exchangeVals[existIndex] = data;
      } else {
        state.exchangeVals.push(data);
      }
    },
    updateMaxes(state, data) {
      window.Sconsole(['update maxes']);
      let existIndex = null;
      const tmp = state.maxes.filter((val, index) => {
        if (val.skey === data.skey) {
          existIndex = index;
          return true;
        }
        return false;
      });
      if (tmp.length === 0) {
        state.maxes.push(data);
      } else {
        state.maxes[existIndex] = data;
      }
    },
    // removeTrustline(state, code, issuer) {
    //   // state.balances.forEach({})
    // },
    updateIsloading(state, status) {
      state.isloading = status;
    },
    updateExchangePairs(state, pair) {
      const tmp = state.exchangePairs.filter((val) => {
        if (val.skey === pair.skey || val.skey === pair.skey2) {
          return true;
        }
        return false;
      });
      if (tmp.length === 0) {
        state.exchangePairs.push(pair);
      }
    },
    updateExchangePairRateAmount(state, data) {
      state.exchangePairs.filter((val, index) => {
        if (val.skey === data.skey) {
          state.exchangePairs[index].baseRate = data.baseRate;
          state.exchangePairs[index].baseAmount = data.baseAmount;
          state.exchangePairs[index].counterRate = data.counterRate;
          state.exchangePairs[index].counterAmount = data.counterAmount;
          return true;
        }
        return false;
      });
    },
    removeExchangePair(state, skey) {
      const tmp = state.exchangePairs.filter((val) => {
        if (val.skey !== skey) {
          return true;
        }
        return false;
      });
      state.exchangePairs = tmp;
    },
  },
  getters: {
    publicKey(state) {
      return state.publicKey;
    },
    privateKey(state) {
      return state.privateKey;
    },
    lang(state) {
      return state.lang;
    },
    nativeBalance(state) {
      return state.nativeBalance;
    },
    nativeMax(state) {
      return state.nativeMax;
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
    maxes(state) {
      return state.maxes;
    },
    isloading(state) {
      return state.isloading;
    },
    exchangePairs(state) {
      return state.exchangePairs;
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
