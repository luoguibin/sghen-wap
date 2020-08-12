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
        <template v-for="item in list" >
          <div :key="item.id + '-time'" v-if="item.timeLine" class="time-line sg-sticky-item">
            {{item.timeLine}}
          </div>
          <div :key="item.id" class="images-item" item-type="images-item">
            <div class="image-outter" v-for="src in item.smallImages" :key="src">
              <div class="image-inner">
                <img  item-type="image"  :src="src" alt />
              </div>
            </div>
          </div>
          <div :key="item.id + '-divider'" class="divider"></div>
        </template>
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
import { getSmallImage } from '@/common/image'
import { getItemIndex, getItemTypeIndex, getItemTypeObj } from '@/utils/dom'

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
        const nowYear = new Date().getFullYear()
        this.list.forEach(o => {
          const d = new Date(o.time_create)
          const yyyyMM_ = d.getFullYear() * 100000 + (d.getMonth() + 1)
          if (yyyyMM !== yyyyMM_) {
            yyyyMM = yyyyMM_
            const divider = '' + yyyyMM_
            if (nowYear === d.getFullYear()) {
              o.timeLine = '今年' + divider.substr(7, 8) + '月'
            } else {
              o.timeLine = divider.substr(0, 4) + '年' + divider.substr(7, 8) + '月'
            }
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

  .time-line {
    padding: 1rem;
    border-top: 1px solid white;
    font-size: 1.4rem;
    font-weight: bold;
    text-align: right;
    box-sizing: border-box;
    background-color: #f6f6f6;
  }
  .sg-sticking {
    z-index: 99;
  }

  .images-item {
    padding: 0 $padding-normal;
    // margin-bottom: 2rem;

    .image-outter {
      position: relative;
      display: inline-block;
      width: 33.33%;
      height: 0;
      padding-bottom: 33.33%;
    }
    .image-inner {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 100%;
      padding: 0.5rem;
      box-sizing: border-box;
      overflow: hidden;
    }
    img {
      display: inline-block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 5px;
    }
  }
  .divider {
    width: 92%;
    height: 1px;
    padding: 0 $padding-normal;
    margin: 0 auto;
    box-sizing: border-box;
    background-color: white;
  }
}
</style>
