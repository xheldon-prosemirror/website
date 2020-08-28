!{"template": "example", "title": "ProseMirror 内嵌编辑器示例"}

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

PART(nodeview_forwardUpdate)

When adding steps to a transaction for content changes, the offset is
adjusted for the changes in length caused by the change, so that
further steps are created in the correct position.

The `setSelection` method on a node view will be called when
ProseMirror tries to put the selection inside the node. Our
implementation makes sure the CodeMirror selection is set to match the
position that is passed in.

PART(nodeview_setSelection)

A somewhat tricky aspect of nesting editor like this is handling
cursor motion across the edges of the inner editor. This node view
will have to take care of allowing the user to move the selection out
of the code editor. For that purpose, it binds the arrow keys to
handlers that check if further motion would ‘escape’ the editor, and
if so, return the selection and focus to the outer editor.

上述的按键映射也同样绑定了撤销和重做，外部编辑器将会处理该事件。对于 ctrl-enter 按键来说，在 ProseMirror 的基础按键绑定中，将会在代码块后面创建一个新的段落节点。

PART(nodeview_keymap)

When a node update comes in from ProseMirror, for example because of
an undo action, we sort of have to do the inverse of what
`forwardUpdate` did—check for text changes, and if present, propagate
them from the outer to the inner editor.

To avoid needlessly clobbering the state of the inner editor, this
method only generates a replacement for the range of the content that
was changed, by comparing the start and end of the old and new
content.

PART(nodeview_update)

The `updating` property is used to disable the event listener on the
code editor, so that it doesn't try to forward the change (which just
came from ProseMirror) back to ProseMirror.

PART(nodeview_end)

Handling cursor motion from the outer to the inner editor must be done
with a keymap on the outer editor, because the browser's native
behavior won't handle this. The `arrowHandler` function uses the
[`endOfTextblock` method](##view.EditorView.endOfTextblock) to
determine, in a bidi-text-aware way, whether the cursor is at the end
of a given textblock. If it is, and the next block is a code block,
the selection is moved into it.

PART(arrowHandlers)
