<template>
  <div class="api-manage sg-flex-column">
    <sg-header @back="$router.go(-1)">
      API管理中心
      <sg-button slot="right" type="text" @click="onOpenNew">新建</sg-button>
    </sg-header>
    <div class="sg-flex-one">
      <sg-table :headers="tableHeaders" :items="tableItems">
        <sg-button
          type="text"
          slot="options"
          slot-scope="row"
          :class="{'item__selected': row.scope.id === formData.id}"
          @click="onItemDetail(row.scope)"
        >
          <span class="choice"></span>
        </sg-button>
      </sg-table>
    </div>
    <div class="footer">
      <div v-show="!hasSelected">
        <sg-button type="text" @click="onNextPage(-1)" :disabled="offset === 0">上一页</sg-button>
        <sg-button type="text" @click="onNextPage()" :disabled="isEnd">下一页</sg-button>
        <sg-button type="text">共{{total}}项</sg-button>
      </div>

      <div v-show="hasSelected">
        <sg-button type="text" @click="onDelete">删除</sg-button>
        <sg-button type="text" @click="onEdit">编辑</sg-button>
        <sg-button type="text" @click="onOpenTest">测试</sg-button>
        <sg-button type="text" @click="onCancel">取消</sg-button>
      </div>
    </div>

    <div class="sg-mask sg-mask-white" v-if="saveVisible">
      <div class="sg-flex-column">
        <sg-header @back="onCancel">API{{formData.id ? '编辑' :'创建'}}</sg-header>
        <div class="sg-flex-one">
          <sg-form ref="form" :formData="formData" :formRules="formRules" sg-scroll="vertical_stop">
            <div slot="status">
              <sg-dropdown
                ref="statusDropdown"
                :options="statusOptions"
                @change="handleStatusChange"
                :optionActive="true"
                :optionType="'center'"
              ></sg-dropdown>
            </div>
            <div slot="method">
              <sg-dropdown
                ref="methodDropdown"
                :options="methodOptions"
                @change="handleMethodChange"
                :optionActive="true"
                :optionType="'center'"
              ></sg-dropdown>
            </div>
            <sg-button type="primary" style="margin: 2rem 0;" @click="onConfirmSave">保存</sg-button>
          </sg-form>
        </div>
      </div>
    </div>

    <div class="sg-mask sg-mask-white" v-if="testVisible">
      <div class="sg-flex-column">
        <sg-header @back="onCancel">API测试</sg-header>
        <div class="sg-flex-one">
          <div class="scroll-vertical" sg-scroll="vertical_stop">
            <div class="test-item api-name">
              <span>
                名称
                <i>:</i>
              </span>
              <div>{{formData.name}}</div>
            </div>
            <div class="test-item">
              <span>
                路由
                <i>:</i>
              </span>
              <div>{{formData.suffixPath}}</div>
            </div>
            <div class="test-item">
              <span>
                参数
                <i>:</i>
              </span>
              <div class="overflow-hidden">
                <textarea v-model="testParamsStr"></textarea>
              </div>
            </div>
            <div class="test-item">
              <span>
                结果
                <i>:</i>
              </span>
              <div class="scroll-vertical" sg-scroll="vertical_stop" style="height: 15rem;">
                <json-viewer :value="testResult" :expand-depth="10" copyable boxed sort></json-viewer>
              </div>
            </div>
          </div>
        </div>
        <div class="test-item" style="margin: 2rem 0;">
          <sg-button type="primary" @click="onTestAPI">测试</sg-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import JsonViewer from 'vue-json-viewer'
import { apiGetData, apiPostData } from '@/api'

const preffix = '/napi'
const apiCenterURL = {
  config: `${preffix}/open/api-center/config`,
  list: `${preffix}/open/api-center/list`,
  create: `${preffix}/auth/api-center/create`,
  update: `${preffix}/auth/api-center/update`,
  delete: `${preffix}/auth/api-center/delete`
}
const SQL_KEY_REG = /\$\{[0-9a-zA-Z_]{1,}\}/g
const getSQLKeys = function (v) {
  if (!v) {
    return
  }
  const keys = v.match(SQL_KEY_REG) || []
  return keys.map(v => {
    return v.substring(2, v.length - 1)
  })
}

export default {
  name: 'ApiManage',

  components: {
    JsonViewer
  },

  data () {
    return {
      tableHeaders: [
        { key: 'id', label: 'ID', style: { width: '50px' } },
        { key: 'suffixPath', label: '路由' },
        { key: 'name', label: '名称' },
        { key: 'method', label: '请求方式' },
        { key: 'count', label: '调用次数' },
        { key: 'options', label: '操作', slot: true, style: { width: '50px' } }
      ],
      tableItems: [],
      total: 0,
      offset: 0,
      limit: 10,

      saveVisible: false,
      isSaveing: false,
      formData: {
        id: null,
        name: '获取评论前10条数据',
        comment: '',
        suffixPath: 'comment/list10',
        content: '[{"key":"data","sql":"SELECT * FROM comment LIMIT 10"}]',
        params: '{}',
        method: '',
        methodLabel: '',
        status: null,
        statusLabel: ''
      },
      formRules: [
        {
          key: 'name',
          label: '名称',
          required: true,
          type: 'textarea',
          _error: ''
        },
        {
          key: 'suffixPath',
          label: '路由',
          required: true,
          _error: ''
        },
        {
          key: 'comment',
          label: '说明'
        },
        {
          key: 'content',
          label: '伪SQL语句',
          required: true,
          type: 'textarea',
          style: {
            'min-height': '10rem'
          },
          validator: (v, rule) => {
            if (!v) {
              return '请输入' + rule.label
            }
            try {
              const json = JSON.parse(v)
              if (json instanceof Array) {
                if (json[0] && json[0].key && json[0].sql) {
                  return ''
                } else {
                  return `请输入数据项{key: '', sql: ''}`
                }
              } else {
                return '请输入JSON数组数据'
              }
            } catch (error) {
              return '请输入JSON数组数据'
            }
          },
          _error: ''
        },
        {
          key: 'params',
          label: '参数类型',
          required: true,
          type: 'textarea',
          style: {
            'min-height': '10rem'
          },
          validator: (v, rule) => {
            if (!v) {
              return '请输入' + rule.label
            }
            try {
              const params = JSON.parse(v)
              for (const key in params) {
                if (!this.paramTypes.includes(params[key].type)) {
                  this.$toast('可选参数类型：' + this.paramTypes.join())
                  return '请输入合法参数类型'
                }
              }
            } catch (error) {
              return '请输入JSON数据'
            }
          },
          _error: ''
        },
        {
          key: 'method',
          label: '请求方式',
          slot: true,
          required: true,
          hasValue: true,
          validator: (v, rule) => {
            return v ? '' : '请选择' + rule.label
          },
          _error: ''
        },
        {
          key: 'status',
          label: '启用模式',
          slot: true,
          required: true,
          hasValue: true,
          validator: (v, rule) => {
            return v !== null ? '' : '请选择' + rule.label
          },
          _error: ''
        }
      ],

      testVisible: false,
      testResult: {},
      testParamsStr: '',
      paramTypes: [],

      statusOptions: [
        { value: 0, label: '禁用' },
        { value: 1, label: '启用' },
        { value: 2, label: '缓存' }
      ],
      methodOptions: [
        { value: 'GET', label: 'GET' },
        { value: 'POST', label: 'POST' }
      ]
    }
  },

  computed: {
    isEnd () {
      return this.total === this.tableItems.length
    },
    hasSelected () {
      return !!this.formData.id
    }
  },

  watch: {
    'formData.content': {
      handler (v) {
        if (this.formData.id) {
          return
        }
        const keys = getSQLKeys(v)
        const params = {}
        const currentParams = JSON.parse(this.formData.params)

        keys.forEach(key => {
          params[key] = currentParams[key] || { type: 'STRING' }
        })
        this.formData.params = JSON.stringify(params)
      }
    }
  },

  created () {
    window.apiManage = this
    this.defaultFormData = JSON.parse(JSON.stringify(this.formData))
    this.getAPIs()
    this.getConfig()
  },

  methods: {
    getConfig () {
      apiGetData(apiCenterURL.config)
        .then(resp => {
          this.paramTypes = resp.data
        })
        .catch(() => {
          this.$toast('配置信息加载失败')
        })
    },
    getAPIs () {
      if (this.isLoading) {
        return
      }
      this.isLoading = true
      const params = {
        offset: this.offset,
        limit: this.limit
      }

      apiGetData(apiCenterURL.list, params)
        .then(resp => {
          const { total, list } = resp.data
          if (list instanceof Array) {
            list.forEach(o => {
              o.isSelected = false
            })
          }
          this.tableItems = list
          this.total = total
        })
        .catch(() => {
          this.$toast('加载失败，请重试')
        })
        .finally(() => {
          this.isLoading = false
        })
    },

    onNextPage (offsetPage = 1) {
      this.offset += offsetPage * this.limit
      this.getAPIs()
    },

    onItemDetail (item) {
      const formData = this.formData
      if (formData.id === item.id) {
        this.onCancel()
        return
      }
      const keys = [
        'id',
        'name',
        'comment',
        'content',
        'params',
        'method',
        'status',
        'suffixPath'
      ]
      keys.forEach(key => {
        if (item[key] !== undefined) {
          formData[key] = item[key]
        }
      })

      this.currentApi = item
      item.isSelected = true
    },
    onCancel () {
      this.formData.id = null
      if (this.currentApi) {
        this.currentApi.isSelected = false
        this.currentApi = null
      }
      this.saveVisible = false
      this.testVisible = false
    },

    onOpenTest () {
      this.testVisible = true
      this.testResult = {}

      const keys = getSQLKeys(this.formData.content)
      const params = {}
      keys.forEach(key => {
        if (key === 'limit') {
          params[key] = 10
        } else if (key === 'offset') {
          params[key] = 0
        } else {
          params[key] = ''
        }
      })
      this.testParamsStr = JSON.stringify(params)
    },

    onTestAPI () {
      this.testResult = {}
      let params
      try {
        params = JSON.parse(this.testParamsStr)
      } catch (error) {
        this.$toast('请输入JSON参数')
        return
      }

      const { suffixPath, method } = this.formData
      if (method === 'GET') {
        this.$toast('加载中...', { direction: 'middle', loading: true, duration: -1 })
        apiGetData(preffix + '/dynamic-api/' + suffixPath, params)
          .then(resp => {
            this.testResult = resp // JSON.stringify(resp.data)
            this.$toast('测试成功', { replace: true })
          })
          .catch(err => {
            if (err && err.data) {
              this.testResult = err.data // JSON.stringify(err.data)
            }
            this.$toast('测试失败', { replace: true })
          })
      } else {
        this.$toast('正在码...')
      }
    },
    onDelete () {
      if (this.isDeleting) {
        return
      }
      this.isDeleting = true
      this.$confirm({
        title: '提示',
        content: '是否删除该API',
        confirm: () => {
          apiPostData(apiCenterURL.delete, { id: this.formData.id })
            .then(resp => {
              this.$toast('删除成功')
              this.onCancel()
              this.getAPIs()
            })
            .catch(() => {
              this.$toast('删除失败')
            })
            .finally(() => {
              this.isDeleting = false
            })
        }
      })
    },
    onEdit () {
      this.saveVisible = true
      this.setDropdownsValue({
        statusVal: this.formData.status,
        methodVal: this.formData.method
      })
    },

    onOpenNew () {
      this.saveVisible = true
      const object = this.defaultFormData
      const formData = this.formData
      for (const key in object) {
        formData[key] = object[key]
      }
      this.setDropdownsValue()
    },
    setDropdownsValue ({ statusVal, methodVal }) {
      this.$nextTick(() => {
        const statusOption = this.statusOptions.find(o => o.value === statusVal) || this.statusOptions[1]
        this.$refs.statusDropdown.setSelectOption(statusOption)
        this.handleStatusChange(statusOption.value)

        const methodOption = this.methodOptions.find(o => o.value === methodVal) || this.methodOptions[0]
        this.$refs.methodDropdown.setSelectOption(methodOption)
        this.handleMethodChange(methodOption.value)
      })
    },
    onConfirmSave () {
      this.$refs.form.validate(error => {
        if (error) {
          return
        }
        if (this.isSaveing) {
          return
        }
        this.isSaveing = true

        const {
          id,
          name,
          comment,
          content,
          params,
          method,
          status,
          suffixPath
        } = this.formData
        const data = {
          name,
          comment,
          content,
          params,
          method,
          status,
          suffixPath
        }

        let url = apiCenterURL.create
        if (id) {
          data.id = id
          url = apiCenterURL.update
        }
        apiPostData(url, data)
          .then(resp => {
            this.getAPIs()
            this.onCancel()
            this.$toast('保存成功')
          })
          .catch(() => {
            this.$toast('保存失败')
          })
          .finally(() => {
            this.isSaveing = false
          })
      })
    },

    handleStatusChange (value) {
      this.formData.status = value
      this.formData.statusLabel = this.statusOptions.find(
        o => o.value === value
      ).label
    },
    handleMethodChange (value) {
      this.formData.method = value
      this.formData.methodLabel = this.methodOptions.find(
        o => o.value === value
      ).label
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/ui/style/const";

.api-manage {
  height: 100%;
  overflow: hidden;

  .overflow-hidden {
    overflow: hidden;
  }

  .footer {
    position: relative;
    padding: $padding-normal;
    border-top: 1px solid $color-theme-disabled;
    text-align: right;
    .sg-button + .sg-button {
      margin-left: 2rem;
    }
  }

  .sg-form {
    height: 100%;
    padding: 0 $padding-normal;
    overflow-y: auto;
  }
  .choice {
    position: relative;
    display: inline-block;
    width: 12px;
    height: 12px;
    margin-right: 1rem;
    border-radius: 50%;
    border: 2px solid $color-theme-disabled;
  }
  .item__selected {
    color: $color-theme;
    .choice {
      border-color: $color-theme;
      &::before {
        content: "";
        position: absolute;
        left: 2px;
        top: 2px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: $color-theme;
      }
    }
  }

  .test-item {
    padding: 0 $padding-normal;
    margin-bottom: 2rem;
    overflow: hidden;
    box-sizing: border-box;

    > span {
      display: block;
      margin-bottom: 0.5rem;
      font-size: $size-text;
      color: $color-tip;
    }
    > div {
      font-size: $size-text;
      color: $color-text;
    }
    textarea {
      display: block;
      width: 100%;
      height: 10rem;
      margin: 0;
      outline: 0;
      box-sizing: border-box;
      font-size: $size-text;
      color: $color-text;
    }
  }
}
</style>

<style lang="scss">
@import "@/ui/style/const";

.api-manage {
  .sg-mask-white {
    background-color: white;
  }
  .sg-table {
    .sg-table-header,
    .sg-scroll {
      padding: 0 $padding-normal;
    }
  }

  .jv-container.jv-light {
    background: #b8d1ea;
    .jv-more {
      background: linear-gradient(0deg, #b8d1ea, transparent);
    }
  }
}
</style>
