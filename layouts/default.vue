<template>
  <v-app>
    <v-app-bar app style="background: linear-gradient(to right, #0e293c, #141e30, #0b2130);">
      <template v-if="$auth.loggedIn">
        <nuxt-link to="/">
          <v-img :src="'/images/' +projectId + '.png'" max-height="100" max-width="100" contain></v-img>
        </nuxt-link>

        <v-spacer />
        <v-avatar @click="onUserInfoClick" style="cursor:pointer;">
          <v-img :src="$auth.user.picture" :alt="$auth.user.name" />
        </v-avatar>
      </template>

      <template v-else class="pa-0 ma-0">
        <nuxt-link to="/">
          <v-img :src="'/images/' +projectId + '.png'" max-height="100" max-width="100" contain></v-img>
        </nuxt-link>
        <v-spacer />
        <v-icon
          color="cyan"
          style="cursor:pointer;"
          @click="$auth.loginWith('auth0')"
        >mdi-fingerprint</v-icon>
      </template>
    </v-app-bar>

    <!-- Sizes your content based upon application components -->
    <v-content>
      <v-container fluid :class="{ scrollbar: $device.isDesktop }">
        <nuxt />

        <v-dialog v-model="dialog" fullscreen persistent>
          <v-card>
            <v-card-text>
              <v-container fill-height>
                <v-row justify="center" align="center">
                  <v-col cols="12">
                    <v-img src="/images/portrait.png" max-height="150" contain></v-img>
                    <br />
                    <v-row justify="center">
                      <div class="headline teal--text text--accent-3">Please rotate your device.</div>
                      <div
                        class="subtitle-2 text-center"
                      >We don't support Landscape mode yet. <br> Please switch back to Portrait mode for the best user experience.</div>
                    </v-row>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
          </v-card>
        </v-dialog>

        <user-dialog :user="$auth.user" ref="userDialog" />
        <v-tooltip left dark>
          <template v-slot:activator="{ on }">
            <v-fab-transition>
              <v-btn
                v-show="!hidden"
                small
                color="cyan"
                fixed
                bottom
                right
                fab
                @click="toggleFullscreen"
                v-on="on"
                v-if="! $device.isIos"
              >
                <v-icon>mdi-fullscreen</v-icon>
              </v-btn>
            </v-fab-transition>
          </template>
          <span>Fullscreen mode</span>
        </v-tooltip>
      </v-container>
    </v-content>
  </v-app>
</template>


<script>
import UserDialog from '../components/UserDialog'

export default {
  data() {
    return {
      projectName: process.env.PROJECT_NAME,
      projectId: process.env.PROJECT_ID,
      hidden: false,
      dialog: false
    }
  },
  components: {
    UserDialog
  },
  methods: {
    onUserInfoClick() {
      this.$refs.userDialog.openDialog()
    },
    toggleFAB() {
      this.hidden = !this.hidden
    },
    toggleFullscreen() {
      this.$fullscreen.toggle(document.documentElement, {
        wrap: false,
        callback: this.toggleFAB
      })
    }
  },
  async mounted() {
    if (this.$auth.loggedIn) {
      await this.$axios
        .post('/api/user', { sub: this.$auth.user.sub })
        .then(data => {
          // console.log(data)
        })
        .catch(err =>  {
          this.$auth.loginWith('auth0')
        })
    }
    if (this.$device.isMobile) {
      if (
        screen.orientation.type === 'landscape-primary' ||
        screen.orientation.type === 'landscape-secondary'
      )
        this.dialog = true

      let vm = this
      window.onorientationchange = function() {
        if (
          screen.orientation.type === 'landscape-primary' ||
          screen.orientation.type === 'landscape-secondary'
        ) {
          vm.dialog = true
        } else {
          vm.dialog = false
        }
      }
    }
  }
}
</script>

<style>
.v-application--wrap {
  position: inherit !important;
}
html {
  overflow-y: auto !important;
}
.widthLimit {
  width: 750px;
  margin: auto;
}
.scrollbar::-webkit-scrollbar {
  width: 6px;
}
.scrollbar::-webkit-scrollbar-track, .scrollbar::-webkit-scrollbar-button {
  display: none;
}
.scrollbar::-webkit-scrollbar-thumb {
  background-color: #2dbcad;
  border-radius: 16px;
}
.scrollbar {
  height: calc(100vh - 64px);
  overflow-y: auto !important;
}
</style>