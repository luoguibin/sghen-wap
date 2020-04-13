<template>
  <div :class="{'peotry': true, 'peotry-peot-icon': hasPeotIcon}" @click="onClickPeotIcon($event)">
    <!-- 诗人头像 -->
    <img
      v-if="hasPeotIcon"
      class="peot-icon"
      img-type="user-peot"
      :src="(peotry.user && peotry.user.iconUrl) | imgFilter"
    />

    <!-- 诗词选集及标题 -->
    <div :class="{'peotry-title': true, 'peotry-inline': titleInline}">
      <span
        v-if="peotry.set"
        class="tooltip peotry-set"
        :tooltip="'选集：' + peotry.set.name"
      >{{peotry.set.name}}</span>
      <span v-if="peotry.set && peotry.title" class="peotry-set_dot">*</span>
      <span class="peotry-title" v-show="peotry.title">{{peotry.title}}</span>
    </div>

    <!-- 诗词点赞数 -->
    <div v-if="showRank" :class="{'peotry-rank': true, 'peotry-inline': titleInline}">
      <span class="peotry-count" v-show="showPraiseCount && praiseComments.length">
        <i class="el-icon-s-data"></i>
        {{praiseComments.length}}
      </span>
      <span @click="onCommentPraise(true)" class="rank-praise">
        <i :class="[isPraise ? 'el-icon-star-on' : 'el-icon-star-off']"></i>
      </span>
    </div>

    <!-- 诗词作者及创建时间 -->
    <div :class="{'peot-name': true, 'peotry-inline': titleInline && !showRank}">
      <template v-if="titleInline">
        {{peotry.user ? '--' + peotry.user.name : ""}}
        <span
          v-if="showTime"
        >于{{peotry.time | time-format}}</span>
      </template>
      <template v-else>
        {{peotry.user ? peotry.user.name : ""}}
        <span v-if="showTime">--{{peotry.time | time-format}}</span>
      </template>
    </div>

    <!-- `white-wrap: pre-wrap` and code's format -->
    <!-- 诗词内容 -->
    <div class="content-container" ref="contentEl" :style="{height: contentHeight}">
      <div :class="{'content': true }" v-html="peotry.content"></div>
      <div class="end" v-if="peotry.end">{{peotry.end}}</div>
    </div>

    <!-- 诗词扩展按钮 -->
    <div v-if="canExpand" class="content-expand">
      <p v-show="contentHeight !== 'initial'">...</p>
      <span @click="onClickExpand">{{contentHeight === 'initial' ? '收起' : expandText}}</span>
    </div>

    <!-- 诗词图片 -->
    <div v-if="showImage && thumbnails.length" class="images">
      <div v-for="value in thumbnails" :key="value" class="image-wrapper">
        <div class="image-wrapper__inner">
          <img :src="value" />
        </div>
      </div>
    </div>

    <!-- 诗词功能按钮 -->
    <!-- <div v-show="showMore" class="peotry-more">
      <template v-if="showMoreDirect">
        <sg-button @click="onCommandMore('praise')">{{isPraise ? "取消点赞" : "点赞"}}</sg-button>
        <sg-button @click.stop="onCommandMore('comment')">评论</sg-button>
      </template>
      <el-dropdown v-else @command="onCommandMore" trigger="click">
        <i class="peotry-more_icon el-icon-more-outline"></i>

        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="comment">
            <span>
              评论
              <i class="el-icon-chat-dot-square"></i>
            </span>
          </el-dropdown-item>

          <el-dropdown-item command="praise">
            <span>
              {{isPraise ? "取消点赞" : "点赞"}}
              <i
                :class="[isPraise ? 'el-icon-star-on' : 'el-icon-star-off']"
              ></i>
            </span>
          </el-dropdown-item>

          <el-dropdown-item v-if="isSelfPeotry" command="update">
            <span>
              更新
              <i class="el-icon-edit-outline"></i>
            </span>
          </el-dropdown-item>

          <el-dropdown-item v-if="isSelfPeotry" command="delete">
            <span>
              删除
              <i class="el-icon-delete"></i>
            </span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>-->

    <!-- 诗词评论 -->
    <div v-if="showComment && peotry.comments && peotry.comments.length" class="comments">
      <div class="praise-users" v-show="praiseComments.length">
        <img
          v-for="comment in praiseComments"
          :key="comment.id"
          img-type="user-list"
          :src="comment.fromUser && comment.fromUser.iconUrl"
        />
      </div>

      <div v-show="praiseComments.length && realComments.length" class="comments-divider"></div>

      <div
        v-for="comment in realComments"
        class="comment"
        :key="comment.id"
        @click.stop="onCommentUser($event)"
      >
        <div class="users">
          <span
            class="user"
            :user-id="comment.fromId"
            :comment-id="comment.id"
          >{{comment.fromUser ? comment.fromUser.name : comment.fromId}}</span>
          <span v-if="comment.toId !== comment.fromId" class="comment_to">回复</span>
          <span
            v-if="comment.toId !== comment.fromId"
            class="user"
            :user-id="comment.toId"
          >{{comment.toUser ? comment.toUser.name : comment.toId}}</span>
          <span class="comment_dot">:</span>
        </div>
        <p>{{comment.content}}</p>
      </div>
    </div>

    <!-- 诗词评论输入框 -->
    <div v-if="inComment" class="comment-input">
      <h5
        v-if="newComment.toId !== userID"
        style="text-align: left;"
      >回复：{{newComment.toUser ? newComment.toUser.name : newComment.toId}}</h5>
      <el-input
        ref="commentEl"
        type="textarea"
        :autosize="{ maxRows: 4}"
        maxlength="100"
        show-word-limit
        placeholder="请输入内容"
        v-model="newComment.content"
      ></el-input>
      <el-button
        @click.stop="onCommentSubmit"
        size="small"
        :disabled="!newComment.content.trim()"
      >提交</el-button>
    </div>

    <!-- 作者基本信息 -->
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { apiURL, apiPostData } from '@/api'

export default {
  name: 'Peotry',

  props: {
    peotry: {
      type: Object,
      required: true
    },

    /**
     * 是否有
     */
    hasPeotIcon: {
      type: Boolean,
      default: true
    },

    /**
     * 标题和作者内联排列
     */
    titleInline: {
      type: Boolean,
      default: false
    },

    /**
     * 是否显示点赞数
     */
    showPraiseCount: {
      type: Boolean,
      default: true
    },

    /**
     * 是否显示创建时间
     */
    showTime: {
      type: Boolean,
      default: true
    },

    /**
     * 是否显示评论
     */
    showComment: {
      type: Boolean,
      default: true
    },

    /**
     * 是否显示图片
     */
    showImage: {
      type: Boolean,
      default: true
    },

    /**
     * 是否显示更多操作
     */
    showMore: {
      type: Boolean,
      default: false
    },

    /**
     * 是否直接展示操作按钮
     */
    showMoreDirect: {
      type: Boolean,
      default: false
    },

    /**
     * 是否显示排行
     */
    showRank: {
      type: Boolean,
      default: false
    },

    /**
     * 扩展按钮
     */
    expandText: {
      type: String,
      default: '展开全文'
    }
  },
  data () {
    return {
      inComment: false,
      newComment: {
        type: 1,
        typeId: 0,
        content: '',
        fromId: 0,
        fromUser: null,
        toId: 0,
        toUser: null
      },
      clickTime: 0,
      canExpand: false,
      contentHeight: 'initial',
      mainScrollBox: null,

      showUser: false,
      showUserInfo: {}
    }
  },
  filters: {
    imgFilter (v) {
      let path
      if (v.indexOf('.') === 0) {
        if (v.indexOf('./file') === 0) {
          path = '/sapi' + v.substr(1)
        } else {
          path = '/sapi/file/peotry/img' + v.substr(1)
        }
      } else {
        path = '/sapi/file/peotry/img/' + v
      }
      return path
    }
  },
  computed: {
    /**
     * @returns {Boolean} 返回是否为当前用户创建的诗词
     */
    isSelfPeotry () {
      return this.peotry.user && this.userID === this.peotry.user.id
    },

    /**
     * @returns {Array} 返回诗词的直接可用图片列表
     */
    peotryImages () {
      window.peotry = this
      const imageObj = this.peotry.image
      if (imageObj && imageObj.count) {
        const imgFilter = this.$options.filters['imgFilter']
        return JSON.parse(imageObj.images).map(v => {
          return imgFilter(v)
        })
      } else {
        return []
      }
    },
    thumbnails () {
      return this.peotryImages.map(v => {
        v = v.replace(/.jpg$/, '_100.jpg')
        v = v.replace(/.jpeg$/, '_100.jpeg')
        v = v.replace(/.png$/, '_100.png')
        return v
      })
    },

    /**
     * @returns {Array} 返回用户评论列表
     */
    realComments () {
      if (!this.peotry.comments) return []
      return this.peotry.comments
        .filter(comment => comment.toId > 0)
        .sort(function (o0, o1) {
          // 按时间排序评论列表
          const time0 = new Date(o0.createTime).getTime()
          const time1 = new Date(o1.createTime).getTime()
          return time0 < time1 ? -1 : 1
        })
    },

    /**
     * @returns {Array} 返回用户点赞列表
     */
    praiseComments () {
      if (!this.peotry.comments) return []
      return this.peotry.comments
        .filter(comment => comment.toId === -1 && comment.content === 'praise')
        .sort(function (o0, o1) {
          // 按时间排序评论列表
          const time0 = new Date(o0.createTime).getTime()
          const time1 = new Date(o1.createTime).getTime()
          return time0 < time1 ? -1 : 1
        })
    },

    /**
     * @returns {Comment} 返回我的点赞对象
     */
    myPraiseComment () {
      const userID = this.userID
      if (!userID) return
      return this.praiseComments.find(
        comment => comment.toId === -1 && comment.fromId === userID
      )
    },

    /**
     * @returns {Boolean} 返回当前登录用户是否点赞当前诗词
     */
    isPraise () {
      return this.myPraiseComment && this.myPraiseComment.content === 'praise'
    },

    ...mapState({
      userID: state => state.auth.userID,
      userName: state => state.auth.userName,
      userAvatar: state => state.auth.userAvatar
    })
  },
  created () {
    const mainScrollEl = document.getElementById('main-scroll')
    if (mainScrollEl && mainScrollEl.children) {
      this.mainScrollBox = mainScrollEl.children[0]
    }
  },
  mounted () {
    this.checkCanExpand(true)
  },
  methods: {
    /**
     * 分发诗词操作
     */
    onCommandMore (key) {
      switch (key) {
        case 'comment':
          this.openComment(this.userID)
          break
        case 'praise':
          this.onCommentPraise()
          break
        case 'update':
          this.$emit('on-update', this.peotry)
          break
        case 'delete':
          this.$emit('on-delete', this.peotry)
          break
        default:
          break
      }
    },

    /**
     * 检测当前评论对象
     * 若toId===fromId，表示直接评论诗词；
     * 若toId===-1，表示点赞诗词；
     * 否则为回复某用户的评论
     * @param {Integer} toId
     */
    checkComment (toId) {
      window.testPeotry = this
      const comment = this.newComment
      comment.content = ''
      comment.typeId = this.peotry.id
      comment.fromId = this.userID
      comment.fromUser = {
        id: this.userID,
        name: this.userName,
        iconUrl: this.userAvatar
      }
      comment.toId = toId
      if (toId > 1 && toId !== comment.fromId) {
        const fromComment = this.realComments.find(o => o.fromId === toId)
        comment.toUser = { ...fromComment.fromUser }
      } else {
        comment.toUser = null
      }
    },
    checkCanExpand (widthExpand) {
      const contentEl = this.$refs.contentEl
      if (!contentEl) {
        return
      }
      if (contentEl.clientHeight >= 120) {
        this.canExpand = true
        if (widthExpand) {
          this.onClickExpand()
        }
      }
    },
    onClickExpand () {
      this.contentHeight =
        this.contentHeight === 'initial' ? '105px' : 'initial'
    },

    openComment (toId) {
      if (!this.userID) {
        this.$message.warning('请登录后再操作')
        return
      }
      this.inComment = true
      this.checkComment(toId)
      this.$nextTick(() => {
        this.$refs.commentEl.focus()
        this.setOutClick(true)
      })
    },

    setOutClick (flag) {
      if (flag) {
        if (!this.onOutClick) {
          this.onOutClick = e => {
            let el = e.srcElement
            let count = 0
            const commentEl = this.$refs.commentEl
            if (!commentEl.$el) {
              this.inComment = false
              this.setOutClick(false)
              return
            }
            const parentElement = commentEl.$el.parentElement
            // 3代节点内检测是否还处于评论编辑框附近
            while (el && count < 3) {
              if (el === parentElement) {
                break
              } else {
                count++
                el = el.parentElement
              }
            }
            if (el === parentElement) {
              return
            }
            this.setOutClick(false)
            this.inComment = false
          }
        }
        window.addEventListener('click', this.onOutClick)
      } else {
        window.removeEventListener('click', this.onOutClick)
      }
    },

    onCommentUser (e) {
      if (!this.userID) {
        this.$message.warning('请登录后再操作')
        return
      }
      const userID = e.srcElement.getAttribute('user-id')
      if (userID) {
        const toId = parseInt(userID)
        const commentId = parseInt(e.srcElement.getAttribute('comment-id'))
        if (toId !== this.userID) {
          this.openComment(toId)
        } else if (commentId) {
          this.$confirm('是否删除该评论？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(() => {
              this.inComment = false
              this.onCommentDelete(commentId)
            })
            .catch(e => {})
        }
      }
    },
    onCommentPraise (needEmit) {
      if (!this.userID) {
        this.$message.warning('请登录后再操作')
        return
      }

      if (this.isPraise) {
        this.onCommentDelete(this.myPraiseComment.id, needEmit)
      } else {
        this.checkComment(-1)
        this.newComment.content = 'praise'
        this.onCommentSubmit(needEmit)
      }
    },
    /**
     * 提交诗词评论
     */
    onCommentSubmit (needEmit) {
      apiPostData(apiURL.commentCreate, this.newComment).then(resp => {
        const comment = resp.data.data
        this.addComment(comment)
        this.$emit('update', {
          type: 'comment-create',
          isPraise: comment.toId === -1
        })
      })

      this.setOutClick(false)
      this.inComment = false
    },
    /**
     * 添加诗词本地评论
     */
    addComment (comment) {
      if (comment.fromId > 1) {
        comment.fromUser = {
          id: this.userID,
          name: this.userName,
          iconUrl: this.userAvatar
        }
        delete comment.fromUser.token
      }
      // 正常流程都是点击评论列表中的某个用户，所以存在用户
      const comments = this.peotry.comments
      if (comment.toId > 1) {
        const toComment = comments.find(o => o.fromId === comment.toId)
        comment.toUser = { ...toComment.fromUser }
      }
      if (!comments) {
        this.$set(this.peotry, 'comments', [])
      }
      comments.push(comment)
    },
    /**
     * 删除某条评论
     * @param {Integer} id 评论对象id
     * @param {Boolean} needEmit 是否需要抛出事件
     */
    onCommentDelete (id, needEmit) {
      apiPostData(apiURL.commentDelete, { id, fromId: this.userID }).then(
        resp => {
          const index = this.peotry.comments.findIndex(o => o.id === id)
          const comment = this.peotry.comments.splice(index, 1)[0]
          this.$emit('update', {
            type: 'comment-delete',
            peotryId: this.peotry.id,
            isPraise: comment.toId === -1
          })
        }
      )
    },

    /**
     * 点击作者头像
     * @param {Event} e
     */
    onClickPeotIcon (e) {
      const el = e.srcElement
      if (el.tagName === 'IMG') {
        const imgType = el.getAttribute('img-type')
        if (imgType === 'user-peot') {
          this.showUserInfo = { ...this.peotry.user }
          this.showUser = true
        } else if (imgType === 'user-list') {
          let index = 0
          let tempEl = el
          while (tempEl.previousElementSibling) {
            index++
            tempEl = tempEl.previousElementSibling
          }
          const user = this.praiseComments[index].fromUser
          if (user) {
            this.showUserInfo = { ...user }
            this.showUser = true
          } else {
            this.$message.info('获取用户信息失败')
          }
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
$size-content: 18px;
$padding-set: 12px;

.peotry {
  position: relative;
  box-sizing: border-box;

  .peot-icon {
    width: 26px;
    height: 26px;
    object-fit: contain;
    position: absolute;
    left: 3px;
    top: 0;
    cursor: pointer;
    object-fit: contain;

    &:hover {
      background-color: rgba(250, 250, 250, 0.8);
      border-radius: 3px;
    }
  }

  .peotry-title {
    padding-bottom: $padding-set;

    .peotry-set {
      font-size: 18px;
    }
    .peotry-set_dot {
      font-size: 16px;
      padding: 0 5px;
    }
    .peotry-title {
      font-size: 16px;
    }
  }
  .peotry-title.peotry-inline {
    margin-right: 10px;
  }

  .peotry-rank {
    padding: 2px 5px;
    background-color: #eeeeee;

    .peotry-count {
      font-size: 14px;
      i {
        font-size: 20px;
        color: #a4c8ff;
        vertical-align: bottom;
      }
    }
    .rank-praise {
      cursor: pointer;
      margin-left: 8px;
      .el-icon-star-on {
        font-size: 15px;
        color: #e6a23c;
      }
      .el-icon-star-off {
        font-size: 15px;
      }
    }
  }

  .peot-name {
    padding-bottom: $padding-set;
    font-size: 14px;
    color: #888888;
    span {
      margin-left: 8px;
    }
  }

  .content-container {
    overflow: hidden;
    box-sizing: border-box;

    .content {
      font-size: $size-content;
      line-height: 26px;
      white-space: pre-wrap;
      word-break: break-all;
      box-sizing: border-box;
      padding-bottom: $padding-set;
    }
    .end {
      font-size: 12px;
      color: #333;
      padding-bottom: $padding-set;
    }
  }

  .content-expand {
    margin-bottom: 2rem;
    font-size: $size-content;

    span {
      cursor: pointer;
      color: rgb(112, 112, 112);
      font-size: 14px;
    }
  }

  .images {
    .image-wrapper {
      position: relative;
      display: inline-block;
      width: 30%;
      height: 0;
      padding-bottom: 30%;
      margin-right: 3%;
      margin-bottom: 3%;
    }
    .image-wrapper__inner {
      position: absolute;
      width: 100%;
      height: 100%;
      overflow: hidden;
      border-radius: 3px;
    }
    img {
      object-fit: cover;
      width: 100%;
      height: 100%;
    }
  }

  .peotry-more {
    margin: 5px 0;
    text-align: right;
    .peotry-more_icon {
      font-size: 20px;
      cursor: pointer;

      &:active {
        color: #148acf;
      }
    }
  }

  .comments {
    position: relative;
    margin: 0;
    padding: 5px 10px;
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 8px;

    .comments-divider {
      border-bottom: 1px solid white;
    }

    .praise-users {
      user-select: none;

      img {
        width: 30px;
        height: 30px;
        margin-right: 3px;
        cursor: pointer;
        object-fit: contain;

        &:hover {
          background-color: rgba(250, 250, 250, 0.8);
          border-radius: 3px;
        }
      }
    }

    &::before {
      content: "";
      width: 0;
      height: 0;
      position: absolute;
      left: 8px;
      top: -10px;
      border: solid 10px transparent;
      border-bottom-color: rgba(0, 0, 0, 0.1);
      border-top-width: 0;
    }

    .comment {
      padding: 5px 3px;

      .users {
        float: left;
        font-weight: bold;
        margin-right: 8px;

        .user {
          cursor: pointer;

          &:hover {
            color: #148acf;
          }
        }
      }

      .comment_to {
        padding: 0 5px;
        font-weight: initial;
        font-size: 0.9rem;
        color: #555555;
      }

      .comment_dot {
        font-weight: initial;
        font-size: 0.9rem;
        color: #555555;
      }

      p {
        white-space: pre-line;
        word-break: break-all;
        line-height: 21px;
      }
    }
  }

  .comment-input {
    text-align: right;
    margin-top: 5px;
    padding-right: 10px;

    .el-button {
      margin-top: 5px;
    }
  }

  .peotry-inline {
    display: inline-block;
  }
}

.peotry-peot-icon {
  padding-left: 38px;
}
</style>
