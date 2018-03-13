<template>
  <md-layout md-gutter class="main-box">
    <md-layout md-flex="100">
      <robot-switch></robot-switch>
    </md-layout>

    <md-layout md-flex="40">
      <wallet-info></wallet-info>
    </md-layout>

    <md-layout md-flex="60">
      <robot-exchange-pair></robot-exchange-pair>
    </md-layout>

    <md-layout md-flex="100">
      <order-list></order-list>
    </md-layout>

  </md-layout>
</template>

<script>
import WalletInfo from '@/components/common/WalletInfo';
import RobotExchangePair from '@/components/common/RobotExchangePair';
import OrderList from '@/components/common/OrderList';
import RobotSwitch from '@/components/common/RobotSwitch';

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
    'order-list': OrderList,
    'robot-switch': RobotSwitch,
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
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
.custom-option {
  max-width: none !important;
}
</style>
