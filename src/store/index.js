import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  state: {
    snackmsg: null,
    publicKey: null,
    privateKey: null,
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
  },
  strict: debug,
});
