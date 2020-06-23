<template>
  <div class="sg-mask image-viewer-mask" v-show="visible">
    <div class="image-viewer">
      <sg-header @back="$emit('update:visible', false)" :centerStatus="''" :rightStatus="''">
        <span slot="left">{{currentName}}</span>
      </sg-header>
      <div :class="{'image-viewer-wrapper': true, 'image-view-origin': isShowNatural}">
        <sg-slider
          v-if="visible"
          ref="swipper"
          :index="index"
          :items="swipperItems"
          @change="hanleChange"
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
      <div class="image-viewer-footer">
        <sg-button @click="isShowNatural = !isShowNatural">{{isShowNatural ? '自适应' : '原图'}}</sg-button>
      </div>
    </div>
  </div>
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
      isShowNatural: false
    }
  },

  computed: {
    swipperItems () {
      return this.images.map((o, i) => {
        return {
          slot: 'img-' + i
        }
      })
    },
    currentName () {
      if (!this.images.length) {
        return ''
      }
      const name = this.images[this.currentIndex]
      const index = name.lastIndexOf('/') + 1
      return name.substr(index)
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
      if (index < 0) {
        return
      }
      this.currentIndex = index
      this.isShowNatural = false
      if (!this.imageOptions.length) {
        return
      }
      const min = Math.max(index - 2, 0)
      const max = Math.min(index + 2, this.images.length - 1)
      for (let i = min; i <= max; i++) {
        this.imageOptions[i].visible = true
      }
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
    // width: 100%;
    height: 100%;
    // overflow: auto;
  }
  .image-wrapper {
    // position: absolute;
    // top: 50%;
    // transform: translate(0, -50%);
    // height: 100%;
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
</style>

<style lang="scss">
.image-viewer {
  .sg-header .left {
    color: white;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .sg-swipper {
    height: 100%;
    .sg-swipper-item {
      position: relative;
      background-color: transparent;
    }
  }
  .image-view-origin .sg-swipper-item_active,
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
