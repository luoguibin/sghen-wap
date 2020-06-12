<template>
  <div class="api-manage sg-flex-column">
    <sg-header @back="$router.go(-1)">
      API管理
      <sg-button slot="right" type="text" @click="onOpenNew">新建</sg-button>
    </sg-header>
    <div class="sg-flex-one">
      <sg-table :headers="tableHeaders" :items="tableItems">
        <sg-button type="text" slot="options" slot-scope="scope" @click="onItemDetail(scope)">详情</sg-button>
      </sg-table>
    </div>
    <div class="footer">
      <sg-button type="text" @click="onNextPage(-1)" :disabled="offset === 0">上一页</sg-button>
      <sg-button type="text" @click="onNextPage()" :disabled="isEnd">下一页</sg-button>
      <sg-button type="text">共{{total}}项</sg-button>
    </div>

    <div class="sg-mask" v-if="saveVisible">
      <div class="sg-flex-column">
        <sg-header @back="saveVisible = false">API{{formData.id ? '编辑' :'创建'}}</sg-header>
        <div class="sg-flex-one">
          <sg-form ref="form" :formData="formData" :formRules="formRules">
            <div slot="status">
              <sg-dropdown
                ref="statusDropdown"
                :options="statusOptions"
                @change="handleStatusChange"
                :optionActive="true"
              ></sg-dropdown>
            </div>
            <div slot="method">
              <sg-dropdown
                ref="methodDropdown"
                :options="methodOptions"
                @change="handleMethodChange"
                :optionActive="true"
              ></sg-dropdown>
            </div>
            <sg-button type="primary" style="margin: 2rem 0;" @click="onConfirmSave">保存</sg-button>
          </sg-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { apiGetData, apiPostData } from '@/api'

const preffix = '/napi'
const apiCenterURL = {
  list: `${preffix}/open/api-center/list`,
  create: `${preffix}/auth/api-center/create`,
  update: `${preffix}/auth/api-center/update`
}

export default {
  name: 'ApiManage',

  data () {
    return {
      tableHeaders: [
        { key: 'id', label: 'ID', style: { width: '50px' } },
        { key: 'suffixPath', label: '路由' },
        { key: 'name', label: '姓名' },
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
              JSON.parse(v)
            } catch (error) {
              return '请输入JSON数组数据'
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
    }
  },

  created () {
    window.apiManage = this
    this.getAPIs()
  },

  methods: {
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
      console.log(item)
    },

    onOpenNew () {
      this.saveVisible = true
      this.$nextTick(() => {
        const statusOption = this.statusOptions[1]
        this.$refs.statusDropdown.setSelectOption(statusOption)
        this.handleStatusChange(statusOption.value)

        const methodOption = this.methodOptions[0]
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
            this.saveVisible = false
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

  .footer {
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
}
</style>

<style lang="scss">
@import "@/ui/style/const";

.api-manage {
  .sg-mask {
    background-color: white;
  }
  .sg-table {
    .sg-table-header,
    .sg-scroll {
      padding: 0 $padding-normal;
    }
  }
}
</style>
