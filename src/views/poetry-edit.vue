<template>
  <div class="sg-mask">
    <div class="poetry-edit-wrapper">
      <div class="poetry-edit">
        <sg-header @back="onBack">诗词{{formData.id ? '更新':'创建'}}</sg-header>

        <div class="main">
          <div class="main-wrapper" sg-scroll="vertical_stop">
            <sg-form v-if="isFormInit" ref="form" :formData="formData" :formRules="formRules">
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
              >{{formData.id ? '更新':'创建'}}</sg-button>
            </sg-form>
          </div>
        </div>
      </div>
    </div>

    <!-- 选集选择 -->
    <transition name="drawer">
      <div v-if="isFormInit" v-show="poetrySetsVisible" class="sg-mask" @click="onCloseSets">
        <poetry-sets
          :defId="formData.setId"
          @close="onCloseSets()"
          @select="handleSetSelect"
        ></poetry-sets>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { apiURL, apiGetData, apiPostData } from '@/api'
import { PEOTRY } from '@/const'

export default {
  name: 'PoetryEdit',

  components: {
    'image-uploader': () => import('@/components/image-uploader'),
    'poetry-sets': () => import('@/components/poetry-sets')
  },

  data () {
    return {
      isFormInit: false,
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
      poetrySetsVisible: false,
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
    window.poetryEdit = this
    this.initFormData()
  },

  methods: {
    onBack () {
      this.$router.go(-1)
    },
    initFormData () {
      // 是否新建诗词判断
      const tempId = this.$route.params.id
      if (tempId === 'new') {
        const { setId, setName } = this.$route.query
        this.formData.setId = +setId || ''
        this.setName = setName

        const tempFormData = window.poetryEdit_formData
        if (tempFormData) {
          this.setName = tempFormData.setName
          tempFormData.setName = undefined
          this.formData = tempFormData
          window.poetryEdit_formData = undefined
        }
        this.isFormInit = true
        return
      }
      const jsonStr = sessionStorage.getItem(PEOTRY.EDIT_DATA)
      const onSuccess = poetry => {
        const data = this.formData
        data.id = poetry.id
        data.setId = poetry.set && poetry.set.id
        data.title = poetry.title
        data.content = poetry.content
        data.end = poetry.end

        this.setName = poetry.set && poetry.set.name
        this.formRules[this.formRules.length - 1].hidden = true
        this.isFormInit = true
      }
      if (jsonStr) {
        // 读取本地数据
        onSuccess(JSON.parse(jsonStr))
      } else {
        // 加载网络数据
        this.$toast('加载中...', {
          direction: 'middle',
          duration: -1,
          loading: true
        })
        apiGetData(apiURL.poetryList, { id: +tempId })
          .then(data => {
            onSuccess(data.data)
            this.$toast('加载中...', {
              direction: 'middle',
              duration: 1,
              loading: true,
              replace: true
            })
          })
          .catch(err => {
            this.$toast((err && err.msg) || '加载失败，请返回', {
              replace: true
            })
          })
      }
    },
    onOpenSetChoice () {
      this.poetrySetsVisible = true
    },
    onCloseSets (e) {
      if (e) {
        const classList = e.target.classList
        if (!classList.contains('sg-mask')) {
          return
        }
      }
      this.poetrySetsVisible = false
    },
    handleSetSelect ({ id, name }) {
      this.formData.setId = id
      this.setName = name
      this.poetrySetsVisible = false
    },

    handleUpload (images = []) {
      if (images.length) {
        this.formData.imageNames = JSON.stringify(images)
      } else {
        this.formData.imageNames = ''
      }

      this.savePoetry()
    },
    handleUploadFail () {
      this.isSaveing = false
    },
    onConfirm () {
      this.$refs.form.validate(error => {
        if (error) {
          return
        }
        if (!this.userID) {
          // 添加非表单数据进入缓存，重置后删除
          this.formData.setName = this.setName
          window.poetryEdit_formData = this.formData
          this.$refs.uploader.saveImages()
          this.$toastLogin()
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

    savePoetry () {
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
      this.$toast('保存中...', {
        direction: 'middle',
        duration: -1,
        loading: true,
        replace: true
      })
      apiPostData(id ? apiURL.poetryUpdate : apiURL.poetryCreate, params)
        .then(resp => {
          this.$toast(id ? '更新成功' : '创建成功', { replace: true })
          sessionStorage.removeItem(PEOTRY.EDIT_DATA)
          this.$router.go(-1)
        })
        .finally(() => {
          this.isSaveing = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/ui/style/const.scss";

.sg-mask {
  .poetry-edit-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .sg-mask {
    padding-left: 30%;
    box-sizing: border-box;
    overflow: hidden;
  }
}

.drawer-enter,
.drawer-leave-to {
  background-color: transparent;
}
.drawer-enter .poetry-sets,
.drawer-leave-to .poetry-sets {
  transform: translate(100%, 0);
}
.drawer-enter-active,
.drawer-leave-active {
  transition: background-color 0.3s ease;
}
.drawer-enter-active .poetry-sets,
.drawer-leave-active .poetry-sets {
  transition: transform 0.3s ease;
}

.poetry-edit {
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
