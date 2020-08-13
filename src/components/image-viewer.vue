<template>
  <transition name="viewer">
    <div class="sg-mask image-viewer-mask" v-show="visible">
      <div class="image-viewer">
        <sg-header v-show="optionsVisible" @back="$emit('update:visible', false)" :centerStatus="''" :rightStatus="''">
          <span slot="left">图片详情</span>
        </sg-header>
        <div :class="{'image-viewer-wrapper': true, 'image-view-origin': isShowNatural}">
          <sg-slider
            v-if="visible"
            ref="slider"
            :index="index"
            :items="sliderItems"
            @change="hanleChange"
            @click="handleClick"
          >
            <div
              v-for="(item, index) in imageOptions"
              :key="index"
              :slot="'img-' + index"
              class="image-wrapper"
            >
              <img v-if="item.visible" :src="item.src" />
            </div>
          </sg-slider>
        </div>
        <div v-show="optionsVisible" class="image-viewer-footer">
          <!-- <sg-button @click="isShowNatural = !isShowNatural">{{isShowNatural ? '自适应' : '原图'}}</sg-button> -->
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'ImageViewer',

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    index: {
      type: Number,
      default: 0
    },
    images: {
      type: Array,
      required: true
    }
  },

  data () {
    return {
      currentIndex: 0,
      imageOptions: [],
      isShowNatural: false,
      optionsVisible: true
    }
  },

  computed: {
    sliderItems () {
      return this.images.map((o, i) => {
        return {
          slot: 'img-' + i
        }
      })
    }
  },

  watch: {
    visible (v) {
      if (v) {
        this.currentIndex = this.index
        this.imageOptions = this.images.map((v, i) => {
          return { src: v, visible: Math.abs(i - this.index) < 2 }
        })
      }
    }
  },

  created () {
    window.imageViewer = this
  },

  methods: {
    hanleChange (index) {
      if (!this.imageOptions.length) {
        return
      }

      this.$emit('change', index)
      if (index < 0) {
        return
      }
      this.currentIndex = index
      this.isShowNatural = false

      const min = Math.max(index - 2, 0)
      const max = Math.min(index + 2, this.images.length - 1)
      for (let i = min; i <= max; i++) {
        this.imageOptions[i].visible = true
      }
    },
    handleClick () {
      if (!this.clickTime) {
        this.clickTime = 0
      }
      if (this.clickTimer) {
        clearTimeout(this.clickTimer)
        this.clickTimer = null
      }
      const nowTime = Date.now()
      const clickDelayTime = 250
      if (nowTime - this.clickTime < clickDelayTime) {
        this.isShowNatural = !this.isShowNatural
      } else {
        this.clickTimer = setTimeout(() => {
          this.clickTimer = null
          this.optionsVisible = !this.optionsVisible
        }, clickDelayTime)
      }
      this.clickTime = nowTime
    }
  }
}
</script>

<style lang="scss" scoped>
.image-viewer-mask {
  position: absolute;
}
.image-viewer {
  position: relative;
  height: 100%;
  box-sizing: border-box;
  .sg-header {
    position: absolute;
    z-index: 10;
    width: 100%;
    span {
      margin-left: 0.5rem;
    }
  }
  .image-viewer-footer {
    position: absolute;
    bottom: 0;
    z-index: 10;
    width: 100%;
    text-align: right;
    .sg-button {
      display: inline-block;
      width: initial;
    }
  }
  .image-viewer-wrapper {
    height: 100%;
  }
  .image-wrapper {
    box-sizing: border-box;
    padding: 1rem;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
}
.viewer-enter,
.viewer-leave-to {
  background-color: transparent;
}
.viewer-enter-active,
.viewer-leave-active {
  transition: background-color 0.3s ease;
}
</style>

<style lang="scss">
.image-viewer {
  .sg-header .left {
    color: white;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .image-view-origin .card-item__active {
    .image-wrapper {
      img {
        width: initial;
        height: initial;
        object-fit: none;
      }
    }
  }
}
</style>
