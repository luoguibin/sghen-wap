<template>
  <div class="home">
    <div class="home-header">
      <template v-if="isLogin">
        <span>{{userName}}</span>
        <span>|</span>
        <span @click="onConfirm">退出</span>
      </template>
      <span v-else @click="onGoLogin">登陆</span>
    </div>

    <!-- 内容 -->
    <div class="home-body">
      <sg-swipper :items="swipperItems">
        <div v-for="(item, index) in swipperItems" :key="item.slot" :slot="item.slot">
          <template v-if="index > 0">
            {{item.slot}}
          </template>
          <div v-else>
            <sg-button @click="$router.push({name: 'peotry-list'})">peotry-list</sg-button>
          </div>
        </div>
      </sg-swipper>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  name: 'Home',

  components: {
  },

  data () {
    return {
      swipperItems: [{ slot: 'item-0' }, { slot: 'item-1' }, { slot: 'item-2' }]
    }
  },

  computed: {
    ...mapGetters({
      isLogin: 'auth/isLogin'
    }),
    ...mapState({
      userName: state => state.auth.userName
    })
  },

  created () {
    window.home = this
  },

  methods: {
    onGoLogin () {
      this.$router.push({ name: 'login', query: { redirect: this.$route.fullPath } })
    },
    onConfirm () {
      this.$confirm({
        title: '提示',
        content: '退出后需要重新登录验证',
        confirm: () => {
          this.logout()
          this.$router.push({ name: 'login' })
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
  .home-header {
    padding: 1rem 0.5rem;
    text-align: right;
    font-size: 1.6rem;
    border-bottom: 1px solid #eee;
    span {
      padding: 0 2px;
    }
  }

  .home-body {
    flex: 1;
    height: 100%;
    overflow: hidden auto;
  }
}
</style>
