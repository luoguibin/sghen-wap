<template>
  <div class="login">
    <div class="login-header">
      <h2>Sghen-UI测试</h2>
    </div>
    <sg-form ref="form" :formData="formData" :formRules="formRules">
      <div class="login-code" slot="code">
        <input v-model="formData.code" v-focus-within />
        <span class="code-divider"></span>
        <span v-show="countdown > 0" class="code-countdown">{{countdownText}}</span>
        <sg-button v-show="countdown <= 0" :isLoading="smsLoading" @click="getSmsCode">获&nbsp;取</sg-button>
      </div>
      <div class="login-type" slot="loginType">
        <sg-button @click="onChangeLoginType">{{formData.loginType === 'pw' ? '短信登陆' : '密码登陆'}}</sg-button>
      </div>
      <sg-button class="login-button" type="primary" :isLoading="isRequesting" @click="onSubmit">登&nbsp;&nbsp;录</sg-button>
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
        pw: '',
        code: '',
        loginType: 'pw'
      },
      formRules: [
        {
          key: 'phone',
          label: '手机号码',
          required: true,
          hidden: false,
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
        },
        {
          key: 'code',
          slot: true,
          label: '动态码',
          hidden: true,
          required: false,
          validator: (v, rule) => {
            if (!v) {
              return '请输入' + rule.label
            } else {
              return v.length !== 4 ? '动态码长度为4字符' : ''
            }
          },
          _error: ''
        },
        {
          key: 'loginType',
          slot: true,
          noneClass: true
        }
      ],

      smsLoading: false,
      countdown: 0
    }
  },

  created () {
    window.login = this
  },

  computed: {
    countdownText () {
      return this.countdown + 'S后获取'
    }
  },

  methods: {
    onChangeLoginType () {
      let type = this.formData.loginType
      type = type === 'pw' ? 'code' : 'pw'
      this.formData.loginType = type

      let item = this.formRules.find(o => o.key === type)
      item.hidden = false
      item.required = true

      type = type === 'pw' ? 'code' : 'pw'
      item = this.formRules.find(o => o.key === type)
      item.hidden = true
      item.required = false

      this.$refs.form.clearErrors()
    },

    getSmsCode () {
      this.smsLoading = true
      setTimeout(() => {
        this.countdown = 60
        clearInterval(this.countdownHandle)
        this.countdownHandle = setInterval(() => {
          this.countdown--
          if (this.countdown === 0) {
            clearInterval(this.countdownHandle)
          }
        }, 1000)
      }, 2000)
    },

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
  },
  beforeDestroy () {
    clearInterval(this.countdownHandle)
  }
}
</script>

<style lang="scss" scoped>
.login {
  .login-header {
    margin-bottom: 2rem;
    text-align: center;
  }
  .login-code {
    display: flex;
    flex-direction: row;
    align-items: center;
    input {
      flex: 1;
    }
    .code-divider {
      margin: 0 1rem;
      width: 1px;
      height: 1.6rem;
      background-color: rgb(151, 151, 151);
    }
    .code-countdown {
      display: inline-block;
      width: 6rem;
      color: rgb(167, 167, 167);
    }
    .sg-button {
      width: 6rem;
      font-size: 1.3rem;
      padding-right: 0;
      padding-left: 0;
    }
  }
  .login-type {
    .sg-button {
      display: inline-block;
      width: inherit;
      font-size: 1.2rem;
    }
  }
  .login-button {
    margin-top: 2rem;
  }
}
</style>
