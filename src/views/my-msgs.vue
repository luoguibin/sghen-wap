<template>
  <div class="my-msgs sg-flex-column">
    <sg-header @back="$router.go(-1)">
      <span>我的消息</span>
    </sg-header>

    <div class="main sg-flex-one">
      <div class="msg-list" sg-scroll="vertical_stop">
        <div v-for="item in msgs" :key="item.id" class="msg-item">
          <!-- 消息内容 -->
          <p>{{ item | msgTextFilter }}</p>

          <!-- 消息简介 -->
          <div class="msg-bottom sg-flex">
            <div class="title">
              {{ item.msgType | msgTypeFilter }}
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
      </div>
    </div>
  </div>
</template>

<script>
import { apiURL, apiPostData } from '@/api'
import { mapState } from 'vuex'

export default {
  name: 'MyMsgs',

  computed: {
    ...mapState({
      msgs: (state) => state.sysMsg.msgs
    })
  },

  filters: {
    msgTypeFilter (item) {
      switch (item.msgType) {
        default:
          return '系统消息'
      }
    },
    msgTextFilter (item) {
      switch (item.msgType) {
        case 2001:
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
    }
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

.msg-list {
  height: 100%;
  padding: 1rem;
  box-sizing: border-box;
  overflow-y: auto;
}
.msg-item {
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  line-height: 2rem;
  align-items: flex-end;
  border-bottom: 1px dashed gray;

  .msg-bottom {
    font-size: 1rem;
    color: #888888;
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
</style>
