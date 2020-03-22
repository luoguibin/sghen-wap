<template>
  <div class="home">
    <sg-button @click="onConfirm">退出</sg-button>
  </div>
</template>

<script>
export default {
  name: 'Home',

  methods: {
    onConfirm () {
      this.$confirm({
        title: '提示',
        content: '退出后需要重新登录验证',
        confirm: () => {
          this.$router.go(-1)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.home {}
</style>
