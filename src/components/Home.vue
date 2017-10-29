<template>
  <md-layout md-gutter class="main-box">
    <md-layout md-flex="40">
      <wallet-info></wallet-info>
    </md-layout>

    <md-layout md-flex="60">
      <robot-exchange-pair></robot-exchange-pair>
    </md-layout>
  </md-layout>
</template>

<script>
import WalletInfo from '@/components/common/WalletInfo';
import RobotExchangePair from '@/components/common/RobotExchangePair';

export default {
  name: 'home',
  data() {
    return {

    };
  },
  methods: {
  },
  components: {
    'wallet-info': WalletInfo,
    'robot-exchange-pair': RobotExchangePair,
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
