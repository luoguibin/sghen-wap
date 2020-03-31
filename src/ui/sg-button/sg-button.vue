<template>
  <button :class="`sg-button sg-button-` + type" :disabled="disabled || isLoading" @click="onClick">
    <i v-show="isLoading"></i>
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
    onClick () {
      if (this.isLoading) {
        return
      }
      this.$emit('click')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../style/colors.scss';

.sg-button {
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  border-radius: 0.3rem;
  text-align: center;
  font-size: 1.6rem;

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
  color: $main-color;
}

.sg-button-primary {
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

@keyframes sg-rotate {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(1turn);
  }
}
</style>
