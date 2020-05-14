<template>
  <div :class="{'personal': true, 'personal-editing': isEditing}">
    <sg-header @back="onBack">
      <span>个人中心</span>
      <sg-button
        v-if="isSelf"
        slot="right"
        type="text"
        style="font-size: 1rem;"
        @click="onEditOrSave"
      >{{isEditing ? '保存' : '编辑'}}</sg-button>
    </sg-header>
    <div class="personal-main">
      <div class="info-item">
        <span>
          昵称
          <i>:</i>
        </span>
        <div>
          <template v-if="!isEditing">{{personalName}}</template>
          <input v-else v-model="personalName" />
        </div>
      </div>
      <div class="info-item avatar-item">
        <span>
          头像
          <i>:</i>
        </span>
        <div>
          <img :src="personalAvatar | img-src" />
          <sg-button v-if="isEditing" type="text" @click="onOpenChangeAvatar">更换</sg-button>
        </div>
      </div>
      <div v-if="isSelf" class="info-item">
        <span>
          手机号码
          <i>:</i>
        </span>
        <div>{{phoneText}}</div>
      </div>

      <div v-if="isSelf && !isEditing" class="logout-item">
        <sg-button @click="onLogout">退&nbsp;出&nbsp;登&nbsp;陆</sg-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import Cache from '@/common/cache-center'

export default {
  name: 'Personal',

  data () {
    return {
      personalID: 0,
      personalName: '',
      personalAvatar: '',

      isEditing: false
    }
  },

  computed: {
    phoneText () {
      const phone = this.phone + ''
      if (!phone || phone.length !== 11) {
        return ''
      }
      return phone.substr(0, 3) + '****' + phone.substr(7)
    },
    isSelf () {
      return +this.userID === +this.personalID
    },
    ...mapState({
      userID: state => state.auth.userID,
      phone: state => state.auth.phone
    }),
    ...mapGetters({
      selfPublicInfo: 'auth/selfPublicInfo'
    })
  },

  created () {
    window.personal = this
    this.initData()
    this.getPersonalPeotryInfo()
  },

  methods: {
    initData () {
      const uuid = this.$route.query.uuid
      if (!uuid) {
        return
      }

      this.personalID = +uuid
      if (this.isSelf) {
        this.personalName = this.selfPublicInfo.username
        this.personalAvatar = this.selfPublicInfo.avatar
      } else {
        const info = Cache.UserCache.getData(+uuid) || {}
        this.personalName = info.username
        this.personalAvatar = info.avatar
      }
    },
    getPersonalPeotryInfo () {},

    hasEditChange () {
      const saveData = this.saveData
      let hasChange = false
      for (const key in saveData) {
        if (this[key] !== saveData[key]) {
          hasChange = true
        }
      }
      return hasChange
    },

    onOpenChangeAvatar () {
      this.$toast('正在码...')
    },
    onEditOrSave () {
      if (this.isEditing) {
        if (this.hasEditChange()) {
          this.$toast('正在码...')
        }
      } else {
        this.saveData = {
          personalName: this.personalName,
          personalAvatar: this.personalAvatar
        }
      }
      this.isEditing = !this.isEditing
    },
    onBack () {
      if (this.isEditing) {
        if (this.hasEditChange()) {
          this.$confirm({
            title: '系统提示',
            content: '信息已编辑，是否放弃修改？',
            confirm: () => {
              this.initData()
              this.isEditing = false
            }
          })
          return
        }
        this.initData()
        this.isEditing = false
      } else {
        this.$router.go(-1)
      }
    },
    onLogout () {
      this.logout()
    },
    ...mapActions({
      logout: 'auth/logout'
    })
  }
}
</script>

<style lang="scss" scoped>
.personal {
  .personal-main {
    padding: 1rem;
  }
  .info-item {
    display: flex;
    flex-direction: row;
    overflow: hidden;
    margin-bottom: 1.6rem;
    > span {
      display: inline-block;
      width: 6rem;
      padding-right: 1rem;
      text-align: right;
      font-size: 1.2rem;
      color: #555;
    }
    > div {
      flex: 1;
      font-size: 1.2rem;
    }
  }
  .avatar-item {
    img {
      display: inline-block;
      width: 2rem;
      height: 2rem;
      vertical-align: top;
    }
    .sg-button {
      font-size: 1.2rem;
      margin-left: 2rem;
      line-height: 2rem;
      color: rgb(61, 104, 139);
    }
  }
  .logout-item {
    margin: 1rem 0;
    .sg-button {
      color: rgb(255, 255, 255);
      background-color: #aeb4b9;
    }
  }
}
.personal-editing {
  .info-item {
    input {
      display: block;
      width: 100%;
      padding: 0.3rem 0.5rem;
      font-size: 1.2rem;
      line-height: 1.5rem;
      border: 1px solid #ddd;
      border-radius: 0.5rem;
      outline: none;
      box-sizing: border-box;
      background-color: transparent;
    }
  }
}
</style>
