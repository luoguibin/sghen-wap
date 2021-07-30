<template>
  <div class="page-invalid">
    <div v-if="invalidType === 'updating'">
      <p>系统正在升级...</p>
      <p>预计2021-08-01正常服务</p>
    </div>
    <div v-else>页面丢失....</div>
  </div>
</template>

<script>
export default {
  name: 'PageInvalid',

  data () {
    return {
      invalidType: ''
    }
  },

  created () {
    window.pageInvalid = this
    this.invalidType = this.$route.params.invalidType
  }
}
</script>

<style lang="scss" scoped>
.page-invalid {
  height: 100%;
  padding: 2em 1em;
  box-sizing: border-box;
  text-align: center;
}
</style>
