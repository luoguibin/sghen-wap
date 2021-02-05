<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'App',

  computed: {
    ...mapGetters({
      isLogin: 'auth/isLogin'
    })
  },

  created () {
    window.app = this
    this.getUserMsgs()
  },

  methods: {
    getUserMsgs () {
      if (!this.isLogin) {
        return
      }
      this.getSysMsgs()
    },

    ...mapActions({
      getSysMsgs: 'sysMsg/getSysMsgs'
    })
  }
}
</script>

<style lang="scss" scoped>
#app {
  height: 100%;
  background-color: #f6f6f6;
}
</style>
