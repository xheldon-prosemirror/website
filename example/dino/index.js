// nodespec{
// 支持的恐龙类型
const dinos = ["brontosaurus", "stegosaurus", "triceratops",
               "tyrannosaurus", "pterodactyl"]

const dinoNodeSpec = {
  // 恐龙只有一个属性，那就是它的类型，而且必须是上面的类型之一
  // Brontosaurs 是默认的类型
  attrs: {type: {default: "brontosaurus"}},
  inline: true,
  group: "inline",
  draggable: true,

  // 这些节点以一个带有 `dino-type` 属性的 images 节点进行渲染
  // 在 /img/dino/ 目录下有所有的恐龙图片
  toDOM: node => ["img", {"dino-type": node.attrs.type,
                          src: "/img/dino/" + node.attrs.type + ".png",
                          title: node.attrs.type,
                          class: "dinosaur"}],
  // 当格式化一个 image DOM 的时候，如果它的 type 属性是上面所述的恐龙类型之一，那么它就会被转换成一个 dino 节点
  parseDOM: [{
    tag: "img[dino-type]",
    getAttrs: dom => {
      let type = dom.getAttribute("dino-type")
      return dinos.indexOf(type) > -1 ? {type} : false
    }
  }]
}
// }

// schema{
import {Schema, DOMParser} from "prosemirror-model"
import {schema} from "prosemirror-schema-basic"

const dinoSchema = new Schema({
  nodes: schema.spec.nodes.addBefore("image", "dino", dinoNodeSpec),
  marks: schema.spec.marks
})

let content = document.querySelector("#content")
let startDoc = DOMParser.fromSchema(dinoSchema).parse(content)
// }

// command{
let dinoType = dinoSchema.nodes.dino

function insertDino(type) {
  return function(state, dispatch) {
    let {$from} = state.selection, index = $from.index()
    if (!$from.parent.canReplaceWith(index, index, dinoType))
      return false
    if (dispatch)
      dispatch(state.tr.replaceSelectionWith(dinoType.create({type})))
    return true
  }
}
// }

// menu{
import {MenuItem} from "prosemirror-menu"
import {buildMenuItems} from "prosemirror-example-setup"

// 让 example-setup 去 build 它的基本菜单
let menu = buildMenuItems(dinoSchema)
// 增加一个插入恐龙节点的按钮
dinos.forEach(name => menu.insertMenu.content.push(new MenuItem({
  title: "Insert " + name,
  label: name.charAt(0).toUpperCase() + name.slice(1),
  enable(state) { return insertDino(name)(state) },
  run: insertDino(name)
})))
// }

// editor{
import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {exampleSetup} from "prosemirror-example-setup"

window.view = new EditorView(document.querySelector("#editor"), {
  state: EditorState.create({
    doc: startDoc,
    // 传给 exampleSetup 和 我们创建的 menu
    plugins: exampleSetup({schema: dinoSchema, menuContent: menu.fullMenu})
  })
})
// }
