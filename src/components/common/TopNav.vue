<template>
  <div>
    <md-toolbar>
      <md-button class="md-icon-button" v-on:click="toggleLeftSidenav">
        <md-icon>menu</md-icon>
      </md-button>
      <h2 class="md-title site-title" style="flex: 0.1;">{{ 'site_title' | translate }}</h2>
      <md-spinner :md-size="40" md-indeterminate class="md-warn" v-if="isloading"></md-spinner>
    </md-toolbar>
    <!--<md-progress class="md-warn" :md-progress="progress"></md-progress>-->
    <md-sidenav class="md-left" ref="leftSidenav" @open="open('Left')" @close="close('Left')">
      <md-toolbar>
        <div class="md-toolbar-container">
          <h3 class="md-title">{{ 'site_title' | translate }}</h3>
        </div>
      </md-toolbar>
      <md-list>
        <md-list-item>
          <router-link to="/">{{ 'home' | translate }}</router-link>
        </md-list-item>
        <md-list-item md-expand-multiple>
          <span>{{ 'lang' | translate }}</span>
          <md-list-expand>
            <md-list>
              <md-list-item class="md-inset">
                <md-input-container>
                  <md-select name="lang" id="lang" v-model="lang">
                    <md-option value="zh-CN">中文</md-option>
                    <md-option value="en">English</md-option>
                  </md-select>
                </md-input-container>
              </md-list-item>
            </md-list>
          </md-list-expand>
        </md-list-item>
        <md-list-item>
          <span>v{{ version }}</span>
        </md-list-item>
        <md-list-item>
          <a class="custom_a" href="javascript:void(0)" @click="help">{{ 'help' | translate }}</a>
        </md-list-item>
        <md-list-item>
          <md-button class="md-primary" @click="importConfig">{{ 'import' | translate }}</md-button>
        </md-list-item>
        <md-list-item>
          <md-button class="md-warn" @click="backup">{{ 'backup' | translate }}</md-button>
        </md-list-item>
        <md-list-item>
          <md-button class="md-accent" @click="reset">{{ 'reset' | translate }}</md-button>
        </md-list-item>
      </md-list>
    </md-sidenav>
    <md-dialog-alert
      :md-title="$t('backup')"
      :md-content-html="backupConfig"
      @open="onBackupOpen"
      @close="onBackupClose"
      ref="backup">
    </md-dialog-alert>
    <md-dialog-prompt
      :md-title="$t('import')"
      :md-ok-text="$t('done')"
      :md-cancel-text="$t('cancel')"
      @open="onImportOpen"
      @close="onImportClose"
      v-model="configStr"
      ref="restore">
    </md-dialog-prompt>
  </div>
</template>

<script>
export default {
  props: {
    version: String,
  },
  data() {
    return {
      lang: this.$store.getters.lang,
      backupConfig: '<p></p>',
      configStr: '',
      // progress: 0,
    };
  },
  watch: {
    lang(val) {
      this.$i18n.set(val);
      this.$store.commit('updateLang', val);
    },
  },
  computed: {
    isloading() {
      return this.$store.getters.isloading;
    },
  },
  methods: {
    toggleLeftSidenav() {
      this.$refs.leftSidenav.toggle();
    },
    open(ref) {
      window.Sconsole(['open:', ref]);
    },
    close(ref) {
      window.Sconsole(['close', ref]);
    },
    reset() {
      window.localStorage.vuex = null;
      window.location.reload();
    },
    help() {
      if (this.$store.getters.lang === 'en') {
        window.open('https://galactictalk.org/d/1287-how-to-use-stellarbot-a-making-market-robot');
      } else {
        window.open('https://steemit.com/cn/@ety001/stellarbot');
      }
    },
    backup() {
      this.$refs.backup.open();
    },
    onBackupOpen() {
      const result = window.localStorage.vuex;
      const warning = this.$i18n.translate('has_private_key');
      this.backupConfig = `<pre>${result}</pre><p><b>${warning}</b></p>`;
    },
    onBackupClose() {
      this.backupConfig = '<p></p>';
    },
    importConfig() {
      this.$refs.restore.open();
    },
    onImportOpen() {
      this.configStr = '';
    },
    onImportClose(btnType) {
      switch (btnType) {
        case 'ok':
          try {
            window.localStorage.vuex = JSON.stringify(JSON.parse(this.configStr));
            setTimeout(() => {
              window.location.reload();
            });
          } catch (e) {
            window.Sconsole(['import err', e], 'msg');
          }
          break;
        case 'cancel':
          this.configStr = '';
          break;
        default:
          break;
      }
    },
  },
  mounted() {
    // let count = 0;
    // setInterval(() => {
    //   if (count === this.$store.getters.intervalTime * 5) count = 0;
    //   this.progress = 100 * (count / (this.$store.getters.intervalTime * 5));
    //   count += 1;
    // }, 200);
  },
};
</script>
<style scoped>
  .site-title a {
    color: #fff !important;
    text-decoration: none !important;
  }
  .site-title a:hover {
    color: #fff !important;
    text-decoration: none !important;
  }
  .custom_a {
    color: #000 !important;
    text-decoration: none !important;
  }
</style>
