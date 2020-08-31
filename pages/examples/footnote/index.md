!{"template": "example", "title": "ProseMirror 脚注示例"}

# 编辑脚注

这个示例演示了如何在 ProseMirror 中实现类似脚注一样的东西：

@HTML

[![Remix on Glitch](https://cdn.glitch.com/2703baf2-b643-4da7-ab91-7ee2a2d00b5b%2Fremix-button.svg)](https://glitch.com/edit/#!/remix/prosemirror-demo-footnote)

脚注看起来应该被实现为一种带有内容的内联节点--他们出现在其他内联内容之间，但是它的内容并不是它外层文本 block 的内容。
因此让我们先像下面一样定义它们：

PART(schema)

对于有内容的内联节点，ProseMirror 处理的并不太好，至少默认并不支持这种类型。
所以你需要为这种类型的节点写一个 [node view](/docs/guide/#view.node_views)，
它可以以某种方式管理这种带内容的内联节点出现在编辑器中的方式。

因此这就是我们将要做的事情。本示例中的脚注以一个数字的形式显示在文档中。而事实上，
他们仅仅是 `<footnote>` 节点，我们需要依赖 CSS 来将数字添加上去：

PART(nodeview_start)

只有当 node view 被选中的时候，用户才可以与它的内容做交互（它将在用户的光标放到上去的时候或者鼠标点击的时候才会被选中，
因为我们对这种类型的节点设置了 [`atom`](##model.NodeSpec.atom) 属性)。下面这两种方法处理 node view 被选中和取消选中时候的逻辑：

PART(nodeview_select)

当选中的时候，我们需要做的是弹出一个小的子编辑器，它本身是一个 ProseMirror view，内容是节点的内容。在子编辑器中的 Transaction 被特殊的由父编辑器的 `dispatchInner` 方法处理。

Mod-z 和 y 按键被绑定到 _父编辑器_ 的 undo 和 redo 功能上。我们一会儿再来看它是如何做到的：

PART(nodeview_open)

当子编辑器的内容改变的时候应该如何处理？我们可以仅仅是拿到内容，然后将在外部编辑器的脚注的内容给重置为该内容，但是这对于 undo 历史和协同编辑来说并不可行。

一个更好的实现是简单的将自于子编辑器的 setps，加上合适的偏移位置，应用到外部文档中去。

我们需要小心的处理 [appended transactions](##state.PluginSpec.appendTransaction)，同时需要能够处理来自外部编辑器的更新而不造成一个无限循环，
下面代码也同样理解 transaction 的 `「fromOutside」` 的含义，会在它出现的时候不让其向外传播（冒泡）：

PART(nodeview_dispatchInner)

为了能够干净的处理来自外部编辑器的更新（比如协同编辑或者由外部编辑器处理的用户 undo 的一些操作的时候），node view 的 [`update`](##view.NodeView.update)
方法将会仔细的查看当前内容和节点内容的不同。它只替换掉发生变化的部分，尽可能的保证光标在原地不动：

PART(nodeview_update)

最后，nodevidw 需要处理销毁事件，以及告诉外部编辑器应该处理哪些来自于 node view 的事件和变化：

PART(nodeview_end)

我们可以像下面这样启用 schema 和 node view，以创建一个真实编辑器：

PART(editor)
