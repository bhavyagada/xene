<template>
  <v-overlay opacity="0.98" :value="$store.state.loading" style="z-index: 400">
    <div column justify-center align-center>
      <Lottie
        :animationData="require('~/assets/jsons/lottie/loader.json')"
        :style="'height: 80vh;'"
        :speed="2"
      />
    </div>
  </v-overlay>
</template>

<script>
import Lottie from '~/components/Lottie.vue'

export default {
  components: {
    Lottie
  }
}
</script>

<style>
</style>