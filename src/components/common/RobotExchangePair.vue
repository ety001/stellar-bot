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
            <md-table-head>{{ $t('exchange.amount') }}</md-table-head>
            <md-table-head>{{ $t('exchange.counter') + '' + $t('wallet.asset') }}</md-table-head>
            <md-table-head>{{ $t('exchange.sell_rate') }}</md-table-head>
            <md-table-head>{{ $t('exchange.amount') }}</md-table-head>
            <md-table-head v-if="isRateEditable"></md-table-head>
          </md-table-row>
        </md-table-header>
        <md-table-body>
          <md-table-row>
            <md-table-cell>
              <span>
                CNY
                <md-tooltip md-direction="bottom">GCRF5BWQLVAEDIE4J25KJ5XKC3JI5XKPCT2BA7PZD7B2SW3LSPVX5ENC</md-tooltip>
              </span>
            </md-table-cell>
            <md-table-cell>
              <md-input-container>
                <label></label>
                <md-input :disabled="!isRateEditable"></md-input>
              </md-input-container>
            </md-table-cell>
            <md-table-cell>
              <md-input-container>
                <label></label>
                <md-input :disabled="!isRateEditable"></md-input>
              </md-input-container>
            </md-table-cell>
            <md-table-cell>
              <span>
                USD
                <md-tooltip md-direction="bottom">GCRF5BWQLVAEDIE4J25KJ5XKC3JI5XKPCT2BA7PZD7B2SW3LSPVX5ENC</md-tooltip>
              </span>
            </md-table-cell>
            <md-table-cell>
              <md-input-container>
                <label></label>
                <md-input :disabled="!isRateEditable"></md-input>
              </md-input-container>
            </md-table-cell>
            <md-table-cell>
              <md-input-container>
                <label></label>
                <md-input :disabled="!isRateEditable"></md-input>
              </md-input-container>
            </md-table-cell>
            <md-table-cell v-if="isRateEditable">
              <md-button class="md-icon-button md-raised md-warn">
                <md-icon>delete</md-icon>
              </md-button>
            </md-table-cell>
          </md-table-row>
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
      <md-input-container md-inline>
        <label>{{ $t('exchange.base_asset') }}</label>
        <md-input type="password" v-model="baseAsset"></md-input>
      </md-input-container>
      <md-input-container md-inline>
        <label>{{ $t('exchange.base_issuer') }}</label>
        <md-input type="password" v-model="baseIssuer"></md-input>
      </md-input-container>
      <md-input-container md-inline>
        <label>{{ $t('exchange.counter_asset') }}</label>
        <md-input type="password" v-model="counterAsset"></md-input>
      </md-input-container>
      <md-input-container md-inline>
        <label>{{ $t('exchange.counter_issuer') }}</label>
        <md-input type="password" v-model="counterIssuer"></md-input>
      </md-input-container>
    </dialog-form>

  </md-card>
</template>

<script>
import DialogForm from '@/components/common/DialogForm';

export default {
  data() {
    return {
      baseAsset: null,
      baseIssuer: null,
      counterAsset: null,
      counterIssuer: null,
      isRateEditable: false,
    };
  },
  components: {
    'dialog-form': DialogForm,
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
            // To update state
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
    },
    saveChange() {
      this.isRateEditable = false;
    },
  },
};
</script>
<style scoped>
</style>
