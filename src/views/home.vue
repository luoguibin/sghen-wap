<template>
  <div class="home">
    <div class="home-header">
      <span>{{username}}</span>
      <span>|</span>
      <span @click="onConfirm">退出</span>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'Home',

  computed: {
    ...mapState({
      username: state => state.auth.username
    })
  },

  methods: {
    onConfirm () {
      this.$confirm({
        title: '提示',
        content: '退出后需要重新登录验证',
        confirm: () => {
          this.logout()
          this.$router.go(-1)
        }
      })
    },
    ...mapActions({
      logout: 'auth/logout'
    })
  }
}
</script>

<style lang="scss" scoped>
.home {
  padding: 0.5rem;
  .home-header {
    text-align: right;
    font-size: 1.6rem;
    span {
      padding: 0 0.2rem;
    }
  }
}
</style>
