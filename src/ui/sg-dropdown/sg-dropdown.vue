<template>
  <div :class="['sg-dropdown', optionsVisible ? 'options-active' : '']">
    <div class="option-label sg-flex" @click.stop="onToggle">
      <div class="sg-flex-one sg-ellipsis">
        <slot>
          <span
            :class="{'option-tip': !currentLabel, 'current-label': optionActive && !!currentLabel}"
          >{{currentLabel || '点击选择'}}</span>
        </slot>
      </div>
      <i v-show="pointerVisible" class="iconfont icon-down"></i>
    </div>
    <div
      v-show="optionsVisible"
      :class="[optionType !== 'center' ? '' : 'sg-mask', 'dropdown-' + optionType, 'align-' + optionAlign]"
    >
      <div class="sg-options" sg-scroll="vertical_stop">
        <div class="options-inner">
          <div
            v-for="item in options"
            :key="item.value"
            v-show="!item.hidden"
            class="sg-option sg-ellipsis"
            :class="{'option-active': optionActive && currentValue === item.value}"
            :disabled="item.disabled"
            @click.stop="onSelectOption(item, $event)"
          >
            <i v-if="item.icon" :class="['iconfont', item.icon]"></i>
            {{item.label}}
          </div>
        </div>
      </div>
      <div v-if="optionType !== 'center'" v-show="optionsVisible" class="pointer"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SgDropdown',

  props: {
    options: {
      type: Array,
      required: true
    },
    optionActive: {
      type: Boolean,
      default: true
    },
    optionType: {
      type: String,
      default: 'normal' // ['normal', 'fullwidth', 'center']
    },
    pointerVisible: {
      type: Boolean,
      default: true
    },
    initValue: {
      type: String,
      default: ''
    }
  },

  data () {
    return {
      optionAlign: 'bottom',
      optionsVisible: false,
      currentLabel: '',
      currentValue: ''
    }
  },

  mounted () {
    document.addEventListener('click', () => {
      if (this.optionsVisible) {
        this.optionsVisible = false
      }
    })

    const option = this.options.find(o => o.value === this.initValue)
    option && this.setSelectOption(option)
  },

  methods: {
    onToggle () {
      this.optionsVisible = !this.optionsVisible
      if (this.optionsVisible) {
        if (this.optionType === 'center') {
          this.optionAlign = 'bottom'
        } else {
          const rect = this.$el.getBoundingClientRect()
          const isElBottom = rect.top > document.body.clientHeight / 2
          this.optionAlign = isElBottom ? 'top' : 'bottom'
        }
      }
    },
    setSelectOption ({ value, label }) {
      this.currentValue = value
      this.currentLabel = label
    },
    onSelectOption (option, e) {
      if (option.disabled) {
        return
      }
      this.setSelectOption(option)
      this.optionsVisible = false
      this.$emit('change', option.value, e)
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../style/const.scss";
// @import "../style/index.scss";

.sg-dropdown {
  position: relative;
  padding: 0 $padding-small;
  background-color: white;
  box-sizing: border-box;
  // test style
  // border: 1px solid gray;
  // background-color: #ddd;
  .sg-flex {
    align-items: center;
  }
  .option-tip {
    color: #aaa;
  }
  .current-label {
    color: $color-theme;
  }
  .option-label {
    font-size: 1.4rem;
    line-height: $height-text;
    i {
      display: inline-block;
      margin-left: 1rem;
      transform: rotate(0);
      transition: transform 300ms;
    }
  }

  .sg-options {
    position: absolute;
    right: 0;
    min-width: 8rem;
    padding: $padding-normal 0;
    // height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    box-sizing: border-box;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    background-color: white;
    border-radius: 0.3rem;
    z-index: $z-index-normal;

    // test style
    // border: 1px solid gray;
    // background-color: #ddd;
  }
  .options-inner {
    padding: 0 1rem;
  }

  .dropdown-normal .sg-options{
    max-width: 50%;
    max-height: 20rem;
  }
  .dropdown-fullwidth .sg-options {
    width: 100%;
    max-height: 20rem;
  }
  .dropdown-center .sg-options {
    position: fixed;
    top: 50%;
    left: 50%;
    max-width: 90%;
    min-width: 5rem;
    max-height: 80%;
    transform: translate(-50%, -50%);
  }

  .pointer {
    position: absolute;
    right: 1rem;
    width: 0;
    height: 0;
    z-index: $z-index-normal;
    box-sizing: border-box;
    border-width: 1rem;
    border-style: solid;
    border-color: transparent transparent white transparent;

    // test style
    // border-color: transparent transparent #ddd transparent;
  }
  .sg-option {
    margin-bottom: 0.5rem;
    line-height: $height-text;
    font-size: $size-text;
    color: $color-text;
    &[disabled] {
      color: $color-theme-disabled;
    }
    &:last-child {
      margin-bottom: 0;
    }
  }
  .option-active {
    color: $color-theme;
  }
}

.dropdown-normal.align-top,
.dropdown-fullwidth.align-top {
  .sg-options {
    bottom: 3.4rem;
  }
  .pointer {
    bottom: 1.4rem;
    transform: rotate(180deg);
  }
}

.dropdown-normal.align-bottom,
.dropdown-fullwidth.align-bottom {
  .sg-options {
    top: 3.4rem;
  }
  .pointer {
    top: 1.4rem;
  }
}

.options-active {
  .option-label {
    i {
      transform: rotate(180deg);
    }
  }
}
</style>

<style>
/* @import "//at.alicdn.com/t/font_1730652_96vm5rfm5q.css";
* {
  margin: 0;
  padding: 0;
}
html {
  font-size: 12px;
}
html,
body {
  height: 100%;
} */
</style>
