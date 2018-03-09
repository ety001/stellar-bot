<template>
  <md-card style="width: 100%;">
    <md-card-header>
      <md-card-header-text>
        <div class="md-title">{{ $t('robot') + ' ' + $t('exchange.exchange_pair') }}</div>
        <div class="md-subhead"></div>
      </md-card-header-text>

      <md-menu md-size="4" md-direction="bottom left">
        <md-button class="md-icon-button" md-menu-trigger>
          <md-icon>menu</md-icon>
        </md-button>
        <md-menu-content>
          <md-menu-item @click="openDialog('add_exchange_pair')">
            <span>{{ $t('add', {what: $t('exchange.exchange_pair')} ) }}</span>
            <md-icon>add</md-icon>
          </md-menu-item>
          <md-menu-item @click="editParams()">
            <span>{{ $t('edit', {what: $t('exchange.params')} ) }}</span>
            <md-icon>edit</md-icon>
          </md-menu-item>
        </md-menu-content>
      </md-menu>
    </md-card-header>
    <md-card-content v-if="isRateEditable">
      <md-button @click="saveChange" class="md-raised md-primary">
        <md-icon>save</md-icon>
      </md-button>
    </md-card-content>
    <md-card-content>
      <md-table>
        <md-table-header>
          <md-table-row>
            <md-table-head>{{ $t('exchange.base') + '' + $t('wallet.asset') }}</md-table-head>
            <md-table-head>{{ $t('exchange.buy_rate') }}</md-table-head>
            <md-table-head>{{ $t('exchange.value') }}(XLM)</md-table-head>
            <md-table-head>{{ $t('exchange.counter') + '' + $t('wallet.asset') }}</md-table-head>
            <md-table-head>{{ $t('exchange.sell_rate') }}</md-table-head>
            <md-table-head>{{ $t('exchange.value') }}(XLM)</md-table-head>
            <md-table-head v-if="isRateEditable"></md-table-head>
          </md-table-row>
        </md-table-header>
        <md-table-body>
          <pair-item v-for="pair in exchangePairs" :key="pair.skey" :pair="pair" :isRateEditable="isRateEditable" :isSave="isSave"></pair-item>
        </md-table-body>
      </md-table>
    </md-card-content>

    <dialog-form
      :md-title="$t('add', {what: $t('exchange_pair')})"
      :md-ok-text="$t('done')"
      :md-cancel-text="$t('cancel')"
      @open="onOpen"
      @close="onClose"
      :md-dialog-width="'50%'"
      ref="add_exchange_pair">
      <md-input-container>
        <label for="exchange_base_asset"></label>
        <md-select name="exchange_base_asset" md-menu-class="custom-option" id="exchange_base_asset" v-model="baseAsset" :placeholder="$t('exchange.base_asset')">
          <md-option value="XLM">XLM</md-option>
          <md-option v-for="balance in balances" :key="`${balance.asset_code}_${balance.asset_issuer}`" :value="`${balance.asset_code}`">{{ balance.asset_code }}</md-option>
        </md-select>
      </md-input-container>
      <md-input-container>
        <label for="exchange_base_issuer"></label>
        <md-select name="exchange_base_issuer" md-menu-class="custom-option" id="exchange_base_issuer" v-model="baseIssuer" :placeholder="$t('exchange.base_issuer')">
          <md-option></md-option>
          <md-option v-for="balance in balances" :key="`${balance.asset_code}_${balance.asset_issuer}`" :value="`${balance.asset_issuer}`">{{ `${balance.asset_issuer} ( ${balance.asset_code} )` }}</md-option>
        </md-select>
      </md-input-container>
      <md-input-container>
        <label for="exchange_counter_asset"></label>
        <md-select name="exchange_counter_asset" md-menu-class="custom-option" id="exchange_counter_asset" v-model="counterAsset" :placeholder="$t('exchange.counter_asset')">
          <md-option value="XLM">XLM</md-option>
          <md-option v-for="balance in balances" :key="`${balance.asset_code}_${balance.asset_issuer}`" :value="`${balance.asset_code}`">{{ balance.asset_code }}</md-option>
        </md-select>
      </md-input-container>
      <md-input-container>
        <label for="exchange_counter_issuer"></label>
        <md-select name="exchange_counter_issuer" md-menu-class="custom-option" id="exchange_counter_issuer" v-model="counterIssuer" :placeholder="$t('exchange.counter_issuer')">
          <md-option></md-option>
          <md-option v-for="balance in balances" :key="`${balance.asset_code}_${balance.asset_issuer}`" :value="`${balance.asset_issuer}`">{{ `${balance.asset_issuer} ( ${balance.asset_code} )` }}</md-option>
        </md-select>
      </md-input-container>
    </dialog-form>

  </md-card>
</template>

<script>
import DialogForm from '@/components/common/DialogForm';
import PairItem from '@/components/common/RobotExchangePairItem';

export default {
  data() {
    return {
      baseAsset: null,
      baseIssuer: null,
      counterAsset: null,
      counterIssuer: null,
      isRateEditable: false,
      isSave: '',
    };
  },
  components: {
    'dialog-form': DialogForm,
    'pair-item': PairItem,
  },
  computed: {
    exchangePairs() {
      return this.$store.getters.exchangePairs;
    },
    balances() {
      return this.$store.getters.balances;
    },
  },
  watch: {
  },
  methods: {
    openDialog(ref) {
      this.$refs[ref].open(ref);
    },
    onOpen(ref) {
      switch (ref) {
        default:
          break;
      }
      window.Sconsole(['Dialog Opened', ref]);
    },
    onClose(ref, type) {
      switch (ref) {
        case 'add_exchange_pair':
          if (type === 'ok') {
            // TODO: detect pair exist.
            // const issuers = this.$store.getters.issuers;
            // if (issuers.indexOf(this.baseIssuer.toUpperCase()) ||
            //   issuers.indexOf(this.counterIssuer.toUpperCase())) {
            //   this.$store.commit('updateSnackmsg', 'exchange.has_existed');
            //   return;
            // }
            const baseAsset = this.baseAsset ? this.baseAsset.toUpperCase() : null;
            const baseIssuer = this.baseIssuer ? this.baseIssuer.toUpperCase() : null;
            const counterAsset = this.counterAsset ? this.counterAsset.toUpperCase() : null;
            const counterIssuer = this.counterIssuer ? this.counterIssuer.toUpperCase() : null;
            const balances = this.balances;

            if (baseAsset === counterAsset) {
              this.$store.commit('updateSnackmsg', 'exchange.base_asset_cannot_be_the_same_as_counter_asset');
              return;
            }

            // Check if the asset and issuer are paired
            let baseErr = false;
            console.log(baseAsset, baseIssuer, counterAsset, counterIssuer);
            if (baseIssuer === null && baseAsset !== 'XLM') {
              this.$store.commit('updateSnackmsg', 'exchange.base_asset_and_issuer_not_paired');
              return;
            }
            balances.forEach((el) => {
              if (el.asset_issuer === baseIssuer) {
                if (el.asset_code !== baseAsset) {
                  baseErr = true;
                }
              }
            });
            if (baseErr) {
              this.$store.commit('updateSnackmsg', 'exchange.base_asset_and_issuer_not_paired');
              return;
            }

            let counterErr = false;
            if (counterIssuer === null && counterAsset !== 'XLM') {
              this.$store.commit('updateSnackmsg', 'exchange.counter_asset_and_issuer_not_paired');
              return;
            }
            balances.forEach((el) => {
              if (el.asset_issuer === counterIssuer) {
                if (el.asset_code !== counterAsset) {
                  counterErr = true;
                }
              }
            });
            if (counterErr) {
              this.$store.commit('updateSnackmsg', 'exchange.counter_asset_and_issuer_not_paired');
              return;
            }

            const pair = {
              skey: `${baseAsset}${baseIssuer}_${counterAsset}${counterIssuer}`,
              skey2: `${counterAsset}${counterIssuer}_${baseAsset}${baseIssuer}`,
              baseAsset,
              baseIssuer,
              baseRate: 0,
              baseValue: 0,
              counterAsset,
              counterIssuer,
              counterRate: 0,
              counterValue: 0,
            };
            this.$store.commit('updateExchangePairs', pair);
          }
          this.clearAddExchangePairInput();
          break;
        default:
          break;
      }
      window.Sconsole(['Dialog Closed', ref, type]);
    },
    clearAddExchangePairInput() {
      this.baseAsset = null;
      this.baseIssuer = null;
      this.counterAsset = null;
      this.counterIssuer = null;
    },
    editParams() {
      this.isRateEditable = true;
      this.isSave = 'opening';
    },
    saveChange() {
      this.isRateEditable = false;
      this.isSave = 'saved';
    },
  },
};
</script>
<style>
</style>
