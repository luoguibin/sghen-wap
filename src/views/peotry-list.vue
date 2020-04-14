<template>
  <div class="peotry-list">
    <sg-scroll ref="sgScroll" :isEnd="isEnd" @load="handleLoad" @refresh="handleRefresh">
      <peotry v-for="item in peotries" :key="item.id" :peotry="item" @img="handleImage"></peotry>
    </sg-scroll>

    <image-viewer :visible.sync="viewerVisible" :index="imageIndex" :images="images"></image-viewer>
  </div>
</template>

<script>
import { apiURL, apiGetData } from '@/api'
import Peotry from '@/components/peotry'
import ImageViewer from '@/components/image-viewer'

export default {
  nae: 'PeotryList',

  components: {
    Peotry,
    ImageViewer
  },

  data () {
    return {
      isEnd: false,
      peotries: [],

      page: 1,
      limit: 20,

      viewerVisible: false,
      images: [],
      imageIndex: 0
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
    },

    handleImage (e) {
      this.viewerVisible = true
      this.images = e.images
      this.imageIndex = e.index
    }
  }
}
</script>

<style lang="scss" scoped>
.peotry-list {
  position: relative;
  height: 100%;
  overflow: hidden;

  .peotry {
    margin-bottom: 3rem;
  }
}
</style>
