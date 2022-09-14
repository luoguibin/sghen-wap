<template>
  <div class="login sg-flex-column">
    <sg-header @back="$router.go(-1)">Sghen三行</sg-header>
    <div class="sg-flex-one" style="overflow-x: hidden; overflow-y: auto;" sg-scroll="vertical_stop">
      <sg-form ref="form" :formData="formData" :formRules="formRules">
        <div class="login-captcha" slot="captchaValue">
          <input v-model="formData.captchaValue" v-focus-within />
          <span v-if="captcha.id" class="svg-box" v-html="captcha.svgData" @click="onGetCaptcha"></span>
        </div>
        <div class="login-code" slot="code">
          <input v-model="formData.code" v-focus-within />
          <span class="code-divider"></span>
          <span v-show="countdown > 0" class="code-countdown">{{countdownText}}</span>
          <sg-button
            v-show="countdown <= 0"
            type="text"
            :isLoading="smsLoading"
            @click="onGetSmsCode"
          >获&nbsp;取</sg-button>
        </div>
        <div class="login-type" slot="loginType">
          <div class="left">
            <sg-button
              v-show="formData.loginType !== 'create'"
              type="text"
              @click="onChangeLoginType('code')"
            >{{formData.loginType === 'pw' ? '短信登陆' : '密码登陆'}}</sg-button>
          </div>
          <div class="right">
            <sg-button
              v-show="formData.loginType !== 'code'"
              type="text"
              @click="onChangeLoginType('create')"
            >{{formData.loginType === 'pw' ? '账号注册' : '已有账号？'}}</sg-button>
          </div>
        </div>
        <sg-button
          class="login-button"
          type="primary"
          :isLoading="isRequesting"
          @click="onSubmit"
        >{{formData.loginType === 'create' ? '注&nbsp;&nbsp;册' : '登&nbsp;&nbsp;录'}}</sg-button>
      </sg-form>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { isPhone } from '@/utils/verification'
import { apiURL, apiGetData, apiPostData } from '@/api'

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
            if (this.isNormalLogin) {
              return v ? '' : '请输入' + rule.label
            }
            return isPhone(v) ? '' : '请输入' + rule.label
          },
          _error: ''
        },
        {
          key: 'name',
          label: '昵称',
          required: false,
          hidden: true,
          validator: (v, rule) => {
            return v ? '' : '请输入' + rule.label
          },
          _error: ''
        },
        {
          key: 'pw',
          label: '密码',
          required: true,
          hidden: false,
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
          key: 'pw2',
          label: '重复密码',
          required: false,
          hidden: true,
          inputType: 'password',
          validator: (v, rule) => {
            if (!v) {
              return '请输入' + rule.label
            } else if (v.length < 6 || v.length > 20) {
              return '密码长度为6~20字符'
            } else {
              return this.formData.pw !== v ? '两次密码不一致' : ''
            }
          },
          _error: ''
        },
        {
          key: 'captchaValue',
          slot: true,
          label: '图形验证',
          hidden: true,
          required: false,
          validator: (v, rule) => {
            return v ? '' : '请输入图形验证结果'
          },
          _error: ''
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
        svgData: ''
      },
      smsLoading: false,
      countdown: 0
    }
  },

  created () {
    window.login = this
    if (this.isLogin) {
      this.afterLogin()
    }
    this.isNormalLogin = this.$route.query.mode === 'normal'
  },

  computed: {
    countdownText () {
      return this.countdown + 'S后获取'
    },
    ...mapGetters({
      isLogin: 'auth/isLogin'
    })
  },

  methods: {
    afterLogin () {
      const redirect = this.$route.query.redirect
      if (redirect) {
        if (redirect.startsWith('http')) {
          window.location.replace(decodeURIComponent(redirect))
        } else {
          this.$router.replace({ path: redirect })
        }
      } else {
        this.$router.replace({ name: 'home' })
      }
    },

    onChangeLoginType (otherType) {
      const type = this.formData.loginType === 'pw' ? otherType : 'pw'
      const isPwType = type === 'pw'
      const isCreateType = type === 'create'
      this.formData.loginType = type

      let item = this.formRules.find(o => o.key === 'name')
      item.hidden = !isCreateType
      item.required = isCreateType

      item = this.formRules.find(o => o.key === 'pw')
      item.hidden = !isPwType && !isCreateType
      item.required = isPwType || isCreateType

      item = this.formRules.find(o => o.key === 'pw2')
      item.hidden = !isCreateType
      item.required = isCreateType

      item = this.formRules.find(o => o.key === 'code')
      item.hidden = isPwType
      item.required = !isPwType
      this.formData.code = ''

      item = this.formRules.find(o => o.key === 'captchaValue')
      item.hidden = isPwType
      item.required = !isPwType

      if (!isPwType || isCreateType) {
        this.onGetCaptcha()
      }

      this.$refs.form.clearErrors()
    },
    onGetCaptcha () {
      apiGetData(apiURL.captcha).then(resp => {
        const { key: id, svgData } = resp.data
        this.captcha = { id, svgData }
      })
    },
    onGetSmsCode () {
      this.$refs.form.validateFields(['phone', 'captchaValue'], errors => {
        if (errors) {
          return
        }
        this.smsLoading = true
        const params = {
          mobile: this.formData.phone,
          key: this.captcha.id,
          code: this.formData.captchaValue
        }
        apiPostData(apiURL.smsCode, params)
          .then(() => {
            this.countdown = 60
            clearInterval(this.countdownHandle)
            this.countdownHandle = setInterval(() => {
              this.countdown--
              if (this.countdown === 0) {
                clearInterval(this.countdownHandle)
              }
            }, 1000)
          })
          .finally(() => {
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

        const { phone, pw, code, name, loginType } = this.formData
        const params = { account: phone }
        if (code) {
          params.code = code
          params.pw = '******'
        } else {
          params.pw = pw
        }

        const isCreateType = loginType === 'create'
        if (isCreateType) {
          params.name = name
        } else if (this.isNormalLogin) {
          params.type = 1
        }

        const method = isCreateType ? this.createUser : this.login
        method(params)
          .then(() => {
            this.$toast('登录成功')
            this.afterLogin()
          })
          .finally(() => {
            this.isRequesting = false
          })
      })
    },

    ...mapActions({
      createUser: 'auth/createUser',
      login: 'auth/login'
    })
  },
  beforeDestroy () {
    clearInterval(this.countdownHandle)
  }
}
</script>

<style lang="scss" scoped>
@import "@/ui/style/const.scss";

.login {
  .login-captcha {
    display: flex;
    flex-direction: row;
    align-items: center;
    input {
      flex: 1;
    }
    .svg-box {
      display: inline-block;
      width: 150px;
      height: 39px;
      overflow: hidden;
      /deep/ {
        svg {
          width: 100%;
          height: 100%;
        }
      }
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
  }
  .login-type {
    display: flex;
    flex-direction: row;
    margin-top: 1rem;
    .right {
      flex: 1;
      text-align: right;
    }
    .left {
      flex: 1;
      text-align: left;
    }
  }
  .login-button {
    margin-top: 2rem;
  }
}
</style>
