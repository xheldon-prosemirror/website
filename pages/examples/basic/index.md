!{"template": "example", "title": "ProseMirror 基本示例"}

# 配置一个编辑器

只使用核心库来从零配置一个编辑器的话需要很多的代码。为了能够用一个预先配置好的编辑器快速开始，
我们提供了 [`prosemirror-example-setup`](https://github.com/xheldon-prosemirror/prosemirror-example-setup) 包，
它已经为你创建好了一系列的插件、基础设置，以及一个可配置的 schema。在这个示例中，我们使用 [basic schema](https://github.com/xheldon-prosemirror/prosemirror-schema-basic)
以及使用 [lists](https://github.com/xheldon-prosemirror/prosemirror-schema-list) 来扩展该 schema。

PART(code)

上面代码的运行效果是这个样子：

@HTML

[![Remix on Glitch](https://cdn.glitch.com/2703baf2-b643-4da7-ab91-7ee2a2d00b5b%2Fremix-button.svg)](https://glitch.com/edit/#!/remix/prosemirror-demo-basic)

下面这些插件由上述的 example-setup 库所创建：

 * [Input rules](##inputrules)，它是一个 `宏`，以当有匹配到的输入的时候执行。在这个示例中，
   它提供了类似智能引号（自动配对引号）以及一些类 markdown 的编辑行为，比如如果想新建输入一个 blockquote 可以输入 「>」。
 * [Keymaps](##keymap) 加上 [base bindings](##commands.baseKeymap) 和自定义的键盘绑定以生成常用的样式和节点，
   如 mod+i 可以设置斜体，ctrl—shift—1 则将当前文本块转换成一级标题。
 * [drop cursor](https://github.com/xheldon-prosemirror/prosemirror-dropcursor) 和 [gap cursor](##gapcursor) 插件。
 * [撤销历史](##history)
 * 一个 [菜单栏](https://github.com/xheldon-prosemirror/prosemirror-menu) （该模块更多的是 demo 性质而不是在生产环境使用），有一些
   常用的菜单操作。
