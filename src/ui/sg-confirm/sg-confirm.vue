<template>
  <transition name="confirm">
    <div :class="['sg-mask', className || '']" v-show="visible">
      <div :class="{'sg-confirm': true, 'no-title': !title }">
        <div v-show="title" class="title">{{title}}</div>
        <div class="content">
          <input v-if="type === 'input'" v-model="content" :placeholder="placeholder" />
          <textarea v-else-if="type === 'textarea'" :placeholder="placeholder" v-model="content"></textarea>
          <template v-else>{{content}}</template>
        </div>
        <div class="options sg-flex">
          <div v-show="cancelVisible" class="sg-flex-one">
            <button class="cancel" @click="hide()">取消</button>
          </div>
          <span v-show="cancelVisible"></span>
          <div class="sg-flex-one">
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
      className: '',
      cancelVisible: true,
      title: '',
      content: '',
      type: ''
    }
  },

  created () {
    window.sgConfirm = this
  },

  methods: {
    show (params = {}) {
      this.className = params.className || ''
      this.title = params.title
      this.type = params.type
      this.content = params.content
      this.confirmCall = params.confirm
      this.cancelVisible = params.cancelVisible !== false

      if (this.type === 'input' || this.type === 'textarea') {
        this.placeholder = params.placeholder
        this.validator = params.validator
      }
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
@import "../style/index.scss";

.sg-confirm {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 85%;
  border-radius: 1rem;
  background-color: white;
  transform: translate(-50%, -50%);

  input,
  textarea {
    display: block;
    width: 100%;
    padding: $padding-small * 0.5 $padding-small;
    font-size: $size-text;
    line-height: $height-text;
    border: none;
    outline: none;
    box-sizing: border-box;
    background-color: $color-border;
  }

  .title {
    text-align: center;
    color: $color-title;
    font-size: $size-title;
    font-weight: bold;
    line-height: $height-title + 1rem;
  }
  .content {
    padding: 2px 1rem 2rem 1rem;
    text-align: center;
    color: $color-text;
    font-size: $size-text;
    line-height: $height-text;
  }
  .options {
    align-items: center;
    line-height: 3.3rem;
    border-top: 1px solid $color-border;
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
  .sg-flex-one {
      text-align: center;
    }
}
.no-title {
  .content {
    padding: 2rem 1rem;
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
