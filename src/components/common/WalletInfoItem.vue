<template>
  <md-table-row>
    <md-table-cell>
      <span>
        {{ detail.asset_code }}
        <md-tooltip md-direction="right">{{ detail.asset_issuer }}</md-tooltip>
      </span>
    </md-table-cell>
    <md-table-cell>{{ detail.balance }}</md-table-cell>
    <md-table-cell>{{ assetVals | valFilter(detail) }}</md-table-cell>
    <md-table-cell>
      <md-input-container>
        <label></label>
        <md-input class="asset_max" :disabled="!isMaxEditable" v-model="maxVal.max"></md-input>
      </md-input-container>
    </md-table-cell>
    <md-table-cell v-if="isMaxEditable">
      <md-button v-if="detail.balance == 0" @click="removeTrustline" class="md-icon-button md-raised md-warn">
        <md-icon>delete</md-icon>
      </md-button>
    </md-table-cell>
  </md-table-row>
</template>

<script>
import Api from '@/lib/Api';

export default {
  data() {
    return {
      maxVal: {
        skey: '',
        max: 0,
      },
    };
  },
  props: {
    maxes: Array,
    detail: Object,
    isMaxEditable: Boolean,
    assetVals: Array,
    isSave: String,
  },
  computed: {
  },
  watch: {
    isSave(n, o) {
      if (n === 'saved' && o === 'opening') {
        // to save
        this.$store.commit('updateMaxes', this.maxVal);
      }
    },
  },
  methods: {
    removeTrustline(e) {
      window.Sconsole(['removeTrustline', e]);
      if (this.$store.getters.privateKey) {
        this.$store.commit('updateIsloading', true);
        Api.removeTrustline(
          window.server,
          this.$store.getters.privateKey,
          this.detail.asset_code,
          this.detail.asset_issuer,
          (res) => {
            window.Sconsole(['removeTrustline succ', res]);
            this.$store.commit('updateIsloading', false);
            this.$store.commit('updateSnackmsg', 'wallet.remove_trustline_succ');
          },
          (errRes) => {
            window.Sconsole(['removeTrustline fail', errRes], 'msg');
            this.$store.commit('updateIsloading', false);
            this.$store.commit('updateSnackmsg', 'wallet.remove_trustline_fail');
          },
        );
      }
    },
  },
  filters: {
    valFilter: (vals, asset) => {
      const len = vals.length;
      if (len > 0) {
        for (let i = 0; i < len; i += 1) {
          if (vals[i].skey === `${asset.asset_code}_${asset.asset_issuer}`) {
            return vals[i].assetVal;
          }
        }
      }
      return '';
    },
  },
  mounted() {
    const skey = `${this.detail.asset_code}_${this.detail.asset_issuer}`;
    let existIndex = null;
    const tmp = this.maxes.filter((val, index) => {
      if (val.skey === skey) {
        existIndex = index;
        return true;
      }
      return false;
    });
    if (tmp.length > 0) {
      this.maxVal.skey = this.maxes[existIndex].skey;
      this.maxVal.max = this.maxes[existIndex].max;
    } else {
      this.maxVal.skey = skey;
      this.maxVal.max = 0;
    }
  },
};
</script>
<style scoped>
</style>
