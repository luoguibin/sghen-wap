<template>
  <div class="sg-components" sg-scroll="vertical_stop">
    <div class="item">
      <div class="label">标题栏</div>
      <div class="component">
        <SgHeader @back="$router.go(-1)">
          <span slot="left">返回</span>
          我是默认居中的标题
          <span slot="right">右插槽</span>
        </SgHeader>

        <SgHeader @back="$toast('你点击了返回')" :centerStatus="''">
          <span slot="left">左插槽(没有标题)</span>
          <span slot="right">(没有标题)右插槽</span>
        </SgHeader>

        <SgHeader @back="$toast('你点击了返回')" :rightStatus="''" :centerStatus="''">
          <span slot="left">左插槽独占一行</span>
        </SgHeader>
      </div>
    </div>

    <div class="item">
      <div class="label">按钮</div>
      <div class="component">
        <SgButton @click="$toast('你点击了按钮')">我是独占一行的默认按钮</SgButton>
        <SgButton type="primary" @click="$toast('你点击了按钮')">我是独占一行的主要按钮</SgButton>
        <SgButton type="primary" :isLoading="true" @click="$toast('你点击了按钮')">加载中的按钮</SgButton>
        <SgButton type="primary" :disabled="true" @click="$toast('你点击了按钮')">禁用的按钮</SgButton>
        <SgButton type="text" @click="$toast('你点击了按钮')">我是文本按钮</SgButton>
      </div>
    </div>

    <div class="item">
      <div class="label">表单</div>
      <div class="component">
        <SgForm ref="form" :formData="formData" :formRules="formRules">
          <SgButton style="margin-top: 1rem;" type="primary" @click="onSubmit">提交</SgButton>
        </SgForm>
      </div>
    </div>

    <div class="item">
      <div class="label">Toast</div>
      <div class="component">
        <SgButton @click="$toast('默认底部Toast默认底部Toast默认底部Toast', {direction: 'bottom'})">默认底部Toast</SgButton>
        <SgButton @click="$toast('顶部Toast', {direction: 'top'})">顶部Toast</SgButton>
        <SgButton @click="$toast('中间Toast', {direction: 'middle', replace: true})">中间Toast（可替换）</SgButton>
        <SgButton @click="$toast('加载中...', {direction: 'middle', loading: true})">加载中...</SgButton>
      </div>
    </div>

    <div class="item">
      <div class="label">确认框</div>
      <div class="component">
        <SgButton @click="$confirm({content: '你好，世界~'})">提示框</SgButton>
        <SgButton @click="$confirm({title: '提示', content: '你好，世界~', cancelVisible: false})">确认提示框</SgButton>
        <SgButton @click="onConfirmInput">输入确认框</SgButton>
      </div>
    </div>

    <div class="item">
      <div class="label">上拉加载下拉刷新组件</div>
      <div class="component" style="height: 15rem;">
        <SgScroll ref="scroll" :isEnd="isEnd" @refresh="handleRefresh" @load="handleLoad">
          <div class="scroll-item" v-for="item in scrollItems" :key="item.id">{{item.content}}</div>
        </SgScroll>
      </div>
    </div>

    <div class="item">
      <div class="label">滑动卡片</div>
      <div class="component" style="height: 20rem;">
        <sg-slider :items="sliderItems" @change="onSlideChange">
          <div v-for="item in sliderItems" :key="item.slot" :slot="item.slot">{{item.slot}}</div>
        </sg-slider>
      </div>
    </div>

    <div class="item">
      <div class="label">下拉选择</div>
      <div class="component">
        <SgDropdown :options="dropdownOptions" @change="$toast($event, {replace: true})"></SgDropdown>
        <SgDropdown
          :options="dropdownOptions"
          :optionActive="true"
          :optionType="'fullwidth'"
          :pointerVisible="false"
          @change="$toast($event, {replace: true})"
        ></SgDropdown>
        <SgDropdown
          :options="dropdownOptions"
          :optionType="'center'"
          @change="$toast($event, {replace: true})"
        ></SgDropdown>
      </div>
    </div>

    <div class="item">
      <div class="label">时间</div>
      <div class="component">
        <SgTime ref="time"></SgTime>
        <SgButton @click="$toast($refs.time.getTimeValues())">确认</SgButton>
      </div>
    </div>

    <div class="item">
      <div class="label">表格</div>
      <div class="component" style="height: 18rem;">
        <SgTable :headers="tableHeaders" :items="tableItems">
          <sg-button
            type="text"
            slot="options"
            slot-scope="scope"
            @click="onTableItemDetail(scope)"
          >详情</sg-button>
        </SgTable>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SgComponents',

  data () {
    return {
      formData: {
        phone: null,
        name: 'Sghen',
        content: ''
      },
      formRules: [
        {
          key: 'phone',
          label: '手机号码',
          required: true,
          hidden: false,
          validator: (v, rule) => {
            return v ? '' : '请输入' + rule.label
          },
          _error: ''
        },
        {
          key: 'name',
          label: '姓名',
          required: true,
          hidden: false,
          _error: ''
        },
        {
          key: 'content',
          type: 'textarea',
          label: '正文',
          required: false,
          _error: ''
        }
      ],

      isEnd: false,
      scrollItems: [],

      dropdownOptions: [
        { label: '红色', value: 'red' },
        { label: '绿色', value: 'greeen' },
        { label: '蓝色', value: 'blue' }
      ],

      sliderItems: [
        {
          slot: 'slot-0',
          itemStyle: {
            backgroundColor: 'rgba(12, 123, 234, 0.3)'
          }
        },
        {
          slot: 'slot-1',
          itemStyle: {
            backgroundColor: 'rgba(123, 12, 234, 0.3)'
          }
        },
        {
          slot: 'slot-2',
          itemStyle: {
            backgroundColor: 'rgba(234, 12, 123, 0.3)'
          }
        },
        {
          slot: 'slot-3',
          itemStyle: {
            backgroundColor: 'rgba(12, 234, 123, 0.3)'
          }
        },
        {
          slot: 'slot-4',
          itemStyle: {
            backgroundColor: 'rgba(123, 234, 12, 0.3)'
          }
        }
      ],

      tableHeaders: [
        { key: 'id', label: 'ID', style: { width: '50px' } },
        { key: 'name', label: '姓名' },
        {
          key: 'address',
          label: '地址(具体地球经纬度，例如：N43.234234 W123.3211)'
        },
        { key: 'options', label: '操作', slot: true, style: { width: '50px' } }
      ],
      tableItems: []
    }
  },

  created () {
    window.sgComponents = this

    for (let i = 0; i < 30; i++) {
      this.tableItems.push({
        id: i,
        name: 'name-name-name-name-name-name-' + i,
        address: 'address-address-address-address-address-' + i
      })
    }
  },

  methods: {
    onSubmit () {
      this.$refs.form.validate(errors => {
        if (errors) {
          return
        }
        this.$toast('提交成功:' + JSON.stringify(this.formData))
      })
    },

    onConfirmInput () {
      this.$confirm({
        title: '提示',
        placeholder: '请输入。。。',
        type: 'input',
        validator: v => {
          if (!v) {
            this.$toast('请输入')
            return '请输入'
          }
          return ''
        }
      })
    },

    handleLoad () {
      setTimeout(() => {
        const start = this.scrollItems.length
        for (let i = start, len = start + 20; i < len; i++) {
          this.scrollItems.push({
            id: i,
            content: 'content' + i
          })
        }
        this.isEnd = this.scrollItems.length >= 60
        this.$nextTick(() => {
          this.$refs.scroll.success()
        })
      }, 1000)
    },
    handleRefresh () {
      this.scrollItems = []
      setTimeout(() => {
        for (let i = 0; i < 20; i++) {
          this.scrollItems.push({
            id: i,
            content: 'content' + i
          })
        }
        this.$nextTick(() => {
          this.$refs.scroll.success()
        })
      }, 1000)
    },

    onTableItemDetail (item) {
      console.log('onTableItemDetail', item)
      this.$toast(JSON.stringify(item))
    },
    onSlideChange (index) {
      console.log('onSlideChange', index)
    }
  }
}
</script>

<style lang="scss" scoped>
.sg-components {
  height: 100%;
  padding: 1rem 0;
  box-sizing: border-box;
  background-color: #eeeeee;
  overflow-x: hidden;
  overflow-y: auto;
  .item {
    margin-bottom: 2rem;
    background-color: white;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    .label {
      padding: 0.5rem;
      font-size: 1.4rem;
      border-bottom: 2px solid #eeeeee;
    }
    .component {
    }
  }

  .scroll-item {
    color: rgb(92, 92, 92);
    font-size: 1.4rem;
    line-height: 3rem;
  }
}
</style>
