<template>
  <md-table-row>
    <md-table-cell>
      <span>
        {{ pair.baseAsset }}
        <md-tooltip md-direction="bottom">{{ pair.baseIssuer }}</md-tooltip>
      </span>
    </md-table-cell>
    <md-table-cell>
      <md-input-container>
        <label></label>
        <md-input :disabled="!isRateEditable" v-model="baseRate"></md-input>
      </md-input-container>
    </md-table-cell>
    <md-table-cell>
      <md-input-container>
        <label></label>
        <md-input :disabled="!isRateEditable" v-model="baseValue"></md-input>
      </md-input-container>
    </md-table-cell>
    <md-table-cell>
      <span>
        {{ pair.counterAsset }}
        <md-tooltip md-direction="bottom">{{ pair.counterIssuer }}</md-tooltip>
      </span>
    </md-table-cell>
    <md-table-cell>
      <md-input-container>
        <label></label>
        <md-input :disabled="!isRateEditable" v-model="counterRate"></md-input>
      </md-input-container>
    </md-table-cell>
    <md-table-cell>
      <md-input-container>
        <label></label>
        <md-input :disabled="!isRateEditable" v-model="counterValue"></md-input>
      </md-input-container>
    </md-table-cell>
    <md-table-cell v-if="isRateEditable">
      <md-button @click="removePair" class="md-icon-button md-raised md-warn">
        <md-icon>delete</md-icon>
      </md-button>
    </md-table-cell>
  </md-table-row>
</template>

<script>
// import Api from '@/lib/Api';

export default {
  data() {
    return {
      baseRate: 0,
      baseValue: 0,
      counterRate: 0,
      counterValue: 0,
    };
  },
  props: {
    pair: Object,
    isRateEditable: Boolean,
    isSave: String,
  },
  computed: {
  },
  watch: {
    isSave(n, o) {
      if (n === 'saved' && o === 'opening') {
        // to save
        this.$store.commit('updateExchangePairRateAmount', {
          skey: this.pair.skey,
          skey2: this.pair.skey2,
          baseRate: this.baseRate,
          baseValue: this.baseValue,
          counterRate: this.counterRate,
          counterValue: this.counterValue,
        });
      }
    },
  },
  methods: {
    removePair(e) {
      window.Sconsole(['remove pair', e]);
      this.$store.commit('removeExchangePair', this.pair.skey);
    },
  },
  mounted() {
    this.baseRate = this.pair.baseRate;
    this.baseValue = this.pair.baseValue;
    this.counterRate = this.pair.counterRate;
    this.counterValue = this.pair.counterValue;
  },
};
</script>
<style scoped>
</style>
