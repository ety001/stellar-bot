<template>
  <div>
    <md-toolbar>
      <md-button class="md-icon-button" v-on:click="toggleLeftSidenav">
        <md-icon>menu</md-icon>
      </md-button>
      <h2 class="md-title site-title" style="flex: 0.1;">{{ 'site_title' | translate }}</h2>
      <md-spinner :md-size="40" md-indeterminate class="md-warn" v-if="isloading"></md-spinner>
    </md-toolbar>

    <md-sidenav class="md-left" ref="leftSidenav" @open="open('Left')" @close="close('Left')">
      <md-toolbar>
        <div class="md-toolbar-container">
          <h3 class="md-title">{{ 'site_title' | translate }}</h3>
        </div>
      </md-toolbar>
      <md-list>
        <md-list-item>
          <md-switch v-model="robotStatus" id="robot_status" name="robot_status" class="md-warn">{{ $t('robot_status', {'robotStatus': $t(robotStatusTxt)}) }}</md-switch>
        </md-list-item>
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
          <md-button class="md-raised md-accent" @click="reset">{{ 'reset' | translate }}</md-button>
        </md-list-item>
      </md-list>
    </md-sidenav>
  </div>
</template>

<script>
export default {
  props: {
    version: String,
  },
  data() {
    return {
      lang: 'en',
      robotStatus: false,
      robotStatusTxt: 'off',
    };
  },
  watch: {
    robotStatus() {
      this.robotStatusTxt = this.robotStatus ? 'on' : 'off';
    },
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
</style>
