<template>
  <md-switch
    v-model="robotStatus"
    id="robot_status"
    name="robot_status"
    class="md-warn">
      {{ $t('robot_status', {'robotStatus': $t(robotStatusTxt)}) }}
  </md-switch>
</template>

<script>
  export default {
    name: 'robot-switch',
    props: {
    },
    data() {
      return {
        robotStatus: false,
        robotStatusTxt: 'off',
      };
    },
    watch: {
      robotStatus(status) {
        this.robotStatusTxt = status ? 'on' : 'off';
        this.$store.commit('updateRobotStatus', status);
      },
    },
    methods: {
    },
  };
</script>
