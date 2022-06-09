<template>
  <div class="lottie" :style="style" ref="lottie"></div>
</template>

<script>
import lottie from 'lottie-web'
export default {
  props: {
    animationData: {
      type: Object,
      required: true
    },
    speed: {
      type: Number,
      required: false,
      default: 1
    },
    width: {
      type: Number,
      required: false,
      default: -1
    },
    height: {
      type: Number,
      required: false,
      default: -1
    },
    loop: {
      type: Boolean,
      required: false,
      default: true
    },
    autoPlay: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data: () => ({
    anim: null,
    style: null
  }),
  mounted() {
    this.init()
  },
  methods: {
    async init() {
      this.style = {
        width: this.width != -1 ? `${this.width}px` : '100%',
        height: this.height != -1 ? `${this.height}px` : '100%',
        overflow: 'hidden',
        margin: '0 auto'
      }
      
      this.anim = lottie.loadAnimation({
        container: this.$refs.lottie,
        renderer: 'svg',
        loop: this.loop,
        autoplay: this.autoPlay,
        animationData: this.animationData,
        rendererSettings: {
          clearCanvas: true,
          progressiveLoad: true,
          hideOnTransparent: true
        }
      })
      this.anim.setSpeed(this.speed)
      
      this.$emit('created', this.anim)
    }
  },
  beforeRouteLeave(to, from, next) {
    this.anim.destroy()
    next()
  }
}
</script>

<style>
</style>