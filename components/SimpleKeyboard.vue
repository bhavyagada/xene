<template>
  <div :class="keyboardClass"></div>
</template>
 
<script>
import 'simple-keyboard/build/css/index.css'
export default {
  name: 'SimpleKeyboard',
  props: {
    keyboardClass: {
      default: 'simple-keyboard',
      type: String
    },
    input: {
      type: String
    },
    block_context: false,
    tutorial_mode: false
  },
  data: () => ({
    keyboard: null,
    disabled_keys: [],
    layout: {
      default: [
        '{custom_func} 0 1 {num} {char} ( [',
        'return if else while foreach',
        'true false var_a var_b {var} input',
        '- ! {ops} {enter} {bksp}'
      ],
      noblocks: [
        '{custom_func} 0 1 {num} {char} ( [',
        'return in true false',
        'var_a var_b var_c {var} input',
        '- ! {ops} {back} {enter} {bksp}'
      ],
      var: [
        'input var_a var_b var_c',
        'var_d var_e var_f var_g',
        'var_h var_i var_j var_k var_l',
        'var_m var_n var_o {back} {enter} {bksp}'
      ],
      func: [
        'length sort sort_with',
        'push pop insert remove',
        'new_list fill is_list copy',
        'map {back} {enter} {bksp}'
      ],
      custom_func: [
        'mod abs pow max min',
        'function f1 f2 f3 f4 f5',
        'f6 f7 f8 f9 f10 f11 f12',
        'f13 f14 f15 f16 {back} {enter} {bksp}'
      ],
      ops: [
        '+ - * / ( ) [ ]',
        '++ -- == != { }',
        '< > ! && || : " ->',
        '= . , ; {back} {enter} {bksp}'
      ],
      num: ['0 1 2', '3 4 5', '6 7 8 9', '{back} {enter} {bksp}'],
      char: [
        'a b c d e f g h',
        'i j k l m n o p',
        'q r s t u v w x',
        'y z {back} {enter} {bksp}'
      ]
    }
  }),
  mounted() {
    this.$nextTick(function() {
      this.$axios
        .get('api/user/disabled_keys')
        .then(puzzles => {
          this.disabled_keys = puzzles.data
          let disabledKeys = {}
          this.disabled_keys.forEach(key => {
            disabledKeys[
              '' + key
            ] = `<button type="button" class="theme--dark"><span class="v-btn__content red--text text--darken-4"><i aria-hidden="true" class="v-icon notranslate v-icon--left mdi mdi-lock-outline theme--dark red--text text--darken-4" style="font-size:16px;margin-left:0px;margin-right:0px;"></i>${key}</span></button>`
          })
          let opaque = this.disabled_keys
            .filter(
              key => ['if', 'else', 'while', 'foreach', 'in'].indexOf(key) < 0
            )
            .join(' ')
          let blacked = this.disabled_keys
            .filter(
              key => ['if', 'else', 'while', 'foreach', 'in'].indexOf(key) >= 0
            )
            .join(' ')
          let disabledButtons = []
          if (opaque) {
            disabledButtons.push({ class: 'disabled-opaque', buttons: opaque })
          }
          if (blacked) {
            disabledButtons.push({
              class: 'disabled-blacked',
              buttons: blacked
            })
          }
          this.keyboard = new this.$Keyboard({
            onChange: this.onChange,
            onKeyPress: this.onKeyPress,
            onInit: this.onInit,
            mergeDisplay: true,
            newLineOnEnter: true,
            // preventMouseDownDefault: true,
            // stopMouseDownPropagation: true,
            disableButtonHold: true,
            theme: 'hg-theme-default hg-layout-default custom',
            layout: this.layout,
            display: {
              '{bksp}': '&nbsp;&nbsp;⌫&nbsp;&nbsp;',
              // '{tab}': '⇥',
              // '{space}': '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
              '{char}': 'a-z',
              '{ops}': 'ops',
              '{func}': '.func',
              '{custom_func}': 'func',
              '{num}': '...',
              '{var}': '...',
              '{back}': 'back',
              '{enter}': '&nbsp;&nbsp;↵&nbsp;&nbsp;',
              ...disabledKeys
            },
            buttonTheme: [
              {
                class: 'keyword',
                buttons: 'if else while foreach return in'
              },
              {
                class: 'keyword-function',
                buttons: 'function'
              },
              {
                class: 'atom-1',
                buttons: 'true false'
              },
              {
                class: 'atom-2',
                buttons: 'input'
              },
              {
                class: 'black',
                buttons: '{tab} {enter} {space} {bksp} {back}'
              },
              {
                class: 'number',
                buttons: '{num} 0 1 2 3 4 5 6 7 8 9'
              },
              {
                class: 'string',
                buttons:
                  '{char} a b c d e f g h i j k l m n o p q r s t u v w x y z'
              },
              {
                class: 'variable',
                buttons:
                  '{var} var_a var_b var_c var_d var_e var_f var_g var_h var_i var_j var_k var_l var_m var_n var_o'
              },
              {
                class: 'variable-2',
                buttons:
                  '{custom_func} {func} abs mod max min pow length is_list push pop insert remove sort sort_with copy new_list fill map f1 f2 f3 f4 f5 f6 f7 f8 f9 f10 f11 f12 f13 f14 f15 f16'
              },
              {
                class: 'operator',
                buttons: '{ops} = + - * / ++ -- == != < > && || ! . , : ; " -> '
              },
              {
                class: 'bracket',
                buttons: '( ) [ ] { }'
              },
              ...disabledButtons
            ]
          })
        })
        .catch(err => console.log(err))
    })
  },
  methods: {
    onInit() {
      this.$emit('onInit')
    },
    onChange(input) {
      this.$emit('onChange', input)
    },
    checkBlock() {
      this.$nextTick(() => {
        if (this.block_context) {
          this.keyboard.setOptions({
            layoutName: 'noblocks'
          })
        } else {
          this.keyboard.setOptions({
            layoutName: 'default'
          })
        }
      })
    },
    onKeyPress(button) {
      if (button == '{bksp}') {
        this.$emit('deleteToken')
        this.checkBlock()
        return
      }
      if (button == '{enter}') {
        this.$emit('addLine')
        this.checkBlock()
        return
      }
      if (button === '{back}') {
        this.checkBlock()
        return
      }
      if (this.tutorial_mode) {
        if (
          button === '{var}' ||
          button === '{num}' ||
          button === '{ops}' ||
          button === '{custom_func}' ||
          button === '{func}' ||
          button === '{char}'
        ) {
          this.handleToggle(button)
          return
        } else this.$emit('addToken', button)
      } else {
        if (
          ['{var}', '{num}', '{ops}', '{char}', '{func}'].indexOf(button) >= 0
        ) {
          this.keyboard.setOptions({
            layoutName: button.substring(1, button.length - 1)
          })
          return
        }
        let current_layout = this.keyboard.options.layoutName
        let layouts = this.keyboard.options.layout
        let extra = x => ['{enter}', '{bksp}', '{back}'].indexOf(x) < 0
        let buttons = type =>
          [].concat
            .apply(
              [],
              layouts[type].map(x => x.split(' '))
            )
            .filter(extra)
        let blocks = [
          'if',
          'else',
          'while',
          'foreach',
          'in',
          'return',
          'function'
        ]
        let digits = buttons('num')
        digits.push('true', 'false')
        let vars = buttons('var')
        let func = buttons('func')
        let custom_func = buttons('custom_func')
        let ops = buttons('ops')
        let char = buttons('char')
        /*
        1:      default
        2, 3:   ops
        4:      noblocks
        5:      func
        6:      custom_func
        7:      var
      */
        switch (current_layout) {
          case 'default':
            if (digits.indexOf(button) >= 0 || vars.indexOf(button) >= 0) {
              this.$emit('addToken', button)
              this.keyboard.setOptions({
                layoutName: 'ops'
              })
              return
            }
            if (button == 'foreach') {
              this.$emit('addToken', button)
              this.keyboard.setOptions({
                layoutName: 'var'
              })
              return
            }
            if (button == '{custom_func}') {
              this.keyboard.setOptions({
                layoutName: 'custom_func'
              })
              return
            }
            if (
              blocks.indexOf(button) >= 0 ||
              ['(', ')', '[', ']', '{', '}', '-', '!'].indexOf(button) >= 0
            ) {
              this.$emit('addToken', button)
              this.checkBlock()
              return
            }
            if (button == '{ops}') {
              this.keyboard.setOptions({
                layoutName: 'ops'
              })
              return
            }
            break
          case 'ops':
            this.$emit('addToken', button)
            if (
              blocks.indexOf(button) >= 0 ||
              ['(', ')', '[', ']', '{', '}', '-', '!'].indexOf(button) >= 0
            ) {
              this.checkBlock()
              return
            }
            if (button == '.') {
              this.keyboard.setOptions({
                layoutName: 'func'
              })
              return
            }
            this.checkBlock()
            return
          case 'noblocks':
            if (
              blocks.indexOf(button) >= 0 ||
              ['(', ')', '[', ']', '{', '}', '-', '!'].indexOf(button) >= 0
            ) {
              this.$emit('addToken', button)
              this.checkBlock()
              return
            }
            if (digits.indexOf(button) >= 0 || vars.indexOf(button) >= 0) {
              this.$emit('addToken', button)
              this.keyboard.setOptions({
                layoutName: 'ops'
              })
              return
            }
            if (button == '{custom_func}') {
              this.keyboard.setOptions({
                layoutName: 'custom_func'
              })
              return
            }
            if (button == '{ops}') {
              this.keyboard.setOptions({
                layoutName: 'ops'
              })
              return
            }
            break
          case 'func':
            this.$emit('addToken', button)
            this.keyboard.setOptions({
              layoutName: 'ops'
            })
            return
          case 'custom_func':
          case 'var':
            this.$emit('addToken', button)
            this.checkBlock()
            if (button == 'function') {
              this.$nextTick(() =>
                this.keyboard.setOptions({
                  layoutName: 'custom_func'
                })
              )
            }
            return

          case 'num':
          case 'char':
            this.$emit('addToken', button)
            return
        }
      }
    },
    handleToggle(button) {
      let butt = button.substring(1, button.length - 1)
      let currentLayout = this.keyboard.options.layoutName
      let toggle = currentLayout === 'default' ? butt : 'default'
      this.keyboard.setOptions({
        layoutName: toggle
      })
    }
  },
  watch: {
    block_context: function(newContext, oldContext) {
      // console.log(newContext, oldContext)
      if (oldContext === true && newContext === false) {
        this.keyboard.setOptions({
          layoutName: 'default'
        })
      }
    },
    tutorial_mode: function(newContext, oldContext) {
      if (newContext) {
        this.layout.default[0] = this.layout.noblocks[0] =
          '{custom_func} {func} 0 1 {num} {char} ( ['
      } else {
        this.layout.default[0] = this.layout.noblocks[0] =
          '{custom_func} 0 1 {num} {char} ( ['
      }
      this.checkBlock()
      this.keyboard.setOptions({
        layout: this.layout
      })
    }
  }
}
</script>
 
<!-- @TODO Add "scoped" attribute to limit CSS to this component only -->
<style>
.simple-keyboard {
  width: 100%;
  bottom: 0;
  position: fixed;
  padding: 0px;
}
.simple-keyboard.hg-theme-default.custom {
  background: #022c43;
  font-family: 'Share Tech Mono', monospace;
  color: white;
}
.hg-theme-default .hg-button {
  border: 0px;
  box-shadow: none;
  background: #0c2233;
}
.simple-keyboard.hg-layout-default .hg-button.keyword {
  background: #00bceb;
}
.simple-keyboard.hg-layout-default .hg-button.keyword-function {
  background: #00bceb;
}
.simple-keyboard.hg-layout-default .hg-button.keyword-function span {
  color: white;
}
.simple-keyboard.hg-layout-default .hg-button.string span {
  color: #ffc107;
}
.simple-keyboard.hg-layout-default .hg-button.number span {
  color: #f9d276;
}
.simple-keyboard.hg-layout-default .hg-button.atom-1 span {
  color: #5f85db;
}
.simple-keyboard.hg-layout-default .hg-button.atom-2 {
  background: #5f85db;
}
.simple-keyboard.hg-layout-default .hg-button.operator span {
  color: #fd7014;
}
.simple-keyboard.hg-layout-default .hg-button.variable {
  background: #2dbcad;
}
.simple-keyboard.hg-layout-default .hg-button.variable-2 span {
  color: #a3f7bf;
}
.simple-keyboard.hg-layout-default .hg-button.bracket span {
  color: #bbe1fa;
}
.simple-keyboard.hg-layout-default .hg-button.black {
  background: #000000;
}
.simple-keyboard.simple-keyboard.hg-layout-default .hg-button.disabled-opaque {
  pointer-events: none;
  padding: 2px;
  font-size: 0.85em;
  opacity: 0.9;
}
.simple-keyboard.simple-keyboard.hg-layout-default .hg-button.disabled-blacked {
  pointer-events: none;
  padding: 2px;
  font-size: 0.85em;
  background-color: rgba(0, 0, 0, 0.5);
}
.hg-theme-default .hg-button.hg-activeButton {
  background: steelblue;
}
</style>