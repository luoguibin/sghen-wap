<template>
  <div class="peotry-list">
    <sg-scroll ref="sgScroll" :isEnd="isEnd" @load="handleLoad" @refresh="handleRefresh"></sg-scroll>
  </div>
</template>

<script>
export default {
  data () {
    return {
      isEnd: false
    }
  },

  methods: {
    handleLoad () {},
    handleRefresh () {
      // this.$refs.sgScroll.reset()
    }
  }
}
</script>

<style>
</style>
