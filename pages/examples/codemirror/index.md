!{"template": "example", "title": "ProseMirror 内嵌编辑器示例"}

# 嵌入一个代码编辑器

某些节点以一个编辑器内嵌的文档节点来表示可能会比较有用，比如代码块、数学公式，或者甚至是图片，以展示专门针对此类节点的自定义控制组件。
[Node views](##view.NodeView) 就是 ProseMirror 用来实现此类效果的一个 feature。

在这个示例中，我们设置了一个代码块，它们在 [basic schema](##schema-basic) 中已经提供了。
它被渲染成一个 [CodeMirror](http://codemirror.net) 的实例，也即一个代码编辑器组件。大致思路与 [footnote example](../footnote/) 类似，
不过区别是代码块不用用户选择某个节点，它总是会显示出来。

将 node view 和 keymap 放到一个编辑器中的效果就像下面这样：

@HTML

由于我们希望代码编辑器(CodeMirror)中的更改能够立即在ProseMirror文档中显示出来，所以我们的节点视图(node view)必须及时将更改内容刷新到 ProseMirror 中。
为了确保 ProseMirror 命令能够操作到正确的选区(selection)，代码编辑器(CodeMirror)还会将它的选区(selection) 与 ProseMirror 同步。

在我们的代码块 node view 中，我们首先创建一个编辑器，它带有一些基本扩展、一些额外的按键绑定，并且还有一个更新监听器，用于进行同步。

PART(nodeview_start)

当代码编辑器(CodeMirror)处于 focused 状态时，将任何更改文档(changes)或选区(selection)的更新转换为 ProseMirror 事务(transaction)。
通过传递给节点视图(node view)的`getPos`函数，我们可以确定代码内容相对于外部文档的起始位置（`+ 1`跳过代码块的开头标记）。

PART(nodeview_forwardUpdate)

当因为内容更改(content changes)而要给事务(transaction)添加步骤(step)时，
通过调整偏移量(offset)来适应更改引起的长度变化，以便在正确的位置创建进一步的步骤(steps)。

当 ProseMirror 尝试将选择放置在节点内时，会调用节点视图(node view)上的 [`setSelection`](##view.NodeView.setSelection) 方法。
我们的实现会确保 CodeMirror 的选择与传入的位置相匹配。

PART(nodeview_setSelection)

像这样的嵌套编辑器，比较棘手的地方是处理光标在内部编辑器边缘移动的情况。节点视图(node view) 必须允许用户能够将光标移出代码编辑器(CodeMirror)。 
为了实现这个目的，它设置了一个按键映射以绑定方向键处理函数，以检查是否用户进一步的操作将会「脱离」代码编辑器(CodeMirror)的控制，如果是的话，返回这个选区，然后 focus 外部编辑器。

上述的按键映射也同样绑定了撤销和重做，外部编辑器将会处理该事件。对于 ctrl-enter 按键来说，在 ProseMirror 的基础按键绑定中，将会在代码块后面创建一个新的段落节点。

PART(nodeview_keymap)

当从 ProseMirror 收到节点更新时，例如由于撤销操作，
我们需要做与 `forwardUpdate` 相反的操作-检查文本变化，并且如果有变化，则将其从外部传播到内部编辑器。
(译者注: `forwardUpdate` 相当于同步 CodeMirror 状态给 ProseMirror 的监听器, `update` 相当于同步 ProseMirror 状态给 CodeMirror 的监听器)

为了避免不必要地破坏内部编辑器的状态，该方法仅通过比较旧内容和新内容的起始和结束来生成更改范围的替换内容。

PART(nodeview_update)

`updating` 属性用于禁用代码编辑器(CodeMirror)上的事件监听器(译者注: 好像是原文写错了应该是 `stopEvent`)，以防止它尝试将更改（刚刚来自 ProseMirror）转发回 ProseMirror。

PART(nodeview_end)

处理从外部编辑器到内部代码编辑器(CodeMirror)的光标的移动必须由外部编辑器通过按键映射完成。`arrowHandler` 函数使用 [`endOfTextblock` 方法](##view.EditorView.endOfTextblock) ，以一种受 bidi 文本影响的方式，决定光标是否在给定文本 block 的末尾。如果是的话，并且下一个 block 是代码块，则光标就会被移动到代码块内（译者注：bidi 影响文本的书写方向，因此影响光标是否在文本块的结尾的判断，ProseMirror 处理了这种情况）：


PART(arrowHandlers)
