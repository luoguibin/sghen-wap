<template>
  <div class="test">
    <div v-for="(item, index) in items" :key="item.id" class="item-outter">
      <div class="item-inner">
        text-{{item.id}}
        <span>{{index}}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Test',

  data () {
    return {
      items: []
    }
  },

  mounted () {
    window.test = this

    for (let i = 0; i < 33; i++) {
      this.items.push({
        id: i
      })
    }
  },
  methods: {

  }
}
</script>

<style lang="scss" scoped>
.test {
  position: relative;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
  overflow-y: auto;

  .item-outter {
    display: inline-block;
    position: relative;
    width: 24%;
    height: 0;
    padding-top: 24%; // 一行四个： 100% / 4 = 25%； 每个通用右间距 1%
    vertical-align: top;
    margin-right: 1.3333%; // 每第四个元素无右间隔，则每行总间隔：1% * 4 = 4%；实际间隔：4% / 3 = 1.3333%
    margin-bottom: 1.3333%;
    &:nth-child(4n) {
      margin-right: 0; // 每第四个元素无右间隔
    }
    &:nth-last-child(1) {
      margin-bottom: 0;
    }
    &:nth-last-child(2) {
      margin-bottom: 0;
    }
    &:nth-last-child(3) {
      margin-bottom: 0;
    }
    &:nth-last-child(4) {
      margin-bottom: 0;
    }
  }
  .item-inner {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border: 1px solid rgb(84, 166, 214);
    border-radius: 10px;
    box-sizing: border-box;
    background-color: rgb(137, 169, 206);
    box-shadow:  0 5px 3px rgba(84, 166, 214, 0.507), 0 5px 5px 5px rgba(20, 138, 207, 0.4);
    text-align: center;
    color: white;
    font-size: 30px;
    padding-top: 30%;
    user-select: none;

    &:active {
      box-shadow:  0 0 5px rgb(22, 151, 108);
      transform: translate(0, 5px);
    }

    span {
      display: inline-block;
      position: absolute;
      top: 5px;
      right: 5px;
      font-size: 12px;
    }
  }
}
</style>

<style lang="scss">
html,
body {
  overflow: hidden;
}
body {
  margin: 0;
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>
