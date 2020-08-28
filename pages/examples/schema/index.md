!{"template": "example", "title": "ProseMirror schema 示例"}

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

Links 则确实有一个 attributes--它们的 url，因此它们的 DOM 序列化的方法需要输出这个 attributes
（从 `toDOM` 函数返回的数组中的第二个元素如果是一个普通对象的话，会提供一个 DOM attributes 集合），同时它们的 DOM parser 需要读取这个 attributes。

默认情况下，marks 需要 _inclusice_ 属性，它表示该 mark 会应用到直接插入在它们后面的内容（如果这些 marks 位于它们父级节点的开始位置的话，也一样会应用）。
对于 link 类型的 marks，这通常不是预期的行为，因此设置到此类 marks 上的 [`inclusive`](##model.MarkSpec.inclusive) 属性可以被设置为 false 以禁止此行为。

译者注：假设有 mark b： `<b>abc</b>`，然后输入 `d`。如果其 `inclusive` 属性是 true，则光标放到 `c` 后面的时候输入的内容也被当成是 b mark 的一部分，即变成了 `<b>abcd</>`；
同理，如果 b 是其父节点的第一个 mark 的话，如 `<p><b>abc</b></p>`，则得到 `<p><b>dabc</b></p>`。
如果 b 的 mark 是 `inclusive` 是 false，则光标放到 `c` 后面输入内容 `d`，则会得到结果 `<b>abc</b>d`，
同理，若是其父节点的第一个 mark 的话， 则得到：`<p>d<b>abc</b></p>`：

@HTML:star

[![Remix on Glitch](https://cdn.glitch.com/2703baf2-b643-4da7-ab91-7ee2a2d00b5b%2Fremix-button.svg)](https://glitch.com/edit/#!/remix/prosemirror-demo-schema)

为了能与这些元素进行交互，我们再一次的需要一个自定义的 keymap。对于打开/关闭 marks，有一个直接使用的命令辅助函数，这样我们就可以直接对 shouting mark 使用这个辅助函数了：

PART(starKeymap)

打开/关闭一个 link 实际上是有点复杂的。当什么也没选中的时候，启用或者禁用一个 inclusive 为 false 的 marks 没有任何意义，因为你不能将内容「输入进」这种 marks（就像 inclusive 为 true 做的那样）。
此外我们还需要让用户输入一个 URL--但是前提是得先添加一个 link。因此打开/关闭 links 的命令会在请求用户输入 URL 之前使用 [`rangeHasMark`](##model.Node.rangeHasMark) 去检查 link mark 是否将要被添加或者移除。

（`请求用户` 这种交互逻辑可能在真实的系统是并不是你想要的。当使用一个异步的方法让用户输入一些信息然后应用的时候，你需要确保该时刻使用的是 _当前最新的_ state，而不是当命令被调用时刻的 state。）

PART(toggleLink)

插入一个 star 的命令首先检查 schema 是否允许一个 star 插入光标所在的位置（使用 [`canReplaceWith`](##model.Node.canReplaceWith) 方法），如果允许的话，
则用新创建的 star 节点替换选区：

PART(insertStar)
