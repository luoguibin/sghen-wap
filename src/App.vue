<template>
  <div id="app">
    <login></login>
    <button @click="onConfirm">confirm</button>
  </div>
</template>

<script>
import Login from '@/components/login'

export default {
  name: 'App',

  components: { Login },

  methods: {
    onConfirm () {
      this.$confirm({
        title: '提示',
        content: '删除后无法找回',
        confirm: () => {
          console.log(this.$options.name)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
#app {}
</style>
