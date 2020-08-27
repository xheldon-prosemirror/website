!{"template": "example", "title": "ProseMirror schema example"}

# 从零开始写一个 Schema

ProseMirror 的 [schemas](/docs/guide/#schema) 为文档提供了类似语法一样的东西--他们决定哪些文档结构是有效可用的。

最简单的 schema 可能仅仅是一个有文本节点组成的文档：

PART(textSchema)

你可以使用它来编辑行内元素。<span id="text-editor"></span> (ProseMirror 的 view 可以 [mounted(挂载)](##view.EditorView.constructor) 在任何节点，包括行内节点)

## 块级节点

为了添加更多文档结构，你通常想要添加一些块级节点。比如，下面这个 schema 包含一些备忘信息节点，它可以（可选的）与其他备忘信息组成一个备忘信息组节点，以分组显示：

PART(noteSchema)

对于不是 text 或者顶级节点的节点来说，提供一个 [`toDOM`](##model.NodeSpec.toDOM) 方法是[必要的](/docs/guide/#schema.serialization_and_parsing)，
这样一来，编辑器可以渲染这些节点；以及提供一个 [`parseDOM`](##model.NodeSpec.parseDOM) 方法，这样 DOM 节点可以被 parse 成 ProseMirror 的 node。
下面的 schema 使用自定义的 `<note>` 和 `<notegroup>` 这两个 DOM 元素来代表 ProseMirror 中对应的节点：

@HTML:note

你可以选中几个 notes 后按 ctrl-space 来将他们成组。要实现这个效果，你首先应该实现一个自定义的 [编辑命令](/docs/guide/#commands)，就像下面这样：

PART(makeNoteGroup)

一个像 `keymap({"Ctrl-Space": makeNoteGroup})` 一样的 [keymap](##keymap) 可以启用该命令。

对于 enter 和 backspace 按键的 [通用按键绑定](##commands.baseKeymap) 在这个 schema 中可以正常运行--
enter 将会分隔在光标两侧的文本 block，或者如果光标所在的位置为空文本 block，则会试着将其脱离其父级节点，
因此可以用来从当前 notes group 中退出，然后创建一个新的 notes。在一个文本 block 的开头按 backspace 会将文本 block 脱离其父级节点，
这样也可以用来将一个 note 中 note group 中移除。

## Groups and marks（节点组和 marks）

让我们再做一次，伴随着 start 和 shouting（不知道啥意思）。

下面这个 schema 不仅有文本作为 inline 节点，_start_ 也是 inline 的节点。
为了能够容易的引用我们的这两个 inline 节点，他们可以被归为一组（仍然叫做 `「inline」`）。
这个 schema 将遇到的两种 block 节点一视同仁，一个是 `paragraph` 类型，它允许任何 inline 内容，
另一种是 `boring_paragraph` 类型，它只允许没有 mark 设置的文本内容：

PART(starSchema_1)

因为文本 block 类型的节点默认情况下允许 marks，因此 `boring_paragraph` 节点将 [`marks`](##model.NodeSpec.marks) 设置为空字符串，以明确禁止它。

下面这个 schema 定义了两种类型的 marks，`shouted text` 和 `links`。前者类似于普通的加粗 marks，它只所在的内容上添加一点信息，而没有任何 attributes。
它在 DOM 中被渲染成 `<shouting>` 标签（样式被设置为内联、加粗和大写），同时有该名字的 DOM 标签应该被 parse 成这个 mark：

PART(starSchema_2)

Links do have an attribute—their target URL, so their DOM serializing
method has to output that (the second element in an array returned
from `toDOM`, if it's a plain object, provides a set of DOM
attributes), and their DOM parser has to read it.

By default, marks are _inclusive_, meaning that they get applied to
content inserted at their end (as well as at their start when they
start at the start of their parent node). For link-type marks, this is
usually not the expected behavior, and the
[`inclusive`](##model.MarkSpec.inclusive) property on the mark spec
can be set to false to disable that behavior.

@HTML:star

[![Remix on Glitch](https://cdn.glitch.com/2703baf2-b643-4da7-ab91-7ee2a2d00b5b%2Fremix-button.svg)](https://glitch.com/edit/#!/remix/prosemirror-demo-schema)

To make it possible to interact with these elements we again have to
add a custom keymap. There's a command helper for toggling marks,
which we can use directly for the shouting mark.

PART(starKeymap)

Toggling a link is a little more involved. En- or disabling
non-inclusive marks when nothing is selected isn't meaningful, since
you can't “type into’ them like you can with inclusive marks. And we
need to ask the user for a URL—but only if a link is being added. So
the command uses [`rangeHasMark`](##model.Node.rangeHasMark) to check
whether it will be adding or removing, before prompting for a URL.

(`prompt` is probably not what you'd want to use in a real system.
When using an asynchronous method to query the user for something,
make sure to use the _current_ state, not the state when the command
was originally called, when applying the command's effect.)

PART(toggleLink)

The command that inserts a star first checks whether the schema allows
one to be inserted at the cursor position (using
[`canReplaceWith`](##model.Node.canReplaceWith)), and if so, replaces
the selection with a newly created star node.

PART(insertStar)
