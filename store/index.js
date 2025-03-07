export const state = () => ({
    challenges: [],
    puzzles: [],
    loading: true,
    solve_hints: {
        "2": `You don't have to save <span class="CodeMirror-code cm-s-custom" style="background: unset"><pre class="CodeMirror-line" style="display:inline;"><span class="cm-atom">input</span></pre></span> in another variable, you can use it directly`,
        "3": `If you don't write <span class="CodeMirror-code cm-s-custom" style="background: unset"><pre class="CodeMirror-line" style="display:inline;"><span class="cm-keyword">return</span></pre></span>, the last modified variable gets returned by default`,
        "4": `When typing <span class="CodeMirror-code cm-s-custom" style="background: unset"><pre class="CodeMirror-line" style="display:inline;"><span class="cm-keyword">if</span>/<span class="cm-keyword">else</span>/<span class="cm-keyword">foreach</span>/<span class="cm-keyword">while</span>/<span class="cm-keyword">function</span></pre></span>, press the ↵ key to go inside the block after writing the condition`,
        "5": `Variables are initialized with <span class="CodeMirror-code cm-s-custom" style="background: unset"><pre class="CodeMirror-line" style="display:inline;"><span class="cm-number">0</span></pre></span> by default`,
        "6": `You can click 'Add to Home Screen' option in your browser (if available) for a smoother experience along with fullscreen `,
        "7": `List index starts from <span class="CodeMirror-code cm-s-custom" style="background: unset"><pre class="CodeMirror-line" style="display:inline;"><span class="cm-number">0</span></pre></span>`,
        "8": `The read-only mode for the editor is enabled on mobile and becomes optional on desktop`,
        "9": `Lists are passed/assigned by reference, so modifying one will modify both`
    }
})

export const mutations = {
    SET_CHALLENGES(state, challenges) {
        state.challenges = challenges;
    },
    SET_PUZZLES(state, puzzles) {
        state.puzzles = puzzles;
    },
    SET_LOADING(state, flag) {
        state.loading = flag;
    }
}

export const getters = {
    puzzlesForChallenge: (state) => (id) => {
        return state.puzzles.filter(puzzle => puzzle.challengeId == id)
    },
    puzzle: (state) => (id) => {
        return state.puzzles.find(puzzle => puzzle.id == id)
    }
}

export const actions = {
    async nuxtServerInit({ dispatch }, { }) {
        await dispatch('setChallenges');
        await dispatch('setPuzzles');
    },

    async setChallenges({ commit }) {
        await this.$axios.get('api/challenges')
            .then(challenges => {
                commit('SET_CHALLENGES', challenges.data);
            })
            .catch(err => console.log(err));
    },
    async setPuzzles({ commit }) {
        await this.$axios.get('api/puzzles?secret=' + process.env.API_SECRET)
            .then(puzzles => {

                commit('SET_PUZZLES', puzzles.data);
            })
            .catch(err => console.log(err));
    },
    setLoading({ commit }, flag) {
        commit('SET_LOADING', flag);
    }
}