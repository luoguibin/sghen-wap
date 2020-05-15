<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',

  created () {
    window.app = this
  },

  methods: {}
}
</script>

<style lang="scss" scoped>
#app {
  height: 100%;
  background-color: #f6f6f6;
}
</style>
