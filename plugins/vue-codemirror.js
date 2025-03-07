import Vue from 'vue'
import CodeMirror from 'codemirror'
import VueCodemirror from 'vue-codemirror'

import 'codemirror/addon/mode/simple.js'
import 'codemirror/addon/comment/comment.js'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/scroll/simplescrollbars.js'
import 'codemirror/addon/scroll/simplescrollbars.css'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/closebrackets.js'

CodeMirror.defineSimpleMode("custom", {
    // The start state contains the rules that are intially used
    start: [
        // The regex matches the token, the token property contains the type
        { regex: /"(?:[^\\]|\\.)*?(?:"|$)/, token: "string" },
        { regex: /'(?:[^\\]|\\.)*?(?:'|$)/, token: "string" },
        { regex: /[()\[\]]/, token: "bracket" },
        // You can match multiple tokens at once. Note that the captured
        // groups must span the whole string in this case
        {
            regex: /(?:f1|f2|f3|f4|f5|f6|f7|f8|f9|f10|f11|f12|f13|f14|f15|f16|abs|mod|min|max|pow|length|sort|sort_with|push|pop|insert|remove|new_list|copy|fill|is_list|map)\b/,
            token: "variable-2"
        },
        // Rules are matched in the order in which they appear, so there is
        // no ambiguity between this one and the one above
        {
            regex: /(?:function|return|if|foreach|in|while|else)\b/,
            token: "keyword"
        },
        { regex: /input|true|false/, token: "atom" },
        {
            regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i,
            token: "number"
        },
        { regex: /\/\/.*/, token: "comment" },
        // A next property will cause the mode to move to a different state
        { regex: /\/\*/, token: "comment", next: "comment" },
        { regex: /(->|\+|-|\*|\/|\+\+|--|==|!=|=|>|<|!|&&|\|\||:|"|\.|,|;)/, token: "operator" },
        // indent and dedent properties guide autoindentation
        { regex: /[\{\[\(]/, indent: true },
        { regex: /[\}\]\)]/, dedent: true },
        { regex: /var_[a-o]?/, token: "variable" },
    ],
    // The multi-line comment state.
    comment: [
        { regex: /.*?\*\//, token: "comment", next: "start" },
        { regex: /.*/, token: "comment" }
    ],
    // The meta property contains global information about the mode. It
    // can contain properties like lineComment, which are supported by
    // all modes, and also directives like dontIndentStates, which are
    // specific to simple modes.
    meta: {
        dontIndentStates: ["comment"],
        lineComment: "//"
    },    
});

CodeMirror.extendMode("custom", {
    commentStart: "/*",
    commentEnd: "*/",    
    newlineAfterToken: function(type, content, textAfter, state) {
        if (this.jsonMode) {
            return /^[\[,{]$/.test(content) || /^}/.test(textAfter);
        } else {
            if (content == ";" && state.lexical && state.lexical.type == ")") return false;
        return /^[;{}]$/.test(content) && !/^;/.test(textAfter);
        }
    }
});

CodeMirror.defineExtension("commentRange", function (isComment, from, to) {
    var cm = this, curMode = CodeMirror.innerMode(cm.getMode(), cm.getTokenAt(from).state).mode;
    cm.operation(function() {
        if (isComment) { // Comment range
            cm.replaceRange(curMode.commentEnd, to);
            cm.replaceRange(curMode.commentStart, from);
        if (from.line == to.line && from.ch == to.ch) // An empty comment inserted - put cursor inside
            cm.setCursor(from.line, from.ch + curMode.commentStart.length);
        } else { // Uncomment range
            var selText = cm.getRange(from, to);
            var startIndex = selText.indexOf(curMode.commentStart);
            var endIndex = selText.lastIndexOf(curMode.commentEnd);
            if (startIndex > -1 && endIndex > -1 && endIndex > startIndex) {
                // Take string till comment start
                selText = selText.substr(0, startIndex)
                // From comment start till comment end
                + selText.substring(startIndex + curMode.commentStart.length, endIndex)
                // From comment end till string end
                + selText.substr(endIndex + curMode.commentEnd.length);
            }
            cm.replaceRange(selText, from, to);
        }
    });
});


CodeMirror.defineExtension("autoIndentRange", function (from, to) {
    var cmInstance = this;
    this.operation(function () {
        for (var i = from.line; i <= to.line; i++) {
            cmInstance.indentLine(i, "smart");
        }
    });
});


CodeMirror.defineExtension("autoFormatRange", function (from, to) {
    var cm = this;
    var outer = cm.getMode(), text = cm.getRange(from, to).split("\n");        
    var state = CodeMirror.copyState(outer, cm.getTokenAt(from).state);
    var tabSize = cm.getOption("tabSize");

    var out = "", lines = 0, atSol = from.ch == 0;
    function newline() {
      out += "\n";
      atSol = true;
      ++lines;
    }

    for (var i = 0; i < text.length; ++i) {
      var stream = new CodeMirror.StringStream(text[i], tabSize);      
      while (!stream.eol()) {
        var inner = CodeMirror.innerMode(outer, state);   
        var style = outer.token(stream, state), cur = stream.current();
        stream.start = stream.pos;
        if (!atSol || /\S/.test(cur)) {
          out += cur;
          atSol = false;
        }

        if (!atSol && inner.mode.newlineAfterToken &&
            inner.mode.newlineAfterToken(style, cur, stream.string.slice(stream.pos) || text[i+1] || "", inner.state))
          newline();        
      }
      if (!stream.pos && outer.blankLine) outer.blankLine(state);
    //   if (!atSol)newline();
    }

    cm.operation(function () {
      cm.replaceRange(out, from, to);
      for (var cur = from.line + 1, end = from.line + lines; cur <= end; ++cur)
        cm.indentLine(cur, "smart");
      cm.setSelection(from, cm.getCursor(false));
    });
});

Vue.use(VueCodemirror, {
    options: {
        tabSize: 2,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        styleSelectedText: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        closeBrackets: {
            explode: "[]{}()",
            override: true
        },
        showCursorWhenSelecting: true,
        viewportMargin: Infinity,
        mode: 'custom',
        theme: 'custom',
        inputStyle: 'textarea',
        readOnly: 'nocursor',
        scrollbarStyle: 'overlay'
      },
})