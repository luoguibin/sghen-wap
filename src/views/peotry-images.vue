<template>
  <div class="peotry-images sg-flex-column">
    <sg-header @back="$router.go(-1)">诗词图集</sg-header>

    <div class="main sg-flex-one" @click="onClickImage">
      <sg-scroll
        ref="sgScroll"
        :isEnd="isEnd"
        :auto="true"
        @load="handleLoad"
        @refresh="handleRefresh"
      >
        <div v-for="item in list" :key="item.id" class="images-item" item-type="images-item">
          <div v-if="item.timeDivider" class="time-divider">
            <h2>{{item.timeDivider}}</h2>
          </div>
          <div class="images">
            <img v-for="src in item.smallImages" item-type="image" :key="src" :src="src" alt />
          </div>
          <div class="divider"></div>
        </div>
      </sg-scroll>
    </div>

    <image-viewer
      :visible.sync="viewerVisible"
      :index="viewIndex"
      :images="viewImages"
      @change="handleChange"
    ></image-viewer>
  </div>
</template>

<script>
import Vue from 'vue'
import { apiURL, apiGetData } from '@/api'
import { getSmallImage } from '@/utils/sgData'
import { getItemIndex, getItemTypeIndex, getItemTypeObj } from '@/utils/sgDom'

export default {
  name: 'PeotryImages',

  components: {
    ImageViewer: () => import('@/components/image-viewer')
  },

  data () {
    return {
      isEnd: false,
      page: 1,
      limit: 20,
      total: 0,
      list: [],

      viewerVisible: false,
      viewIndex: 0,
      viewImages: []
    }
  },

  created () {
    window.peotryImages = this
  },

  methods: {
    handleLoad (isRefresh) {
      if (!isRefresh) {
        this.page += 1
      }

      apiGetData(apiURL.peotryImageList, {
        offset: (this.page - 1) * this.limit,
        limit: this.limit
      }).then(resp => {
        this.total = resp.data.count

        const list = resp.data.data
        const imgSrcFunc = Vue.filter('imgSrcFilter')
        list.forEach(o => {
          o.images = JSON.parse(o.images).map(imgSrcFunc)
          o.smallImages = o.images.map(getSmallImage)
        })
        if (isRefresh) {
          this.list = list
        } else {
          this.list.push(...list)
        }
        let yyyyMM = 0
        this.list.forEach(o => {
          const d = new Date(o.time_create)
          const yyyyMM_ = d.getFullYear() * 1000 + (d.getMonth() + 1)
          if (yyyyMM !== yyyyMM_) {
            yyyyMM = yyyyMM_
            const divider = '' + yyyyMM_
            o.timeDivider = divider.substr(0, 4) + '-' + divider.substr(5, 6)
          }
        })
        this.isEnd = this.list.length >= this.total
        this.$refs.sgScroll.success()
      })
    },
    handleRefresh () {
      this.page = 1
      this.handleLoad(true)
    },

    onClickImage (e) {
      const { el, itemType } = getItemTypeObj(e.target) || {}
      if (!itemType) {
        return
      }

      const itemIndex = getItemIndex(el)
      const index = getItemTypeIndex(el, 'images-item')
      const allImages = []

      this.viewIndex = itemIndex
      this.list.forEach((o, i) => {
        if (i < index) {
          this.viewIndex += o.images.length
        }
        allImages.push(...o.images)
      })
      this.viewImages = allImages
      this.viewerVisible = true
    },

    handleChange (index) {
    },

    onGoPeotry (index) {
      this.$router.push({
        name: 'peotry-detail',
        params: { id: this.lastestImages[index].id }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/ui/style/const.scss";

.peotry-images {
  height: 100%;
  padding: 0 $padding-normal;

  .images-item {
    margin-bottom: 2rem;

    .time-divider {
      margin-top: 2rem;
      text-align: right;
    }

    img {
      width: 33%;
      padding: 0.5rem;
      box-sizing: border-box;
      vertical-align: top;
    }

    .divider {
      border-top: 1px solid $color-theme-disabled;
    }
  }
}
</style>
