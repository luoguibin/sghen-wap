<template>
  <div class="sg-header sg-flex">
    <div v-if="leftStatus" class="left">
      <div v-show="leftStatus === 'visible'">
        <span v-show="backVisible" class="back iconfont icon-down" @click="onBack"></span>
        <slot name="left"></slot>
      </div>
    </div>
    <div v-if="centerStatus" class="center">
      <div v-show="centerStatus === 'visible'">
        <slot></slot>
      </div>
    </div>
    <div v-if="rightStatus" class="right">
      <div v-show="rightStatus === 'visible'">
        <slot name="right"></slot>
      </div>
    </div>
  </div>
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
    autoBack: {
      type: Boolean,
      default: true
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
.sg-header {
  padding: 1rem;
  .back {
    display: inline-block;
    transform: rotate(90deg);
  }

  .left {
    flex: 1;
    text-align: left;
  }
  .center {
    flex: 3;
    text-align: center;
  }
  .right {
    flex: 1;
    text-align: right;
  }
}
.sg-flex {
  overflow: initial;
}
</style>
