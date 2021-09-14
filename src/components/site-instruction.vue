<template>
  <div class="site-instruction">
    <span :title="new Date()">{{authYear}}</span> /
    <span @click="onPageHome">Sghen三行</span> /
    <a href="http://beian.miit.gov.cn" target="_blank">粤ICP备19116971号</a>
    /
    <a
      href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=44010602007093"
      target="_blank"
    >
      粤公网安备 44010602007093号
      <img :src="beianSrc" />
    </a>
  </div>
</template>

<script>
export default {
  name: 'SiteInstruction',

  data () {
    return {
      authYear: '©2019-' + new Date().getFullYear(),
      beianSrc: require('@/assets/beian.png')
    }
  },

  methods: {
    onPageHome () {
      this.$router.push({ name: 'home' })
    }
  }
}
</script>

<style lang="scss" scoped>
.site-instruction {
  text-align: center;
  padding: 20px 0 10px 0;
  color: #c8c8c8;

  > * {
    display: inline-block;
  }

  span, a {
    color: #c8c8c8;
    cursor: pointer;

    img {
      vertical-align: sub;
    }
  }

  a:visited {
    color: inherit;
  }

  span,
  a {
    &:hover {
      color: #8d8d8d;
    }
  }
}
</style>
