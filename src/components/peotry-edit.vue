<template>
  <div class="peotry-edit">
    <sg-header>
      <span style="font-size: 1.6rem;">诗词{{peotry ? '编辑':'创建'}}</span>
    </sg-header>

    <div class="main">
      <div class="main-wrapper">

      </div>
    </div>
  </div>
</template>

<script>
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
    return {}
  },

  created () {
    window.peotryEdit = this
  }
}
</script>

<style lang="scss" scoped>
.peotry-edit {
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;
  overflow: hidden;

  .main {
    position: relative;
    flex: 1;
    height: 100%;
    overflow: hidden;
  }
  .main-wrapper {
    height: 100%;
    overflow-y: auto;
  }
}
</style>
