<template>
  <md-toolbar>
    <md-button class="md-icon-button" v-on:click="gohome">
      <md-icon>home</md-icon>
    </md-button>
    <h2 class="md-title site-title" style="flex: 1">{{ 'site_title' | translate }}</h2>
    <md-switch v-model="robotStatus" id="robot_status" name="robot_status" class="md-warn">{{ $t('robot_status', {'robotStatus': $t(robotStatusTxt)}) }}</md-switch>
  </md-toolbar>
</template>

<script>
export default {
  data() {
    return {
      robotStatus: false,
      robotStatusTxt: 'off',
    };
  },
  watch: {
    robotStatus() {
      this.robotStatusTxt = this.robotStatus ? 'on' : 'off';
    },
  },
  methods: {
    gohome() {
      this.$router.push({ name: 'home' });
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
