<template>
  <header class="sg-header sg-flex">
    <div v-if="leftStatus" v-show="leftStatus === 'visible'" class="left">
      <span v-show="backVisible" class="back iconfont icon-down" @click="onBack"></span>
      <slot name="left"></slot>
    </div>
    <div v-if="centerStatus" class="center">
      <div v-show="centerStatus === 'visible'">
        <slot></slot>
      </div>
    </div>
    <div v-if="rightStatus" v-show="rightStatus === 'visible'" class="right">
      <slot name="right"></slot>
    </div>
  </header>
</template>

<script>
export default {
  name: 'SgHeader',

  props: {
    leftStatus: {
      type: String,
      default: 'visible'
    },
    centerStatus: {
      type: String,
      default: 'visible'
    },
    rightStatus: {
      type: String,
      default: 'visible'
    },
    backVisible: {
      type: Boolean,
      default: true
    }
  },

  created () {
    window.sgHeader = this
  },

  methods: {
    onBack () {
      this.$emit('back')
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../style/const.scss";

.sg-header {
  padding: 0 $padding-normal;
  height: $height-title * 1.5;
  color: $color-text;
  line-height: $height-title * 1.5;
  align-items: center;
  box-sizing: border-box;
  .back {
    display: inline-block;
    transform: rotate(90deg);
  }

  .left {
    flex: 1;
    text-align: left;
    font-size: $size-option;
  }
  .center {
    flex: 3;
    color: $color-title;
    text-align: center;
    font-size: $size-title;
    font-weight: bold;
  }
  .right {
    flex: 1;
    text-align: right;
    font-size: $size-option;
  }
}
</style>
