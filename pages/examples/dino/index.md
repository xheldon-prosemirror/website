!{"template": "example", "title": "ProseMirror dino example"}

# 文档中的恐龙

产品给了你一个需求：你需要在你的文档中包含一些独家的文档元素。
用户可以操作这些元素或者开发者自己可以生成这些元素。下面的例子就展示给你这样一个「独家」的恐龙元素。

ProseMirror 允许你定义你自己的 schemas，它包含了自定义的文档元素。你可以在文档中使用任何你放到 schema 中的元素，当然如果 schema 中没有的元素你是不能够用的。

@HTML

[![Remix on Glitch](https://cdn.glitch.com/2703baf2-b643-4da7-ab91-7ee2a2d00b5b%2Fremix-button.svg)](https://glitch.com/edit/#!/remix/prosemirror-demo-dino)

在这个示例中，我们扩展了 [basic](https://github.com/xheldon-prosemirror/prosemirror-schema-basic) schema，将一个单独的新的节点加入其中。
首先，我们定义一个 [node spec](##model.NodeSpec)，它描述了节点的行为和它的 DOM 表现形式。

PART(nodespec)

之后，我们创建了一个真实的 schema 来包含这个节点，然后使用它去格式化 HTML 到 ProseMirror 文档：

PART(schema)

这个示例再次使用了 [example setup](https://github.com/xheldon-prosemirror/prosemirror-example-setup) 模块，以提供一些基本的编辑行为。
不过我们在菜单栏需要一个新的菜单项，来插入该节点。所以首先，定义一个 [command](/docs/guide/#commands) 来处理恐龙的插入：

PART(command)

然后，新建一个菜单项来调用我们的命令：

PART(menu)

现在，就只剩下用我们自定义的 schema 和 menu 来创建一个编辑器 state 和 view： 

PART(editor)
