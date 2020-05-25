<template>
  <div class="sg-table sg-flex-column">
    <div class="sg-table-header row-item sg-flex">
      <div
        v-for="item in headers"
        :key="item.key"
        :class="{'cell-item': true, 'sg-flex-one': !item.style || !item.style.width}"
        :style="item.style"
      >{{item.label}}</div>
    </div>

    <div class="sg-table-content sg-flex-one">
      <div class="sg-scroll">
        <div v-for="item in items" :key="item.id" class="row-item sg-flex">
          <div
            v-for="item_ in headers"
            :key="item_.key"
            :class="{'cell-item': true, 'sg-flex-one': !item_.style || !item_.style.width}"
            :style="item_.style"
          >
            <template v-if="!item_.slot">{{item[item_.key]}}</template>
            <slot :name="item_.key" :scope="item"></slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SgTable',

  props: {
    headers: {
      type: Array,
      default () {
        return []
      }
    },

    items: {
      type: Array,
      default () {
        return []
      }
    }
  },

  data () {
    return {}
  },

  created () {
    window.sgTable = this
  }
}
</script>

<style lang="scss" scoped>
@import "../style/const.scss";
@import "../style/index.scss";

.sg-table {
  height: 100%;

  .row-item {
    line-height: $height-text * 1.3;
    font-size: $size-text;
    color: $color-text;
  }
  .cell-item {
    display: inline-block;
    @extend .sg-ellipsis;
  }

  .sg-table-header {
    .cell-item {
      display: inline-block;
      font-weight: bold;
    }
  }
  .sg-table-content {
    height: 100%;
    overflow: hidden;
    .row-item:nth-child(2n) {
      background-color: #fafafa;
    }
  }
  .sg-scroll {
    height: 100%;
    overflow: auto;
  }
}
</style>
