<template>
  <div class="peotry-sets sg-flex-column">
    <sg-header @back="$emit('back')" :centerStatus="''" :backVisible="false">
      <span slot="left">{{userID ? '我的' : '公开'}}选集（{{sets.length ? sets.length : '?'}}）</span>
      <span class="iconfont icon-increase" slot="right" @click="onNewSet"></span>
    </sg-header>
    <!-- 选集列表 -->
    <div class="sg-flex-one" style="overflow: hidden;">
      <div class="scroll" sg-scroll="vertical_stop">
        <div class="wrapper">
          <div
            v-for="item in sets"
            :key="item.id"
            @click="onClickSet(item)"
            :class="{'set-item': true,  'sg-flex': true, 'set-item__selected': currentId === item.id}"
          >
            <span class="choice"></span>
            <div class="sg-flex-one sg-text-ellipsis">{{item.name}}</div>
            <span v-show="item.isOwn" class="iconfont icon-delete" @click.stop="onDeleteSet(item)"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { apiURL, apiGetData, apiPostData } from '@/api'

export default {
  name: 'PeotrySets',

  props: {
    defId: {
      type: [Number, String],
      default: 0
    }
  },

  data () {
    return {
      currentId: 0,
      sets: []
    }
  },

  computed: {
    ...mapState({
      userID: state => state.auth.userID
    })
  },

  created () {
    window.peotrySets = this
    this.currentId = this.defId
    this.getPeotSets()
  },

  methods: {
    getPeotSets (selectLast) {
      apiGetData(apiURL.peotSets, { userId: this.userID }).then(resp => {
        const selfId = this.userID
        const systemSets = []
        const selfSets = []
        resp.data.forEach(o => {
          o.isOwn = o.userId === selfId
          if (o.isOwn) {
            selfSets.push(o)
          } else {
            systemSets.push(o)
          }
        })
        const timeSortFunc = function (o0, o1) {
          const time0 = new Date(o0.timeCreate).getTime()
          const time1 = new Date(o1.timeCreate).getTime()
          return time0 >= time1 ? -1 : 1
        }
        this.sets = [...systemSets.sort(timeSortFunc), ...selfSets.sort(timeSortFunc)]
        if (selectLast) {
          this.onClickSet(selfSets[0])
        }
      })
    },

    onDeleteSet ({ id }) {
      this.$confirm({
        title: '提示',
        content: '是否删除该选集',
        confirm: () => {
          apiPostData(apiURL.peotSetDelete, { id }).then(resp => {
            const index = this.sets.findIndex(o => o.id === id)
            this.sets.splice(index, 1)
          })
        }
      })
    },

    onClickSet ({ id, name }) {
      this.setSelectedSet(id)
      this.$emit('select', { id, name })
    },

    setSelectedSet (id) {
      this.currentId = id
    },

    onNewSet () {
      if (!this.userID) {
        this.$toastLogin()
        return
      }
      this.$confirm({
        title: '创建选集',
        type: 'input',
        placeholder: '请输入选集名',
        validator: v => {
          if (!v) {
            this.$toast('请输入选集名')
            return '请输入选集名'
          }
          if (v.length > 16) {
            this.$toast('选集名长度不能超过16个字符')
            return '选集名长度不能超过16个字符'
          }
          const o = this.sets.find(o => o.name === v)
          if (o) {
            this.$toast('选集名重复')
            return '选集名重复'
          }
          return ''
        },
        confirm: v => {
          apiPostData(apiURL.peotSetCreate, { name: v }).then(resp => {
            this.getPeotSets(true)
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/ui/style/const.scss";

$set-item-height: $height-text * 2;
$set-item-size: $size-text * 1.2;
.peotry-sets {
  background-color: $color-bg;
  .wrapper {
    padding: $padding-normal;
  }
  .scroll {
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
  }
  .set-item {
    height: $set-item-height;
    line-height: $set-item-height;
    padding: 0 $padding-big;
    margin-bottom: 2rem;
    font-size: $set-item-size;
    color: $color-text;
    background-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  }
  .sg-flex {
    align-items: center;
  }
  .icon-delete {
    margin-left: 1rem;
    font-size: $set-item-size * 1.5;
  }
  .choice {
    position: relative;
    display: inline-block;
    width: 12px;
    height: 12px;
    margin-right: 1rem;
    border-radius: 50%;
    border: 2px solid $color-theme-disabled;
  }
  .set-item__selected {
    color: $color-theme;
    .choice {
      border-color: $color-theme;
      &::before {
        content: "";
        position: absolute;
        left: 2px;
        top: 2px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: $color-theme;
      }
    }
  }
}
</style>
