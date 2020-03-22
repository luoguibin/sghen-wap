<template>
  <div :class="`sg-button sg-button-` + type">
    <button :disabled="disabled || isLoading" @click="onClick">
      <span v-show="isLoading"></span>
      <slot v-if="!isLoading"></slot>
    </button>
  </div>
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
@import '@/style/colors.scss';

.sg-button {
  text-align: center;
  font-size: 1.6rem;
  button {
    display: block;
    width: 100%;
    padding: 0.5rem 1rem;
    font-size: inherit;
    border-radius: 0.3rem;
  }
  span {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    border: 0.2rem solid white;
    border-left-color: transparent;
    animation: sg-rotate 1s infinite linear;
  }
}

.sg-button-default {
  button {
    color: $main-color;
  }
}

.sg-button-primary {
  button {
    color: white;
    background-color: $main-color;
    &:active {
      background-color: $main-active-color;
    }
    &:disabled {
      background-color: $main-disabled-color;
    }
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
