<template>
  <md-layout md-gutter class="main-box">
    <md-layout md-flex="30">
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
              <md-menu-item @click="openDialog('setting_privary_key')">
                <span>{{ $t('settings', {what_to: $t('wallet.base')}) }}</span>
                <md-icon>settings</md-icon>
              </md-menu-item>
              <md-menu-item @click="openDialog('setting_privary_key')">
                <span>{{ $t('add', {what: $t('wallet.trustline')} ) }}</span>
                <md-icon>add</md-icon>
              </md-menu-item>
            </md-menu-content>
            <md-dialog
              md-open-from="#setting_privary_key"
              md-close-to="#setting_privary_key"
              ref="setting_privary_key"
              @open="onOpen"
              @close="onClose">
              <md-dialog-title>{{ $t('wallet.config_your_private_key') }}</md-dialog-title>
              <md-dialog-content>
                <form>
                  <md-input-container md-inline>
                    <label>{{ $t('wallet.type_your_private_key') }}</label>
                    <md-input v-model="walletPrimateKey"></md-input>
                  </md-input-container>
                </form>
              </md-dialog-content>
              <md-dialog-actions>
                <md-button class="md-primary" @click="closeDialog('setting_privary_key')">{{ $t('cancel') }}</md-button>
                <md-button class="md-primary" @click="dialogDone('setting_privary_key')">{{ $t('done') }}</md-button>
              </md-dialog-actions>
            </md-dialog>
          </md-menu>
        </md-card-header>

        <md-card-content>
          <md-table md-sort="value" md-sort-type="desc">
            <md-table-header>
              <md-table-row>
                <md-table-head>{{ 'wallet.asset' | translate }}</md-table-head>
                <md-table-head md-sort-by="total">{{ 'wallet.balance' | translate }}</md-table-head>
                <md-table-head md-sort-by="value">{{ 'wallet.value' | translate }} (XLM)</md-table-head>
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
              </md-table-row>
            </md-table-body>
          </md-table>
        </md-card-content>
      </md-card>
    </md-layout>

    <md-layout md-flex="70">
      <md-card style="width: 100%;">
        <md-card-header>
          <md-card-header-text>
            <div class="md-title">{{ $t('exchange_pair') }}</div>
            <div class="md-subhead"></div>
          </md-card-header-text>

          <md-menu md-size="4" md-direction="bottom left">
            <md-button class="md-icon-button" md-menu-trigger>
              <md-icon>menu</md-icon>
            </md-button>
            <md-menu-content>
              <md-menu-item @click="openDialog('setting_privary_key')">
                <span>{{ $t('add', {what: $t('exchange_pair')} ) }}</span>
                <md-icon>add</md-icon>
              </md-menu-item>
            </md-menu-content>
            <md-dialog
              md-open-from="#setting_privary_key"
              md-close-to="#setting_privary_key"
              ref="setting_privary_key"
              @open="onOpen"
              @close="onClose">
              <md-dialog-title>{{ $t('wallet.config_your_private_key') }}</md-dialog-title>
              <md-dialog-content>
                <form>
                  <md-input-container md-inline>
                    <label>{{ $t('wallet.type_your_private_key') }}</label>
                    <md-input v-model="walletPrimateKey"></md-input>
                  </md-input-container>
                </form>
              </md-dialog-content>
              <md-dialog-actions>
                <md-button class="md-primary" @click="closeDialog('setting_privary_key')">{{ $t('cancel') }}</md-button>
                <md-button class="md-primary" @click="dialogDone('setting_privary_key')">{{ $t('done') }}</md-button>
              </md-dialog-actions>
            </md-dialog>
          </md-menu>
        </md-card-header>

        <md-card-content>
          <md-table>
            <md-table-header>
              <md-table-row>
                <md-table-head>{{ $t('base') }} {{ $t('wallet.asset') }}</md-table-head>
                <md-table-head>{{ $t('base') }} {{ $t('wallet.asset') }} {{ $t('max') }}</md-table-head>
                <md-table-head>{{ $t('counter') }} {{ $t('wallet.asset') }}</md-table-head>
                <md-table-head>{{ $t('counter') }} {{ $t('wallet.asset') }} {{ $t('max') }}</md-table-head>
                <md-table-head></md-table-head>
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
                <md-table-cell>1231.231</md-table-cell>
                <md-table-cell>
                  <span>
                    USD
                    <md-tooltip md-direction="bottom">GCRF5BWQLVAEDIE4J25KJ5XKC3JI5XKPCT2BA7PZD7B2SW3LSPVX5ENC</md-tooltip>
                  </span>
                </md-table-cell>
                <md-table-cell>1231.231</md-table-cell>
                <md-table-cell>
                  <md-button class="md-icon-button">
                    <md-icon>settings</md-icon>
                  </md-button>
                </md-table-cell>
              </md-table-row>
            </md-table-body>
          </md-table>
        </md-card-content>
      </md-card>
    </md-layout>
  </md-layout>
</template>

<script>
export default {
  name: 'home',
  data() {
    return {
      walletPrimateKey: null,
    };
  },
  methods: {
    openDialog(ref) {
      this.$refs[ref].open();
    },
    closeDialog(ref) {
      this.$refs[ref].close();
      this.$emit('close', 'cancel');
    },
    dialogDone(ref) {
      this.$refs[ref].close();
      this.$emit('close', 'done');
    },
    onOpen() {
      window.Sconsole('Private Key Setting Opened');
    },
    onClose(type) {
      window.Sconsole(['Private Key Setting Closed', type, this.walletPrimateKey]);
      if (type === 'ok') {
        window.Sconsole('save private key');
      }
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.main-box {
  padding: 0 20px;
}
.main-box .md-layout {
  margin-top: 20px;
  padding: 10px;
}
.md-subhead {
  word-break:break-all;
}
.addr {
  width: 160px;
  overflow: hidden;
  text-overflow:ellipsis;
  white-space: nowrap;
}
</style>
