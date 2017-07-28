<template>
  <md-toolbar>
    <h2 class="md-title site-title" style="flex: 1">
      <router-link to="home">{{ 'siteTitle' | translate }}</router-link>
    </h2>
    <md-menu >
      <md-button class="md-icon-button" md-menu-trigger>
        <md-icon>settings</md-icon>
      </md-button>
      <md-menu-content>
        <md-menu-item>My Item 1</md-menu-item>
        <md-menu-item>My Item 2</md-menu-item>
      </md-menu-content>
    </md-menu>
  </md-toolbar>
</template>

<script>
export default {
  data() {
    return {
      activeIndex: this.$route.name,
    };
  },
  methods: {
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
