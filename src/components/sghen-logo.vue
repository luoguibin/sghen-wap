<template>
  <div class="sghen-logo">
    <svg
      class="letters letters--effect-1"
      viewBox="0 0 500 100"
      width="500"
      height="100"
      @click="onRobotPoetry"
    >
      <g v-for="(p, i) in pathItems" :key="i" class="letter letter-s">
        <g class="letter-part">
          <path class="letter-layer color-bg" :d="p" />
          <path class="letter-layer color-fg" :d="p" />
        </g>
      </g>
    </svg>

    <!-- 机器作诗词 -->
    <div class="sg-mask sys-type-mask" v-if="typeVisible">
      <div class="sg-flex-column">
        <sg-header @back="typeVisible = false">
          <template>机器作诗词</template>
          <sg-button type="text" slot="right" @click="onConfirm"
            >确定</sg-button
          >
        </sg-header>
        <div class="sg-flex-one">
          <sg-form
            ref="form"
            :formData="formData"
            :formRules="formRules"
            sg-scroll="vertical_stop"
          >
            <div slot="key">
              <sg-dropdown
                :options="poetryTypes"
                @change="handleTypeChange"
                :initValue="formData.key"
                :optionType="'fullwidth'"
                :pointerVisible="false"
                :optionActive="true"
              ></sg-dropdown>
            </div>

            <div slot="yan">
              <sg-dropdown
                ref="yanDropdown"
                :options="poetryYans"
                @change="handleYanChange"
                :initValue="formData.yan"
                :optionType="'fullwidth'"
                :pointerVisible="false"
                :optionActive="true"
              ></sg-dropdown>
            </div>

            <div v-show="poetStyles.length" slot="style">
              <sg-dropdown
                ref="styleDropdown"
                :options="poetStyles"
                @change="handleStyleChange"
                :initValue="formData.style"
                :optionType="'fullwidth'"
                :pointerVisible="false"
                :optionActive="true"
              ></sg-dropdown>
            </div>
          </sg-form>
          <div class="keyword-tip">输入要求：{{ keyWordTip }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { apiURL, apiPostData } from '@/api'
import anime from 'animejs'

/**
 * Sghen三行
 */
export default {
  name: 'SghenLogo',

  data () {
    const yans = [
      { label: '五言', value: '5' },
      { label: '七言', value: '7' }
    ]

    return {
      pathItems: Object.freeze([
        'M57.07 79.9Q51.31 79.9 45.91 79.18Q40.6 78.37 37.72 77.47L39.16 70.09Q42.31 71.17 47.17 72.07Q52.03 72.88 57.61 72.88Q62.2 72.88 65.71 71.89Q69.31 70.9 71.29 68.2Q73.27 65.5 73.27 60.46Q73.27 57.49 72.1 55.69Q70.93 53.89 68.14 52.45Q65.44 51.01 60.76 49.3Q55.63 47.41 52.48 45.7Q49.33 43.9 47.89 41.47Q46.54 38.95 46.54 35.17Q46.54 27.79 49.42 23.56Q52.3 19.33 57.52 17.53Q62.83 15.64 69.76 15.64Q74.35 15.64 78.76 16.36Q83.17 16.99 85.42 17.89L83.98 25.09Q81.46 24.1 77.41 23.38Q73.45 22.57 69.22 22.57Q64.72 22.57 61.39 23.47Q58.06 24.37 56.26 26.8Q54.46 29.14 54.46 33.73Q54.46 36.16 55.45 37.69Q56.44 39.13 58.87 40.39Q61.3 41.56 65.71 43.18Q71.29 45.25 74.71 47.23Q78.13 49.21 79.66 52.09Q81.28 54.88 81.28 59.56Q81.28 70.09 75.25 75.04Q69.31 79.9 57.07 79.9Z',
        'M103.15 97Q99.91 97 96.49 96.64Q93.16 96.28 91 95.83L92.17 89.08Q94.78 89.71 97.39 90.07Q100.09 90.43 103.24 90.43Q109.54 90.43 112.96 88.54Q116.47 86.56 118.27 82.78Q120.07 78.91 121.33 73.24L122.95 66.04L122.41 66.04Q121.15 69.37 118.81 72.52Q116.56 75.67 113.41 77.74Q110.26 79.81 106.12 79.81Q99.37 79.81 95.32 75.94Q91.36 71.98 91.36 63.52Q91.36 57.31 92.98 51.28Q94.69 45.25 98.02 40.3Q101.44 35.35 106.57 32.47Q111.7 29.5 118.54 29.5Q122.77 29.5 125.83 30.76Q128.98 32.02 131.05 33.91Q133.12 35.8 134.11 37.69L134.83 39.04L128.35 73.96Q127.45 79 125.83 83.23Q124.21 87.46 121.42 90.52Q118.72 93.58 114.22 95.29Q109.81 97 103.15 97Z',
        'M106.84 73.42Q110.35 73.42 113.41 70.9Q116.47 68.29 118.9 64.33Q121.42 60.28 123.13 55.87Q124.84 51.37 125.74 47.5Q126.73 43.63 126.73 41.47Q126.55 40.39 125.65 39.13Q124.84 37.78 122.95 36.88Q121.06 35.89 117.55 35.89Q113.14 35.89 109.72 38.23Q106.3 40.57 103.96 44.44Q101.62 48.31 100.36 53.08Q99.19 57.85 99.19 62.71Q99.19 67.39 100.81 70.45Q102.52 73.42 106.84 73.42Z',
        'M171.91 29.5Q178.21 29.5 181.54 32.83Q184.87 36.16 184.87 41.56Q184.87 42.64 184.69 44.17Q184.51 45.7 184.24 46.96L178.03 79L170.29 79L176.05 49.39Q176.32 48.13 176.59 46.15Q176.95 44.17 176.95 43.09Q176.95 39.76 175.24 37.87Q173.53 35.89 169.57 35.89Q165.16 35.89 161.38 38.41Q157.69 40.93 155.62 45.61L149.14 79L141.4 79L154.63 10.6L162.37 10.6L157.15 37.42Q161.83 29.5 171.91 29.5Z',
        'M234.37 40.48Q234.37 49.66 226 54.16Q217.63 58.57 201.7 60.46L201.7 61.54Q201.7 68.11 205.12 70.81Q208.54 73.42 214.3 73.42Q216.55 73.42 219.16 72.97Q221.77 72.43 224.11 71.62Q226.45 70.72 227.89 69.73L226.9 76.48Q224.83 77.83 220.87 78.91Q217 79.9 213.13 79.9Q207.82 79.9 203.5 78.19Q199.18 76.39 196.57 72.52Q194.05 68.65 194.05 62.08Q194.05 55.42 196.12 49.57Q198.28 43.63 201.97 39.13Q205.66 34.63 210.52 32.11Q215.47 29.5 221.05 29.5Q226.63 29.5 230.5 32.02Q234.37 34.54 234.37 40.48Z',
        'M220.69 35.89Q214.21 35.89 209.17 40.75Q204.22 45.61 202.42 53.98Q212.05 53.08 217.45 51.19Q222.85 49.21 225.01 46.6Q227.26 43.99 227.26 41.02Q227.26 38.32 225.28 37.15Q223.39 35.89 220.69 35.89Z',
        'M268.75 29.5Q275.05 29.5 278.38 32.83Q281.71 36.16 281.71 41.56Q281.71 42.64 281.53 44.17Q281.35 45.7 281.08 46.96L274.87 79L267.13 79L272.89 49.39Q273.16 48.13 273.43 46.15Q273.79 44.17 273.79 43.09Q273.79 39.76 272.08 37.87Q270.37 35.89 266.41 35.89Q262 35.89 258.22 38.41Q254.44 40.84 252.46 45.52L245.98 79L238.24 79L247.6 30.4L255.34 30.4L253.99 37.42Q256.06 33.46 259.84 31.48Q263.71 29.5 268.75 29.5Z',
        'M297.91 19.06L297.91 12.4L365.41 12.4L365.41 19.06L297.91 19.06Z',
        'M303.67 48.31L303.67 41.56L358.39 41.56L358.39 48.31L303.67 48.31Z',
        'M292.78 79.36L292.78 72.61L370.27 72.61L370.27 79.36L292.78 79.36Z',
        'M415.72 9.16L459.64 9.16L459.64 15.46L415.72 15.46L415.72 9.16Z',
        'M400.69 3.67L407.08 6.19Q404.2 10.15 400.33 14.2Q396.46 18.25 392.23 21.94Q388.09 25.63 384.04 28.51Q383.32 27.43 382.15 25.81Q380.98 24.1 380.08 23.2Q383.86 20.68 387.73 17.35Q391.6 14.02 395.02 10.42Q398.44 6.82 400.69 3.67Z',
        'M404.38 22.84L410.59 25.18Q408.52 28.6 406 32.02Q403.48 35.44 400.69 38.77L400.69 86.11L394.03 86.11L394.03 46.15Q391.51 48.76 388.9 51.19Q386.38 53.53 383.86 55.51Q383.14 54.52 381.61 52.72Q380.17 50.92 379.18 49.93Q383.86 46.6 388.45 42.28Q393.04 37.87 397.18 32.92Q401.32 27.88 404.38 22.84Z',
        'M411.85 33.73L462.25 33.73L462.25 40.12L448.66 40.12L448.66 77.29Q448.66 80.35 447.76 82.06Q446.95 83.77 444.7 84.58Q442.45 85.3 438.4 85.48Q434.44 85.57 427.78 85.57Q427.6 84.22 426.97 82.42Q426.34 80.53 425.62 79.09Q430.39 79.18 434.35 79.27Q438.4 79.27 439.66 79.18Q440.92 79.09 441.37 78.73Q441.91 78.37 441.91 77.2L441.91 40.12L411.85 40.12L411.85 33.73Z'
      ]),

      typeVisible: false,
      formData: {
        keyWords: '',
        key: '',
        yan: '',
        style: ''
      },
      formRules: [
        {
          key: 'key',
          label: '类型',
          required: true,
          hasValue: true,
          slot: true,
          _error: ''
        },
        {
          key: 'yan',
          label: '言数',
          required: true,
          hasValue: true,
          slot: true,
          _error: ''
        },
        {
          key: 'style',
          label: '情感',
          hidden: false,
          required: false,
          hasValue: true,
          slot: true,
          _error: ''
        },
        {
          key: 'keyWords',
          label: '关键词',
          required: true,
          _error: '',
          validator: (v = '', rule) => {
            return v.length ? '' : '请输入' + rule.label
          }
        }
      ],
      poetryTypes: [
        { label: '绝句', value: 'jueju', genre: 1, yans },
        {
          label: '风格绝句',
          value: 'fengge',
          genre: 4,
          yans,
          userStyles: [
            '萧瑟凄凉',
            '忆旧感喟',
            '孤寂惆怅',
            '思乡忧老',
            '渺远孤逸'
          ].map((v) => {
            return { label: v, value: v }
          })
        },
        {
          label: '藏头诗',
          value: 'cangtou',
          genre: 2,
          yans,
          userStyles: ['悲伤', '较悲伤', '中性', '较喜悦', '喜悦'].map((v) => {
            return { label: v, value: v }
          }),
          isInputValid: function (v) {
            return v && v.length > 0 && v.length <= 5
          },
          tip: '请输入1~4个字'
        },
        {
          label: '律诗',
          value: 'lvshi',
          genre: 7,
          yans
        },
        {
          label: '集句诗',
          value: 'jiju',
          genre: 5,
          yans: yans.filter((o) => o.value === '5'),
          isInputValid: function (v) {
            return v && (v.length === 5 || v.length === 7)
          },
          tip: '请输入一句五字句或者七字句'
        },
        {
          label: '词',
          value: 'ci',
          genre: 3,
          yans: [{ label: '默认', value: '0' }],
          userStyles: [
            '归字谣',
            '如梦令',
            '梧桐影',
            '渔歌子',
            '捣练子',
            '忆江南',
            '秋风清',
            '忆王孙',
            '河满子',
            '思帝乡',
            '望江怨',
            '醉吟商',
            '卜算子',
            '点绛唇',
            '乌夜啼',
            '江亭怨',
            '踏莎行',
            '画堂春',
            '浣溪沙',
            '武陵春',
            '采桑子',
            '城头月',
            '玉楼春',
            '海棠春',
            '苏幕遮',
            '蝶恋花',
            '江城子',
            '八声甘州',
            '声声慢',
            '水龙吟',
            '满江红',
            '沁园春'
          ].map((v) => {
            return { label: v, value: v }
          })
        }
      ],
      poetryYans: [],
      poetStyles: [],
      keyWordTip: ''
    }
  },

  mounted () {
    window.sghenLogo = this

    this.bounceIn = anime({
      targets: '.letter-part',
      translateY: {
        value: [-30, 0],
        duration: 900,
        elasticity: 600,
        easing: 'easeOutElastic'
      },
      opacity: {
        value: [0, 1],
        duration: 300,
        easing: 'linear'
      },
      delay: function (el, i) {
        return i * 50
      }
    })
    this.lineDrawing = anime({
      targets: '.color-fg',
      strokeDashoffset: [anime.setDashoffset, 0],
      easing: 'easeOutElastic',
      duration: 4000,
      delay: function (el, i) {
        return i * 300
      },
      loop: true,
      direction: 'alternate'
    })
  },

  computed: {
    ...mapGetters({
      isLogin: 'auth/isLogin'
    })
  },

  methods: {
    handleTypeChange (v) {
      this.formData.key = v
      const typeObj = this.poetryTypes.find((o) => o.value === v)

      this.poetryYans = typeObj.yans
      this.$refs.yanDropdown &&
        this.$refs.yanDropdown.setSelectOption(typeObj.yans[0])
      this.formData.yan = typeObj.yans[0].value

      this.poetStyles = typeObj.userStyles || []
      const hasStyle = !!this.poetStyles.length
      if (hasStyle) {
        this.$refs.yanDropdown &&
          this.$refs.styleDropdown.setSelectOption(this.poetStyles[0])
        this.formData.style = this.poetStyles[0].value
      } else {
        this.formData.style = ''
      }
      const styleRule = this.formRules.find((o) => o.key === 'style')
      styleRule.hidden = !hasStyle

      this.keyWordTip = typeObj.tip || '请输入句子、段落或关键词，以空格隔开'
    },
    handleYanChange (v) {
      this.formData.yan = v
    },
    handleStyleChange (v) {
      this.formData.style = v
    },
    onConfirm () {
      this.$refs.form.validate((error) => {
        if (error) {
          return
        }
        const fData = this.formData
        const typeObj = this.poetryTypes.find((o) => o.value === fData.key)
        if (typeObj.isInputValid && !typeObj.isInputValid(fData.keyWords)) {
          this.$toast('关键词长度或格式不正确')
          return
        }

        if (this.loading) {
          return
        }
        this.loading = true

        const params = {}
        for (const key in fData) {
          if (Object.hasOwnProperty.call(fData, key) && fData[key]) {
            params[key] = fData[key]
          }
        }
        apiPostData(apiURL.servicesUrl, {
          serviceName: 'poetry',
          type: 'auto-create-poetry',
          ...params
        })
          .then(() => {
            this.typeVisible = false
            this.$toast('需自行在一段时间后刷新列表，查看是否创建成功')
          })
          .finally(() => {
            this.loading = false
          })
      })
    },
    onRobotPoetry () {
      if (!this.isLogin) {
        return
      }
      const nowTime = Date.now()
      if (!this.robotTime) {
        this.robotTime = nowTime
        return
      }
      if (nowTime - this.robotTime < 300) {
        this.handleTypeChange(this.poetryTypes[0].value)
        this.typeVisible = true
      }
      this.robotTime = nowTime
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/ui/style/const.scss";

.sghen-logo,
svg {
  width: 100%;
  height: 100%;
}

svg {
  // background-color: black;
  .color-bg {
    stroke: $color-border;
    stroke-width: 8px;
  }

  .color-fg {
    stroke: $color-theme;
    transform: translate3d(2px, 2px, 0);
    stroke-width: 8px;
  }

  .letters {
    position: relative;
    stroke-miterlimit: 2;
    fill: transparent;
  }

  .letter-layer {
    fill: transparent;
  }
}

.sys-type-mask {
  background-color: white;
}

.keyword-tip {
  padding: $padding-normal;
  color: $color-tip;
  font-size: $size-text;
  line-height: 1.2;
}
</style>
