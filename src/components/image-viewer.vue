<template>
  <div class="image-viewer-mask" v-show="visible">
    <div class="image-viewer">
      <div class="image-viewer-header">
        <div @click="$emit('update:visible', false)">&lt;</div>
        <span>|</span>
        <div class="image-name">{{currentName}}</div>
      </div>
      <div :class="{'image-viewer-wrapper': true, 'image-view-origin': showType}">
        <sg-swipper ref="swipper" :items="swipperItems" :auto="false" @change="hanleChange">
          <div v-for="(item, index) in imageOptions" :key="index" :slot="'img-' + index" class="image-wrapper">
            <img v-if="item.visible" :src="item.src" />
          </div>
        </sg-swipper>
      </div>
      <!-- <div class="image-viewer-footer">
        <sg-button @click="showType = !showType">原图/自适应</sg-button>
      </div> -->
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
      imageOptions: [],
      showType: false
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
      const name = this.images[this.index]
      const index = name.lastIndexOf('/') + 1
      return name.substr(index)
    }
  },

  watch: {
    visible (v) {
      if (v) {
        const swipper = this.$refs.swipper
        swipper && swipper.setCurrentIndex(this.index)
        console.log(swipper, this.index)
        this.imageOptions = this.images.map(v => {
          return { src: v, visible: false }
        })
      }
    }
  },

  created () {
    window.imageViewer = this
  },

  methods: {
    hanleChange (index) {
      this.currentIndex = index
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
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
  background-color: rgba(0, 0, 0, 0.6);
}
.image-viewer {
  position: relative;
  height: 100%;
  box-sizing: border-box;
  .image-viewer-header {
    position: absolute;
    z-index: 10;
    width: 100%;
    display: flex;
    flex-direction: row;
    font-size: 1.8rem;
    color: white;
    div {
      display: inline-block;
    }
    .image-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    span {
      padding: 0 0.5rem;
    }
  }
  .image-viewer-footer {
    position: absolute;
    bottom: 0;
    z-index: 10;
    width: 100%;
    text-align: center;
  }
  .image-viewer-wrapper {
    height: 100%;
    overflow: hidden;
  }
  .image-wrapper {
    position: absolute;
    top: 50%;
    transform: translate(0, -50%);
    padding: 1rem;
    max-width: 100%;
    max-height: 100%;
    img {
      width: 100%;
    }
  }
}
</style>

<style lang="scss">
.image-viewer {
  .sg-swipper {
    height: 100%;
    .sg-swipper-item {
      position: relative;
      background-color: transparent;
    }
  }
}
</style>
