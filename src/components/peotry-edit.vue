<template>
  <div class="dialog-mask">
    <div class="dialog-wrapper">
      <div class="peotry-edit">
        <sg-header @back="$emit('close')" :autoBack="false">
          <span style="font-size: 1.6rem;">诗词{{peotry ? '编辑':'创建'}}</span>
        </sg-header>

        <div class="main">
          <div class="main-wrapper">
            <div class="peotry-item set">
              <label>选集:</label>
              <sg-dropdown :options="setOptions" @change="handleDropdown">
              </sg-dropdown>
              <span class="iconfont icon-increase" @click="onNewSet"></span>
            </div>

            <div class="peotry-item title">
              <label>标题:</label>
              <input v-model="tempPoetry.title" />
            </div>

            <div class="peotry-item content">
              <label>内容:</label>
              <textarea v-model="tempPoetry.content"></textarea>
            </div>

            <div class="peotry-item end">
              <label>尾注:</label>
              <textarea v-model="tempPoetry.end"></textarea>
            </div>

            <sg-button type="primary">{{peotry ? '编辑':'创建'}}</sg-button>
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
  name: 'PeotryEdit',

  props: {
    peotry: {
      type: Object,
      default () {
        return null
      }
    }
  },

  data () {
    return {
      tempPoetry: {
        id: null,
        setId: null,
        title: '',
        content: '',
        end: ''
      },

      setOptions: [
      ]
    }
  },

  computed: {
    ...mapState({
      userID: state => state.auth.userID
    })
  },

  created () {
    window.peotryEdit = this
    this.$toast('正在码...')
    this.getPeotSets()
  },

  methods: {
    getPeotSets () {
      apiGetData(apiURL.peotSets, { userId: this.userID }).then(resp => {
        this.setOptions = resp.data.map(o => {
          return {
            label: o.name,
            value: o.id
          }
        })
      })
    },
    handleDropdown (key) {
      this.tempPoetry.setId = key
    },
    onNewSet () {}
  }
}
</script>

<style lang="scss" scoped>
.dialog-mask {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  .dialog-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
}
.peotry-edit {
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;
  overflow: hidden;
  background-color: white;

  .main {
    position: relative;
    flex: 1;
    height: 100%;
    overflow: hidden;
  }
  .main-wrapper {
    height: 100%;
    padding: 1rem;
    overflow-y: auto;
  }

  input,
  textarea {
    display: block;
    width: 100%;
    padding: 0.3rem 0.5rem;
    font-size: 1.2rem;
    line-height: 1.4rem;
    border: 1px solid #ccc;
    outline: none;
    box-sizing: border-box;
    background-color: transparent;
  }

  .sg-dropdown {
    padding: 0 0.5rem;
    min-width: 5rem;
    border: 1px solid #ccc;
  }

  .peotry-item {
    position: relative;
    display: flex;
    flex-direction: row;
    margin-bottom: 1rem;

    label {
      display: inline-block;
      width: 5rem;
      padding: 0 5px;
      box-sizing: border-box;
    }
  }
}
</style>
