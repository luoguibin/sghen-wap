<template>
  <div class="login">
    <sg-form ref="form" :formData="formData" :formRules="formRules">
      <button @click="onSubmit">登录</button>
    </sg-form>
  </div>
</template>

<script>
import { sgIsPhone } from '@/utils/sgRegExp'

export default {
  name: 'Login',

  data () {
    return {
      formData: {
        phone: 15625045984,
        pw: ''
      },
      formRules: [
        {
          key: 'phone',
          label: '手机号码',
          required: true,
          validator: (v, rule) => {
            return sgIsPhone(v) ? '' : '请输入' + rule.label
          },
          _error: ''
        },
        {
          key: 'pw',
          label: '密码',
          required: true,
          inputType: 'password',
          validator: (v, rule) => {
            if (!v) {
              return '请输入' + rule.label
            } else {
              return v.length < 6 || v.length > 20 ? '密码长度为6~20字符' : ''
            }
          },
          _error: ''
        }
      ]
    }
  },

  created () {
    window.login = this
  },

  methods: {
    onSubmit () {
      this.$refs.form.validate(isValid => {
        if (isValid) {
          this.$toast(JSON.stringify(this.formData))
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.login {
}
</style>
