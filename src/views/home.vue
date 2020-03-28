<template>
  <div class="home sg-flex">
    <div class="home-header">
      <span>{{username}}</span>
      <span>|</span>
      <span @click="onConfirm">退出</span>
    </div>

    <sg-scroll
      ref="sgScroll"
      class="home-body sg-flex-one"
      :isEnd="isEnd"
      @load="handleLoad"
      @refresh="handleRefresh"
    >
      <div class="scroll-item" style="text-align: center;">
        上拉加载，下拉刷新（请在移动端测试）
      </div>
      <div v-for="(item, index) in items" :key="index" class="scroll-item">{{index}}</div>
      <div class="scroll-item" style="text-align: center;">共{{totalCount}}项目</div>
    </sg-scroll>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'Home',

  data () {
    return {
      isEnd: false,
      totalCount: 50,
      loadCount: 0,
      items: []
    }
  },

  computed: {
    ...mapState({
      username: state => state.auth.username
    })
  },

  methods: {
    handleLoad () {
      this.loadCount += 20
      this.getItems()
    },
    handleRefresh () {
      this.loadCount = 20
      this.getItems()
    },
    getItems () {
      setTimeout(() => {
        const items = []
        const count = Math.min(this.totalCount, this.loadCount)
        this.isEnd = count === this.totalCount
        for (let i = 0; i < count; i++) {
          items.push(i)
        }
        this.items = items
        this.$refs.sgScroll.reset()
      }, 1500)
    },
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
  .home-header {
    padding: 1rem 0.5rem;
    text-align: right;
    font-size: 1.6rem;
    border-bottom: 0.1rem solid #eee;
    span {
      padding: 0 0.2rem;
    }
  }
  .home-body {
    background-color: #f8f8f8;
  }

  .scroll-item {
    padding: 1.6rem 1rem;
    margin-bottom: 2rem;
    background-color: white;
  }
}
</style>
