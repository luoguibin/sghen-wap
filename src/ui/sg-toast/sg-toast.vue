<template>
  <div class="sg-toast">{{msg}}</div>
</template>

<script>
export default {
  name: 'SgToast',
  data () {
    return {
      msg: ''
    }
  },
  methods: {
    setMsg (msg) {
      this.msg = msg
    }
  }
}
</script>

<style lang="scss" scoped>
.sg-toast {
  position: fixed;
  top: 2rem;
  left: 50%;
  padding: 0.5rem 1rem;
  color: white;
  font-size: 1.2rem;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 0.6rem;
  transform: translateX(-50%);
}
</style>
