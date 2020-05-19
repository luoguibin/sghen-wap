<template>
  <div class="sg-mask">
    <div class="peotry-edit-wrapper">
      <div class="peotry-edit">
        <sg-header @back="$emit('close')">
          <span style="font-size: 1.6rem;">诗词{{peotry ? '更新':'创建'}}</span>
        </sg-header>

        <div class="main">
          <div class="main-wrapper">
            <sg-form ref="form" :formData="formData" :formRules="formRules">
              <div slot="setId" class="set-item">
                <span
                  :class="{'is-setname': !!setName}"
                  @click="onOpenSetChoice"
                >{{ setName ? setName : '请选择'}}</span>
              </div>

              <div v-if="!formData.id" slot="imageNames" class="petory-item">
                <image-uploader ref="uploader" @success="handleUpload" @fail="handleUploadFail"></image-uploader>
              </div>

              <sg-button
                type="primary"
                style="margin-top: 2rem;"
                :disabled="isSaveing"
                :isLoading="isSaveing"
                @click="onConfirm"
              >{{peotry ? '更新':'创建'}}</sg-button>
            </sg-form>
          </div>
        </div>
      </div>
    </div>

    <!-- 选集选择 -->
    <div v-show="peotrySetsVisible" class="peotry-sets-wrapper">
      <peotry-sets
        :defId="formData.setId"
        @back="peotrySetsVisible = false"
        @select="handleSetSelect"
      ></peotry-sets>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { apiURL, apiPostData } from '@/api'

export default {
  name: 'PeotryEdit',

  components: {
    'image-uploader': () => import('@/components/image-uploader'),
    'peotry-sets': () => import('@/components/peotry-sets')
  },

  props: {
    peotry: {
      type: Object,
      default () {
        return null
      }
    }
  },

  data () {
    return {
      formData: {
        id: null,
        setId: null,
        title: '',
        content: '',
        end: '',
        imageNames: ''
      },
      formRules: [
        {
          key: 'setId',
          label: '选集',
          slot: true,
          required: true,
          hasValue: true,
          validator: (v, rule) => {
            return v ? '' : '请选择' + rule.label
          },
          _error: ''
        },
        {
          key: 'title',
          label: '标题',
          required: true,
          validator: (v, rule) => {
            return v ? '' : '请输入' + rule.label
          },
          _error: ''
        },
        {
          key: 'content',
          label: '内容',
          required: true,
          type: 'textarea',
          style: {
            'min-height': '10rem'
          },
          validator: (v, rule) => {
            if (!v) {
              return '请输入' + rule.label
            }
            return v.length > 4 ? '' : '内容长度不能少于5个字符'
          },
          _error: ''
        },
        {
          key: 'end',
          label: '尾注',
          required: false,
          type: 'textarea',
          _error: ''
        },
        {
          key: 'imageNames',
          label: '图集',
          slot: true,
          hasValue: true,
          hidden: false
        }
      ],

      setName: '',
      peotrySetsVisible: false,
      isSaveing: false
    }
  },

  computed: {
    ...mapState({
      userName: state => state.auth.userName,
      userID: state => state.auth.userID
    })
  },

  created () {
    window.peotryEdit = this
    this.initFormData()
  },

  methods: {
    initFormData () {
      const peotry = this.peotry
      if (peotry) {
        const data = this.formData
        data.id = peotry.id
        data.setId = peotry.set && peotry.set.id
        data.title = peotry.title
        data.content = peotry.content
        data.end = peotry.end

        this.setName = peotry.set && peotry.set.name
        this.formRules[this.formRules.length - 1].hidden = true
      }
    },
    onOpenSetChoice () {
      this.peotrySetsVisible = true
    },
    handleSetSelect ({ id, name }) {
      this.formData.setId = id
      this.setName = name
      this.peotrySetsVisible = false
    },

    handleUpload (images = []) {
      if (images.length) {
        this.formData.imageNames = JSON.stringify(images)
      } else {
        this.formData.imageNames = ''
      }

      this.savePeotry()
    },
    handleUploadFail () {
      this.isSaveing = false
    },
    onConfirm () {
      this.$refs.form.validate(error => {
        if (error) {
          return
        }
        if (this.isSaveing) {
          return
        }
        this.isSaveing = true

        if (!this.formData.id) {
          // 调用上传，产生回调事件
          this.$refs.uploader.start()
        } else {
          this.handleUpload()
        }
      })
    },

    savePeotry () {
      const data = this.formData
      const params = {
        userId: this.userID,
        setId: data.setId,
        title: data.title,
        content: data.content,
        end: data.end
      }
      if (data.imageNames) {
        params.imageNames = data.imageNames
      }

      const id = data.id
      if (id) {
        params.id = id
      }
      apiPostData(id ? apiURL.peotryUpdate : apiURL.peotryCreate, params)
        .then(resp => {
          this.$toast(id ? '更新成功' : '创建成功')
          this.$emit('success')
        })
        .finally(() => {
          this.isSaveing = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/ui/style/const.scss';

.sg-mask {
  .peotry-edit-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .peotry-sets-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: white;
  }
}

.peotry-edit {
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;
  overflow: hidden;
  background-color: white;

  .main {
    position: relative;
    flex: 1;
    height: 100%;
    overflow: hidden;
  }
  .main-wrapper {
    height: 100%;
    padding: 1rem 0;
    box-sizing: border-box;
    overflow-x: hidden;
    overflow-y: auto;
  }

  input,
  textarea {
    display: block;
    width: 100%;
    padding: 0.3rem 0.5rem;
    font-size: 1.2rem;
    line-height: 1.4rem;
    border: 1px solid #ccc;
    outline: none;
    box-sizing: border-box;
    background-color: transparent;
  }

  .sg-dropdown {
    flex: 1;
    min-width: 5rem;
    padding: 0 1rem;
    background-color: #f5f5f5;
    border-radius: 5px;
  }

  .set-item {
    padding: 0.5rem 0;
    span {
      display: block;
      padding: 0.5rem 1rem;
      box-sizing: border-box;
      font-size: $size-text;
      color: $color-tip;
      background-color: $color-bg;
      border-radius: 0.5rem;
    }
    .is-setname {
      color: $color-theme-focus;
      background-color: $color-theme-disabled;
    }
  }
}
</style>
