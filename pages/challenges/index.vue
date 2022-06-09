<template>
  <v-container>
    <v-row dense>
      <v-col v-for="(item, i) in challenges" :key="i" cols="12" lg="4" md="6" sm="6">
        <v-skeleton-loader
          :loading="skeleton_loading"
          class="ma-1 challenges-skeleton"
          type="card-avatar, actions"
        >
          <v-card
            :color="colorPicker(item.id, i)"
            dark
            elevation="16"
            :to="'/challenges/' + item.id"
          >
            <Lottie
              :animationData="require('~/assets/jsons/lottie/challenges/' + item.name + '.json')"
              :height="250"
              :width="250"
              @created="v => anim.push(v)"
            />
            <v-progress-circular
              :rotate="-90"
              :size="100"
              :width="10"
              :value="puzzlesSolvedRatio(item.id) * 100"
              :color="puzzlesSolvedRatio(item.id) == 1 ? 'teal accent-3' : 'cyan'"
              class="ml-2 mb-2"
            >{{ filterChallenge(item.id).length }} / {{ $store.getters.puzzlesForChallenge(item.id).length }}</v-progress-circular>

            <span
              :class="['headline ml-6 cyan--text', {'teal--text text--accent-3': puzzlesSolvedRatio(item.id) == 1}]"
              v-text="item.name"
            ></span>

            <div class="d-flex justify-space-between">
              <v-btn
                class="ma-2 subtitle-2"
                tile
                outlined
                :color="puzzlesSolvedRatio(item.id) == 1 ? 'teal accent-3' : 'cyan'"
                @click.prevent="openLeaderboard(item.id)"
              >
                <v-icon left>mdi-podium-gold</v-icon>Leaderboard
              </v-btn>

              <v-btn
                class="ma-2 subtitle-2"
                tile
                outlined
                :color="puzzlesSolvedRatio(item.id) == 1 ? 'teal accent-3' : 'cyan'"
                @click.prevent="openAnalytics(item.id)"
              >
                Analytics
                <v-icon right>mdi-chart-areaspline</v-icon>
              </v-btn>
            </div>
          </v-card>
        </v-skeleton-loader>
      </v-col>
    </v-row>

    <v-dialog v-model="leaderboard_sheet" fullscreen persistent scrollable v-if="leaderboard_sheet">
      <!-- @TODO Fix Android Chrome address bar resize scroll bug for all leaderboard dialogs  -->
      <v-card v-if="challenge_users">
        <v-card-title
          :class="['teal--text text--accent-4', { widthLimit: $device.isDesktop }]"
          style="border: 1px solid; border-radius: 2em;"
        >
          Top 50 Leaderboard
          <v-spacer />
          <v-btn
            icon
            color="error"
            @click="() => {leaderboard_sheet = !leaderboard_sheet; anim.forEach( v => v.play())}"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text :class="{ scrollbar: $device.isDesktop }" style="padding: 0px 20px 0px 0px; max-width: 750px; margin: auto auto;">
          <v-list rounded>
            <v-subheader
              class="title teal--text text--accent-3"
              v-if="challenge"
            >{{ challenge.name }}</v-subheader>

            <v-list-group v-for="(challenge_user, index) in challenge_users" :key="index" dense>
              <template v-slot:activator>
                <v-list-item
                  :class="[ 'pb-1 my-1 pl-1 pr-0', challenge_user.sub == $auth.user.sub ? 'light-blue darken-1' : index % 2 == 0 ? 'teal darken-1' : 'teal darken-3']"
                  style="min-width: 100%"
                >
                  <v-list-item-avatar>
                    <v-avatar style="min-width: inherit">
                      <v-img :src="challenge_user.picture" :alt="challenge_user.name" />
                    </v-avatar>
                  </v-list-item-avatar>

                  <v-list-item-content class="py-6 px-1">
                    <v-list-item-title
                      v-text="challenge_user.name.match(/\S+@\S+\.\S+/) ? challenge_user.nickname : challenge_user.name"
                    ></v-list-item-title>
                  </v-list-item-content>

                  <v-list-item-icon class="mr-2">
                    <v-badge
                      :color="challenge_user.rank == 0 ? '#C9B037' : (challenge_user.rank == 1 ? '#D7D7D7' : (challenge_user.rank == 2 ? '#AD8A56' : 'cyan lighten-2'))"
                      :content="challenge_user.rank + 1"
                      offset-x="40"
                      offset-y="-2"
                      left
                      bottom
                    >
                      <v-chip color="teal accent-2" outlined>{{challenge_user.avg_score}}</v-chip>
                    </v-badge>
                  </v-list-item-icon>
                </v-list-item>
              </template>

              <v-list-item class="px-2">
                <v-list-item-content>
                  <v-list-item-title v-for="puzzle in challenge_user.puzzles" :key="puzzle.id">
                    <span class="cyan--text text--lighten-2">{{ puzzle.name }}</span>
                    <span class="teal--text text--accent-3 float-right">{{ puzzle.score }}</span>
                    <v-divider />
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-group>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="analytics_dialog"
      fullscreen
      persistent
      scrollable
      v-if="analytics_dialog"
    >
      <v-card>
        <v-card-title
          :class="['teal--text text--accent-4', { widthLimit: $device.isDesktop }]"
          v-if="challenge"
          style="border: 1px solid; border-radius: 2em;"
        >
          {{ challenge.name }} - Analytics
          <v-spacer />
          <v-btn
            icon
            color="error"
            @click="() => {analytics_dialog = !analytics_dialog; anim.forEach( v => v.play())}"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>        
        <v-card-text :class="{ scrollbar: $device.isDesktop }" style="padding: 0px 4px 8px; max-width: 750px; margin: auto auto;">
          <!-- Temp fix with Fullscreen @TODO Fix Chrome address bar width resize on scroll bug for all analytics dialogs -->          
          <v-alert
            class="text-center mt-2"
            color="blue lighten-3"
            dark
            dense
            outlined
            icon="mdi-radar"
          >Radar for You vs. Best</v-alert>
          <div style="height: 40vh;">
            <RadarChart v-if="analytics_dialog" :radar_data="radar_data"></RadarChart>
          </div>
          <div class="d-flex justify-center white--text" style="font-size:11px !important;">
            <v-btn class="mx-2" depressed x-small icon disabled>
              <v-icon :style="'color: ' + radar_data.options[0] + ' !important'">mdi-square</v-icon>
            </v-btn>Best Score
            <span v-if="radar_data.flags.user">
              <v-btn class="mx-2" depressed x-small icon disabled>
                <v-icon :style="'color: ' + radar_data.options[1] + ' !important'">mdi-square</v-icon>
              </v-btn>You
            </span>
          </div>

          <v-alert
            class="text-center mt-2"
            color="cyan"
            dark
            outlined
            icon="mdi-chart-bell-curve"
          >Percentile</v-alert>
          <c3-chart :options="percentile_chart" style="width: 97%;" />

          <v-alert
            class="text-center mt-2"
            color="orange"
            dark
            dense
            outlined
            icon="mdi-chart-bell-curve-cumulative"
          >CDF Plot</v-alert>
          <c3-chart :options="cdf_chart" style="width: 97%;" />

          <v-alert
            class="text-center mt-2"
            color="blue lighten-3"
            dark
            dense
            outlined
            icon="mdi-chart-bar-stacked"
          >Boxplot for Score Attributes</v-alert>
          <c3-chart :options="boxplot_chart" />

          <v-alert
            class="text-center mt-2"
            color="amber"
            dark
            dense
            outlined
            icon="mdi-chart-donut-variant"
          >Donut Chart for Everyone</v-alert>
          <c3-chart :options="donut_chart" />

          <v-alert
            class="text-center mt-2"
            color="teal accent-4"
            dark
            dense
            outlined
            icon="mdi-chart-pie"
            v-if="pie_chart"
          >Pie Chart for User</v-alert>
          <c3-chart v-if="pie_chart" :options="pie_chart" style="width: 97%;" />

          <v-alert
            class="text-center mt-2"
            color="blue lighten-3"
            dark
            dense
            outlined
            icon="mdi-chart-scatter-plot"
          >Scatter Plot for Everyone</v-alert>
          <c3-chart :options="scatter_chart" style="width: 97%;" />

          <v-alert
            class="text-center mt-2"
            color="amber"
            dark
            dense
            outlined
            icon="mdi-chart-bar"
          >Stacked Bar Chart for Mean Score</v-alert>
          <c3-chart :options="stacked_bar_chart" style="width: 97%;" />

          <v-alert
            class="text-center mt-2"
            color="teal lighten-2"
            dark
            dense
            outlined
            icon="mdi-chart-gantt"
          >Top 10 Total Scores</v-alert>
          <c3-chart :options="axes_rotated_chart" style="width: 97%;" />

          <v-alert
            class="text-center mt-2"
            color="cyan lighten-3"
            dark
            dense
            outlined
            icon="mdi-chart-histogram"
          >User Counts</v-alert>
          <c3-chart :options="area_step_chart" style="width: 97%;" />
        </v-card-text>
      </v-card>
    </v-dialog>

    <overlay-loader />
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import Lottie from '~/components/Lottie.vue'
import RadarChart from '~/components/RadarChart.vue'
import C3Chart from '~/components/C3Chart'
import OverlayLoader from '~/components/OverlayLoader.vue'

import {
  boxplot,
  donut,
  pie,
  stackedBar,
  axesRotated,
  areaStep,
  scatter,
  radar,
  percentile,
  cdf
} from '~/utils/chart-utils'

export default {
  middleware: ['auth'],
  head() {
    return {
      title: process.env.PROJECT_NAME + ' - Challenges'
    }
  },
  components: {
    Lottie,
    C3Chart,
    RadarChart,
    OverlayLoader
  },
  computed: {
    puzzles: function() {
      return this.challenge
        ? this.$store.getters.puzzlesForChallenge(this.challenge.id)
        : null
    },
    ...mapState(['challenges'])
  },
  data() {
    return {
      user_puzzles: [],
      skeleton_loading: true,
      challenge: null,
      challenge_users: [],
      leaderboard_sheet: false,
      analytics_dialog: false,
      boxplot_chart: null,
      donut_chart: null,
      pie_chart: null,
      stacked_bar_chart: null,
      axes_rotated_chart: null,
      area_step_chart: null,
      scatter_chart: null,
      radar_data: null,
      percentile_chart: null,
      cdf_chart: null,
      anim: []
    }
  },
  methods: {
    colorPicker: function(id, i) {
      if (
        this.filterChallenge(id).length /
          this.$store.getters.puzzlesForChallenge(id).length ==
        1
      )
        return 'black'
      return i % 2 == 0 ? 'grey darken-4' : 'blue-grey darken-4'
    },
    fetchUserPuzzles: async function() {
      await this.$axios
        .get('api/user/puzzles')
        .then(puzzles => {
          this.user_puzzles = puzzles.data
          this.skeleton_loading = false
        })
        .catch(err => console.log(err))
    },
    filterChallenge: function(id) {
      return this.user_puzzles.length > 0
        ? this.user_puzzles.filter(puzzle => puzzle.challengeId == id)
        : []
    },
    puzzlesSolvedRatio: function(id) {
      return (
        this.filterChallenge(id).length /
        this.$store.getters.puzzlesForChallenge(id).length
      )
    },
    openLeaderboard: function(id) {
      this.anim.forEach(v => v.pause())
      this.$store.dispatch('setLoading', true)
      this.challenge = this.challenges.find(challenge => challenge.id == id)

      this.$axios
        .get(`api/leaderboard/challenges/${id}`)
        .then(res => {
          let challenge_users = res.data.result

          let scores = []
          this.challenge_users = challenge_users.map(function(challenge_user) {
            let formatted_user = {}

            let user_details = res.data.users.find(user => {
              return user.sub === challenge_user.sub
            })
            formatted_user['sub'] = user_details.sub
            formatted_user['name'] = user_details.name
            formatted_user['nickname'] = user_details.nickname
            formatted_user['picture'] = user_details.picture
            formatted_user['avg_score'] = challenge_user.avg_score
            formatted_user['puzzles'] = challenge_user.puzzles
            let index = scores.indexOf(challenge_user.avg_score)
            if (index < 0) { 
              scores.push(challenge_user.avg_score)
              formatted_user['rank'] = scores.length - 1
            } else {
              formatted_user['rank'] = index
            }
            return formatted_user
          })

          this.challenge_users.sort((a, b) => {
            if (a.avg_score == b.avg_score) {              
              if (a.name.toLowerCase() > b.name.toLowerCase()) {
                return 1
              } else if (a.name.toLowerCase() < b.name.toLowerCase()) {
                return -1
              } else {
                return 0
              }
            } else {
              return b.avg_score - a.avg_score
            }
          })
          this.leaderboard_sheet = true
          setTimeout(() => this.$store.dispatch('setLoading', false), 300)
        })
        .catch(err => console.log(err))
    },
    openAnalytics: function(id) {      
      this.anim.forEach(v => v.pause())
      this.$store.dispatch('setLoading', true)

      this.challenge = this.challenges.find(challenge => challenge.id == id)

      Promise.all([
        this.$axios.get(`api/analytics/challenges/${id}`),
        this.$axios.get(`api/analytics/user/challenges/${id}`),
        this.$axios.get(`api/analytics/challenges/${id}/average_scores`),
        this.$axios.get(`api/analytics/challenges/${id}/sum_scores`),
        this.$axios.get(`api/analytics/challenges/${id}/user_counts`),
        this.$axios.get(`/api/analytics/challenges/${id}/puzzles_best_score`)
      ])
        .then(responses => {
          this.boxplot_chart = boxplot(responses[0].data, this.puzzles)

          this.donut_chart = donut(responses[0].data, this.puzzles)

          if (!responses[1].data.hasOwnProperty('success')) {
            this.pie_chart = pie(responses[1].data, this.puzzles)
          }

          this.stacked_bar_chart = stackedBar(responses[2].data, this.puzzles)

          this.axes_rotated_chart = axesRotated(responses[3].data)

          this.area_step_chart = areaStep(responses[4].data, this.puzzles)

          this.scatter_chart = scatter(responses[0].data)

          this.radar_data = radar(
            responses[5].data.best_user,
            responses[5].data.user,
            999
          )

          this.percentile_chart = percentile(
            responses[0].data,
            this.$auth.user.sub,
            this.puzzles
          )
          // CDF function depends on percentile. Has to be called in this order
          this.cdf_chart = cdf()

          this.$nuxt.$loading.finish()
          this.analytics_dialog = true
          setTimeout(() => this.$store.dispatch('setLoading', false), 300)
        })
        .catch(err => console.log(err))
    }
  },
  beforeCreate() {
    this.$store.dispatch('setLoading', true)
  },
  created() {
    setTimeout(() => this.$store.dispatch('setLoading', false), 1500)
    this.fetchUserPuzzles()
  }
}
</script>

<style>
/* Leaderboard list arrow icon */
.v-list-group
  .v-list-group__header
  .v-list-item__icon.v-list-group__header__append-icon {
  margin: 0 !important;
  min-width: unset !important;
}
.v-list-group .v-list-item {
  padding: unset;
}

/* Skeleton Loader */
.challenges-skeleton .v-skeleton-loader__image {
  height: 250px !important;
}
.challenges-skeleton .v-skeleton-loader__list-item-avatar {
  height: 105px !important;
}
.challenges-skeleton .v-skeleton-loader__avatar {
  background: radial-gradient(
    circle,
    transparent 58%,
    rgb(255, 255, 255, 0.12) 0
  ) !important;
  border-radius: 100% !important;
}
.challenges-skeleton
  .v-skeleton-loader__list-item-avatar
  .v-skeleton-loader__avatar {
  height: 100px !important;
  width: 100px !important;
  margin-top: 5px;
}
.challenges-skeleton .v-skeleton-loader__text {
  height: 27px !important;
}
.challenges-skeleton .v-skeleton-loader__actions {
  padding: 2px !important;
  text-align: center !important;
  display: flex !important;
  justify-content: space-between !important;
}
.challenges-skeleton .v-skeleton-loader__button {
  width: 134px !important;
  margin: 8px !important;
  height: 35px !important;
  background: transparent !important;
  border: 3px rgba(255, 255, 255, 0.12) solid !important;
}
</style>