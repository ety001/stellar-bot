<template>
  <md-card style="width: 100%;">
    <md-card-header>
      <md-card-header-text>
        <div class="md-title">{{ $t('info', {which: $t('wallet.base')}) }}</div>
        <div class="md-subhead">
          {{ $t('address', {which: ''}) }}:
          <span>GCRF5BWQLVAEDIE4J25KJ5XKC3JI5XKPCT2BA7PZD7B2SW3LSPVX5ENC</span>
        </div>
      </md-card-header-text>

      <md-menu md-size="4" md-direction="bottom left">
        <md-button class="md-icon-button" md-menu-trigger>
          <md-icon>menu</md-icon>
        </md-button>
        <md-menu-content>
          <md-menu-item @click="openDialog('set_privary_key')">
            <span>{{ $t('settings', {what_to: $t('wallet.base')}) }}</span>
            <md-icon>settings</md-icon>
          </md-menu-item>
          <md-menu-item @click="openDialog('add_trust')">
            <span>{{ $t('add', {what: $t('wallet.trustline')} ) }}</span>
            <md-icon>add</md-icon>
          </md-menu-item>
        </md-menu-content>
      </md-menu>
    </md-card-header>

    <md-card-content>
      <md-table md-sort="value" md-sort-type="desc">
        <md-table-header>
          <md-table-row>
            <md-table-head>{{ 'wallet.asset' | translate }}</md-table-head>
            <md-table-head md-sort-by="total">{{ 'wallet.balance' | translate }}</md-table-head>
            <md-table-head md-sort-by="value">{{ 'wallet.value' | translate }} (XLM)</md-table-head>
            <md-table-head>
              {{ $t('exchange.max') }}
              <md-tooltip md-direction="right">{{ $t('exchange.calculated_in_ripplefox_cny_price')}}</md-tooltip></md-table-head>
            <md-table-head></md-table-head>
          </md-table-row>
        </md-table-header>
        <md-table-body>
          <md-table-row v-for="(row, index) in 5" :key="index">
            <md-table-cell>
              <span>
                CNY
                <md-tooltip md-direction="right">GCRF5BWQLVAEDIE4J25KJ5XKC3JI5XKPCT2BA7PZD7B2SW3LSPVX5ENC</md-tooltip>
              </span>
            </md-table-cell>
            <md-table-cell>2073.123</md-table-cell>
            <md-table-cell>2112.122</md-table-cell>
            <md-table-cell>
              <md-input-container>
                <label></label>
                <md-input disabled value="123"></md-input>
              </md-input-container>
            </md-table-cell>
            <md-table-cell>
              <md-button class="md-icon-button md-raised md-primary">
                <md-icon>edit</md-icon>
              </md-button>
              <md-button class="md-icon-button md-raised md-warn">
                <md-icon>delete</md-icon>
              </md-button>
            </md-table-cell>
          </md-table-row>
        </md-table-body>
      </md-table>
    </md-card-content>

    <dialog-form
      :md-title="$t('wallet.config_your_private_key')"
      :md-ok-text="$t('done')"
      :md-cancel-text="$t('cancel')"
      :md-dialog-width="'30%'"
      @open="onOpen"
      @close="onClose"
      ref="set_privary_key">
      <md-input-container md-inline>
        <label>{{ $t('wallet.type_your_private_key') }}</label>
        <md-input type="password" v-model="walletPrivateKeyDisplay"></md-input>
      </md-input-container>
    </dialog-form>

    <dialog-form
      :md-title="$t('add', {what: $t('wallet.trustline')})"
      :md-ok-text="$t('done')"
      :md-cancel-text="$t('cancel')"
      :md-dialog-width="'50%'"
      @open="onOpen"
      @close="onClose"
      ref="add_trust">
      <md-input-container md-inline>
        <label>{{ $t('wallet.asset_code') }}</label>
        <md-input v-model="assetCode"></md-input>
      </md-input-container>
      <md-input-container md-inline>
        <label>{{ $t('wallet.asset_issuer') }}</label>
        <md-input v-model="assetIssuer"></md-input>
      </md-input-container>
    </dialog-form>

  </md-card>
</template>

<script>
import DialogForm from '@/components/common/DialogForm';

export default {
  data: () => ({
    walletPrivateKey: null,
    walletPrivateKeyDisplay: null,
    trustAssetCode: null,
    trustIssuer: null,
    assetCode: null,
    assetIssuer: null,
  }),
  watch: {
  },
  components: {
    'dialog-form': DialogForm,
  },
  methods: {
    openDialog(ref) {
      this.$refs[ref].open(ref);
    },
    onOpen(ref) {
      switch (ref) {
        case 'set_privary_key':
          this.walletPrivateKeyDisplay = null;
          break;
        default:
          break;
      }
      window.Sconsole(['Dialog Opened', ref]);
    },
    onClose(ref, type) {
      switch (ref) {
        case 'set_privary_key':
          this.walletPrivateKey = this.walletPrivateKeyDisplay;
          // To generate PublicKey
          // To update state
          this.walletPrivateKeyDisplay = null;
          break;
        default:
          break;
      }
      window.Sconsole(['Dialog Closed', ref, type]);
    },
  },
};
</script>
<style scoped>
.md-dialog {

}
</style>
