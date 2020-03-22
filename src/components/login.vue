<template>
  <div class="login">
    <sg-form ref="form" :formData="formData" :formRules="formRules">
      <sg-button class="login-button" type="primary" :isLoading="isRequesting" @click="onSubmit">登录</sg-button>
    </sg-form>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { sgIsPhone } from '@/utils/sgRegExp'

export default {
  name: 'Login',

  data () {
    return {
      isRequesting: false,
      formData: {
        phone: null,
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
        if (!isValid) {
          return
        }
        this.isRequesting = true
        this.login(JSON.parse(JSON.stringify(this.formData))).then(() => {
          this.isRequesting = false
          this.$toast('登录成功', { direction: 'bottom' })
          this.$router.push({ name: 'home' })
        })
      })
    },

    ...mapActions({
      login: 'auth/login'
    })
  }
}
</script>

<style lang="scss" scoped>
.login {
  .login-button {
    margin-top: 2rem;
  }
}
</style>
