<template>
  <div class="sg-time">
    <div>currentTimeText</div>

    <div class="sg-flex">
      <div class="sg-flex-two sg-time_year">
        <div class="sg-time-item"></div>
        <div v-for="item in yearList" :key="item" class="sg-time-item">{{item}}</div>
        <div class="sg-time-item"></div>
      </div>
      <span>-</span>
      <div class="sg-flex-one sg-time_month">
        04
      </div>
      <span>-</span>
      <div class="sg-flex-one sg-time_month">
        03
      </div>
      <span>&nbsp;&nbsp;</span>
      <div class="sg-flex-one sg-time_hour">
        17
      </div>
      <span>:</span>
      <div class="sg-flex-one sg-time_minute">
        44
      </div>
      <span>:</span>
      <div class="sg-flex-one sg-time_second">
        50
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SgTime',

  props: {

  },

  data () {
    return {
      currentTimeText: '请选择',
      yearList: ['2020', '2021', '2022']
    }
  },

  created () {
    window.sgTime = this
  }
}
</script>

<style lang="scss" scoped>
.sg-time {
  font-size: 1.4rem;
  height: 5.4rem;
  .sg-flex {
    height: 100%;
    overflow: hidden;
    align-items: center;
  }
  .sg-flex-one, .sg-flex-two {
    height: 100%;
    overflow: hidden;
  }
  .sg-time-item {
    height: 1.6rem;
  }

  .sg-flex {
    text-align: center;
  }

  .sg-time_year {
    overflow: hidden;
  }
}
</style>
