ProseMirror provides a set of tools and concepts for building rich
text editors, using user interface inspired by
what-you-see-is-what-you-get, but trying to avoid the pitfalls of that
style of editing.

@cn ProseMirror 提供了一整套构建富文本编辑器的工具和概念，它使用的用户界面受 所见即所得 概念的启发，
但是尽量避免陷入它样式编辑的天坑。

The main principle of ProseMirror is that your code gets full control
over the document and what happens to it. This document isn't a blob
of HTML, but a custom data structure that only contains elements that
you explicitly allow it to contain, in relations that you specified.
All updates go through a single point, where you can inspect them and
react to them.

@cn Prosemirror 的基本概念是，你和你的代码对文档和文档的变化拥有绝对的控制权。
这里的文档不是 HTML 里的那一大坨杂乱无章的代码，而是一个只包含那些你明确指定允许它包含的元素和它们之间的你指定的关系的自定义数据结构(意思就是什么元素可以出现，
元素之间的关系，都在你的掌控之下——译者注)。所有的文档更新操作都从一个点出发，方便你对更新做处理。

The core library is not an easy drop-in component—we are prioritizing
modularity and customizability over simplicity, with the hope that,
in the future, people will distribute drop-in editors based on
ProseMirror. As such, this is more of a Lego set than a Matchbox car.

@cn Prosemirror 的核心模块并不是开箱即用的，在开发这个库的时候，我们坚持它的模块化和自定义程度的优先级高于简洁性。
当然，我们希望将来有人能开发一个基于 Prosemirror 的开箱即用的编辑器。这种感觉打个比喻来说就是，Prosemirror 是一个乐高积木，
拿到后需要你手动拼装，而不是像一个火柴盒一样，打开就能使用。

There are four essential modules, which are required to do any editing at
all, and a number of extension modules maintained by the core team,
which have a status similar to that of 3rd party modules—they provide
useful functionality, but you may omit them or replace them with other
modules that implement similar functionality.

@cn Prosemirror 有四个必要的模块，任何操作都需要这四个模块，另外还有很多 Prosemirror 核心团队维护的扩展模块，
它们(这些扩展模块)像一些提供了很多有用功能的第三方模块一样，都能被实现了相同功能的其他模块所取代。

The essential modules are:

@cn 上述的四个必要模块有：

 - [`prosemirror-model`](##model) defines the editor's [document
   model](#doc), the data structure used to describe the content
   of the editor.
 
   @cn [`prosemirror-model`](##model) 定义了编辑器的 Document Model，它用来描述编辑器的内容。

 - [`prosemirror-state`](##state) provides the data structure that
   describes the editor's whole state, including the selection, and a
   transaction system for moving from one state to the next.

   @cn [`prosemirror-state`](##state) 提供了一个描述编辑器完整状态的单一数据结构，
   包括编辑器的选区操作，和一个用来处理从当前 state 到下一个 state 的一个叫做 transaction 的系统。

 - [`prosemirror-view`](##view) implements a user interface component
   that shows a given editor state as an editable element in the
   browser, and handles user interaction with that element.
   
   @cn [`prosemirror-view`](##view) 用来将给定的 state 展示成相对应的可编辑元素显示在编辑器中，同时处理用户交互。

 - [`prosemirror-transform`](##transform) contains functionality for
   modifying documents in a way that can be recorded and replayed,
   which is the basis for the transactions in the `state` module, and
   which makes the undo history and collaborative editing possible.
   
   @cn [`prosemirror-transform`](##transform) 包含了一种可以被重做和撤销的修改文档的功能，它是 prosemirror-state 库的 transaction 功能的基础，这使得撤销操作历史记录和协同编辑成为可能。

In addition, there are modules for [basic editing
commands](##commands), [binding keys](##keymap), [undo
history](##history), [input macros](##inputrules), [collaborative
editing](##collab), a [simple document schema](##schema-basic), and
more under the [GitHub prosemirror
organization](https://github.com/prosemirror/).

@cn 除此之外，还有一些模块如 [基本编辑命令](##commands)，[快捷键绑定](##keymap)，[撤销历史](##history)，
[宏命令](##inputrules)，[协同编辑](##collab)，和[一个简单的文档 Schema](##schema-basic)等等。更多模块可以在 Github 上的 [Prosemirror 组织](https://github.com/prosemirror/) 中发现。

@comment 相应模块的中文版在 [这里](https://github.com/xheldon-prosemirror/)

The fact that ProseMirror isn't distributed as a single,
browser-loadable script means that you'll probably want to use some
kind of bundler when using it. A bundler is a tool that automatically
finds your script's dependencies, and combines them into a single big
file that you can easily load from a web page. You can read more about
bundling on the web, for example
[here](https://medium.freecodecamp.org/javascript-modules-part-2-module-bundling-5020383cf306).

@cn Prosemirror 并不是一个浏览器可直接加载的脚本，这意味着你需要使用一些打包工具才能使用它。
打包工具就是一个自动寻找你脚本声明的依赖，然后合并它们到一个单独的脚本文件，以便你能够在浏览器中方便的加载它。
你可以自己去看看更多关于 Web 打包方面的东西，比如 [这里](https://medium.freecodecamp.org/javascript-modules-part-2-module-bundling-5020383cf306) 。

## My first editor

The Lego pieces fit together like this to create a very minimal
editor:

@cn 下面的代码像乐高积木一样的摞在一起创建了一个最简单的编辑器：

```javascript
import {schema} from "prosemirror-schema-basic"
import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"

let state = EditorState.create({schema})
let view = new EditorView(document.body, {state})
```

ProseMirror requires you to specify a schema that your document
conforms to, so the first thing this does is import a module with a
basic schema in it.

@cn Prosemirror 需要你手动指定一个 document 需要遵守的 Schema (来规定哪些元素能包含哪些不能包含以及元素之间的关系)，
为了达成这个目的，上述代码做的第一件事就是先导入一个基本的 schema（通常情况下 schema 是你自己写的，这里作者拿了一个现成的包含基本元素的 schema 做示例——译者注）。

That schema is then used to create a state, which will generate an
empty document conforming to the schema, and a default selection at
the start of that document. Finally, a view is created for the state,
and appended to `document.body`. This will render the state's document
as an editable DOM node, and generate state transactions whenever the
user types into it.

@cn 之后，这个基础 schema 被用来创建一个 state，该 state 会生成一个遵守 schema 约束的一个空的文档，
以及一个默认的选区在这个文档的开头(这个选区是空的，因此这里指的是光标)。最终，这个 state 会生成一个 view 被 append 到 document.body。
上述的 state 的文档最终将被渲染成一个可编辑的 DOM 节点(就是 contenteditable 的节点——译者注) 和一个会对用户输入做出反应的 state transaction。

The editor isn't very usable yet. If you press enter, for example,
nothing happens, because the core library has no opinion on what enter
should do. We'll get to that in a moment.

@cn (不幸的是)到目前为止这个编辑器还不能用. 例如, 如果你在刚刚的编辑器中按 Enter 键, 
则什么也不会发生, 因为上述提到的四个核心模块并不知道输入 Enter 之后应该做什么, 我们将在稍后告诉它如何响应各种输入行为.

## Transactions

When the user types, or otherwise interacts with the view, it
generates ‘state transactions’. What that means is that it does not
just modify the document in-place and implicitly update its state in
that way. Instead, every change causes a
[_transaction_](#state.transactions) to be created, which describes
the changes that are made to the state, and can be applied to create a
_new_ state, which is then used to update the view.

@cn 当用户输入的时候, 或者更广泛的说, 当用户与页面的 view 进行交互的时候, prosemirror 会产生 ‘state transactions’. 
这意味着每当用户输入后, prosemirror 不仅仅只修改 document 内容, 同时还会在背后更新 state. 
也就是说, 每一个变化都会有一个 [_transaction_](#state.transactions) 被创建, 它描述了 state 被应用的变化, 
这些变化可以被用来创建一个新的 state, 然后这个新的 state 被用来更新 view.

By default this all happens under the cover, but you can hook into by
writing [plugins](#state.plugins) or configuring your view. For
example, this code adds a
[`dispatchTransaction`](##view.DirectEditorProps.dispatchTransaction)
[prop](##view.EditorProps), which will be called whenever a
transaction is created:

@cn 默认情况下, 上述的这些变化是框架进行的, 你无需关注. 不过你可以通过写一个 [plugins](#state.plugins) 或者自定义你的 view 的方式, 
来往这个变化的过程中挂载一些 hook. 举个例子, 下面的代码增加了一个 [`dispatchTransaction`](##view.DirectEditorProps.dispatchTransaction) 的 [prop](##view.EditorProps), 
它在每一个 transaction 被创建的时候调用：

```javascript
// (Imports omitted)

let state = EditorState.create({schema})
let view = new EditorView(document.body, {
  state,
  dispatchTransaction(transaction) {
    console.log("Document size went from", transaction.before.content.size,
                "to", transaction.doc.content.size)
    let newState = view.state.apply(transaction)
    view.updateState(newState)
  }
})
```

_Every_ state update has to go through
[`updateState`](##view.EditorView.updateState), and every normal
editing update will happen by dispatching a transaction.

@cn _每次_ 的 state 更新最终都需要执行 [`updateState`](##view.EditorView.updateState) 方法, 
而且每 dispatching 一个 transaction 一般情况下都会触发一个编辑状态的更新.

## Plugins

Plugins are used to extend the behavior of the editor and editor state
in various ways. Some are relatively simple, like the
[keymap](##keymap) plugin that binds [actions](#commands) to
keyboard input. Others are more involved, like the
[history](##history) plugin which implements an undo history by
observing transactions and storing their inverse in case the user
wants to undo them.

@cn Plugins 被用来以多种不同的方式扩展编辑行为和编辑状态.
一些插件比较简单, 比如 [keymap](##keymap) 插件, 它用来绑定键盘输入的 [actions](#commands). 还有些插件相对复杂一点, 
比如 [history](##history) 插件, 它通过监视 transactions 和按照相反的顺序存储它们以便用户想要撤销
一个 transactions 来实现一个 undo/redo 的功能.

Let's add those two plugins to our editor to get undo/redo
functionality:

@cn 让我们先增加下面两个 plugin 以获得 undo/redo 的功能：

```javascript
// (Omitted repeated imports)
import {undo, redo, history} from "prosemirror-history"
import {keymap} from "prosemirror-keymap"

let state = EditorState.create({
  schema,
  plugins: [
    history(),
    keymap({"Mod-z": undo, "Mod-y": redo})
  ]
})
let view = new EditorView(document.body, {state})
```

Plugins are registered when creating a state (because they get access
to state transactions). After creating a view for this history-enabled
state, you'll be able to press Ctrl-Z (or Cmd-Z on OS X) to undo your
last change.

@cn Plugins 会在创建 state 的时候被注册(因为它们需要访问 state 的 transactions 的权限). 
在给这个可撤销/重做的 state 创建一个 view 之后, 你将能够通过按 Ctrl+Z(或者 Mac 下 Cmd+Z) 撤销上一步操作.

## Commands

The `undo` and `redo` values that the previous example bound to keys
are a special kind of functions called [_commands_](#commands).
Most editing actions are written as commands which can be bound to
keys, hooked up to menus, or otherwise exposed to the user.

@cn 上面示例中, 被绑定到相关键盘按键的的特殊的函数叫做 [_commands_](#commands). 大多数的编辑行为都会被写成 commands 的形式, 
因此可以被绑定到特定的键上, 以供编辑菜单调用, 或者暴露给用户来操作.

The `prosemirror-commands` package provides a number of basic editing
commands, along with a minimal keymap that you'll probably want to
enable to have things like enter and delete do the expected thing in
your editor.

@cn `prosemirror-commands` 这个包提供了很多基本的编辑 commands, 包括在编辑器中按照你的期望映射 enter 和 delete 按键的行为.

```javascript
// (忽略无关代码)
import {baseKeymap} from "prosemirror-commands"

let state = EditorState.create({
  schema,
  plugins: [
    history(),
    keymap({"Mod-z": undo, "Mod-y": redo}),
    keymap(baseKeymap)
  ]
})
let view = new EditorView(document.body, {state})
```

At this point, you have a basically working editor.

@cn 到此为止, 你应该有了一个基本能 work 的编辑器了.

To add a menu, additional keybindings for schema-specific things, and
so on, you might want to look into the
[`prosemirror-example-setup`](https://github.com/prosemirror/prosemirror-example-setup)
package. This is a module that provides you with an array of plugins
that set up a baseline editor, but as the name suggests, it is meant
more as an example than as a production-level library. For a
real-world deployment, you'll probably want to replace it with custom
code that sets things up exactly the way you want.

@cn 如果还想增加一个菜单方便编辑操作, 或者想增加一些 schema 允许的按键绑定, 诸如此类的东西, 
那么你可能想要看下 [`prosemirror-example-setup`](https://github.com/prosemirror/prosemirror-example-setup) 这个包. 
这个包提供了实现一个基本编辑器的一系列设置好的插件, 不过就像这个包名所表示的含义那样, 它仅仅是用来示例一些 API 的用法, 
而不是一个可以用在生产环境的包. 对于一个真实的开发环境, 你可能想要用自己的代码替换其中的一些内容, 以精确实现你想要的效果.

## Content

A state's document lives under its [`doc`](##state.EditorState.doc)
property. This is a read-only data structure, representing the
document as a hierarchy of nodes, somewhat like the browser DOM. A
simple document might be a `"doc"` node containing two `"paragraph"`
nodes, each containing a single `"text"` node. You can read more about
the document data structure in the [guide](#doc) about it.

@cn 一个 state 的 document 对象存储在 [`doc`](##state.EditorState.doc) 属性上, 它是一个只读类型的数据结构, 用一系列的不同层级的节点表示, 
这些节点的层级结构有点类似于浏览器中的 DOM 节点. 一个简单的 document 可能有一个 “doc” 节点, 
它包含两个 “paragraph” 节点, 每个 “prragraph” 节点又包含一个 “text” 节点. 
你可以在 [guide](#doc) 中读到更多关于 document 数据结构的信息.

When initializing a state, you can give it an initial document to use.
In that case, the `schema` field is optional, since the schema can be
taken from the document.

@cn 当初始化一个 state 的时候, 你可以传给它一个初始 document. 在这种情况下, 
schema 字段就是可选的, 因为 schema 可以从 document 中获取.

Here we initialize a state by parsing the content found in the DOM
element with the ID `"content"`, using the DOM parser mechanism, which
uses information supplied by the schema about which DOM nodes map to
which elements in that schema:

@cn 下面的示例我们通过 DOM 格式化的机制去格式化 DOM 中 id 为 “content” 的元素来初始化一个 state, 
这个 state 使用的 schema 信息是由 DOM 节点格式化后映射到相应元素上获得的(意思就是 DOM 节点包含哪些元素, 
格式化后被对应成 schema 的形式供 state 使用, 因此 schema 信息可以从格式化 DOM 的信息中获取而不用手动指定——译者注).

```javascript
import {DOMParser} from "prosemirror-model"
import {EditorState} from "prosemirror-state"
import {schema} from "prosemirror-schema-basic"

let content = document.getElementById("content")
let state = EditorState.create({
  doc: DOMParser.fromSchema(schema).parse(content)
})
```
