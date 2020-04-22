<template>
  <div class="sg-form">
    <slot name="header"></slot>
    <input type="password" autocomplete="new-password" hidden />
    <div
      v-for="item in formRules"
      :key="item.key"
      :class="{'sg-form-item': !item.noneClass}"
      v-show="!item.hidden"
    >
      <template v-if="item.slot">
        <slot :name="item.key"></slot>
      </template>
      <template v-else>
        <textarea v-if="item.type === 'textarea'" v-model="formData[item.key]" v-focus-within></textarea>
        <input v-else v-model="formData[item.key]" :type="item.inputType" v-focus-within />
      </template>
      <label :class="{'sg-label-required': item.required}">
        {{item.label}}
        <span v-if="item._error">({{item._error}})</span>
      </label>
    </div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'SgForm',

  props: {
    formData: {
      type: Object,
      required: true
    },
    /**
     * [{
     *   key: 'phone', // required, unique
     *   type: '', // ``, 'input', `textarea`
     *   hidden: false, // true or false
     *   slot: false, // true or false
     *   label: '手机号码', // label
     *   noneClass: false, // true or false
     *   required: true, // true or false
     *   inputType: '', // type of `input`
     *   validator: (v, rule) => { return '请输入手机号码'}, // params fixed
     *   _error: '' // required
     * }]
     */
    formRules: {
      type: Array,
      required: true
    }
  },

  data () {
    return {}
  },

  created () {
    window.sgForm = this
  },

  methods: {
    clearErrors () {
      this.formRules.forEach(o => {
        if (o._error !== undefined) {
          o._error = ''
        }
      })
    },

    validateFields (fieldKeys, call) {
      const errors = []
      const tempValidator = (v, rule) => {
        return v ? '' : (rule.label || rule.key) + '不能为空'
      }
      const ruleMap = {}
      this.formRules.forEach(o => {
        ruleMap[o.key] = o
      })

      fieldKeys.forEach(fieldKey => {
        const fieldRule = ruleMap[fieldKey]
        if (!fieldRule) {
          errors.push({ fieldKey, msg: '未定义该字段' })
        }
        if (fieldRule.required) {
          const validator = fieldRule.validator || tempValidator
          const msg = validator(this.formData[fieldRule.key], fieldRule)
          fieldRule._error = msg || ''

          if (msg) {
            errors.push({ fieldKey, msg })
          }
        } else {
          fieldRule._error = ''
        }
      })

      call && call(errors.length ? errors : '')
    },

    validate (call) {
      const fieldKeys = this.formRules
        .filter(o => o.required)
        .map(o => {
          return o.key
        })
      this.validateFields(fieldKeys, call)
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../style/colors.scss";

.sg-form {
  padding: 1rem;

  .sg-form-item {
    position: relative;
    padding-top: 0.5rem;
    border-bottom: 2px solid $border-color;
    input,
    textarea {
      display: block;
      width: 100%;
      padding: 0.3rem 0.5rem;
      color: $main-color;
      font-size: 2rem;
      line-height: 2rem;
      border: none;
      outline: none;
      box-sizing: border-box;
      background-color: transparent;
    }
    label {
      position: absolute;
      top: 1rem;
      left: 0.5rem;
      pointer-events: none;
      transition: transform 0.3s;
      span {
        padding-left: 1rem;
        color: $error-color;
      }
    }
    &::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: -2px;
      width: 100%;
      height: 2px;
      background-color: $border-color;
      transform: scaleX(0);
      transition: transform 0.3s;
    }
  }
  .sg-form-item + .sg-form-item {
    margin-top: 2rem;
  }

  .sg-form-item.sg-focus-within {
    &::after {
      background-color: $main-color;
      transform: scaleX(1);
    }
  }
  .sg-form-item.sg-input-value,
  .sg-form-item.sg-focus-within {
    label {
      transform: translateY(-150%);
    }
  }

  .sg-label-required::before {
    content: "*";
    color: $error-color;
    padding-right: 2px;
  }
}
</style>
