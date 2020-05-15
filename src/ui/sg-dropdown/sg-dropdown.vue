<template>
  <div
    :class="['sg-dropdown', optionsVisible ? 'sg-dropdown-active' : '', 'sg-dropdown_' + direction]"
  >
    <div class="sg-dropdown-label sg-flex" @click.stop="onToggle">
      <div class="sg-flex-one sg-ellipsis">
        <slot>
          <span
            :class="{'sg-dropdown-tip': !currentLabel, 'sg-dropdown-text': optionActive && !!currentLabel}"
          >{{currentLabel || '点击选择'}}</span>
        </slot>
      </div>
      <i v-show="pointerVisible" class="iconfont icon-down"></i>
    </div>
    <div v-show="optionsVisible" class="sg-dropdown-options">
      <div class="options-wrapper">
        <div
          v-for="item in options"
          :key="item.value"
          class="sg-dropdown-option sg-ellipsis"
          :class="{'sg-dropdown-option_active': optionActive && currentValue === item.value}"
          @click.stop="onSelectOption(item, $event)"
        >{{item.label}}</div>
      </div>
    </div>
    <div v-show="optionsVisible" class="sg-dropdown-pointer"></div>
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
      default: false
    },
    pointerVisible: {
      type: Boolean,
      default: true
    }
  },

  data () {
    return {
      direction: 'bottom',
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
  },

  methods: {
    onToggle () {
      this.optionsVisible = !this.optionsVisible
      if (this.optionsVisible) {
        const rect = this.$el.getBoundingClientRect()
        const isElTop = rect.top < document.body.clientHeight / 2
        // console.log('isElTop', isElTop)
        this.direction = isElTop ? 'bottom' : 'top'
      }
    },
    setSelectOption ({ value, label }) {
      this.currentValue = value
      this.currentLabel = label
    },
    onSelectOption (option, e) {
      this.setSelectOption(option)
      this.optionsVisible = false
      this.$emit('change', option.value, e)
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../style/const.scss";

.sg-dropdown {
  position: relative;
  padding: $padding-small;
  background-color: white;
  .sg-flex {
    align-items: center;
  }
  .sg-dropdown-tip {
    color: #aaa;
  }
  .sg-dropdown-text {
    color: $color-theme;
  }
  .sg-dropdown-label {
    font-size: 1.4rem;
    // line-height: 1;
    i {
      display: inline-block;
      margin-left: 1rem;
      transform: rotate(0);
      transition: transform 300ms;
    }
  }

  .sg-dropdown-options {
    position: absolute;
    right: 0;
    max-width: 50vw;
    min-width: 5rem;
    padding: $padding-normal 0;
    box-sizing: border-box;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    background-color: white;
    border-radius: 0.3rem;
    z-index: $z-index-normal;
    .options-wrapper {
      padding: 0 1rem;
      max-height: 16rem;
      overflow: auto;
    }
  }
  .sg-dropdown-pointer {
    position: absolute;
    right: 1rem;
    width: 0;
    height: 0;
    z-index: $z-index-normal;
    box-sizing: border-box;
    border-width: 1rem;
    border-style: solid;
    border-color: transparent transparent white transparent;
  }
  .sg-dropdown-option {
    margin-bottom: 0.5rem;
    line-height: $height-text;
    font-size: $size-text;
    color: $color-text;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .sg-dropdown-option_active {
    color: $color-theme;
  }
}

.sg-dropdown_top {
  .sg-dropdown-options {
    bottom: 3rem;
  }
  .sg-dropdown-pointer {
    bottom: 1rem;
    transform: rotate(180deg);
  }
}

.sg-dropdown_bottom {
  .sg-dropdown-options {
    top: 3rem;
  }
  .sg-dropdown-pointer {
    top: 1rem;
  }
}

.sg-dropdown-active {
  .sg-dropdown-label {
    i {
      transform: rotate(180deg);
    }
  }
}
</style>
