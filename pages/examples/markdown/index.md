!{"template": "example", "title": "ProseMirror markdown 示例"}

# 友好的 markdown

想象一下你有一个允许用户输入评论的网站，同时你决定让用户在评论输入的时候使用 Markdown。
你的大部分用户都知道如何使用 Markdown，并且觉得它很方便。但是你可能还要面对一些非技术的用户，
他们对学习 Markdown 的晦涩难懂的语法规则并不感冒。

不用修改你后端服务的任何东西，你可以将 ProseMirror 作为你的编辑器。
人们在编辑的时候可以随时切换到正常编辑模式和 Markdown 编辑模式！

@HTML

[`prosemirror-markdown`](https://github.com/prosemirror/prosemirror-markdown) 库定义了
一个 ProseMirror 的 [schema](/docs/guide/#schema) ，它支持了 Markdown 的语法及元素。
它也提供了一个 parser 和 serializer 来将普通文档和 Markdown 文档相互转化。

为了抽象这个实际的编辑器，我们首先在 textarea 中创建了一个 Markdown 视图：

PART(MarkdownView)

之后实现支持 Markdown 的 ProseMirror 编辑器。该编辑器输入和输入的内容仍然是 Markdown 文本，
该文本内部被转换成 ProseMirror 文档:

PART(ProseMirrorView)

最后，我们可以再加一些单选按钮以让用户来在两种输入模式中切换:

PART(radio)
