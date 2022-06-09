<template>
  <div>
    <v-alert show type="warning">This is a secure page!</v-alert>
    <v-row>
      <v-col md="8">
        <v-card title="State">
          <pre>{{ state }}</pre>
        </v-card>
      </v-col>
    </v-row>
    <hr />
    <v-btn @click="$auth.fetchUser()">Fetch User</v-btn>
    <v-btn @click="$auth.logout()">Logout</v-btn>
  </div>
</template>

<script>
export default {
  middleware: ['auth'],
  computed: {
    state() {
      return JSON.stringify(this.$auth.$state, undefined, 2)
    }
  },
  created() {
    setTimeout(() => this.$store.dispatch('setLoading', false), 500)
  }
}
</script>