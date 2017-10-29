<template>
  <md-dialog ref="dialog" @close="fireCloseEvent('cancel')">
    <md-dialog-title v-if="mdTitle">{{ mdTitle }}</md-dialog-title>
    
    <md-dialog-content>
      <slot></slot>
    </md-dialog-content>

    <md-dialog-actions>
      <md-button class="md-primary" @click="close('cancel')">{{ mdCancelText }}</md-button>
      <md-button class="md-primary" @click="confirmValue">{{ mdOkText }}</md-button>
    </md-dialog-actions>
  </md-dialog>
</template>

<script>
  export default {
    name: 'dialog-form',
    props: {
      mdTitle: String,
      mdOkText: {
        type: String,
        default: 'Ok',
      },
      mdCancelText: {
        type: String,
        default: 'Cancel',
      },
      mdDialogWidth: {
        type: String,
        default: null,
      },
    },
    data() {
      return {
        debounce: false,
        currentComponentRef: null,
      };
    },
    methods: {
      fireCloseEvent(type) {
        if (!this.debounce) {
          this.$emit('close', this.currentComponentRef, type);
        }
      },
      open(ref) {
        this.$emit('open', ref);
        this.currentComponentRef = ref;
        this.debounce = false;
        this.$refs.dialog.open();
        if (this.mdDialogWidth) {
          this.$refs.dialog.$el.querySelector('.md-dialog').style.width = this.mdDialogWidth;
        }
      },
      close(type) {
        this.fireCloseEvent(type);
        this.debounce = true;
        this.$refs.dialog.close();
      },
      confirmValue() {
        this.close('ok');
      },
    },
  };
</script>
