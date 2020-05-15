<template>
  <div class="sg-mask dialog-mask">
    <div class="dialog-wrapper">
      <div class="peotry-edit">
        <sg-header @back="$emit('close')">
          <span style="font-size: 1.6rem;">诗词{{peotry ? '更新':'创建'}}</span>
        </sg-header>

        <div class="main">
          <div class="main-wrapper">
            <sg-form ref="form" :formData="formData" :formRules="formRules">
              <div slot="setId" class="peotry-item set">
                <sg-dropdown
                  ref="dropdown"
                  :options="setOptions"
                  :optionActive="true"
                  @change="handleDropdown"
                ></sg-dropdown>
                <span class="iconfont icon-increase" @click="onNewSet"></span>
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
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { apiURL, apiGetData, apiPostData } from '@/api'

export default {
  name: 'PeotryEdit',

  components: {
    'image-uploader': () => import('@/components/image-uploader')
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

      setOptions: [],
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
    this.getPeotSets()
  },

  methods: {
    initFormData () {
      const peotry = this.peotry
      if (peotry) {
        const data = this.formData
        data.id = peotry.id
        data.setId = peotry.set && peotry.set.id
        data.setName = peotry.set && peotry.set.name
        data.title = peotry.title
        data.content = peotry.content
        data.end = peotry.end

        this.formRules[this.formRules.length - 1].hidden = true
      }
    },
    getPeotSets (isLast) {
      apiGetData(apiURL.peotSets, { userId: this.userID }).then(resp => {
        const options = resp.data.map(o => {
          return {
            label: o.name,
            value: o.id
          }
        })
        this.setOptions = options
        if (isLast) {
          this.$refs.dropdown.setSelectOption(options[options.length - 1])
        } else {
          const peotry = this.peotry
          if (peotry && peotry.id && peotry.set) {
            const { id, name } = peotry.set
            this.$refs.dropdown.setSelectOption({ value: id, label: name })
          }
        }
      })
    },
    handleDropdown (key) {
      this.formData.setId = key
    },
    onNewSet () {
      this.$confirm({
        title: '选集创建',
        type: 'input',
        placeholder: '请输入选集名',
        validator: v => {
          if (!v) {
            this.$toast('请输入选集名')
            return '请输入选集名'
          }
          if (v.length > 20) {
            this.$toast('选集名长度不能超过20个字符')
            return '选集名长度不能超过20个字符'
          }
          const o = this.setOptions.find(o => o.label === v)
          if (o) {
            this.$toast('选集名重复')
            return '选集名重复'
          }
          return ''
        },
        confirm: v => {
          apiPostData(apiURL.peotSetCreate, { name: v }).then(resp => {
            this.getPeotSets(true)
          })
        }
      })
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
        // 调用上传，产生回调事件
        this.$refs.uploader.start()
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
.dialog-mask {
  .dialog-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
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

  .peotry-item {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 1rem;
  }
  .icon-increase {
    margin-left: 1rem;
  }
}
</style>

<style lang="scss">
.peotry-edit {
  .sg-dropdown {
    line-height: 1.5;
    .sg-dropdown-text {
      font-size: 2rem;
    }
  }
}
</style>
