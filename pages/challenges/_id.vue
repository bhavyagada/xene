<template>
  <v-container>
    <v-btn
      :color="user_puzzles.length == puzzles.length ? 'teal accent-3' : 'cyan'"
      fab
      dark
      top
      outlined
      tile
      :to="'/challenges'"
    >
      <v-icon dark>mdi-arrow-left</v-icon>
    </v-btn>
    <v-row dense>
      <v-col v-for="(item, i) in puzzles" :key="i" cols="12" lg="4" md="6" sm="6">
        <v-skeleton-loader
          :loading="skeleton_loading"
          class="ma-1 puzzles-skeleton"
          :type="'image, card-heading, list-item, actions'"
        >
          <v-card
            :color="colorPicker(item.id, i)"
            class="d-flex justify-center"
            dark
            elevation="16"
            @click="$router.push('/solve/' + item.id)"
          >
            <div>           
              <Lottie
              :animationData="require('~/assets/jsons/lottie/puzzles/' + item.name + '.json')"
              :height="200"
              :width="200"
              @created="v => anim.push(v)"
            />

              <v-card-title class="headline justify-center pa-2" v-text="item.name"></v-card-title>

              <v-alert
                class="text-center"
                :color="getUserPuzzle(item.id) ? 'teal accent-3' : 'cyan'"
                dark
                dense
                :icon="getUserPuzzle(item.id) ? 'mdi-check-circle-outline' : 'mdi-close-octagon-outline'"
                outlined
              >
                Score: {{ getUserPuzzle(item.id) ? getUserPuzzle(item.id).UserPuzzles.score : 0 }}
                <span
                  class="cyan--text float-right"
                  :nuxt="'/solve/' + item.id"
                >{{ getUserPuzzle(item.id) ? 'Replay' : 'Play' }}</span>
              </v-alert>
              <div class="d-flex justify-space-between">
                <v-btn
                  class="ma-2 subtitle-2"
                  tile
                  outlined
                  :color="getUserPuzzle(item.id) ? 'teal accent-3' : 'cyan'"
                  @click.stop="openLeaderboard(item.id)"
                >
                  <v-icon left>mdi-podium-gold</v-icon>Leaderboard
                </v-btn>

                <v-btn
                  class="ma-2 subtitle-2"
                  tile
                  outlined
                  :color="getUserPuzzle(item.id) ? 'teal accent-3' : 'cyan'"
                  @click.stop="openAnalytics(item.id)"
                >
                  Analytics
                  <v-icon right>mdi-chart-areaspline</v-icon>
                </v-btn>
              </div>
            </div>
          </v-card>
        </v-skeleton-loader>
      </v-col>
    </v-row>
    
      <v-dialog v-model="leaderboard_sheet" fullscreen persistent scrollable v-if="leaderboard_sheet">
        <v-card v-if="puzzle_users">
          <v-card-title
            :class="['teal--text text--accent-4', { widthLimit: $device.isDesktop }]"            
            style="border: 1px solid;  border-radius: 2em;"
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
              <v-subheader class="title teal--text text--accent-3" v-if="puzzle">{{ puzzle.name }}</v-subheader>

              <v-list-group v-for="(puzzle_user, index) in puzzle_users" :key="index" dense>
                <template v-slot:activator>
                  <v-list-item
                    :class="[ 'pb-1 my-1 pl-1 pr-0', puzzle_user.sub == $auth.user.sub ? 'light-blue darken-1' : index % 2 == 0 ? 'teal darken-1' : 'teal darken-3']"
                    style="min-width: 100%;"
                  >
                    <v-list-item-avatar>
                      <v-avatar style="min-width: inherit">
                        <v-img :src="puzzle_user.picture" :alt="puzzle_user.name" />
                      </v-avatar>
                    </v-list-item-avatar>

                    <v-list-item-content class="py-6 px-1">
                      <v-list-item-title
                        v-text="puzzle_user.name.match(/\S+@\S+\.\S+/) ? puzzle_user.nickname : puzzle_user.name"
                      ></v-list-item-title>
                    </v-list-item-content>

                    <v-list-item-icon class="mr-2">
                      <v-badge
                        :color="puzzle_user.rank == 0 ? '#C9B037' : (puzzle_user.rank == 1 ? '#D7D7D7' : (puzzle_user.rank == 2 ? '#AD8A56' : 'cyan lighten-2'))"
                        :content="puzzle_user.rank + 1"
                        offset-x="40"
                        offset-y="-2"
                        left
                        bottom
                      >
                        <v-chip color="teal accent-2" outlined>{{puzzle_user.score}}</v-chip>
                      </v-badge>
                    </v-list-item-icon>
                  </v-list-item>
                </template>

                <v-list-item class="px-2">
                  <v-list-item-content>
                    <v-list-item-title>
                      Time:
                      <span
                        class="cyan--text text--lighten-2 float-right"
                      >{{ puzzle_user.time }}</span>
                    </v-list-item-title>
                    <v-list-item-title>
                      Edits:
                      <span
                        class="cyan--text text--lighten-2 float-right"
                      >+ {{ puzzle_user.edits }}</span>
                    </v-list-item-title>
                    <v-list-item-title>
                      Conciseness:
                      <span
                        class="cyan--text text--lighten-2 float-right"
                      >+ {{ puzzle_user.conciseness }}</span>
                    </v-list-item-title>
                    <v-list-item-title>
                      Complexity:
                      <span
                        class="cyan--text text--lighten-2 float-right"
                      >+ {{ puzzle_user.complexity }}</span>
                    </v-list-item-title>
                    <v-divider />
                    <v-list-item-title>
                      <span class="cyan--text text--lighten-2">Score:</span>
                      <span class="teal--text text--accent-3 float-right">{{ puzzle_user.score }}</span>
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list-group>
            </v-list>
          </v-card-text>
        </v-card>
      </v-dialog>
      
      <v-dialog v-model="analytics_dialog" fullscreen persistent scrollable v-if="analytics_dialog">
        <v-card>
          <v-card-title
            :class="['teal--text text--accent-4', { widthLimit: $device.isDesktop }]"
            v-if="puzzle"
            style="border: 1px solid; border-radius: 2em;"
          >
            {{ puzzle.name }} - Analytics
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
              dense
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
              v-if="boxplot_chart"
            >Boxplot for Score Attributes</v-alert>
            <c3-chart v-if="boxplot_chart" :options="boxplot_chart" />

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
            <c3-chart v-if="pie_chart" :options="pie_chart" />

            <v-alert
              class="text-center mt-2"
              color="blue lighten-3"
              dark
              dense
              outlined
              icon="mdi-chart-scatter-plot"
            >Scatter Plot for Everyone</v-alert>
            <c3-chart :options="scatter_chart" style="width: 97%;" />
          </v-card-text>
        </v-card>
      </v-dialog>
    
      <overlay-loader />
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import Lottie from '~/components/Lottie.vue'
import C3Chart from '~/components/C3Chart'
import RadarChart from '~/components/RadarChart.vue'
import OverlayLoader from '~/components/OverlayLoader.vue'
import {
  donut,
  pie,
  scatter,
  boxplot,
  radar,
  percentile,
  cdf
} from '~/utils/chart-utils'

export default {
  middleware: ['auth'],
  head() {
    return {
      title:
        'Challenges - ' +
        this.$store.state.challenges.find(x => x.id == this.$route.params.id)
          .name
    }
  },
  components: {
    Lottie,
    C3Chart,
    RadarChart,
    OverlayLoader
  },
  data: function() {
    return {
      leaderboard_sheet: false,
      skeleton_loading: true,
      puzzle: null,
      breadcrumb_char: 1,
      user_puzzles: [],
      puzzle_users: [],
      analytics_dialog: false,
      donut_chart: null,
      pie_chart: null,
      boxplot_chart: null,
      scatter_chart: null,
      radar_data: null,
      percentile_chart: null,
      cdf_chart: null,
      anim: []
    }
  },
  computed: {
    puzzles: function() {
      return this.$store.getters.puzzlesForChallenge(this.$route.params.id)
    },
    test_cases: function() {
      return JSON.parse(this.puzzle.test_cases).visible
    }
  },
  methods: {
    colorPicker: function(id, i) {
      if (this.user_puzzles.find(user_puzzle => user_puzzle.id == id))
        return 'black'
      return i % 2 == 0 ? 'grey darken-4' : 'blue-grey darken-4'
    },
    fetchUserPuzzles: async function() {
      await this.$axios
        .get('api/user/puzzles')
        .then(puzzles => {
          let challengeId = this.$route.params.id
          this.user_puzzles = puzzles.data.filter(
            puzzle => puzzle.challengeId == challengeId
          )
          this.skeleton_loading = false
        })
        .catch(err => console.log(err))
    },
    getUserPuzzle: function(id) {
      return this.user_puzzles.find(user_puzzle => user_puzzle.id == id)
    },
    openLeaderboard: function(id) {
      this.anim.forEach(v => v.pause())
      this.$store.dispatch('setLoading', true)
      this.puzzle = this.puzzles.find(puzzle => puzzle.id == id)

      this.$axios
        .get(`api/leaderboard/puzzles/${id}`)
        .then(res => {
          let puzzle_users = res.data.result

          let scores = []
          this.puzzle_users = puzzle_users.map(function(puzzle_user) {
            let formatted_user = {}

            let user_details = res.data.users.find(user => {
              return user.sub === puzzle_user.sub
            })
            formatted_user['sub'] = user_details.sub
            formatted_user['name'] = user_details.name
            formatted_user['nickname'] = user_details.nickname
            formatted_user['picture'] = user_details.picture
            formatted_user['time'] = puzzle_user.time
            formatted_user['edits'] = puzzle_user.edits
            formatted_user['conciseness'] = puzzle_user.conciseness
            formatted_user['complexity'] = puzzle_user.complexity
            formatted_user['score'] = puzzle_user.score
            let index = scores.indexOf(puzzle_user.score)
            if (index < 0) { 
              scores.push(puzzle_user.score)
              formatted_user['rank'] = scores.length - 1
            } else {
              formatted_user['rank'] = index
            }
            return formatted_user
          })
          
          this.puzzle_users.sort((a, b) => {
            if (a.score == b.score) {              
              if (a.name.toLowerCase() > b.name.toLowerCase()) {
                return 1
              } else if (a.name.toLowerCase() < b.name.toLowerCase()) {
                return -1
              } else {
                return 0
              }
            } else {
              return b.score - a.score
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

      this.puzzle = this.puzzles.find(puzzle => puzzle.id == id)

      Promise.all([
        this.$axios.get(`api/analytics/puzzles/${id}`),
        this.$axios.get(`api/user/puzzles/${id}`),
        this.$axios.get(`api/analytics/puzzles/${id}/best_score`),
      ])
        .then(responses => {
          this.donut_chart = donut(responses[0].data)

          if (responses[1].data.success) {
            this.pie_chart = pie([responses[1].data])
          }

          this.boxplot_chart = boxplot(responses[0].data)

          this.scatter_chart = scatter(responses[0].data)

          this.radar_data = radar(
            responses[2].data,
            responses[1].data,
            responses[1].data.success
          )

          this.percentile_chart = percentile(
            responses[0].data,
            this.$auth.user.sub            
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
  },
  validate({ params }) {
    // Must be a number
    return /^\d+$/.test(params.id)
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
/* Leaderboard rank color */
.v-badge__wrapper span {
  color: black;
}

/* Skeleton Loader */
.puzzles-skeleton .v-skeleton-loader__image {
  height: 200px !important;
}

.puzzles-skeleton .v-skeleton-loader__card-heading .v-skeleton-loader__heading {
  margin: 8px !important;
}
.puzzles-skeleton .v-skeleton-loader__heading {
  border-radius: 8px !important;
  height: 32px !important;
  width: 50% !important;
}
.puzzles-skeleton .v-skeleton-loader__bone {
  display: flex !important;
  justify-content: center !important;
}
.puzzles-skeleton .v-skeleton-loader .v-skeleton-loader__list-item {
  border-radius: 4px !important;
  padding: 0px 8px !important;
  height: 48px !important;
}
.puzzles-skeleton .v-skeleton-loader__text {
  border-radius: 6px !important;
  height: 42px !important;
  margin-top: 8px !important;
  margin-bottom: 8px !important;
  background: transparent !important;
  border: 3px rgba(255, 255, 255, 0.12) solid !important;
}
.puzzles-skeleton .v-skeleton-loader__actions {
  padding: 1px !important;
  text-align: center !important;
  display: flex !important;
  justify-content: space-between !important;
}
.puzzles-skeleton .v-skeleton-loader__button {
  width: 134px !important;
  margin: 8px !important;
  height: 34px !important;
  background: transparent !important;
  border: 3px rgba(255, 255, 255, 0.12) solid !important;
}
</style>