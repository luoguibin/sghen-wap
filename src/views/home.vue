<template>
  <div class="home">
    <div class="home-header">
      <span>{{userName}}</span>
      <span>|</span>
      <span @click="onConfirm">退出</span>
    </div>

    <!-- 内容 -->
    <div class="home-body">
      <div style="padding: 1rem;">
        <sg-swipper :items="swipperItems">
          <div v-for="item in swipperItems" :key="item.slot" :slot="item.slot">{{item.slot}}</div>
        </sg-swipper>
      </div>

      <sg-dropdown :options="dropdownOptions" style="width: 10rem; margin: 0 auto;"></sg-dropdown>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'Home',

  components: {
  },

  data () {
    return {
      hotPeotries: [],
      swipperItems: [{ slot: 'item-0' }, { slot: 'item-1' }, { slot: 'item-2' }],
      dropdownOptions: [
        { label: 'label-0', value: '0' },
        { label: 'label-1', value: '1' },
        { label: 'labelabellabellabellabellabellabell-2', value: '0-2' },
        { label: 'label-1', value: '2' },
        { label: 'label-1', value: '3' },
        { label: 'label-1', value: '4' },
        { label: 'label-1', value: '5' },
        { label: 'label-1', value: '6' },
        { label: 'label-1', value: '7' },
        { label: 'label-1', value: '8' },
        { label: 'label-1', value: '9' },
        { label: 'label-1', value: '10' }
      ]
    }
  },

  computed: {
    ...mapState({
      userName: state => state.auth.userName
    })
  },

  created () {
    window.home = this
  },

  methods: {
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
