<template>
  <div class="poetry-census">
    <sg-header :backVisible="false">
      <sg-button
        slot="left"
        type="text"
        :disabled="poetryInfo.year < 2000"
        @click="onPreviousYear"
        >上一年</sg-button
      >
      <span>诗词{{ poetryInfo.year }}年度</span>
      <sg-button
        slot="right"
        type="text"
        :disabled="poetryInfo.year >= nowYear"
        @click="onNextYear"
        >下一年</sg-button
      >
    </sg-header>

    <div class="census-body">
      <sg-scroll ref="scroll" :is-end="true" @refresh="handleRefresh">
        <section>
          <h3>创建数</h3>
          <div ref="ymEl0" class="ym-census"></div>
        </section>
        <section>
          <h3>点赞数</h3>
          <div ref="ymEl1" class="ym-census"></div>
        </section>
        <section>
          <h3>评论数</h3>
          <div ref="ymEl2" class="ym-census"></div>
        </section>
      </sg-scroll>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { calMax5 } from '@/utils/data'
import { apiURL, apiGetData } from '@/api'
echarts.use([CanvasRenderer, LineChart, GridComponent, TooltipComponent])

const mapResp = function (resp) {
  let list = resp.data
  for (let i = 0; i < 12; i++) {
    const item = list[i]
    const month = i + 1
    if (!item || item.month !== month) {
      list.splice(i, 0, {
        month,
        sum: 0
      })
    }
  }

  list = list.map((o) => {
    return {
      name: `${o.month}月`,
      value: +o.sum
    }
  })
  return list
}
const getYearParams = function (year) {
  return {
    startYear: `${year - 1}-01-01 00:00:00`,
    endYear: `${year}-01-01 00:00:00`
  }
}

export default {
  name: 'PoetryCensus',

  data () {
    return {
      nowYear: new Date().getFullYear(),
      poetryInfo: {
        year: new Date().getFullYear(),
        list: []
      },
      praiseInfo: {
        year: new Date().getFullYear(),
        list: []
      },
      commentInfo: {
        year: new Date().getFullYear(),
        list: []
      }
    }
  },

  created () {
    window.poetryCensus = this
    this.getYmInfos()
  },

  methods: {
    onPreviousYear () {
      this.poetryInfo.year--
      this.praiseInfo.year = this.poetryInfo.year
      this.commentInfo.year = this.praiseInfo.year
      this.getYmInfos()
    },
    onNextYear () {
      this.poetryInfo.year++
      this.praiseInfo.year = this.poetryInfo.year
      this.commentInfo.year = this.praiseInfo.year
      this.getYmInfos()
    },
    getYmInfos () {
      this.handlePoetryYearChange()
      this.handlePraiseYearChange()
      this.handleCommentYearChange()
    },
    handlePoetryYearChange () {
      const chart = this.poetryYmChart
      chart && chart.showLoading({ text: '加载中...' })
      apiGetData(apiURL.censusPoetryYM, getYearParams(this.poetryInfo.year))
        .then((resp) => {
          this.poetryInfo.list = mapResp(resp)
          this.initPoetryYmChart()
        })
        .finally(() => {
          chart && chart.hideLoading()
        })
    },
    handlePraiseYearChange () {
      const chart = this.praiseYmChart
      chart && chart.showLoading({ text: '加载中...' })
      apiGetData(apiURL.censusPraiseYM, getYearParams(this.praiseInfo.year))
        .then((resp) => {
          this.praiseInfo.list = mapResp(resp)
          this.initPraiseYmChart()
        })
        .finally(() => {
          chart && chart.hideLoading()
        })
    },
    handleCommentYearChange () {
      const chart = this.commentYmChart
      chart && chart.showLoading({ text: '加载中...' })
      apiGetData(apiURL.censusCommentYM, getYearParams(this.commentInfo.year))
        .then((resp) => {
          this.commentInfo.list = mapResp(resp)
          this.initCommentYmChart()
        })
        .finally(() => {
          chart && chart.hideLoading()
        })
    },

    initPoetryYmChart () {
      const { list } = this.poetryInfo
      if (!this.poetryYmChart) {
        const chart = echarts.init(this.$refs.ymEl0)
        chart.setOption({
          tooltip: {
            show: true,
            formatter: (o) => {
              const { name, value } = o.data
              return (
                name + ':<span style="padding: 0 3px;">' + value + '首</span>'
              )
            }
          },
          grid: {
            containLabel: true,
            top: 16,
            left: 16,
            right: 16,
            bottom: 16
          },
          xAxis: {
            type: 'category',
            data: list.map((o) => o.name)
          },
          yAxis: {
            type: 'value',
            minInterval: 1,
            splitNumber: 5
          },
          series: [
            {
              type: 'line',
              data: []
            }
          ]
        })
        this.poetryYmChart = chart
      }
      this.poetryYmChart.setOption({
        series: [{ data: list }],
        yAxis: { max: calMax5(list) }
      })
    },
    initPraiseYmChart () {
      const { list } = this.praiseInfo
      if (!this.praiseYmChart) {
        const chart = echarts.init(this.$refs.ymEl1)
        chart.setOption({
          tooltip: {
            show: true,
            formatter: (o) => {
              const { name, value } = o.data
              return (
                name + ':<span style="padding: 0 3px;">' + value + '次</span>'
              )
            }
          },
          grid: {
            containLabel: true,
            top: 16,
            left: 16,
            right: 16,
            bottom: 16
          },
          xAxis: {
            type: 'category',
            data: list.map((o) => o.name)
          },
          yAxis: {
            type: 'value',
            minInterval: 1,
            splitNumber: 5
          },
          series: [
            {
              type: 'line',
              data: []
            }
          ]
        })
        this.praiseYmChart = chart
      }
      this.praiseYmChart.setOption({
        series: [{ data: list }],
        yAxis: { max: calMax5(list) }
      })
    },
    initCommentYmChart () {
      const { list } = this.commentInfo
      if (!this.commentYmChart) {
        const chart = echarts.init(this.$refs.ymEl2)
        chart.setOption({
          tooltip: {
            show: true,
            formatter: (o) => {
              const { name, value } = o.data
              return (
                name + ':<span style="padding: 0 3px;">' + value + '次</span>'
              )
            }
          },
          grid: {
            containLabel: true,
            top: 16,
            left: 16,
            right: 16,
            bottom: 16
          },
          xAxis: {
            type: 'category',
            data: list.map((o) => o.name)
          },
          yAxis: {
            type: 'value',
            minInterval: 1,
            splitNumber: 5
          },
          series: [
            {
              type: 'line',
              data: []
            }
          ]
        })
        this.commentYmChart = chart
      }
      this.commentYmChart.setOption({
        series: [{ data: list }],
        yAxis: { max: calMax5(list) }
      })
    },

    handleRefresh () {
      this.$refs.scroll.success()
    }
  }
}
</script>

<style lang="scss" scoped>
.poetry-census {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.year-choice {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 2rem;

  span {
    flex: 1;
    text-align: center;
  }
}

.census-body {
  flex: 1;
  overflow: hidden;
}

section {
  padding: 0 1rem;

  h3 {
    margin: 0;
  }

  .ym-census {
    height: 20rem;
    box-sizing: border-box;
  }
}
section + section {
  margin-top: 5rem;
}
</style>
