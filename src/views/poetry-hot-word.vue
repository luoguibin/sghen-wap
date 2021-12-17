<template>
  <div class="poetry-hot-word">
    <div ref="container" class="container"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts/core'
import { TooltipComponent } from 'echarts/components'
import 'echarts-wordcloud'
import { apiURL, apiGetData } from '@/api'
echarts.use([TooltipComponent])

const COLORS = [
  '#4897c5',
  '#45A3FF',
  '#8DD1EC',
  '#51CDCC',
  '#8AE0BE',
  '#57CD74',
  '#B0DF87',
  '#B0DF87',
  '#EAA779',
  '#F1667F',
  '#DD82D5',
  '#72A1F9',
  '#9661E7',
  '#5157D0',
  '#8A90EB',
  '#8A90EB',
  '#8DCAFF',
  '#3E86FF',
  '#65ACF9',
  '#1C60D4'
]

export default {
  data () {
    return {
      words: [],
      isWordsErr: false
    }
  },

  mounted () {
    window.poetryWordcloud = this
    this.initChart()
    this.getWords()
  },

  methods: {
    initChart () {
      this.chart = echarts.init(this.$refs.container)
      this.chart.setOption({
        tooltip: {
          show: true,
          formatter: (o) => {
            return (
              '词频率<span style="padding: 0 3px;">' + o.data.rate + '</span>'
            )
          }
        },
        series: [
          {
            type: 'wordCloud',
            shape: 'star',
            left: 'center',
            top: 'center',
            width: '95%',
            height: '95%',
            right: null,
            bottom: null,
            sizeRange: [18, 60],
            rotationRange: [-45, 45],
            rotationStep: 45,
            gridSize: 8,
            drawOutOfBound: false,
            textStyle: {
              fontFamily: 'sans-serif',
              fontWeight: 'bold',
              color: function ({ dataIndex }) {
                return COLORS[dataIndex % COLORS.length]
              }
            },
            emphasis: {
              focus: 'self',
              textStyle: {
                shadowBlur: 10,
                shadowColor: '#333'
              }
            },
            data: []
          }
        ]
      })
      this.chart.on('click', (params) => {
        this.$router.push({
          name: 'poetry-list',
          query: {
            keyword: params.data.name
          }
        })
      })
    },
    getWords () {
      const date = new Date()
      date.setTime(date.getTime() - 24 * 60 * 60 * 1000)
      let toDay = date.getFullYear()
      toDay += '-' + (date.getMonth() + 1)
      toDay += '-' + date.getDate() + ' 00:00:00'

      apiGetData(apiURL.poetryHotWord, { toDay }).then((data) => {
        const list = data.data || []
        const words = list.map((o) => {
          return {
            name: o.word,
            value: +o.frequency,
            rate: 0
          }
        })
        // 计算词频率
        let total = 0
        words.forEach((o) => {
          total += o.value
        })
        words.forEach((o) => {
          o.rate = Number(o.value / total).toFixed(2)
        })
        this.words = words
        this.$emit('loaded', words.length)
        this.$nextTick(() => {
          this.chart.setOption({
            series: [{ data: this.words }]
          })
          this.chart.resize()
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.poetry-hot-word {
  .container {
    width: 348px;
    height: 348px;
    margin: 0 auto;
  }
}
</style>
