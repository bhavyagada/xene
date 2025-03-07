<template>
  <v-row>
    <v-row no-gutters class="editor-container" style="position: fixed">
      <v-toolbar class="px-0">
        <v-progress-linear
          rounded
          absolute
          bottom
          color="cyan"
          :value="progress"
          :indeterminate="query"
        ></v-progress-linear>
        <v-btn icon @click="onBackClick">
          <v-icon>mdi-arrow-left-bold-hexagon-outline</v-icon>
        </v-btn>
        <v-toolbar-title>{{ this.puzzle.name }}</v-toolbar-title>        

        <v-spacer></v-spacer>

        <v-tooltip bottom color="rgba(230,81,0,0.7)" dark offset-overflow>
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              large
              color="orange darken-4"
              @click="autoFormat"
              v-on="on"
              id="autoformat"
            >
              <v-icon>mdi-format-indent-increase</v-icon>
            </v-btn>
          </template>
          <span>Reformat Code</span>
        </v-tooltip>

        <v-tooltip bottom color="rgba(0,188,212,0.7)" dark offset-overflow>
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              large
              :color="tutorial_mode ? 'teal accent-3' : 'red accent-4' "
              @click="tutorialMode"
              v-on="on"
              id="open_tutorial"
            >
              <v-icon>mdi-help-rhombus-outline</v-icon>
            </v-btn>
          </template>
          <span>Tutorial Mode</span>
        </v-tooltip>

        <v-tooltip bottom color="rgba(0,188,212,0.7)" dark offset-overflow>
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              large
              color="cyan accent-3"
              @click="openTestsDialog"
              v-on="on"
              id="open_test_cases"
            >
              <v-icon>mdi-format-list-checks</v-icon>
            </v-btn>
          </template>
          <span>Test Cases</span>
        </v-tooltip>

        <span :class="['timer', {'red--text text--accent-4': time == 0}]">{{ pretty_time }}</span>

        <v-tooltip bottom left color="rgba(0,188,212,0.7)" dark offset-overflow>
          <template v-slot:activator="{ on }">
            <v-btn
              x-large
              icon
              color="teal accent-3"
              @click="runCode"
              :disabled="!code || query"
              v-on="on"
              id="execute"
            >
              <v-icon>mdi-google-play</v-icon>
            </v-btn>
          </template>
          <span>Execute</span>
        </v-tooltip>
      </v-toolbar>
      <v-snackbar
        :value="solve_snackbar.length > 0 && !hint_shown"
        top
        color="cyan darken-4"
        :timeout="0"
        id="solve_snackbar"
        style="top: 63px"
      >
        <span class="text-center px-1" v-html="solve_snackbar"></span>
        <v-icon color="red accent-4" @click="hint_shown = true; solve_snackbar = ''">mdi-close</v-icon>
      </v-snackbar>

      <v-col cols="12">
        <div class="example" style="width: 100vw;">
          <client-only>
            <codemirror
              ref="editor"
              class="codemirror"
              v-model="code"
              @cursorActivity="onCursorActivity"
              style="width: 100vw;"
            />
          </client-only>
        </div>

        <div class="text-center">
          <v-bottom-sheet hide-overlay v-model="alert">
            <v-sheet>
              <v-card tile>
                <v-progress-linear :value="100" class="my-0" height="3" color="red accent-4"></v-progress-linear>
                <v-list>
                  <v-list-item>
                    <v-list-item-avatar>
                      <v-icon color="red accent-4">mdi-alert</v-icon>
                    </v-list-item-avatar>

                    <v-list-item-content>
                      <v-list-item>
                        <span class="red--text text--accent-4">{{ error_alert }}</span>
                      </v-list-item>
                    </v-list-item-content>

                    <v-list-item-icon>
                      <v-btn icon @click="alert = !alert">
                        <v-icon color="red accent-4">mdi-close-circle</v-icon>
                      </v-btn>
                    </v-list-item-icon>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-sheet>
          </v-bottom-sheet>
        </div>

        <!--Keyboard Skeleton Loader-->
        <v-skeleton-loader
          v-if="skeleton_loading"
          class="keyboard-skeleton"
          type="button@6, button@6, button@6, button@5"
        ></v-skeleton-loader>
        <client-only>
          <SimpleKeyboard
            ref="keyboard"
            v-if="! tutorial_mode"
            @onChange="onChange"
            @deleteToken="deleteToken"
            @addToken="addToken"
            @addLine="addLine"
            @onInit="onInit"
            :block_context="block_context"
            :tutorial_mode="tutorial_mode"
          ></SimpleKeyboard>
          <SimpleKeyboard
            ref="tutorial_keyboard"
            v-if="tutorial_mode"
            @deleteToken="tutorialAddToken('{bksp}')"
            @addToken="tutorialAddToken"
            @addLine="tutorialAddToken('{enter}')"
            @onInit="onInit"
            :block_context="block_context"
            :tutorial_mode="tutorial_mode"
          ></SimpleKeyboard>
        </client-only>
      </v-col>
    </v-row>

    <v-dialog v-model="tests_dialog" fullscreen scrollable v-if="tests_dialog">
      <v-card>
        <v-card-text
          :class="{ scrollbar: $device.isDesktop }"
          style="height: 99vh; padding: 0px; max-width: 750px; margin: auto"
        >
          <v-list class="py-1">
            <v-subheader class="cyan--text" style="border: 1px solid; border-radius: 10px">
              <v-btn color="cyan" large icon @click="onBackClick">
                <v-icon>mdi-arrow-left-bold-hexagon-outline</v-icon>
              </v-btn>
              {{ puzzle.name }} Description and Test Cases
              <v-spacer />
              <v-btn icon color="error" v-if="time != 0" @click="tests_dialog = !tests_dialog">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-subheader>
            <blockquote class="blockquote py-2 pl-4">{{ puzzle.description }}</blockquote>

            <template v-if="puzzle">
              <div class="d-flex justify-space-around">
                <span
                  :class="['headline light-blue--text align-center pa-1',{'ml-6' : test_case_results.visible.length}]"
                >input</span>
                <span
                  :class="['headline teal--text text--accent-3 align-center pa-1', {'ml-6': test_case_results.visible.length}]"
                >goal</span>
                <template v-if="test_case_results.visible.length">
                  <span class="headline cyan--text align-center pa-1" color="light-blue">output</span>
                  <span class="headline align-center pa-1"></span>
                </template>
              </div>
              <v-list-item
                v-for="(item, i) in test_cases"
                :key="i"
                class="d-flex justify-space-around"
              >
                <v-tooltip bottom color="cyan darken-4" dark offset-overflow>
                  <template v-slot:activator="{ on }">
                    <v-list-item-title
                      class="breadcrumb"
                      v-on="on"
                    >{{ (item.I.length > breadcrumb_char) ? item.I.substring(0, breadcrumb_char - 3) + '...' :item.I }}</v-list-item-title>
                  </template>
                  <span>{{ item.I }}</span>
                </v-tooltip>

                <v-tooltip bottom color="teal darken-1" dark offset-overflow>
                  <template v-slot:activator="{ on }">
                    <v-list-item-title
                      class="breadcrumb"
                      v-on="on"
                    >{{ (item.O.length > breadcrumb_char) ? item.O.substring(0, breadcrumb_char - 3) + '...' :item.O }}</v-list-item-title>
                  </template>
                  <span>{{ item.O }}</span>
                </v-tooltip>

                <template v-if="test_case_results.visible.length">
                  <v-tooltip bottom color="light-blue darken-3" dark offset-overflow>
                    <template v-slot:activator="{ on }">
                      <v-list-item-title
                        class="text-center light-blue lighten-1 py-3 px-0"
                        v-on="on"
                        v-if="test_case_results.visible.length"
                        style="border-radius: 10px;"
                      >{{ test_case_results.visible[i].Output }}</v-list-item-title>
                    </template>
                    <span
                      v-if="test_case_results.visible.length"
                    >{{ test_case_results.visible[i].Output }}</span>
                  </v-tooltip>

                  <v-list-item-title class="text-center">
                    <v-icon
                      large
                      color="teal accent-3"
                      v-if="test_case_results.visible[i].Result"
                    >mdi-check</v-icon>
                    <v-icon large color="red darken-4" v-else>mdi-close</v-icon>
                  </v-list-item-title>
                </template>
              </v-list-item>

              <v-progress-linear
                :value="hidden_progress"
                color="red accent-4"
                height="35"
                class="title mt-1"
                v-if="time != 0"
                reactive
              >Hidden Test Cases [{{ hidden_progress }}%]</v-progress-linear>

              <v-skeleton-loader
                :loading="skeleton_loading"
                class="ma-1 button-skeleton"
                :type="'actions'"
              >
                <div class="d-flex justify-space-around">
                  <v-btn
                    class="ma-0 mt-2 pa-2 light-blue--text text--accent-1"
                    outlined
                    ripple
                    @click="tutorialMode"
                    v-if="time == 0"
                    style="width: 47%;"
                  >
                    <v-icon left>mdi-help-rhombus-outline</v-icon>Tutorial
                  </v-btn>

                  <v-btn
                    class="ma-0 mt-2 pa-2 teal--text text--accent-3"
                    outlined
                    ripple
                    @click="startPuzzle"
                    v-if="time == 0"
                    style="width: 47%;"
                  >
                    Solve
                    <v-icon right>mdi-play-outline</v-icon>
                  </v-btn>
                </div>
              </v-skeleton-loader>
            </template>
          </v-list>
          <span
            class="d-flex justify-center align-center mt-2"
            v-html="puzzle.hints"
            v-if="detectHintType(puzzle.hints)"
          ></span>
          <v-expansion-panels accordion focusable hover v-else>
            <v-expansion-panel v-for="(hint, index) in JSON.parse(puzzle.hints)" :key="index">
              <v-expansion-panel-header class="py-0">
                <span class="teal--text text--accent-4">
                  <v-icon color="orange" left>mdi-information-outline</v-icon>
                  Hint {{ index + 1 }}
                </span>
                <template v-slot:actions>
                  <v-icon color="light-blue">mdi-chevron-down</v-icon>
                </template>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <span v-html="hint"></span>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialog" fullscreen persistent v-if="dialog">
      <v-card class="justify-center score-card" color="grey darken-4">
        <vue-particles
          color="#1DE9B6"
          :particleOpacity="0.6"
          :particlesNumber="100"
          shapeType="circle"
          :particleSize="2"
          linesColor="#64FFDA"
          :linesWidth="2"
          :lineLinked="true"
          :lineOpacity="0.6"
          :linesDistance="50"
          :moveSpeed="4"
          :hoverEffect="true"
          hoverMode="grab"
          :clickEffect="true"
          clickMode="push"
        ></vue-particles>

        <v-card-text class="px-1" style="max-width: 650px; margin: auto">
          <div class="d-flex justify-space-between align-center">
            <v-btn class="cyan--text" style="width: 30%;" outlined ripple @click="onBackClick">
              <v-icon left>mdi-arrow-left-bold-hexagon-outline</v-icon>Puzzles
            </v-btn>

            <Lottie
              v-if="dialog"
              :animationData="require('~/assets/jsons/lottie/score.json')"
              :height="125"
              :width="125"
            />
            <v-btn
              class="ma-0 mt-2 pa-2 teal--text text--accent-3"
              outlined
              ripple
              style="width: 30%;"
              @click="$store.state.puzzles.length > parseInt($route.params.id) ? $router.push('/solve/' + (parseInt($route.params.id) + 1)) : $router.push('/challenges')"
            >
              {{ $store.state.puzzles.length > parseInt($route.params.id) ? 'Next': 'Done' }}
              <v-icon right>mdi-page-next-outline</v-icon>
            </v-btn>
          </div>

          <div style="height: 35vh;">
            <RadarChart v-if="dialog" :radar_data="radar_data"></RadarChart>
          </div>
          <div class="d-flex justify-center white--text" style="font-size:11px !important;">
            <span>
              <v-btn class="mx-2" depressed x-small icon disabled>
                <v-icon :style="'color: ' + radar_data.options[0] + ' !important'">mdi-square</v-icon>
              </v-btn>Best Score
              <span v-if="!dialogText.new">
                <v-btn class="mx-2" depressed x-small icon disabled>
                  <v-icon :style="'color: ' + radar_data.options[2] + ' !important'">mdi-square</v-icon>
                </v-btn>Previous Score
              </span>
              <v-btn class="mx-2" depressed x-small icon disabled>
                <v-icon :style="'color: ' + radar_data.options[1] + ' !important'">mdi-square</v-icon>
              </v-btn>Your Score
            </span>
          </div>
          <v-list-item class="px-2">
            <v-list-item-content>
              <v-list-item-title class="subtitle-1">
                Time:
                <span :class="score_flags.time">
                  <ICountUp :endVal="dialogText.time" :options="options" :class="score_flags.time" />
                </span>
              </v-list-item-title>
              <v-list-item-title class="subtitle-1">
                Edits:
                <span :class="score_flags.edits">
                  +
                  <ICountUp
                    :endVal="dialogText.edits"
                    :options="options"
                    :class="score_flags.edits"
                  />
                </span>
              </v-list-item-title>
              <v-list-item-title class="subtitle-1">
                Conciseness:
                <span :class="score_flags.conciseness">
                  +
                  <ICountUp
                    :endVal="dialogText.conciseness"
                    :options="options"
                    :class="score_flags.conciseness"
                  />
                </span>
              </v-list-item-title>
              <v-list-item-title class="subtitle-1">
                Complexity:
                <span :class="score_flags.complexity">
                  +
                  <ICountUp
                    :endVal="dialogText.complexity"
                    :options="options"
                    :class="score_flags.complexity"
                  />
                </span>
              </v-list-item-title>
              <v-divider />
              <v-list-item-title class="headline">
                <span :class="score_flags.score">Score:</span>
                <span class="float-right">
                  <ICountUp
                    :endVal="dialogText.score"
                    :options="options"
                    :class="score_flags.score"
                  />
                </span>
              </v-list-item-title>
              <v-divider />
            </v-list-item-content>
          </v-list-item>
          <div class="unlocked text-center">
            <span v-for="unlocked_key in JSON.parse(puzzle.keys)" :key="unlocked_key">
              <v-chip
                :id="unlocked_key"
                @click="unlockedTutorial($event)"
                class="ma-2 pulse"
                color="cyan lighten-2"
                outlined
              >
                <v-avatar left>
                  <v-icon class="cyan--text text--lighten-2">mdi-lock-open-check</v-icon>
                </v-avatar>
                <span class="green--text text--accent-2">{{ unlocked_key }}</span>
              </v-chip>
            </span>
          </div>
          <v-snackbar
            :value="key_snackbar"
            bottom
            color="teal"
            :timeout="0"
            v-if="$route.params.id == 1"
          >
            Click on the
            <v-chip class="ma-2 pulse" color="cyan lighten-2" outlined>
              <v-avatar left>
                <v-icon class="cyan--text text--lighten-2">mdi-lock-open-check</v-icon>
              </v-avatar>
            </v-chip>keys above to learn their syntax
            <v-icon color="red accent-4" @click="key_snackbar = ! key_snackbar">mdi-close</v-icon>
          </v-snackbar>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-bottom-sheet hide-overlay v-model="changes_alert">
      <v-sheet>
        <v-card tile>
          <v-list>
            <v-list-item>
              <v-list-item-avatar>
                <v-icon x-large color="red">mdi-alert-octagon</v-icon>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item>
                  <span class="red--text">You have unsaved changes!<br>Do you still want to leave?</span>
                </v-list-item>
              </v-list-item-content>

              <v-list-item-icon>
                <v-btn large icon @click="to = null; changes_alert = !changes_alert">
                  <v-icon color="red">mdi-close-circle</v-icon>
                </v-btn>
                <v-btn large icon @click="changes_alert = false; $router.push(to)">
                  <v-icon color="teal accent-4">mdi-check</v-icon>
                </v-btn>
              </v-list-item-icon>
            </v-list-item>
          </v-list>
        </v-card>
      </v-sheet>
    </v-bottom-sheet>
  </v-row>
</template>

<script>
import SimpleKeyboard from '~/components/SimpleKeyboard.vue'
import Lottie from '~/components/Lottie.vue'
import RadarChart from '~/components/RadarChart.vue'
import 'intro.js/minified/introjs.min.css'
import 'intro.js/themes/introjs-modern.css'
import { radar } from '~/utils/chart-utils'

const introJS = require('intro.js')

export default {
  middleware: ['auth'],

  components: {
    SimpleKeyboard,
    Lottie,
    RadarChart
  },
  head() {
    return {
      title:
        'Solve - ' +
        this.$store.state.puzzles.find(x => x.id == this.$route.params.id).name
    }
  },
  data: function() {
    return {
      skeleton_loading: true,
      solve_snackbar: '',
      hint_shown: false,
      key_snackbar: false,
      radar_data: null,
      code: '',
      block_context: false,
      tutorial_mode: false,
      time: 0,
      edits: 0,
      timer: null,
      tests_dialog: false,
      // @TODO Modularize and minify JSON
      dialogText: '',
      score_flags: {
        time: 'cyan--text text--lighten-2 float-right',
        edits: 'cyan--text text--lighten-2 float-right',
        conciseness: 'cyan--text text--lighten-2 float-right',
        complexity: 'cyan--text text--lighten-2 float-right',
        score: 'teal--text text--accent-3'
      },
      test_case_results: { visible: [], hidden: [] },
      query: false,
      alert: false,
      to: null,
      changes_alert: false,
      error_alert: '',
      breadcrumb_char: 1,
      dialog: false,
      options: {
        useEasing: true,
        useGrouping: false,
        separator: ',',
        duration: '5'
      }
    }
  },
  beforeCreate() {
    this.$store.dispatch('setLoading', false)
  },
  mounted() {
    let vm = this
    setTimeout(function() {
      vm.setCodeMirrorHeight()
      window.addEventListener('resize', function() {
        vm.setCodeMirrorHeight()
      })
      document.addEventListener('fullscreenchange', function() {
        vm.setCodeMirrorHeight()
      })
      // if (vm.$device.isDesktop) {
      //   vm.$refs.editor.codemirror.setOption('readOnly', false)
      // }
    }, 1000)
    this.$nextTick(function() {
      this.openTestsDialog()
    })
    this.$axios
      .post(`api/puzzles/1/interpret`, {
        serializedCode: '1'
      })
      .then(res => {
        // Wake up Go Interpreter from hibernation
      })
      .catch(err => console.log(err))
  },
  beforeRouteLeave(to, from, next) {    
    if (this.time == 0 || this.to) {
      next()
    } else {
      this.to = to
      this.tests_dialog = false
      this.changes_alert = true
    }
  },
  computed: {
    puzzle: function() {
      return this.$store.getters.puzzle(this.$route.params.id)
    },
    test_cases: function() {
      return JSON.parse(this.puzzle.test_cases).visible
    },
    serializedCode: function() {
      return this.code.replace(/\n/g, ' ')
    },
    pretty_time: function() {
      let minutes = Math.floor(this.time / 60)
      let seconds = this.time - minutes * 60
      return (
        this.str_pad_left(minutes, '0', 2) +
        ':' +
        this.str_pad_left(seconds, '0', 2)
      )
    },
    progress: function() {
      return (
        this.progress_utility(this.test_case_results.visible) +
        this.hidden_progress
      )
    },
    hidden_progress: function() {
      return this.progress_utility(this.test_case_results.hidden)
    }
  },
  methods: {
    detectHintType(hint) {
      return /.*(<span.*\s*>*)+.+/g.test(hint)
    },
    setCodeMirrorHeight: function() {
      let nav = getComputedStyle(document.querySelector('.v-app-bar'))
      let toolbar = getComputedStyle(
        document.querySelector('.editor-container>.v-toolbar')
      )

      let editorHeight =
        window.innerHeight -
        parseInt(nav.height) -
        parseInt(toolbar.height) -
        190
      document.querySelector('.example').style.height = editorHeight + 'px'
      document.querySelector('.CodeMirror').style.height = editorHeight + 'px'
    },
    unlockedTutorial: function(event) {
      document.querySelector('.v-app-bar.v-app-bar--fixed').style.zIndex =
        'unset'
      this.tutorialAddToken(event.currentTarget.id, 1)
    },
    startTimer: function() {
      this.timer = setInterval(() => {
        this.time++
      }, 1000)
    },
    tutorialMode: function() {
      if (this.time == 0) {
        this.startTimer()
      }
      this.tutorial_mode = !this.tutorial_mode
      let vm = this
      if (this.tutorial_mode) {
        this.block_context = false
        let intro = introJS()
        let setoptions = {
          showProgress: true,
          hideNext: true,
          hidePrev: true,
          // exitOnEsc: false,
          exitOnOverlayClick: false,
          overlayOpacity: 0.98,
          helperElementPadding: -4,
          showStepNumbers: false,
          showBullets: false
        }
        intro.setOptions(setoptions)
        intro
          .setOptions({
            steps: [
              {
                element: document.querySelector('#open_tutorial'),
                intro:
                  '<b style="color:#00bcd4">Tutorial Mode</b><br><button type="button" class="v-btn v-btn--flat v-btn--icon v-btn--round theme--dark v-size--large teal--text text--accent-3" style="color: #1de9b6"><span class="v-btn__content"><i aria-hidden="true" class="v-icon notranslate mdi mdi-help-rhombus-outline theme--dark"></i></span></button>on for <span style="color:#2dbcad">syntax</span><br><button type="button" class="v-btn v-btn--flat v-btn--icon v-btn--round theme--dark v-size--large teal--text text--accent-3" style="color: red"><span class="v-btn__content"><i aria-hidden="true" class="v-icon notranslate mdi mdi-help-rhombus-outline theme--dark"></i></span></button>off to <span style="color:#2dbcad">solve</span>'
              },
              {
                element: document.querySelector('#open_test_cases'),
                intro:
                  '<b style="color:#00bcd4">Test Cases</b><br><span style="color:#03A9F4">input</span>-<span style="color:#1DE9B6">goal</span><br>vs.<br><span style="color:#4DD0E1">output</span>'
              },
              {
                element: document.querySelector('.simple-keyboard'),
                intro:
                  '<b style="color:#00bcd4">Predictive Programming Keyboard</b><br><span style="color:#2dbcad">Typing code is a thing of the past</span><br>Click your code to solve'
              },
              {
                element: document.querySelector('.vue-codemirror.codemirror'),
                intro:
                  '<b style="color:#00bcd4">Code Editor</b><br><span style="color:#2dbcad">Read-only code highlighter with automatic formatting/indentation</span>'
              },
              {
                element: document.querySelector('#execute'),
                intro:
                  '<b style="color:#00bcd4">Execute</b><br><span style="color:#2dbcad">Run your code &<br> view output / errors</span>'
              }
            ]
          })
          .exit()
          .onchange(function(targetElement) {
            if (this._currentStep == 0) {
              vm.tests_dialog = false
              document.querySelector('.simple-keyboard').style.pointerEvents =
                'none'
            }
          })
          .onexit(function(targetElement) {
            if (!this.hint_shown)
              setTimeout(function() {
                vm.fetchPuzzleSnackbar()
              }, 1000)
            document.querySelector('.simple-keyboard').style.pointerEvents =
              'unset'
          })
          .start()
      } else {
        this.setBlockContext()
        let vm = this
        if (!this.hint_shown)
          setTimeout(function() {
            vm.fetchPuzzleSnackbar()
          }, 3000)
      }
    },
    showScore: function() {
      this.$axios
        .get(`api/analytics/puzzles/${this.$route.params.id}/best_score`)
        .then(res => {
          this.radar_data = radar(
            res.data,
            this.dialogText,
            1,
            !this.dialogText.new
          )
          this.dialog = true
          this.key_snackbar = true
        })
        .catch(err => console.log(err))
    },
    isOldScoreBetter(attributes) {
      attributes.forEach(attribute => {
        if (this.dialogText[attribute] < this.dialogText.old_score[attribute])
          this.score_flags[attribute] = 'red--text text--lighten-1 float-right'
      })
    },
    setRadarColors: function() {
      if (!this.dialogText.new) {
        this.isOldScoreBetter(['time', 'edits', 'complexity', 'conciseness'])
        if (this.dialogText.score < this.dialogText.old_score.score) {
          this.score_flags.score = 'red--text text--lighten-1'
        }
      }
    },
    progress_utility: function(results) {
      if (results.length == 0) return 0
      let successes = 0
      results.forEach(function(item, index) {
        if (item.Result) successes++
      })
      return (successes / results.length) * 100
    },
    onBackClick() {
      this.changes_alert = true
      this.$router.push('/challenges/' + this.puzzle.challengeId)
    },
    openTestsDialog() {
      let font_constant
      if (this.test_case_results.visible.length) font_constant = 1.7
      else font_constant = 2.2
      if (process.client)
        this.breadcrumb_char = Math.ceil(
          (0.25 * Math.min(window.innerWidth, 950)) / (16 / font_constant)
        )
      this.tests_dialog = !this.tests_dialog
    },
    fetchPuzzleSnackbar() {
      let hints = JSON.parse(JSON.stringify(this.$store.state.solve_hints))
      let hintIndex = Object.keys(hints).findIndex(
        val => val == this.$route.params.id
      )
      this.solve_snackbar = hintIndex >= 0 ? hints[this.$route.params.id] : ''
    },
    startPuzzle() {
      let vm = this
      this.startTimer()
      this.tests_dialog = !this.tests_dialog
      setTimeout(function() {
        vm.fetchPuzzleSnackbar()
      }, 3000)
    },
    runCode() {
      clearInterval(this.timer)
      this.query = true
      this.alert = false
      this.$axios
        .post(`api/puzzles/${this.puzzle.id}/interpret`, {
          serializedCode: this.code
        })
        .then(res => {
          if (res.data.Success) {
            this.test_case_results.visible = res.data.TestCaseResult
            this.test_case_results.hidden = res.data.HiddenTestCaseResult

            for (let i in res.data.TestCaseResult) {
              if (!res.data.TestCaseResult[i].Result) {
                let message = res.data.TestCaseResult[i].Message
                if (message == 'Result is not matching expected result') {
                  this.openTestsDialog()
                } else {
                  this.error_alert = message
                  this.alert = true
                }
                this.query = false
                this.startTimer()
                return
              }
            }
            for (let i in res.data.HiddenTestCaseResult) {
              if (!res.data.HiddenTestCaseResult[i].Result) {
                let message = res.data.HiddenTestCaseResult[i].Message
                if (message == 'Result is not matching expected result') {
                  this.openTestsDialog()
                } else {
                  this.error_alert = message
                  this.alert = true
                }
                this.query = false
                this.startTimer()
                return
              }
            }
            let tokens = res.data.Tokens

            this.$axios
              .post(`api/user/puzzles/${this.$route.params.id}`, {
                code: this.code,
                edits: this.edits,
                time: Math.floor(this.time / 60),
                tokens
              })
              .then(res => {
                this.dialogText = res.data
                this.setRadarColors()
                this.showScore()
                this.query = false
              })
              .catch(err => console.log(err))
          } else {
            this.test_case_results = { visible: [], hidden: [] }
            let message = res.data.Message
            if (typeof message === 'string' || message instanceof String) {
              this.error_alert = message
            } else {
              this.error_alert = 'Possible infinite loop or timeout'
            }
            this.alert = true
            this.startTimer()
            this.query = false
          }
        })
        .catch(err => { 
            this.error_alert = 'Possible infinite loop or timeout'          
            this.alert = true
            this.startTimer()
            this.query = false
        })
    },
    str_pad_left(string, pad, length) {
      return (new Array(length + 1).join(pad) + string).slice(-length)
    },
    onChange(input) {
      this.edits += 1
    },
    onCursorActivity(cm) {
      this.setBlockContext()
    },
    setBlockContext() {
      let cm = this.$refs.editor.codemirror
      let line = cm.getCursor().line
      let initial_spaces = this.getInitialSpaces(line)
      this.block_context =
        cm.getLineTokens(line).length > initial_spaces ? true : false
    },
    autoFormat() {
      let cm = this.$refs.editor.codemirror

      cm.setValue(this.cleanLine(cm.getValue().trim().replace(/\s+/gm, ' ')))
      cm.autoFormatRange(
        { line: 0, ch: 0 },
        { line: 0, ch: cm.getLine(0).length - 1 }
      )
      cm.setCursor({ line: 0, ch: 0 })
    },
    onInit() {
      //keyboard initialized
      this.skeleton_loading = false
    },
    setKBInput() {
      // this.$refs.keyboard.keyboard.setInput(this.$refs.editor.codemirror.getValue())
    },
    getInitialSpaces(line) {
      let cm = this.$refs.editor.codemirror
      let initial_spaces = 0
      let tokens = cm.getLineTokens(line)

      if (tokens.length == 0) return 0

      tokens.every(token => {
        if (token.string != ' ') {
          initial_spaces = token.start
          return false
        }
        return true
      })
      if (initial_spaces == 0 && tokens[0].string == ' ') return tokens.length
      else return initial_spaces
    },
    trimLine(line, firstPart) {
      line = firstPart ? line.trimStart() : line.trimEnd()
      return line.replace(/\s+/gm, ' ')
    },
    cleanLine(line) {
      return line
        .replace(/\s+(?:((,|;|\+\+|--)+))+/g, '$1') // remove space before comma, semicolon, ++, --
        .replace(/( +)(\.)( +)(\w+)/g, '$2$4 ') // remove space before and after dot operator
        .replace(/([\[\(]+)(\s+)/g, '$1') // remove space inside opening square/round bracket
        .replace(/(\s+)([\]\)]+)/g, '$2') // remove space inside closing square/round bracket
        .replace(/(\d+)(\s+)(\d+)/, '$1$3') // remove space between numbers
    },
    formatLine(
      for_token,
      line_to_fix,
      token,
      button,
      tokens,
      line_tokens,
      initial_spaces
    ) {
      let cm = this.$refs.editor.codemirror
      let line = cm.getLine(line_to_fix)

      let space = for_token ? ' ' : ''
      line =
        line.substring(0, token.end) +
        space +
        button +
        space +
        line.substring(token.end)

      let start = line.substring(0, token.end + button.length + space.length)
      let start_result = this.cleanLine(this.trimLine(start, true))

      let end = line.substring(token.end + button.length + space.length)
      let end_result = this.cleanLine(this.trimLine(end, false))

      let semicolon =
        [';', '}', ...tokens].indexOf(button) < 0 &&
        line_tokens.filter(
          tok => [';', '}', ...tokens].indexOf(tok.string) >= 0
        ).length == 0
          ? ';'
          : ''

      cm.replaceRange(
        ' '.repeat(initial_spaces) + start_result + end_result + semicolon,
        {
          line: line_to_fix,
          ch: 0
        },
        {
          line: line_to_fix,
          ch: cm.getLine(line_to_fix).length
        }
      )
      cm.setCursor({
        line: line_to_fix,
        ch: initial_spaces + start_result.length
      })
    },
    addToken(button) {
      let cm = this.$refs.editor.codemirror
      let cursor = cm.getCursor()
      let token = cm.getTokenAt(cursor)
      let line = cm.getLine(cursor.line)
      let initial_spaces = this.getInitialSpaces(cursor.line)

      let tokens = ['if', 'else', 'while', 'foreach', 'function']
      let line_tokens = cm.getLineTokens(cursor.line)
      let matches = {
        '(': ')',
        '[': ']',
        '"': '"',
        '{': '}'
      }

      if (tokens.indexOf(button) >= 0) {
        // If you're starting a decision or loop block
        if (token.string == '}') {
          // If you're typing near a closing bracket
          cm.replaceRange('\n', {
            line: cursor.line,
            ch: token.end
          })
          cursor = cm.getCursor()
          token = cm.getTokenAt(cursor)
        }

        if (button == 'else') {
          cm.replaceRange(
            button + ' {\n' + ' '.repeat(initial_spaces + 2) + '\n}',
            {
              line: cursor.line,
              ch: token.end
            }
          )
          cm.indentLine(cursor.line + 2, 'smart')
          cm.setCursor({
            line: cursor.line + 1,
            ch: initial_spaces + 2
          })
        } else {
          cm.replaceRange(button + ' {\n}', {
            line: cursor.line,
            ch: token.end
          })
          cm.indentLine(cursor.line, 'smart')
          cm.indentLine(cursor.line + 1, 'smart')

          cm.setCursor({
            line: cursor.line,
            ch: token.end + button.length
          })
        }
        return
      } else if (/".*"/.test(token.string)) {
        // If you're typing inside double quotes
        cm.replaceRange(button, {
          line: cursor.line,
          ch: cursor.ch
        })
        cm.setCursor({ line: cursor.line, ch: cursor.ch + button.length })
        return
      } else if ((/^f[0-9]+$/.test(button)) || (['sort_with','push','insert','remove','new_list','fill','map','mod','abs','pow','max','min'].indexOf(button) >= 0)) {
        // If you're typing a custom function
        if (cm.getLine(cursor.line).indexOf('function') >= 0) {
          // If you're defining a custom function
          cm.replaceRange(' ' + button + ' : ', {
            line: cursor.line,
            ch: cursor.ch
          })
          cm.setCursor({ line: cursor.line, ch: cursor.ch + button.length + 4 })
        } else {
          // If you're calling a custom function
          cm.replaceRange(button + '()', {
            line: cursor.line,
            ch: cursor.ch
          })
          cm.setCursor({ line: cursor.line, ch: cursor.ch + button.length + 1 })
        }
        cm.indentLine(cursor.line, 'smart')
        return
      } else if (matches[button] !== undefined) {
        // If you're opening a curly bracket
        if (button == '{') {
          cm.replaceRange(' {\n }', {
            line: cursor.line,
            ch: token.end
          })
          cm.indentLine(cursor.line, 'smart')
          cm.indentLine(cursor.line + 1, 'smart')
          cm.setCursor({ line: cursor.line, ch: cm.getLine(cursor.line) })
        } else {
          // If you're opening a round/square bracket or double quotes
          let ch
          if (token.string == ';' || token.string == '{') {
            ch = token.start
          } else {
            ch = token.end
          }
          // If it's a square bracket, check if the previous token is =/op to add or avoid space
          let space = button == '[' && token.type != 'operator' ? '' : ' '
          cm.replaceRange(space + button + matches[button] + ' ', {
            line: cursor.line,
            ch
          })
          cm.setCursor({ line: cursor.line, ch: ch + 1 + space.length })
        }
        return
      }

      if ([';', '{'].indexOf(token.string) >= 0) {
        // If you're typing near a semicolon
        token.end = token.start
      }

      this.formatLine(
        true,
        cursor.line,
        token,
        button,
        tokens,
        line_tokens,
        initial_spaces
      )
    },
    deleteToken() {
      let cm = this.$refs.editor.codemirror
      let cursor = cm.getCursor()
      let token = cm.getTokenAt(cursor)
      let old_cursor = cursor
      /*
      if (['{', '}', '[', ']', '(', ')'].indexOf(token.string) >= 0) {
        // If you're deleting any kind of bracket, find its matching bracket and delete the entire block
        let section = cm.findMatchingBracket(cursor)
        if (section.match) {
          // If you find a matching bracket
          if (section.from.line < section.to.line) {
            // If it's an opening bracket
            cm.replaceRange(
              '',
              {
                line: section.from.line,
                ch: 0
              },
              { line: section.to.line, ch: cm.getLine(section.to.line).length }
            )
          }
          if (section.from.line == section.to.line) {
            // If it's a square or round bracket i.e. on the same line
            cm.replaceRange(
              '',
              {
                line: section.from.line,
                ch: Math.min(section.from.ch, section.to.ch)
              },
              {
                line: section.to.line,
                ch: Math.max(section.from.ch, section.to.ch) + 1
              }
            )
          } else {
            // If it's a closed bracket
            cm.replaceRange(
              '',
              {
                line: section.to.line,
                ch: 0
              },
              {
                line: section.from.line,
                ch: cm.getLine(section.from.line).length
              }
            )
          }
          return
        }
      }
      */
      if (token.string === '') {
        // If you didn't find any token at the cursor
        let line_changed = false
        while (!cm.getLine(cursor.line) && cursor.line != 0) {
          // Loop through all blank lines in a row
          line_changed = true
          cm.setCursor({
            line: cursor.line - 1,
            ch: cm.getLine(cursor.line - 1)
              ? cm.getLine(cursor.line - 1).length
              : 0
          })
          cursor = cm.getCursor()
          token = cm.getTokenAt(cursor)
        }
        if (line_changed) {
          // If you looped through any blank lines
          cm.replaceRange(
            '',
            {
              line: cursor.line,
              ch: cm.getLine(cursor.line) ? cm.getLine(cursor.line).length : 0
            },
            { line: old_cursor.line, ch: cm.getTokenAt(old_cursor).end }
          )
        } else {
          // If you were at the line already
          cm.replaceRange(
            '',
            {
              line: Math.max(0, cursor.line - 1),
              ch: cm.getLine(cursor.line - 1)
                ? cm.getLine(cursor.line - 1).length
                : 0
            },
            { line: old_cursor.line, ch: cm.getTokenAt(old_cursor).end }
          )
        }
      } else {
        while (token.string === ' ') {
          // Loop through all blank spaces in a row
          cm.setCursor({ line: cursor.line, ch: token.start })
          cursor = cm.getCursor()
          token = cm.getTokenAt(cursor)
        }
        cm.replaceRange(
          '',
          { line: cursor.line, ch: token.start },
          {
            line: old_cursor.line,
            ch: cm.getTokenAt(old_cursor).end
          }
        )
      }
    },
    addLine() {
      let cm = this.$refs.editor.codemirror
      let cursor = cm.getCursor()
      let token = cm.getTokenAt(cursor)
      let tokens = ['if', 'else', 'while', 'foreach', 'function']
      let line_tokens = cm.getLineTokens(cursor.line)
      if (!cm.getLine(cursor.line)) {
        // If the line is blank, add a new line and move on to next line
        cm.replaceRange('\n', { line: cursor.line, ch: token.end })
        cm.setCursor({ line: cursor.line + 1, ch: 0 })
        return
      }

      let ch = 0
      let initial_spaces = this.getInitialSpaces(cursor.line)
      let filtered_brackets = cm
        .getLineTokens(cursor.line)
        .filter(token => ['{', '}'].indexOf(token.string) > -1)

      if (cursor.ch <= initial_spaces) {
        // If cursor is before the first token
        cm.replaceRange('\n' + ' '.repeat(initial_spaces), {
          line: cursor.line,
          ch: cursor.ch
        })
        this.formatLine(
          false,
          cursor.line + 1,
          token,
          '',
          tokens,
          line_tokens,
          initial_spaces
        )
        cm.setCursor({ line: cursor.line, ch: initial_spaces })
        cm.indentLine(cursor.line + 1)
        return
      } else if (filtered_brackets.length > 0) {
        // If there's a block statement on the line, move on to next line
        // Don't add initial spaces if the block is closed
        let extra_spaces = filtered_brackets[0].string == '{' ? 2 : 0
        cm.replaceRange('\n' + ' '.repeat(initial_spaces + extra_spaces), {
          line: cursor.line,
          ch: cm.getLine(cursor.line).length
        })
        ch = initial_spaces + extra_spaces
      } else {
        let tokens = cm.getLineTokens(cursor.line)

        if (tokens.length > 0 && tokens[tokens.length - 1].string == ';') {
          // If the line has tokens and the last one is a semicolon, add a newline after the semicolon
          cm.replaceRange('\n' + ' '.repeat(initial_spaces), {
            line: cursor.line,
            ch: tokens[tokens.length - 1].end
          })
        } else {
          cm.replaceRange('\n' + ' '.repeat(initial_spaces), {
            line: cursor.line,
            ch: token.end
          })
        }
        ch = initial_spaces
      }
      this.formatLine(
        false,
        cursor.line,
        token,
        '',
        tokens,
        line_tokens,
        initial_spaces
      )
      cm.setCursor({ line: cursor.line + 1, ch: ch })
    },
    tutorialAddToken(button, flag) {
      let intro_keys = introJS()
      let key_syntax = require('~/assets/jsons/keys_syntax.json')
      let index = 0
      for (let i = 0; i < key_syntax.keys.length; ++i) {
        if (key_syntax.keys[i].name == button) {
          index = i
        }
      }
      let syntax = key_syntax.keys[index].syntax
      if (index == 0) {
        if (
          button.match(
            /(?:f1|f2|f3|f4|f5|f6|f7|f8|f9|f10|f11|f12|f13|f14|f15|f16)\b/
          )
        ) {
          index = 3
          syntax = key_syntax.keys[index].syntax.replace(/f1/g, button)
        } else if (button.match(/var_[a-o$][\w$]*/)) {
          index = 2
          syntax = key_syntax.keys[index].syntax.replace(/var_a/g, button)
        } else if (button.match(/[0-9]+/g)) {
          index = 1
          syntax = key_syntax.keys[index].syntax
        } else if (button.match(/[a-z]+/g)) {
          index = 4
          syntax = key_syntax.keys[index].syntax
        } else {
          syntax = button
        }
      }
      intro_keys
        .setOptions({
          exitOnOverlayClick: false,
          exitOnEsc: false,
          doneLabel: 'Close',
          showBullets: false,
          showStepNumbers: false,
          helperElementPadding: 5,
          steps: [
            {
              element:
                flag == 1
                  ? document.getElementById(button)
                  : document
                      .querySelector(
                        '[data-skbtn=' + CSS.escape(button) + ']>span'
                      )
                      .closest('div'),
              intro:
                '<b>Usage:- </b><br>' +
                syntax +
                '<br><b>Description:- </b><br>' +
                key_syntax.keys[index].description,
              position: 'top'
            }
          ]
        })
        .exit()
        .onexit(function(targetElement) {
          if (flag == 1)
            document.querySelector(
              '.v-app-bar.v-app-bar--fixed'
            ).style.zIndex = 5
        })
        .start()
    }
  },
  watch: {
    tests_dialog: function(val, oldVal) {
      // To avoid stopped timer if someone clicks the fullscreen button while the page is loading
      this.$nextTick(() => {
        if (val == false && oldVal == true && this.timer === null) {
          this.startTimer()
        }
      })
    }
  },
  validate({ params }) {
    // Must be a number
    return /^\d+$/.test(params.id)
  }
}
</script>

<style>
.button-skeleton .v-skeleton-loader__actions {
  padding: 1px !important;
  text-align: center !important;
  display: flex !important;
  justify-content: space-between !important;
}
.button-skeleton .v-skeleton-loader__button {
  width: 47% !important;
  margin: 8px !important;
  background: transparent !important;
  border: 3px rgba(255, 255, 255, 0.12) solid !important;
}
.keyboard-skeleton {
  bottom: 0;
  position: fixed !important;
  height: 175px !important;
  width: 100vw !important;
}
.keyboard-skeleton > .v-skeleton-loader__button {
  display: inline-block !important;
  margin: 0px 5px 0px 0px !important;
  height: 38px !important;
  border-radius: 5px !important;
  width: calc((100vw / 6) - 5px) !important;
}
.keyboard-skeleton :nth-child(6n) {
  margin: 0px !important;
  width: calc(100vw / 6) !important;
}
.keyboard-skeleton :nth-child(n + 19) {
  width: calc(20vw - 5px) !important;
}
.keyboard-skeleton :nth-child(23) {
  margin: 0px !important;
  width: 20vw !important;
}
.keyboard-skeleton :nth-child(n + 22) {
  background: transparent !important;
  border: 3px rgba(255, 255, 255, 0.12) solid !important;
}
.introjs-helperLayer {
  background: transparent !important;
}

.introjs-overlay {
  opacity: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
}

.introjs-helperLayer:before {
  content: '';
  position: fixed;
  width: inherit;
  height: inherit;
  border-radius: 0.5em;
  box-shadow: 0 0 0 1000em rgba(0, 0, 0, 0.7);
  opacity: 1;
}
.introjs-tooltipReferenceLayer {
  width: 100%;
}
.introjs-helperLayer:after {
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  position: fixed;
  z-index: 1000;
}

.introjs-tooltip {
  font-family: 'Share Tech Mono';
  background-color: rgba(0, 0, 0, 0.5) !important;
}

.introjs-helperNumberLayer {
  font-family: 'Share Tech Mono' !important;
  background: #00bcd4 !important;
  border: 2px solid #fff !important;
}
.introjs-button {
  font-family: 'Share Tech Mono' !important;
  font-weight: bold !important;
  font-size: 13px !important;
}
.introjs-progressbar {
  background: #00bcd4 !important;
}
.introjs-skipbutton {
  color: #607d8b !important;
}

.introjs-donebutton {
  color: #a3f7bf !important;
  margin-left: 5px;
  float: right;
}
.introjs-bullets ul li a {
  background: white !important;
}
.introjs-bullets ul li a.active {
  background: #2196f3 !important;
}
/* 
.o-editor {
  height: 42vh;
}
.o-editor-container {
  width: 100% !important;
  z-index: 0;
} */
.editor-container {
  z-index: 0;
}

.v-application code:before {
  content: '' !important;
}
.breadcrumb {
  list-style: none;
  color: #fff;
  float: left;
  display: block;
  position: relative;
  min-width: 25%;
  height: 40px;
  line-height: 40px !important;
  padding: 0px !important;
  text-align: center;
  margin-right: 15px;
  margin-left: 10px;
  background-color: #2dbcad;
  overflow: inherit !important;
}
.breadcrumb:before,
.breadcrumb:after {
  content: '';
  position: absolute;
  top: 0;
  border: 0 solid #2dbcad;
  border-width: 20px 10px;
  width: 0;
  height: 0;
  border-color: #2dbcad;
  border-left-color: transparent;
}
.breadcrumb:before {
  left: -20px;
  border-color: #2dbcad;
  border-left-color: transparent;
}
.breadcrumb:after {
  left: 100%;
  border-color: transparent;
  border-left-color: #2dbcad;
}
.breadcrumb:first-child {
  background-color: #00bcd4;
}
.breadcrumb:first-child:before {
  border-color: #00bcd4;
  border-left-color: transparent;
}
.breadcrumb:first-child:after {
  border-left-color: #00bcd4;
}

.example {
  display: flex;
  height: 40vh !important;
}

.example .codemirror,
.example .pre {
  width: 50%;
  height: 100%;
  margin: 0;
  /* overflow: auto; */
}

.example .pre {
  display: block;
  padding: 1rem;
  font-size: 1em;
  line-height: 1.6;
  word-break: break-all;
  word-wrap: break-word;
}
/*default size*/
.CodeMirror {
  height: 40vh;
}

.CodeMirror-overlayscroll-horizontal div {
  opacity: 0.2 !important;
}
.CodeMirror-overlayscroll-vertical div {
  opacity: 0.2 !important;
}
.CodeMirror-scrollbar-filler {
  opacity: 0.2 !important;
}
canvas.particles-js-canvas-el {
  height: 100vh !important;
  position: fixed !important;
}
.v-dialog {
  opacity: 0.98 !important;
}
.score-card {
  z-index: 999 !important;
}
.pulse {
  box-shadow: 0 0 0 0 rgba(77, 208, 225, 1);
  /* transform: scale(1); */
  animation: pulse-black 2s infinite;
}
@keyframes pulse-black {
  0% {
    /* transform: scale(0.95); */
    box-shadow: 0 0 0 0 rgba(77, 208, 225, 0.7);
  }

  70% {
    /* transform: scale(1); */
    box-shadow: 0 0 0 10px rgba(77, 208, 225, 0);
  }

  100% {
    /* transform: scale(0.95); */
    box-shadow: 0 0 0 0 rgba(77, 208, 225, 0);
  }
}
.introjs-tooltiptext {
  overflow-x: auto;
}
#solve_snackbar .v-snack__content {
  padding: 0;
}
.editor-container header .v-toolbar__content {
  padding-left: 0 !important;
}
</style>