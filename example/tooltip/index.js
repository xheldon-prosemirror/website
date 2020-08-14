// plugin{
import {Plugin} from "prosemirror-state"

let selectionSizePlugin = new Plugin({
  view(editorView) { return new SelectionSizeTooltip(editorView) }
})
// }

// tooltip{
class SelectionSizeTooltip {
  constructor(view) {
    this.tooltip = document.createElement("div")
    this.tooltip.className = "tooltip"
    view.dom.parentNode.appendChild(this.tooltip)

    this.update(view, null)
  }

  update(view, lastState) {
    let state = view.state
    // 如果文档或者选区未发生更改，则什么不做
    if (lastState && lastState.doc.eq(state.doc) &&
        lastState.selection.eq(state.selection)) return

    // 如果选区为空（光标状态）则隐藏 tooltip
    if (state.selection.empty) {
      this.tooltip.style.display = "none"
      return
    }

    // 否则，重新设置它的位置并且更新它的内容
    this.tooltip.style.display = ""
    let {from, to} = state.selection
    // 这些是在屏幕上的坐标信息
    let start = view.coordsAtPos(from), end = view.coordsAtPos(to)
    // 将 tooltip 所在的父级节点作为参照系
    let box = this.tooltip.offsetParent.getBoundingClientRect()
    // 寻找 tooltip 的中点，当跨行的时候，端点可能更靠近左侧
    let left = Math.max((start.left + end.left) / 2, start.left + 3)
    this.tooltip.style.left = (left - box.left) + "px"
    this.tooltip.style.bottom = (box.bottom - start.top) + "px"
    this.tooltip.textContent = to - from
  }

  destroy() { this.tooltip.remove() }
}
// }

import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {DOMParser} from "prosemirror-model"
import {schema} from "prosemirror-schema-basic"
import {exampleSetup} from "prosemirror-example-setup"

window.view = new EditorView(document.querySelector("#editor"), {
  state: EditorState.create({
    doc: DOMParser.fromSchema(schema).parse(document.querySelector("#content")),
    plugins: exampleSetup({schema}).concat(selectionSizePlugin)
  })
})
