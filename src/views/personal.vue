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
    <div class="personal-main" v-if="personalID">
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
          <img v-if="isAvatarBase64" :src="personalAvatar" />
          <img v-else :src="personalAvatar | imgSrcFilter" />
          <sg-button v-if="isEditing" type="text" @click="onOpenChangeAvatar">更换</sg-button>
        </div>
      </div>
      <div v-if="isSelf" class="info-item">
        <span>
          手机号码
          <i>:</i>
        </span>
        <div>{{phoneText || '-'}}</div>
      </div>
      <div class="info-item">
        <span>
          心情
          <i>:</i>
        </span>
        <div>
          <template v-if="!isEditing">{{personalMood || '-'}}</template>
          <input v-else v-model="personalMood" />
        </div>
      </div>

      <div class="info-item" v-show="!isEditing">
        <span>
          诗词概况
          <i>:</i>
        </span>
        <div class="statistics">
          <template v-if="peotryCount !== 0 || peotSetCount !== 0">
            {{isSelf ? '我' : 'TA'}}共创建<i>{{peotSetCount | numFilter}}</i>个选集，
            <br />
            共<i>{{peotryCount | numFilter}}</i>首诗词，
            <br />
            收获了<i>{{praiseCount | numFilter}}</i>赞
          </template>
          <template v-else>Opps，{{isSelf ? '我' : 'TA'}}暂未有选集和诗词</template>
        </div>
      </div>

      <div v-show="!isEditing">
        <sg-button
          type="primary"
          @click="$router.push({name: 'peotry-list', query: {uuid: personalID}})"
        >{{isSelf ? '我' : 'TA'}}&nbsp;的&nbsp;诗&nbsp;词</sg-button>
      </div>
      <div v-if="isSelf && !isEditing" class="logout-item">
        <sg-button @click="onLogout">退&nbsp;出&nbsp;登&nbsp;陆</sg-button>
      </div>
    </div>

    <!-- 头像编辑 -->
    <div class="sg-mask" v-if="imageEditorVisible">
      <div class="sg-flex-column">
        <sg-header style="color: white" @back="handleAvatarBack" :centerStatus="''">
          <template slot="left">头像编辑</template>
          <sg-button type="text" slot="right" @click="onConfirmAvatar">确定</sg-button>
        </sg-header>
        <image-editor ref="imageEditor" class="sg-flex-one" :autoOpen="true"></image-editor>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import { base64ToFile } from '@/common/image'
import { apiURL, apiGetData, apiPostUpload } from '@/api'
// import Cache from '@/common/cache-center'

export default {
  name: 'Personal',

  components: {
    ImageEditor: () => import('@/components/image-editor')
  },

  data () {
    return {
      personalID: 0,
      personalName: '',
      personalAvatar: '',
      personalMood: '',
      isAvatarBase64: false,

      peotryCount: -1,
      praiseCount: -1,
      peotSetCount: -1,

      isEditing: false,

      imageEditorVisible: false
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
      return this.userID && +this.userID === +this.personalID
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

  beforeRouteUpdate (to, from, next) {
    next()
    this.initData()
    this.getPersonalPeotryInfo()
  },

  methods: {
    initData () {
      const uuid = this.$route.query.uuid || this.userID
      if (!uuid) {
        this.$toastLogin()
        return
      }

      this.personalID = +uuid
      if (this.isSelf) {
        this.personalName = this.selfPublicInfo.username
        this.personalAvatar = this.selfPublicInfo.avatar
        this.personalMood = this.selfPublicInfo.mood
      } else {
        if (this.saveData) {
          const saveData = this.saveData
          for (const key in saveData) {
            this[key] = saveData[key]
          }
          this.saveData = null
        } else {
          apiGetData(apiURL.userInfoList, { datas: this.personalID })
            .then(resp => {
              const info = resp.data[0]
              this.personalName = info.username
              this.personalAvatar = info.avatar
              this.personalMood = info.mood
            })
            .catch(() => {
              this.$toast('获取个人信息失败')
            })
        }
      }
      this.isAvatarBase64 = false
    },
    getPersonalPeotryInfo () {
      const params = { id: this.personalID }
      apiGetData(apiURL.userPoetryCount, params).then(resp => {
        this.peotryCount = resp.data[0].count
      })
      apiGetData(apiURL.userPraiseCount, params).then(resp => {
        this.praiseCount = resp.data[0].count
      })
      apiGetData(apiURL.peotSets, { userId: this.personalID }).then(resp => {
        const userID = this.personalID
        this.peotSetCount = resp.data.filter(o => o.userId === userID).length
      })
    },

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
      this.imageEditorVisible = true
    },
    handleAvatarBack () {
      this.imageEditorVisible = false
    },
    onConfirmAvatar () {
      if (this.isAvatarUploading) {
        return
      }
      this.isAvatarUploading = true
      this.$refs.imageEditor.getImage(base64 => {
        this.personalAvatar = base64
        this.isAvatarBase64 = true

        const formData = new FormData()
        formData.append(
          'file',
          base64ToFile(base64, this.personalID + '-avatar.png')
        )
        apiPostUpload(apiURL.upload, formData, { pathType: 'icon' })
          .then(resp => {
            this.personalAvatar = resp.data[0]
            this.isAvatarBase64 = false
          })
          .finally(() => {
            this.imageEditorVisible = false
            this.isAvatarUploading = false
          })
      })
    },
    onEditOrSave () {
      if (this.isEditing) {
        if (this.hasEditChange()) {
          if (this.isAvatarBase64) {
            return
          }
          this.update({
            name: this.personalName,
            avatar: this.personalAvatar,
            mood: this.personalMood
          }).then(resp => {
            this.$toast('保存成功')
            this.isEditing = false
          })
        } else {
          this.isEditing = false
        }
      } else {
        this.saveData = {
          personalName: this.personalName,
          personalAvatar: this.personalAvatar,
          personalMood: this.personalMood
        }
        this.isEditing = true
      }
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
      this.$confirm({
        title: '提示',
        content: '退出后需要重新登录验证',
        confirm: () => {
          this.logout()
        }
      })
    },
    ...mapActions({
      logout: 'auth/logout',
      update: 'auth/update'
    })
  }
}
</script>

<style lang="scss" scoped>
@import "@/ui/style/const.scss";

.personal {
  .personal-main {
    padding: 1rem;
  }
  .info-item {
    display: flex;
    flex-direction: row;
    // height: $height-text;
    line-height: $height-text;
    margin-bottom: 1.5rem;
    > span {
      display: inline-block;
      width: 6rem;
      padding-right: 1rem;
      color: $color-tip;
      text-align: right;
      font-size: $size-text;
    }
    > div {
      flex: 1;
      font-size: 1.2rem;
      color: $color-text;
    }
  }
  .avatar-item {
    img {
      display: inline-block;
      width: $height-text;
      height: $height-text;
      vertical-align: top;
    }
    .sg-button {
      margin-left: 2rem;
    }
  }
  .statistics {
    i {
      margin: 0 0.3rem;
      font-weight: bold;
      color: $color-theme;
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
      padding: 0 $padding-small;
      font-size: $size-text;
      line-height: $height-text;
      border: none;
      border-bottom: 1px solid #ddd;
      outline: none;
      box-sizing: border-box;
      background-color: transparent;
      &:focus {
        border-bottom-color: $color-theme-focus;
      }
    }
  }
}
</style>
