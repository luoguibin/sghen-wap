<template>
  <div class="peotry-images">
    <p>诗词美图列表</p>
  </div>
</template>

<script>
export default {
  name: 'PeotryImages',

  created () {
    window.peotryImages = this
  },

  methods: {
    onGoPeotry (index) {
      this.$router.push({
        name: 'peotry-detail',
        params: { id: this.lastestImages[index].id }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.peotry-images {
  height: 100%;
}
</style>
