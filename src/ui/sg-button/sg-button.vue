<template>
  <button :class="`sg-button sg-button-` + type" :disabled="disabled || isLoading" @click="onClick">
    <i v-if="isLoading"></i>
    <span><slot></slot></span>
  </button>
</template>

<script>
export default {
  name: 'SgButton',

  props: {
    type: {
      type: String,
      default: 'default'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    onClick (e) {
      if (this.isLoading) {
        return
      }
      this.$emit('click', e)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../style/const.scss';

.sg-button {
  padding: 0 $padding-normal;
  font-size: $size-text;
  line-height: $height-text * 1.5;
  border-radius: 0.3rem;

  i {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    margin-right: 0.5rem;
    border-radius: 50%;
    border: 2px solid $color-theme;
    border-left-color: transparent;
    animation: sg-rotate 1s infinite linear;
  }

  i,
  span {
    vertical-align: middle;
  }
}

.sg-button-default {
  display: block;
  width: 100%;
  color: $color-text;
  background-color: $color-bg;
  &:active {
    background-color: mix($color-bg, $color-theme, 90%);
    color: $color-theme-active;
  }
  &:disabled {
    background-color: $color-theme-disabled;
  }
}

.sg-button-text {
  display: inline-block;
  padding: 0;
  color: $color-theme;
  line-height: $height-text;
  &:active {
    color: $color-theme-active;
  }
  &:disabled {
    color: $color-theme-disabled;
  }
}

.sg-button-primary {
  display: block;
  width: 100%;
  color: white;
  background-color: $color-theme;
  &:active {
    background-color: $color-theme-active;
  }
  &:disabled {
    background-color: $color-theme-disabled;
  }
  i {
    border: 2px solid white;
    border-left-color: transparent;
  }
}

.sg-button-subsidiary {

}

@keyframes sg-rotate {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(1turn);
  }
}
</style>
