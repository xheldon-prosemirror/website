!{"template": "example", "title": "ProseMirror 拼写检查示例"}

# 拼写检查示例

浏览器的 DOM 用来表示复杂的网页是很棒的--这也是设计它的目的。但是它巨大的页面内容和松散的结构使其很难做一些类似于「TypeScript类型推断」一样的推断（来判断用户是否书写合法的内容）。因此，一个代表了更小文档的文档模型就理所当然的应运而生了。

本示例实现了一个简单的文档 [拼写检查](https://en.wikipedia.org/wiki/Lint_(software)) 功能，它能够发现文档中的问题，然后方便的修复它：

@HTML

[![Remix on Glitch](https://cdn.glitch.com/2703baf2-b643-4da7-ab91-7ee2a2d00b5b%2Fremix-button.svg)](https://glitch.com/edit/#!/remix/prosemirror-demo-lint)

这个示例的第一个部分就是一个函数，它接受一个文档参数，返回在该文档中发现的错误数组。我们将会使用 [`descendants`](##model.Node.descendants) 方法去方便的迭代文档中的所有节点。然后根据不同的节点类型，来应用不同的错误检查方式。

每个错误类型被表示为一个对象，它包含有一个错误提示、一个起始位置，以及一个结束位置信息，这样我们就能够展示错误提示然后高亮错误内容。对象也可选的有一个 `fix` 方法，可以修复错误（传 view 作为参数）：

PART(lint)

用来提供修复命令的工具函数大致长这样：

PART(fix)

插件通过维护一个 decorations 集合来高亮错误同时插入一个紧挨着错误的 icon。CSS 用来将这个 icon 定位到编辑器的右侧，这样它就脱离了文档流而不会影响内容：

PART(deco)

错误对象被存储在 icon 的 DOM 节点上，这样当点击 icon 的时候，事件处理函数能够访问到相应的信息。我们将单击设计成选中错误的区域，双击设计成执行 `fix` 方法。

重新计算所有的错误，然后重新创建 decorations 的集合不是一种非常高效方式，因此对于生产环境的代码你可能想要考虑一种增量更新这些 decorations 的方式。想实现这个确实有点复杂，不过却是可行的--transaction 可以为你提供文档的哪部分更新了的信息：

PART(plugin)
