// lint{
// 定义一些你可能不想让用户使用的值
const badWords = /\b(obviously|clearly|evidently|simply)\b/ig
// 将标点符号与前面的空格匹配
const badPunc = / ([,\.!?:]) ?/g

function lint(doc) {
  let result = [], lastHeadLevel = null

  function record(msg, from, to, fix) {
    result.push({msg, from, to, fix})
  }

  // 遍历在文档中的每个节点
  doc.descendants((node, pos) => {
    if (node.isText) {
      // 扫描文本节点中的可疑的匹配内容
      let m
      while (m = badWords.exec(node.text))
        record(`Try not to say '${m[0]}'`,
               pos + m.index, pos + m.index + m[0].length)
      while (m = badPunc.exec(node.text))
        record("Suspicious spacing around punctuation",
               pos + m.index, pos + m.index + m[0].length,
               fixPunc(m[1] + " "))
    } else if (node.type.name == "heading") {
      // 检查标题的等级是否与当前的等级匹配
      let level = node.attrs.level
      if (lastHeadLevel != null && level > lastHeadLevel + 1)
        record(`Heading too small (${level} under ${lastHeadLevel})`,
               pos + 1, pos + 1 + node.content.size,
               fixHeader(lastHeadLevel + 1))
      lastHeadLevel = level
    } else if (node.type.name == "image" && !node.attrs.alt) {
      // 确保图片都有一个 alt 属性
      record("Image without alt text", pos, pos + 1, addAlt)
    }
  })

  return result
}
// }

// fix{
function fixPunc(replacement) {
  return function({state, dispatch}) {
    dispatch(state.tr.replaceWith(this.from, this.to,
                                  state.schema.text(replacement)))
  }
}

function fixHeader(level) {
  return function({state, dispatch}) {
    dispatch(state.tr.setNodeMarkup(this.from - 1, null, {level}))
  }
}

function addAlt({state, dispatch}) {
  let alt = prompt("Alt text", "")
  if (alt) {
    let attrs = Object.assign({}, state.doc.nodeAt(this.from).attrs, {alt})
    dispatch(state.tr.setNodeMarkup(this.from, null, attrs))
  }
}
// }

// deco{
import {Decoration, DecorationSet} from "prosemirror-view"

function lintDeco(doc) {
  let decos = []
  lint(doc).forEach(prob => {
    decos.push(Decoration.inline(prob.from, prob.to, {class: "problem"}),
               Decoration.widget(prob.from, lintIcon(prob)))
  })
  return DecorationSet.create(doc, decos)
}

function lintIcon(prob) {
  let icon = document.createElement("div")
  icon.className = "lint-icon"
  icon.title = prob.msg
  icon.problem = prob
  return icon
}
// }

// plugin{
import {Plugin, TextSelection} from "prosemirror-state"

let lintPlugin = new Plugin({
  state: {
    init(_, {doc}) { return lintDeco(doc) },
    apply(tr, old) { return tr.docChanged ? lintDeco(tr.doc) : old }
  },
  props: {
    decorations(state) { return this.getState(state) },
    handleClick(view, _, event) {
      if (/lint-icon/.test(event.target.className)) {
        let {from, to} = event.target.problem
        view.dispatch(
          view.state.tr
            .setSelection(TextSelection.create(view.state.doc, from, to))
            .scrollIntoView())
        return true
      }
    },
    handleDoubleClick(view, _, event) {
      if (/lint-icon/.test(event.target.className)) {
        let prob = event.target.problem
        if (prob.fix) {
          prob.fix(view)
          view.focus()
          return true
        }
      }
    }
  }
})
// }

// editor{
import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {DOMParser} from "prosemirror-model"
import {schema} from "prosemirror-schema-basic"
import {exampleSetup} from "prosemirror-example-setup"

let state = EditorState.create({
  doc: DOMParser.fromSchema(schema).parse(document.querySelector("#content")),
  plugins: exampleSetup({schema}).concat(lintPlugin)
})

window.view = new EditorView(document.querySelector("#editor"), {state})
// }
