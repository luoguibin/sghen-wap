<template>
  <div class="sg-form">
    <slot name="header"></slot>
    <input type="password" autocomplete="new-password" hidden />
    <div
      v-for="item in formRules"
      :key="item.key"
      :class="{'sg-form-item': !item.noneClass, 'sg-form-value': item.hasValue}"
      v-show="!item.hidden"
    >
      <template v-if="item.slot">
        <slot :name="item.key"></slot>
      </template>
      <template v-else>
        <textarea
          v-if="item.type === 'textarea'"
          v-model="formData[item.key]"
          :style="item.style"
          v-focus-within
        ></textarea>
        <input
          v-else
          v-model="formData[item.key]"
          :type="item.inputType"
          :style="item.style"
          v-focus-within
        />
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
@import "../style/const.scss";

$form-item-font-size: $size-text;
$form-item-line-height: $height-text;
$form-item-input-padding: 0.5rem;

.sg-form {
  .sg-form-item {
    position: relative;
    margin-top: $form-item-line-height;
    border-bottom: 2px solid $color-border;
    input,
    textarea {
      display: block;
      width: 100%;
      padding: $form-item-input-padding;
      color: $color-text;
      font-size: $form-item-font-size;
      line-height: $form-item-line-height;
      border: none;
      outline: none;
      box-sizing: border-box;
      background-color: transparent;
    }
    label {
      position: absolute;
      top: $form-item-input-padding;
      left: 0.5rem;
      font-size: $form-item-font-size;
      line-height: $form-item-line-height;
      pointer-events: none;
      transition: transform 0.3s;
      color: $color-tip;
      span {
        padding-left: 1rem;
        color: $color-error;
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
      background-color: $color-border;
      transform: scaleX(0);
      transition: transform 0.3s;
    }
  }

  .sg-form-item.sg-focus-within {
    &::after {
      background-color: $color-theme;
      transform: scaleX(1);
    }
  }
  .sg-form-item.sg-input-value,
  .sg-form-item.sg-form-value,
  .sg-form-item.sg-focus-within {
    label {
      transform: translateY(-100%);
    }
  }

  .sg-label-required::before {
    content: "•";
    color: $color-required;
  }
}
</style>
