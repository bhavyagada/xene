<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" max-width="315">
      <v-card style="background-color: #111; border-radius: 20px;">
        <v-card-title class="headline cyan--text">
          <v-icon medium color="cyan">mdi-account</v-icon>&nbsp;User Info
          <div class="spacer"></div>
          <v-btn icon color="error" @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text v-if="$auth.loggedIn" style="padding: 0 12px 10px;">
          <v-row justify="center">
            <Lottie
              v-if="dialog"
              :animationData="require('~/assets/jsons/lottie/user-profile.json')"
              :height="150"
              :width="150"
            />
            <br />
          </v-row>
          <v-row justify="center" class="title cyan--text">
            <v-icon color="cyan">mdi-code-tags</v-icon>
            &nbsp;{{ this.user.name }}
          </v-row>
          <v-row justify="center" class="subtitle-1 teal--text text--accent-4">
            <v-icon small color="teal accent-4">mdi-email</v-icon>
            &nbsp;{{ this.user.email }}
          </v-row>
          <v-card-actions>
            <v-btn color="red accent-4" outlined block @click="$auth.logout()">
              Logout
              <v-icon medium right>mdi-exit-to-app</v-icon>
            </v-btn>
          </v-card-actions>
          <v-alert
              text
              prominent
              dense
              type="info"
              color=" teal accent-4"
              class="text-center subtitle-2"
              icon="mdi-frequently-asked-questions"
              border="left"
            >
            Questions or suggestions?<br>Contact:<br>Yash Gill - 9029593179<br>yashgill696@gmail.com
            </v-alert>
        </v-card-text>
        <v-card-text v-else>
          <v-row justify="center">
            <Lottie
              v-if="dialog"
              :animationData="require('~/assets/jsons/lottie/user-profile.json')"
              :height="150"
              :width="150"
            />             
            <v-card-actions>
              <v-btn color="cyan" outlined @click="$auth.loginWith('auth0')">
                Login
                <v-icon medium right>mdi-login-variant</v-icon>
              </v-btn>
            </v-card-actions>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import Lottie from '~/components/Lottie'

export default {
  components: {
    Lottie
  },
  data() {
    return {
      dialog: false
    }
  },
  props: ['user'],
  methods: {
    openDialog() {
      this.dialog = true
    }
  }
}
</script>