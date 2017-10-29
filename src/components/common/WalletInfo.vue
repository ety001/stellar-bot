<template>
  <md-card style="width: 100%;">
    <md-card-header>
      <md-card-header-text>
        <div class="md-title">{{ $t('info', {which: $t('wallet.base')}) }}</div>
        <div class="md-subhead" v-if="walletAddress">
          {{ $t('address', {which: ''}) }}:
          <span>{{ walletAddress }}</span>
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
          <md-menu-item @click="editMax()">
            <span>{{ $t('edit', {what: $t('exchange.max')} ) }}</span>
            <md-icon>edit</md-icon>
          </md-menu-item>
        </md-menu-content>
      </md-menu>
    </md-card-header>

    <md-card-content v-if="isMaxEditable">
      <md-button @click="saveChange" class="md-raised md-primary">
        <md-icon>save</md-icon>
      </md-button>
    </md-card-content>

    <md-card-content>
      <md-table md-sort-type="desc">
        <md-table-header>
          <md-table-row>
            <md-table-head>{{ 'wallet.asset' | translate }}</md-table-head>
            <md-table-head>{{ 'wallet.balance' | translate }}</md-table-head>
            <md-table-head>{{ 'wallet.value' | translate }} (XLM)</md-table-head>
            <md-table-head>
              {{ $t('exchange.max') }} (CNY)
              <md-tooltip md-direction="right">{{ $t('exchange.calculated_in_ripplefox_cny_price')}}</md-tooltip></md-table-head>
            <md-table-head v-if="isMaxEditable"></md-table-head>
          </md-table-row>
        </md-table-header>

        <md-table-body>

          <md-table-row>
            <md-table-cell>
              <span>
                XLM
              </span>
            </md-table-cell>
            <md-table-cell>{{ nativeBalance }}</md-table-cell>
            <md-table-cell>{{ nativeBalance }}</md-table-cell>
            <md-table-cell>
              <md-input-container>
                <label></label>
                <md-input class="asset_max" :disabled="!isMaxEditable"></md-input>
              </md-input-container>
            </md-table-cell>
            <md-table-cell v-if="isMaxEditable">
            </md-table-cell>
          </md-table-row>

          <md-table-row v-for="(detail, index) in balances" :key="index">
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
                <md-input class="asset_max" :disabled="!isMaxEditable"></md-input>
              </md-input-container>
            </md-table-cell>
            <md-table-cell v-if="isMaxEditable">
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
        <md-input type="password" v-model="walletPrivateKey"></md-input>
      </md-input-container>
    </dialog-form>

    <dialog-form
      :md-title="$t('add', {what: $t('wallet.trustline')})"
      :md-ok-text="$t('done')"
      :md-cancel-text="$t('cancel')"
      :md-dialog-width="'50%'"
      @open="onOpen"
      @close="onClose"
      ref="add_trustline">
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
import Api from '@/lib/Api';

export default {
  data() {
    return {
      msg: null,
      walletAddress: this.$store.getters.publicKey,
      walletPrivateKey: null,
      trustAssetCode: null,
      trustIssuer: null,
      assetCode: null,
      assetIssuer: null,
      isMaxEditable: false,
    };
  },
  computed: {
    balances() {
      return this.$store.getters.balances;
    },
    nativeBalance() {
      return this.$store.getters.nativeBalance;
    },
    exchangeVals() {
      return this.$store.getters.exchangeVals;
    },
  },
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
        case 'set_privary_key': {
          // this.walletPrivateKey = null;
          break;
        }
        default: {
          break;
        }
      }
      window.Sconsole(['Dialog Opened', ref]);
    },
    onClose(ref, type) {
      switch (ref) {
        case 'set_privary_key': {
          if (type === 'ok') {
            // To generate PublicKey and save to store
            Api.generateKeypair(
              this.walletPrivateKey,
              (res) => {
                this.$store.commit('updatePublicKey', res.publicKey());
                this.$store.commit('updatePrivateKey', this.walletPrivateKey);
                this.$store.commit('updateSnackmsg', 'save_success');
              },
              () => {
                this.$store.commit('updateSnackmsg', 'wallet.private_key_error');
                this.walletPrivateKey = null;
              },
            );
          } else {
            this.walletPrivateKey = null;
          }
          break;
        }
        case 'add_trustline': {
          if (type === 'ok') {
            this.$store.commit('updatePublicKey', '');
            this.$store.commit('updateSnackmsg', 'save_success');
          } else {
            // console
          }
          break;
        }
        default: {
          break;
        }
      }
      window.Sconsole(['Dialog Closed', ref, type]);
    },
    onSnackbarClose() {
      this.msg = null;
    },
    editMax() {
      this.isMaxEditable = true;
    },
    saveChange() {
      this.isMaxEditable = false;
    },
  },
  filters: {
    valFilter: (vals, asset) => {
      const len = vals.length;
      console.log('vals:', vals);
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
};
</script>
<style scoped>
.md-dialog {

}
</style>
