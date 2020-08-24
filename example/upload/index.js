// placeholderPlugin{
import {Plugin} from "prosemirror-state"
import {Decoration, DecorationSet} from "prosemirror-view"

let placeholderPlugin = new Plugin({
  state: {
    init() { return DecorationSet.empty },
    apply(tr, set) {
      // 调整因为 decoration 的位置，以适应 transaction 引起的文档的改变
      set = set.map(tr.mapping, tr.doc)
      // 查看 transaction 是否增加或者删除任何占位符了
      let action = tr.getMeta(this)
      if (action && action.add) {
        let widget = document.createElement("placeholder")
        let deco = Decoration.widget(action.add.pos, widget, {id: action.add.id})
        set = set.add(tr.doc, [deco])
      } else if (action && action.remove) {
        set = set.remove(set.find(null, null,
                                  spec => spec.id == action.remove.id))
      }
      return set
    }
  },
  props: {
    decorations(state) { return this.getState(state) }
  }
})
// }

// findPlaceholder{
function findPlaceholder(state, id) {
  let decos = placeholderPlugin.getState(state)
  let found = decos.find(null, null, spec => spec.id == id)
  return found.length ? found[0].from : null
}
// }


// event{
document.querySelector("#image-upload").addEventListener("change", e => {
  if (view.state.selection.$from.parent.inlineContent && e.target.files.length)
    startImageUpload(view, e.target.files[0])
  view.focus()
})
// }

// startImageUpload{
function startImageUpload(view, file) {
  // 为 upload 构建一个空的对象来存放占位符们的 ID
  let id = {}

  // 用占位符替换选区
  let tr = view.state.tr
  if (!tr.selection.empty) tr.deleteSelection()
  tr.setMeta(placeholderPlugin, {add: {id, pos: tr.selection.from}})
  view.dispatch(tr)

  uploadFile(file).then(url => {
    let pos = findPlaceholder(view.state, id)
    // 如果占位符周围的内容都被删除了，那就删除这个占位符所代表的图片
    if (pos == null) return
    // 否则的话，将图片插入占位符所在的位置，然后移除占位符
    view.dispatch(view.state.tr
                  .replaceWith(pos, pos, schema.nodes.image.create({src: url}))
                  .setMeta(placeholderPlugin, {remove: {id}}))
  }, () => {
    // 如果上传失败，简单移除占位符就好
    view.dispatch(tr.setMeta(placeholderPlugin, {remove: {id}}))
  })
}
// }

// 下面这个函数只是假装上传了一个文件然后新建了一个 data URL，
// 你可以用一个能够真实上传然后获取真实文件 URL 的函数来替换该函数。
function uploadFile(file) {
  let reader = new FileReader
  return new Promise((accept, fail) => {
    reader.onload = () => accept(reader.result)
    reader.onerror = () => fail(reader.error)
    // Some extra delay to make the asynchronicity visible
    setTimeout(() => reader.readAsDataURL(file), 1500)
  })
}

import {DOMParser} from "prosemirror-model"
import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {schema} from "prosemirror-schema-basic"
import {exampleSetup} from "prosemirror-example-setup"

let view = window.view = new EditorView(document.querySelector("#editor"), {
  state: EditorState.create({
    doc: DOMParser.fromSchema(schema).parse(document.querySelector("#content")),
    plugins: exampleSetup({schema}).concat(placeholderPlugin)
  })
})

