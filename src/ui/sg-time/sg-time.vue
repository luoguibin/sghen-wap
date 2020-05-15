<template>
  <div :class="{'sg-time': true, 'sg-time-actionend': !isTouching}">
    <!-- <div>currentTimeText</div> -->

    <div class="sg-flex">
      <div
        v-show="ymdVisible"
        class="sg-flex-two sg-time_year"
        @touchstart="onActionStart($event, 'year')"
      >
        <div
          ref="yearPanel"
          class="sg-time-panel"
          :style="{transform: `translate(0, ${marginTopMap.year})` }"
        >
          <div v-for="item in listMap.year" :key="item" class="sg-time-item">{{item}}</div>
        </div>
      </div>
      <span v-show="ymdVisible">-</span>
      <div
        v-show="ymdVisible"
        class="sg-flex-one sg-time_month"
        @touchstart="onActionStart($event, 'month')"
      >
        <div
          ref="monthPanel"
          class="sg-time-panel"
          :style="{transform: `translate(0, ${marginTopMap.month})` }"
        >
          <div v-for="item in listMap.month" :key="item" class="sg-time-item">{{item}}</div>
        </div>
      </div>
      <span v-show="ymdVisible">-</span>
      <div
        v-show="ymdVisible"
        class="sg-flex-one sg-time_date"
        @touchstart="onActionStart($event, 'date')"
      >
        <div
          ref="datePanel"
          class="sg-time-panel"
          :style="{transform: `translate(0, ${marginTopMap.date})` }"
        >
          <div v-for="item in listMap.date" :key="item" class="sg-time-item">{{item}}</div>
        </div>
      </div>

      <span v-show="ymdVisible && hmsVisible">&nbsp;&nbsp;</span>

      <div
        v-show="hmsVisible"
        class="sg-flex-one sg-time_hour"
        @touchstart="onActionStart($event, 'hour')"
      >
        <div
          ref="hourPanel"
          class="sg-time-panel"
          :style="{transform: `translate(0, ${marginTopMap.hour})` }"
        >
          <div v-for="item in listMap.hour" :key="item" class="sg-time-item">{{item}}</div>
        </div>
      </div>
      <span v-show="hmsVisible">:</span>
      <div
        v-show="hmsVisible"
        class="sg-flex-one sg-time_minute"
        @touchstart="onActionStart($event, 'minute')"
      >
        <div
          ref="minutePanel"
          class="sg-time-panel"
          :style="{transform: `translate(0, ${marginTopMap.minute})` }"
        >
          <div v-for="item in listMap.minute" :key="item" class="sg-time-item">{{item}}</div>
        </div>
      </div>
      <span v-show="hmsVisible">:</span>
      <div
        v-show="hmsVisible"
        class="sg-flex-one sg-time_second"
        @touchstart="onActionStart($event, 'second')"
      >
        <div
          ref="secondPanel"
          class="sg-time-panel"
          :style="{transform: `translate(0, ${marginTopMap.second})` }"
        >
          <div v-for="item in listMap.second" :key="item" class="sg-time-item">{{item}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SgTime',

  props: {
    ymdVisible: {
      type: Boolean,
      default: true
    },
    hmsVisible: {
      type: Boolean,
      default: true
    }
  },

  data () {
    return {
      currentTimeText: '请选择',

      listMap: {
        year: [],
        month: [],
        date: [],
        hour: [],
        minute: [],
        second: []
      },

      isTouching: false,

      marginTopMap: {
        year: 0,
        month: 0,
        date: 0,
        hour: 0,
        minute: 0,
        second: 0
      }
    }
  },

  mounted () {
    window.sgTime = this

    const time = new Date()
    this.initTime(time)
  },

  methods: {
    /**
     * @param {Date} time
     */
    initTime (time) {
      const listMap = this.listMap

      const year = time.getFullYear()
      const yearList = listMap.year
      for (let i = -100; i < 100; i++) {
        yearList.push(year + i)
      }

      const monthList = listMap.month
      for (let i = 1; i < 13; i++) {
        monthList.push(i)
      }

      const dateList = listMap.date
      for (let i = 1; i < 30; i++) {
        dateList.push(i)
      }
      this.resetDateList(year, time.getMonth() + 1)

      const hourList = listMap.hour
      for (let i = 0; i < 24; i++) {
        hourList.push(i)
      }

      const minuteList = listMap.minute
      const secondList = listMap.second
      for (let i = 0; i < 60; i++) {
        minuteList.push(i)
        secondList.push(i)
      }
      this.setTime(time)
    },
    resetDateList (year, month) {
      const days2 = this.isLeapYear(year) ? 29 : 28
      const daysArray = [31, days2, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
      const days = daysArray[month - 1]

      const dateList = this.listMap.date
      const val = days - dateList.length
      if (val > 0) {
        const lastValue = dateList[dateList.length - 1]
        for (let i = 1; i <= val; i++) {
          dateList.push(lastValue + i)
        }
      } else if (val < 0) {
        dateList.splice(days, -val)
      }
    },
    isLeapYear (year) {
      if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
        return true
      } else {
        return false
      }
    },

    onActionStart (e, key) {
      e.stopPropagation()
      e.preventDefault()
      if (!this.moveHandle) {
        this.moveHandle = e => {
          this.onActionMove(e)
        }
        this.endHandle = e => {
          this.onActionEnd(e)
        }
      }
      this.previouseY = e.touches[0].clientY
      this.currentKey = key

      this.$el.addEventListener('touchmove', this.moveHandle)
      this.$el.addEventListener('touchend', this.endHandle)
    },
    /**
     * @param {Event} e
     */
    onActionMove (e) {
      e.stopPropagation()
      e.preventDefault()
      this.isTouching = true
      const key = this.currentKey
      const clientY = e.touches[0].clientY
      let yVal = clientY - this.previouseY
      if (yVal > 20) {
        yVal = 20
      } else if (yVal < -20) {
        yVal = -20
      } else if (yVal < 0 && yVal > -2) {
        yVal = -2
      } else if (yVal > 0 && yVal < 2) {
        yVal = 2
      }
      const originY = parseInt(this.marginTopMap[key])
      let curVal = originY + yVal

      const panel = this.$refs[key + 'Panel']
      const itemHeight = panel.children[0].clientHeight
      const maxHeight =
        panel.clientHeight - panel.parentElement.clientHeight + itemHeight
      if (curVal < -maxHeight) {
        curVal = -maxHeight
      } else if (curVal > itemHeight) {
        curVal = itemHeight
      }

      this.marginTopMap[key] = curVal + 'px'
      this.previouseY = clientY
    },
    onActionEnd (e) {
      this.isTouching = false
      const key = this.currentKey
      const panel = this.$refs[key + 'Panel']
      const itemHeight = panel.children[0].clientHeight
      const originY = parseInt(this.marginTopMap[key])
      const curVal = itemHeight * Math.round(originY / itemHeight)
      this.marginTopMap[key] = curVal + 'px'

      this.$el.removeEventListener('touchmove', this.moveHandle)
      this.$el.removeEventListener('touchend', this.endHandle)

      if (key === 'year' || key === 'month') {
        const timeValues = this.getTimeValues()
        this.resetDateList(timeValues[0], timeValues[1])
        const val = timeValues[2] - this.listMap.date.length
        if (val > 0) {
          const originY = parseInt(this.marginTopMap.date)
          this.marginTopMap.date = originY + itemHeight * val + 'px'
        }
      }
      // console.log('onActionEnd', this.getTimeValues())
    },

    /**
     * @param {Date} time
     */
    setTime (time) {
      const timeMap = {
        year: time.getFullYear(),
        month: time.getMonth() + 1,
        date: time.getDate(),
        hour: time.getHours(),
        minute: time.getMinutes(),
        second: time.getSeconds()
      }
      this.$nextTick(() => {
        const object = this.marginTopMap
        const listMap = this.listMap
        for (const key in object) {
          const panel = this.$refs[key + 'Panel']
          const itemHeight = panel.children[0].clientHeight
          const list = listMap[key]
          const value = timeMap[key]
          const index = list.findIndex(v => v === value) - 1
          object[key] = -itemHeight * index + 'px'
        }
      })
    },
    getTimeValues () {
      const marginTopMap = this.marginTopMap
      const func = key => {
        const panel = this.$refs[key + 'Panel']
        const itemHeight = panel.children[0].clientHeight
        const originY = -parseInt(marginTopMap[key]) + itemHeight
        const index = Math.round(originY / itemHeight)
        return this.listMap[key][index]
      }
      const timeKeys = []
      if (this.ymdVisible) {
        timeKeys.push('year', 'month', 'date')
      }
      if (this.hmsVisible) {
        timeKeys.push('hour', 'minute', 'second')
      }
      return timeKeys.map(func)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../style/const.scss';

.sg-time {
  font-size: $size-option;
  overflow: hidden;
  box-sizing: border-box;
  border: 1px solid gray;
  .sg-flex {
    height: 6rem;
    overflow: hidden;
    align-items: center;
    > span {
      padding: 0 0.3rem;
    }
  }
  .sg-flex-one,
  .sg-flex-two {
    height: 100%;
    overflow: hidden;
  }
  .sg-time-item {
    padding: 0 0.3rem;
    color: $color-text;
    font-size: $size-text;
    line-height: $height-text;
  }

  .sg-flex {
    text-align: center;
  }

  .sg-time_year {
    overflow: hidden;
  }
}
.sg-time-actionend {
  .sg-time-panel {
    transition: transform 300ms;
  }
}
</style>
