<template>
  <div class="login">
    <sg-form ref="form" :formData="formData" :formRules="formRules">
      <button @click="onSubmit">登录</button>
    </sg-form>
  </div>
</template>

<script>
export default {
  name: 'Login',

  data () {
    return {
      formData: {
        phone: 15625045984,
        code: ''
      },
      formRules: [
        {
          key: 'phone',
          label: '手机号码',
          required: true,
          validator: (v, rule) => {
            return v ? '' : '请输入' + rule.label
          },
          _error: ''
        },
        {
          key: 'code',
          label: '文本',
          type: 'textarea'
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
