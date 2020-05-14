<template>
  <button :class="`sg-button sg-button-` + type" :disabled="disabled || isLoading" @click="onClick">
    <i v-if="isLoading"></i>
    <slot></slot>
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
@import '../style/colors.scss';
@import '../style/size.scss';

.sg-button {
  padding: 0 $padding-normal;
  font-size: $size-text;
  border-radius: 0.3rem;
  line-height: $height-option;

  i {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    margin-right: 0.5rem;
    border-radius: 50%;
    border: 2px solid $main-color;
    border-left-color: transparent;
    animation: sg-rotate 1s infinite linear;
  }
}

.sg-button-default {
  display: block;
  width: 100%;
}

.sg-button-text {
  display: inline-block;
  padding: 0;
  color: $main-color;
}

.sg-button-primary {
  display: block;
  width: 100%;
  color: white;
  background-color: $main-color;
  &:active {
    background-color: $main-active-color;
  }
  &:disabled {
    background-color: $main-disabled-color;
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
