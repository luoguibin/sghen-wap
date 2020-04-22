<template>
  <div class="login">
    <div class="login-header">
      <h2>Sghen-UI测试</h2>
    </div>
    <sg-form ref="form" :formData="formData" :formRules="formRules">
      <div class="login-captcha" slot="captchaValue">
        <input v-model="formData.captchaValue" v-focus-within />
        <img v-if="captcha.id" :src="captcha.base64" @click="onGetCaptcha" />
      </div>
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
import { mapState, mapActions } from 'vuex'
import { sgIsPhone } from '@/utils/sgRegExp'
import { apiURL, apiGetData } from '@/api'

export default {
  name: 'Login',

  data () {
    return {
      isRequesting: false,
      formData: {
        phone: null,
        pw: '',
        code: '',
        loginType: 'pw',
        captchaValue: ''
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
          key: 'captchaValue',
          slot: true,
          label: '图形运算',
          hidden: true,
          required: false,
          validator: (v, rule) => {
            return v ? '请输入图形运算结果' : ''
          }
        },
        {
          key: 'code',
          slot: true,
          label: '验证码',
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
      captcha: {
        id: '',
        base64: ''
      },
      smsLoading: false,
      countdown: 0
    }
  },

  created () {
    window.login = this
    if (this.isLogin) {
      this.$router.push({ name: 'home' })
    }
  },

  computed: {
    countdownText () {
      return this.countdown + 'S后获取'
    },
    ...mapState({
      isLogin: state => state.auth.phone
    })
  },

  methods: {
    onChangeLoginType () {
      const type = this.formData.loginType === 'pw' ? 'code' : 'pw'
      this.formData.loginType = type

      const isPwType = type === 'pw'
      let item = this.formRules.find(o => o.key === 'pw')
      item.hidden = !isPwType
      item.required = isPwType

      item = this.formRules.find(o => o.key === 'code')
      item.hidden = isPwType
      item.required = !isPwType

      item = this.formRules.find(o => o.key === 'captchaValue')
      item.hidden = isPwType
      item.required = !isPwType

      if (!isPwType) {
        this.onGetCaptcha()
      }

      this.$refs.form.clearErrors()
    },
    onGetCaptcha () {
      apiGetData(apiURL.captcha).then(resp => {
        this.captcha = resp.data
      })
    },
    getSmsCode () {
      this.$refs.form.validateFields(['phone', 'captchaValue'], errors => {
        if (errors) {
          return
        }
        this.smsLoading = true
        const params = {
          phone: this.formData.phone,
          captchaId: this.captcha.id,
          captchaValue: this.formData.captchaValue
        }
        this._getSmsCode(params).then(() => {
          this.countdown = 60
          clearInterval(this.countdownHandle)
          this.countdownHandle = setInterval(() => {
            this.countdown--
            if (this.countdown === 0) {
              clearInterval(this.countdownHandle)
            }
          }, 1000)
        }).finally(() => {
          this.smsLoading = false
        })
      })
    },

    onSubmit () {
      this.$refs.form.validate(errors => {
        if (errors) {
          return
        }
        this.isRequesting = true

        const { phone, pw, code } = this.formData
        const params = { account: phone }
        if (code) {
          params.code = code
          params.pw = '******'
        } else {
          params.pw = pw
        }

        this.login(params).then(() => {
          this.$toast('登录成功')
          this.$router.push({ name: 'home' })
        }).finally(() => {
          this.isRequesting = false
        })
      })
    },

    ...mapActions({
      login: 'auth/login',
      _getSmsCode: 'auth/getSmsCode'
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
    overflow: hidden;
  }
  .login-captcha {
    display: flex;
    flex-direction: row;
    align-items: center;
    input {
      flex: 1;
    }
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
