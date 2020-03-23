<template>
  <div class="home">
    <div class="home-header">
      <span>{{username}}</span>
      <span>|</span>
      <span @click="onConfirm">退出</span>
    </div>

    <div class="home-main">
      <canvas ref="canvas"></canvas>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { SgcUi } from '@/canvas-ui'

export default {
  name: 'Home',

  created () {
    window.home = this
  },

  mounted () {
    const sgcUi = new SgcUi(this.$refs.canvas)
    this.$once('hook:beforeDestroy', () => {
      sgcUi.release()
    })
  },

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
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: rgb(138, 138, 138);
  overflow: hidden;
  .home-header {
    padding: 0.5rem;
    text-align: right;
    font-size: 1.6rem;
    background-color: rgb(102, 102, 102);
    span {
      padding: 0 0.2rem;
    }
  }
  .home-main {
    flex: 1;
  }
}
</style>
