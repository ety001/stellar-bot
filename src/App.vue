<template>
  <div id="app">
    <top-nav :version="version"></top-nav>
    <router-view></router-view>
  </div>
</template>

<script>
import TopNav from '@/components/common/TopNav';

export default {
  name: 'app',
  props: {
    version: String,
  },
  components: {
    'top-nav': TopNav,
  },
};
</script>

<style scoped>
#app {
  padding-bottom: 80px;
}
</style>
