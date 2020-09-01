class Span {
  constructor(from, to, commit) {
    this.from = from; this.to = to; this.commit = commit
  }
}

class Commit {
  constructor(message, time, steps, maps, hidden) {
    this.message = message
    this.time = time
    this.steps = steps
    this.maps = maps
    this.hidden = hidden
  }
}

// TrackState{
class TrackState {
  constructor(blameMap, commits, uncommittedSteps, uncommittedMaps) {
    // blameMap 是一种数组数据结构，它含有一系列的文档的范围，以及与其相关的提交。
    // 这可以用来做一些很有用的事情，比如高亮某个提交的修改范围等
    this.blameMap = blameMap
    // 提交的历史，以一个对象的数组存储
    this.commits = commits
    // 通过自上次提交以来发生的 steps 来反转新的 step 和他们相应的 map
    this.uncommittedSteps = uncommittedSteps
    this.uncommittedMaps = uncommittedMaps
  }

  // 对当前 state 应用一个 transform
  applyTransform(transform) {
    // 在当前 transaction 中反转它的 step，以在下一次的提交中保存它们（被用来 undo）
    let inverted =
      transform.steps.map((step, i) => step.invert(transform.docs[i]))
    let newBlame = updateBlameMap(this.blameMap, transform, this.commits.length)
    // 创建一个新的 state，因为编辑器的 state 以及它的任意一个部分，都是一个不可突变的存储结构，任何修改都会产生一个新的 state
    return new TrackState(newBlame, this.commits,
                          this.uncommittedSteps.concat(inverted),
                          this.uncommittedMaps.concat(transform.mapping.maps))
  }
  // 当一个 transaction 被标记为一个 commit 的时候，下面这个函数用来将所有那些暂未提交的 step 放到下一个提交中去。
  applyCommit(message, time) {
    if (this.uncommittedSteps.length == 0) return this
    let commit = new Commit(message, time, this.uncommittedSteps,
                            this.uncommittedMaps)
    return new TrackState(this.blameMap, this.commits.concat(commit), [], [])
  }
}
// }

function updateBlameMap(map, transform, id) {
  let result = [], mapping = transform.mapping
  for (let i = 0; i < map.length; i++) {
    let span = map[i]
    let from = mapping.map(span.from, 1), to = mapping.map(span.to, -1)
    if (from < to) result.push(new Span(from, to, span.commit))
  }

  for (let i = 0; i < mapping.maps.length; i++) {
    let map = mapping.maps[i], after = mapping.slice(i + 1)
    map.forEach((_s, _e, start, end) => {
      insertIntoBlameMap(result, after.map(start, 1), after.map(end, -1), id)
    })
  }

  return result
}

function insertIntoBlameMap(map, from, to, commit) {
  if (from >= to) return
  let pos = 0, next
  for (; pos < map.length; pos++) {
    next = map[pos]
    if (next.commit == commit) {
      if (next.to >= from) break
    } else if (next.to > from) { // 不同的提交，不是之前那个的话
      if (next.from < from) { // 从左边开始（下面的循环会处理右边）
        let left = new Span(next.from, from, next.commit)
        if (next.to > to) map.splice(pos++, 0, left)
        else map[pos++] = left
      }
      break
    }
  }

  while (next = map[pos]) {
    if (next.commit == commit) {
      if (next.from > to) break
      from = Math.min(from, next.from)
      to = Math.max(to, next.to)
      map.splice(pos, 1)
    } else {
      if (next.from >= to) break
      if (next.to > to) {
        map[pos] = new Span(to, next.to, next.commit)
        break
      } else {
        map.splice(pos, 1)
      }
    }
  }

  map.splice(pos, 0, new Span(from, to, commit))
}

// trackPlugin{
import {Plugin} from "prosemirror-state"

const trackPlugin = new Plugin({
  state: {
    init(_, instance) {
      return new TrackState([new Span(0, instance.doc.content.size, null)], [], [], [])
    },
    apply(tr, tracked) {
      if (tr.docChanged) tracked = tracked.applyTransform(tr)
      let commitMessage = tr.getMeta(this)
      if (commitMessage) tracked = tracked.applyCommit(commitMessage, new Date(tr.time))
      return tracked
    }
  }
})
// }

import {EditorState} from "prosemirror-state"
import {Decoration, DecorationSet, EditorView} from "prosemirror-view"
import {schema} from "prosemirror-schema-basic"
import {exampleSetup} from "prosemirror-example-setup"

function elt(name, attrs, ...children) {
  let dom = document.createElement(name)
  if (attrs) for (let attr in attrs) dom.setAttribute(attr, attrs[attr])
  for (let i = 0; i < children.length; i++) {
    let child = children[i]
    dom.appendChild(typeof child == "string" ? document.createTextNode(child) : child)
  }
  return dom
}

const highlightPlugin = new Plugin({
  state: {
    init() { return {deco: DecorationSet.empty, commit: null} },
    apply(tr, prev, oldState, state) {
      let highlight = tr.getMeta(this)
      if (highlight && highlight.add != null && prev.commit != highlight.add) {
        let tState = trackPlugin.getState(oldState)
        let decos = tState.blameMap
            .filter(span => tState.commits[span.commit] == highlight.add)
            .map(span => Decoration.inline(span.from, span.to, {class: "blame-marker"}))
        return {deco: DecorationSet.create(state.doc, decos), commit: highlight.add}
      } else if (highlight && highlight.clear != null && prev.commit == highlight.clear) {
        return {deco: DecorationSet.empty, commit: null}
      } else if (tr.docChanged && prev.commit) {
        return {deco: prev.deco.map(tr.mapping, tr.doc), commit: prev.commit}
      } else {
        return prev
      }
    }
  },
  props: {
    decorations(state) { return this.getState(state).deco }
  }
})

let state = EditorState.create({
  schema,
  plugins: exampleSetup({schema}).concat(trackPlugin, highlightPlugin)
}), view

let lastRendered = null

function dispatch(tr) {
  state = state.apply(tr)
  view.updateState(state)
  setDisabled(state)
  renderCommits(state, dispatch)
}

view = window.view = new EditorView(document.querySelector("#editor"), {state, dispatchTransaction: dispatch})

dispatch(state.tr.insertText("输入点内容，然后提交它。"))
dispatch(state.tr.setMeta(trackPlugin, "初始提交"))

function setDisabled(state) {
  let input = document.querySelector("#message")
  let button = document.querySelector("#commitbutton")
  input.disabled = button.disabled = trackPlugin.getState(state).uncommittedSteps.length == 0
}

function doCommit(message) {
  dispatch(state.tr.setMeta(trackPlugin, message))
}

function renderCommits(state, dispatch) {
  let curState = trackPlugin.getState(state)
  if (lastRendered == curState) return
  lastRendered = curState

  let out = document.querySelector("#commits")
  out.textContent = ""
  let commits = curState.commits
  commits.forEach(commit => {
    let node = elt("div", {class: "commit"},
                   elt("span", {class: "commit-time"},
                       commit.time.getHours() + ":" + (commit.time.getMinutes() < 10 ? "0" : "")
                       + commit.time.getMinutes()),
                   "\u00a0 " + commit.message + "\u00a0 ",
                   elt("button", {class: "commit-revert"}, "revert"))
    node.lastChild.addEventListener("click", () => revertCommit(commit))
    node.addEventListener("mouseover", e => {
      if (!node.contains(e.relatedTarget))
        dispatch(state.tr.setMeta(highlightPlugin, {add: commit}))
    })
    node.addEventListener("mouseout", e => {
      if (!node.contains(e.relatedTarget))
        dispatch(state.tr.setMeta(highlightPlugin, {clear: commit}))
    })
    out.appendChild(node)
  })
}

// revertCommit{
import {Mapping} from "prosemirror-transform"

function revertCommit(commit) {
  let trackState = trackPlugin.getState(state)
  let index = trackState.commits.indexOf(commit)
  // 如果一个提交不在历史操作中，我们就不能反转它
  if (index == -1) return

  // 提交完所有未提交的修改，反转才会被执行
  if (trackState.uncommittedSteps.length)
    return alert("先提交你的修改！")

  // 这是从当前文档初始提交到现在文档的 mapping
  let remap = new Mapping(trackState.commits.slice(index)
                          .reduce((maps, c) => maps.concat(c.maps), []))
  let tr = state.tr
  // 以当前文档为基础，在这个 commit 中构建一个包含所有反转 steps 的 transaction。
  // 这些 step 需要以相反的顺序被应用
  for (let i = commit.steps.length - 1; i >= 0; i--) {
    // mapping 被分隔成不包括当前和之前的 step 的 mapping
    let remapped = commit.steps[i].map(remap.slice(i + 1))
    if (!remapped) continue
    let result = tr.maybeStep(remapped)
    // 如果一个 step 可以被应用，那么添加该 step 的 map 到我们的 mapping 流，这样后续的 step 可以以当前 step 继续 mapping。
    if (result.doc) remap.appendMap(remapped.getMap(), i)
  }
  // 添加一个提交信息，然后 dispatch
  if (tr.docChanged)
    dispatch(tr.setMeta(trackPlugin, `Revert '${commit.message}'`))
}
// }

document.querySelector("#commit").addEventListener("submit", e => {
  e.preventDefault()
  doCommit(e.target.elements.message.value || "Unnamed")
  e.target.elements.message.value = ""
  view.focus()
})

function findInBlameMap(pos, state) {
  let map = trackPlugin.getState(state).blameMap
  for (let i = 0; i < map.length; i++)
    if (map[i].to >= pos && map[i].commit != null)
      return map[i].commit
}

document.querySelector("#blame").addEventListener("mousedown", e => {
  e.preventDefault()
  let pos = e.target.getBoundingClientRect()
  let commitID = findInBlameMap(state.selection.head, state)
  let commit = commitID != null && trackPlugin.getState(state).commits[commitID]
  let node = elt("div", {class: "blame-info"},
                 commitID != null ? elt("span", null, "It was: ", elt("strong", null, commit ? commit.message : "Uncommitted"))
                 : "No commit found")
  node.style.right = (document.body.clientWidth - pos.right) + "px"
  node.style.top = (pos.bottom + 2) + "px"
  document.body.appendChild(node)
  setTimeout(() => document.body.removeChild(node), 2000)
})
