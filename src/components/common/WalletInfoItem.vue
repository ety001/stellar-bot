<template>
  <md-table-row>
    <md-table-cell>
      <span>
        {{ detail.asset_code }}
        <md-tooltip md-direction="right">{{ detail.asset_issuer }}</md-tooltip>
      </span>
    </md-table-cell>
    <md-table-cell>{{ detail.balance }}</md-table-cell>
    <md-table-cell>{{ exchangeVals | valFilter(detail) }}</md-table-cell>
    <md-table-cell>
      <md-input-container>
        <label></label>
        <md-input class="asset_max" :disabled="!isMaxEditable" v-model="maxVal.max"></md-input>
      </md-input-container>
    </md-table-cell>
    <md-table-cell v-if="isMaxEditable">
      <md-button class="md-icon-button md-raised md-warn">
        <md-icon @click="removeTrustline" :data-code="detail.asset_code" :data-issuer="detail.asset_issuer">delete</md-icon>
      </md-button>
    </md-table-cell>
  </md-table-row>
</template>

<script>
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
    exchangeVals: Array,
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
      console.log(e);
    },
  },
  filters: {
    valFilter: (vals, asset) => {
      const len = vals.length;
      if (len > 0) {
        for (let i = 0; i < len; i += 1) {
          if (vals[i].skey === `${asset.asset_code}_${asset.asset_issuer}`) {
            return vals[i].exchangeVal;
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
      this.maxVal = this.maxes[existIndex];
    }
    this.maxVal = { skey, max: 0 };
  },
};
</script>
<style scoped>
</style>
