!{"template": "example", "title": "ProseMirror embedded editor example"}

<link rel=stylesheet href="../../css/codemirror.css">

# 嵌入一个代码编辑器

某些节点以一个编辑器内嵌的文档节点来表示可能会比较有用，比如代码块、数学公式，或者甚至是图片，以展示专门针对此类节点的自定义控制组件。
[Node views](##view.NodeView) 就是 ProseMirror 用来实现此类效果的一个 feature。

将 node view 和 keymap 放到一个编辑器中的效果就像下面这样：

@HTML

在这个示例中，我们设置了一个代码块，它们在 [basic schema](##schema-basic) 中已经提供了。
它被渲染成一个 [CodeMirror](http://codemirror.net) 的实例，也即一个代码编辑器组件。大致思路与 [footnote example](../footnote/) 类似，
不过区别是代码块不用用户选择某个节点，它总是会显示出来。

将 CodeMirror 放到 ProseMirror 的 node view 中的适配代码其实有点复杂，因为我们需要在两种不同文档中相互转换--ProseMirror 的树状文档与 CodeMirror 的纯文本文档：

PART(nodeview_start)

当代码编辑器被 focus 的时候，我们可以将外部编辑器的选区与内部的代码编辑器选区保持同步，这样我们在外部编辑器执行任何命令的话就能看到一个正确的选区：

PART(nodeview_forwardSelection)

辅助函数负责将 CodeMirror 的选区转换成 ProseMirror 的选区。因为 CodeMirror 使用一个基于行/列的索引系统，因此 `indexFromPos` 被用来将其转换成 ProseMirror 的字符索引：

PART(nodeview_asProseMirrorSelection)

选区也可以以另一种方式同步，比如将 ProseMirror 的选区转换成 CodeMirror 的选区，这时要使用 [`setSelection`](##view.NodeView.setSelection) 方法来实现：

PART(nodeview_setSelection)

当代码编辑器的内容发生变化的时候，在 node view 的构造函数中注册了该变化的事件处理函数将会被调用。
它将会对代码块节点的当前值和编辑器中的值进行比较，如果有不同，则会 dispatch 一个 transaction：

PART(nodeview_valueChanged)

像这样的嵌套编辑器，比较棘手的地方是处理光标在内部编辑器边缘移动的情况。node view 必须允许用户能够将光标移出代码编辑器。
为了实现这个目的，它设置了一个按键映射以绑定方向键处理函数，以检查是否用户进一步的操作将会「脱离」代码编辑器的控制，如果是的话，返回这个选区，然后 focus 外部编辑器。

上述的按键映射也同样绑定了撤销和重做，外部编辑器将会处理该事件。对于 ctrl-enter 按键来说，在 ProseMirror 的基础按键绑定中，将会在代码块后面创建一个新的段落节点。

PART(nodeview_keymap)

当一个代码编辑器中的内容更新的时候，比如做了一个撤销操作，我们在某种程度上需要去做一些与这些 `valueChanges（值变化）` 相反的操作（译者注：即添加的要被删除掉，删除的要被添加上等），
即检查文本变化，如果发生了变化，将这些变化从外部编辑器传递到内部编辑器（译者注：即当修改了内部代码编辑器的内容后，按撤销的时候，ProseMirror 需要将修改反转的变化同步到 CodeMirror ）：

PART(nodeview_update)

`updating` 属性用来禁用在代码编辑器上的事件处理函数：

PART(nodeview_end)

`computeChange` 用来比较两个字符串，寻找他们之间的最小差异，就像下面这样：

PART(computeChange)

它从字符串的开始迭代寻找，一直到结尾，直到找到一个不同之处，然后返回返回一个对象，含有改变的起始位置，终止位置以及替换的文本，或者 `null`，表示没有变化。

处理从外部编辑器到内部代码编辑器的光标的移动必须由外部编辑器通过按键映射完成。`arrowHandler` 函数使用 [`endOfTextblock` 方法](##view.EditorView.endOfTextblock) ，以一种受 bidi 文本影响的方式，决定光标是否在给定文本 block 的末尾。如果是的话，并且下一个 block 是代码块，则光标就会被移动到代码块内（译者注：bidi 影响文本的书写方向，因此影响光标是否在文本块的结尾的判断，ProseMirror 处理了这种情况）：

PART(arrowHandlers)
