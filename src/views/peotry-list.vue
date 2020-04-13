<template>
  <div class="peotry-list">
    <sg-scroll ref="sgScroll" :isEnd="isEnd" @load="handleLoad" @refresh="handleRefresh">
      <peotry v-for="item in peotries" :key="item.id" :peotry="item"></peotry>
    </sg-scroll>
  </div>
</template>

<script>
import { apiURL, apiGetData } from '@/api'
import Peotry from '@/components/peotry'

export default {
  nae: 'PeotryList',

  components: {
    Peotry
  },

  data () {
    return {
      isEnd: false,
      peotries: [],

      page: 1,
      limit: 20
    }
  },

  created () {
    window.peotryList = this
  },

  methods: {
    handleLoad (isRefresh) {
      if (!isRefresh) {
        this.page += 1
      }
      apiGetData(apiURL.peotryList, {
        page: this.page,
        limit: this.limit
      }).then(data => {
        if (isRefresh) {
          this.peotries = data.data
        } else {
          this.peotries.push(...data.data)
        }

        this.isEnd = this.peotries.length === data.totalCount
      }).finally(() => {
        this.$refs.sgScroll.reset()
      })
    },
    handleRefresh () {
      this.page = 1
      this.handleLoad(true)
    }
  }
}
</script>

<style lang="scss" scoped>
.peotry-list {
  height: 100%;
  overflow: hidden;

  .peotry {
    margin-bottom: 3rem;
  }
}
</style>
