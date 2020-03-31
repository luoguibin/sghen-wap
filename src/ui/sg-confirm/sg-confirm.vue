<template>
  <transition name="confirm">
    <div class="sg-confirm-mask" v-show="visible">
      <div class="sg-confirm">
        <div class="sg-confirm-title">{{title}}</div>
        <div class="sg-confirm-content">{{content}}</div>
        <div class="sg-confirm-options">
          <div>
            <button class="cancel" @click="hide()">取消</button>
          </div>
          <span></span>
          <div>
            <button class="confirm" @click="confirm">确定</button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'SgConfirm',

  data () {
    return {
      visible: false,
      title: '',
      content: ''
    }
  },

  methods: {
    show (options = {}) {
      this.title = options.title
      this.content = options.content
      this.confirmCall = options.confirm
      this.visible = true
    },
    hide () {
      this.visible = false
      this.confirmCall = null
    },
    confirm () {
      this.confirmCall && this.confirmCall()
      this.hide()
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../style/colors.scss";
.sg-confirm-mask {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}
.sg-confirm {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 90%;
  border-radius: 1rem;
  background-color: white;
  transform: translate(-50%, -50%);
  .sg-confirm-title {
    padding: 1rem;
    text-align: center;
    color: $title-color;
    font-size: 1.8rem;
    font-weight: bold;
  }
  .sg-confirm-content {
    padding: 2px 1rem 2rem;
    text-align: center;
    color: $content-color;
    font-size: 1.6rem;
    line-height: 1.8rem;
  }
  .sg-confirm-options {
    display: flex;
    align-items: center;
    line-height: 4rem;
    border-top: 1px solid $border-color;
    div {
      flex: 1;
      text-align: center;
    }
    span {
      display: inline-block;
      width: 1px;
      height: 3rem;
      background-color: $border-color;
    }
    button {
      font-size: 1.6rem;
      border: none;
      background-color: transparent;
    }
    .cancel {
      color: $title-color;
    }
    .confirm {
      color: $main-color;
    }
  }
}

.confirm-enter-active,
.confirm-leave-active {
  transition: all 0.3s ease;
}
.confirm-enter,
.confirm-leave-to {
  opacity: 0;
}
</style>
