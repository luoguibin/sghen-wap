<template>
  <div class="image-uploader">
    <div class="images">
      <div v-for="item in imageDatas" :key="item.id" class="image-wrapper">
        <div class="image-wrapper__inner">
          <img v-if="item.ready" :src="item.data" />
        </div>
        <div v-show="!isUploading" class="delete" @click="onDelete(item.id)">
          <i class="iconfont icon-close"></i>
        </div>
      </div>

      <!-- 选择入口 -->
      <div class="image-wrapper" v-show="!isUploading && imageDatas.length < max">
        <div class="image-wrapper__inner choice">
          <span class="iconfont icon-increase"></span>
          <input type="file" accept="image/*" @change="handleChange" multiple />
        </div>
      </div>
    </div>

    <!-- 上传进度条 -->
    <div v-show="progress" class="progress">
      <div class="progress-bar" :style="{width: progress}"></div>
    </div>
  </div>
</template>

<script>
import { apiURL, apiPostUpload } from '@/api'
import { resizeImage, base64ToFile } from '@/common/image'

export default {
  name: 'ImageUploader',

  props: {
    max: {
      type: Number,
      default: 9
    }
  },

  data () {
    return {
      imageDatas: [],
      progress: '',
      isUploading: false
    }
  },

  created () {
    window.imageUploader = this
  },

  methods: {
    handleChange (e) {
      const files = [...e.target.files].filter(o => {
        return ['jpg', 'png', 'jpeg'].some(v => o.name.endsWith(o.name))
      })
      if (files.length + this.imageDatas.length > this.max) {
        this.$toast(`最多只能上传${this.max}张图片`)
      }

      const time = Date.now()
      const imageDatas = files
        .map((o, i) => {
          return {
            file: o,
            id: time + i,
            ready: false,
            data: ''
          }
        })
        .slice(0, this.max - this.imageDatas.length)

      this.imageDatas.push(...imageDatas)
      this.checkImages()
    },
    /**
     * 检测是否需要上传图片
     */
    checkImages () {
      const imageDataMap = {}
      this.imageDatas.forEach(o => {
        imageDataMap[o.id] = o
      })
      this.imageDatas.forEach(o => {
        if (o.ready) {
          return
        }
        const reader = new FileReader()
        reader.onload = e => {
          resizeImage(e.target.result)
            .then(src => {
              imageDataMap[o.id].data = src
              imageDataMap[o.id].ready = true
            })
            .catch(() => {
              this.$toast('图片加载失败，请删除重试')
            })
        }
        reader.readAsDataURL(o.file)
      })
    },
    /**
     * 上传图片
     */
    start () {
      // console.log('start uploadImages')
      if (this.isUploading) {
        return
      }
      this.isUploading = true

      if (!this.imageDatas.length) {
        this.$emit('success', [])
        return
      }
      const isAllReady = this.imageDatas.every(o => o.ready)
      if (!isAllReady) {
        this.$toast('图片加载错误，请处理')
        this.$emit('fail')
        return
      }
      const form = new FormData()
      this.imageDatas.forEach(o => {
        // o.data是base64数据，canvas产生默认为png格式
        form.append('file', base64ToFile(o.data, o.file.name))
      })

      this.progress = '0%'
      apiPostUpload(apiURL.upload, form, { pathType: 'peotry' }, e => {
        this.progress = Math.floor(e.loaded / e.total * 100) + '%'
      })
        .then(resp => {
          this.isUploading = false
          this.progress = '100%'
          this.$emit('success', resp.data)
          this.$nextTick(() => {
            this.progress = ''
          })
        })
        .catch(() => {
          this.isUploading = false
          this.progress = ''
          this.$emit('fail')
          this.$toast('上传失败，请重试')
        })
    },
    onDelete (id) {
      const index = this.imageDatas.findIndex(o => o.id === id)
      this.imageDatas.splice(index, 1)
    }
  }
}
</script>

<style lang="scss">
@import "@/ui/style/const.scss";

.image-uploader {
  position: relative;
  padding: 0.5rem 0;
  min-height: 5rem;

  .choice {
    .icon-increase {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 3rem;
    }
    input {
      position: absolute;
      top: 0;
      left: 0;
      display: inline-block;
      width: 100%;
      height: 100%;
      opacity: 0;
    }
  }

  .images {
    margin-right: -3%;
    box-sizing: border-box;
    overflow: hidden;
  }

  .progress {
    position: absolute;
    right: 0;
    bottom: 8px;
    left: 0;
    width: 100%;
    background-color: #adc0ca;
    border-radius: 3px;
    .progress-bar {
      width: 0;
      height: 8px;
      background-color: $color-theme;
      border-radius: 3px;
      transition: width 300ms;
    }
  }

  .delete {
    position: absolute;
    top: 5px;
    right: 5px;
    width: 2.5rem;
    height: 2.5rem;
    line-height: 2.5rem;
    text-align: center;
    background-color: rgba(53, 53, 53, 0.3);
    border-radius: 50%;
    .icon-close {
      color: white;
    }
  }
}

.image-wrapper {
  position: relative;
  display: inline-block;
  width: 30%;
  height: 0;
  padding-bottom: 30%;
  margin-right: 3%;
  margin-bottom: 3%;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .image-wrapper__inner {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;
    box-sizing: border-box;
    border: 1px solid gray;
    border-radius: 5px;
  }
}
</style>
