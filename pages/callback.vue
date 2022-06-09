<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>      
      <Lottie
        :animationData="require('~/assets/jsons/lottie/loader.json')"
        :style="'height: 90vh;'"
      />
    </v-flex>
  </v-layout>
</template>

<script>
import Lottie from '~/components/Lottie.vue'

export default {
  components: {
    Lottie
  }
}
</script>

<style scoped>
</style>