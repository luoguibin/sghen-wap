<template>
  <div>
    <div
      ref="testDiv"
    >
      <h1 ref="testP">123456</h1>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Test',

  data () {
    return {}
  },

  created () {
    window.test = this
  },

  mounted () {
    // @click="onClick($event, 'outter click')"
    // @click.capture="onClick($event, 'outter capture click')"
    [this.$el, this.$refs.testDiv, this.$refs.testP].forEach((node, i) => {
      node.addEventListener(
        'click',
        event => {
        // event.stopImmediatePropagation()
          console.log(i, '冒泡')
        },
        false
      )
      // 点击 node 只会执行上面的函数，该函数不会执行
      node.addEventListener(
        'click',
        event => {
          console.log(i, '捕获 ')
        },
        true
      )
    })
  },

  methods: {
    onClick (e, key) {
      console.log(key)
    }
  }
}
</script>

<style>
</style>
