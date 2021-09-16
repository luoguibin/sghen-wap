<template>
  <div class="my-msgs sg-flex-column">
    <sg-header @back="$router.go(-1)">
      <span>我的消息</span>
    </sg-header>

    <div class="main sg-flex-one">
      <sg-scroll ref="sgScroll" :isEnd="true" @refresh="handleRefresh">
        <div v-for="item in msgs" :key="item.id" class="msg-item">
          <!-- 消息内容 -->
          <p>{{ item | msgTextFilter }}</p>

          <!-- 消息简介 -->
          <div class="msg-bottom sg-flex">
            <div class="title">
              {{ item | msgTypeFilter }}
            </div>
            <div class="sg-flex-one time">
              {{ item.createTime | timeFilter }}
            </div>
            <sg-button
              :disabled="item.status > 0"
              type="text"
              @click="onReadMsg(item)"
            >
              {{ item.status > 0 ? "已读" : "了解" }}</sg-button
            >
          </div>
        </div>

        <div class="msg-bottom-tip">暂只展示最新{{ maxCount }}条消息</div>
      </sg-scroll>
    </div>
  </div>
</template>

<script>
import { apiURL, apiPostData } from '@/api'
import { mapActions, mapState } from 'vuex'
import { MSG_TYPE } from '@/common/const'

const msgTypeMap = {}
Object.keys(MSG_TYPE).forEach((key) => {
  msgTypeMap[MSG_TYPE[key].value] = MSG_TYPE[key]
})

export default {
  name: 'MyMsgs',

  data () {
    return {
      maxCount: 100
    }
  },

  computed: {
    ...mapState({
      msgs: (state) => state.sysMsg.msgs
    })
  },

  filters: {
    msgTypeFilter (item) {
      const o = msgTypeMap[item.msgType] || MSG_TYPE.SYS
      return o.label
    },
    msgTextFilter (item) {
      switch (item.msgType) {
        case MSG_TYPE.USER_CREATE.value:
          return item.content || '欢迎注册Sghen三行~'
        default:
          return item.content || '--'
      }
    }
  },

  created () {
    window.myMsgs = this
  },

  methods: {
    onReadMsg (item) {
      if (item.loading) {
        return
      }
      item.loading = true
      apiPostData(apiURL.readSysMsg, { id: item.id })
        .then(() => {
          item.status = 1
        })
        .finally(() => {
          item.loading = false
        })
    },

    handleRefresh () {
      this.getSysMsgs({ limit: this.maxCount })
        .then(() => {
          this.$refs.sgScroll.success()
        })
        .catch(() => {
          this.$refs.sgScroll.fail()
        })
    },
    ...mapActions({
      getSysMsgs: 'sysMsg/getSysMsgs'
    })
  }
}
</script>

<style lang="scss" scoped>
.my-msgs {
  position: relative;
  height: 100%;
  overflow: hidden;

  .main {
    flex: 1;
    overflow: hidden;
  }
}

.msg-item {
  padding: 0.5rem 1rem 1rem;
  font-size: 1.2rem;
  line-height: 2rem;
  align-items: flex-end;
  &:nth-child(2n) {
    background-color: white;
  }

  .msg-bottom {
    font-size: 1rem;
    color: #888888;
    border-bottom: 1px dashed gray;
  }
  .title {
    width: 100px;
    text-align: left;
  }
  .time {
    text-align: right;
    margin-right: 3rem;
  }
  p {
    margin-bottom: 0.5rem;
  }
}

.msg-bottom-tip {
  text-align: center;
  font-size: 0.8rem;
  color: #999999;
  margin: 1rem 0;
}
</style>
