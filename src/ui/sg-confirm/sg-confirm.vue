<template>
  <transition name="confirm">
    <div class="sg-mask" v-show="visible">
      <div class="sg-confirm">
        <div class="sg-confirm-title">{{title}}</div>
        <div class="sg-confirm-content">
          <input v-if="type === 'input'" v-model="content" :placeholder="placeholder" />
          <textarea v-else-if="type === 'textarea'" :placeholder="placeholder" v-model="content"></textarea>
          <template v-else>{{content}}</template>
        </div>
        <div class="sg-confirm-options">
          <div v-show="cancelVisible">
            <button class="cancel" @click="hide()">取消</button>
          </div>
          <span v-show="cancelVisible"></span>
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
      cancelVisible: true,
      title: '',
      content: '',
      type: ''
    }
  },

  methods: {
    show (options = {}) {
      this.title = options.title
      this.content = options.content
      this.type = options.type
      this.placeholder = options.placeholder
      this.validator = options.validator
      this.confirmCall = options.confirm
      this.cancelVisible = options.cancelVisible !== false
      this.visible = true
    },
    hide () {
      this.visible = false
      this.confirmCall = null
    },
    confirm () {
      if (this.validator && this.validator(this.content)) {
        return
      }
      this.confirmCall && this.confirmCall(this.type ? this.content : '')
      this.hide()
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../style/const.scss";

.sg-confirm {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 90%;
  border-radius: 1rem;
  background-color: white;
  transform: translate(-50%, -50%);

  input,
  textarea {
    display: block;
    width: 100%;
    padding: $padding-small;
    font-size: $size-text;
    line-height: $height-text;
    border: none;
    outline: none;
    box-sizing: border-box;
    background-color: transparent;
    border-bottom: 2px solid $color-border;
  }

  .sg-confirm-title {
    text-align: center;
    color: $color-title;
    font-size: $size-title;
    font-weight: bold;
    line-height: $height-title + 1rem;
  }
  .sg-confirm-content {
    padding: 2px 1rem 2rem;
    text-align: center;
    color: $color-text;
    font-size: $size-text;
    line-height: $height-text;
  }
  .sg-confirm-options {
    display: flex;
    align-items: center;
    line-height: 3.3rem;
    border-top: 1px solid $color-border;
    div {
      flex: 1;
      text-align: center;
    }
    span {
      display: inline-block;
      width: 1px;
      height: 3rem;
      background-color: $color-border;
    }
    button {
      font-size: $size-text;
      background-color: transparent;
    }
    .cancel {
      color: $color-tip;
    }
    .confirm {
      color: $color-theme;
      &:active {
        color: $color-theme-active;
      }
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
