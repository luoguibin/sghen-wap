<template>
  <transition :name="'toast-' + direction">
    <div v-show="visible" :class="'sg-toast sg-toast-' + direction">{{msg}}</div>
  </transition>
</template>

<script>
export default {
  name: 'SgToast',
  data () {
    return {
      direction: 'bottom',
      msg: '',
      visible: false
    }
  },
  methods: {
    show (msg, options = {}) {
      this.msg = msg
      this.direction = options.direction || 'bottom'
      this.visible = true
    },
    hide () {
      this.visible = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../style/size.scss";

.sg-toast {
  position: fixed;
  left: 50%;
  padding: $padding-small $padding-big;
  color: white;
  font-size: $size-text;
  line-height: $height-text;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 0.6rem;
  transform: translateX(-50%);
  z-index: $z-index-999
}
.sg-toast-top {
  top: 2rem;
}
.sg-toast-bottom {
  bottom: 2rem;
}
.sg-toast-middle {
  top: 50%;
}

.toast-top-enter-active,
.toast-top-leave-active,
.toast-middle-enter-active,
.toast-middle-leave-active,
.toast-bottom-enter-active,
.toast-bottom-leave-active {
  transition: all 0.3s ease;
}
.toast-top-enter,
.toast-top-leave-to {
  top: -2rem;
  opacity: 0;
}
.toast-bottom-enter,
.toast-bottom-leave-to {
  bottom: -2rem;
  opacity: 0;
}
.toast-middle-enter,
.toast-middle-leave-to {
  opacity: 0;
}
</style>
