<template>
  <div id="app">
    <top-nav :version="version"></top-nav>
    <router-view></router-view>
    <md-snackbar md-position="top center" ref="snackbar" md-duration="4000" @close="onSnackbarClose">
      <span>{{ $t(snackmsg) }}</span>
    </md-snackbar>
  </div>
</template>

<script>
import TopNav from '@/components/common/TopNav';

export default {
  name: 'app',
  props: {
    version: String,
  },
  computed: {
    snackmsg() {
      return this.$store.state.snackmsg;
    },
  },
  watch: {
    snackmsg() {
      if (this.$store.state.snackmsg !== null) {
        this.$refs.snackbar.open();
      }
    },
  },
  components: {
    'top-nav': TopNav,
  },
  methods: {
    onSnackbarClose() {
      this.$store.commit('updateSnackmsg', null);
    },
  },
};
</script>

<style scoped>
#app {
  padding-bottom: 80px;
}
</style>
