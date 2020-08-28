!{"template": "example", "title": "ProseMirror 菜单示例"}

# 添加一个操作菜单

大多数示例使用 [example setup package](https://github.com/prosemirror/prosemirror-example-setup) 来创建一个菜单，不过我们其实并不推荐在生产环境使用它和 [menu package](https://github.com/prosemirror/prosemirror-menu) ，因为它们既不足够简单，也不是可定制的模块，你使用的话可能很快就会遇到一些限制。

这个示例将会展示如何为 ProseMirror 编辑器实现一个自定义（并且丑陋）的菜单：

@HTML

[![Remix on Glitch](https://cdn.glitch.com/2703baf2-b643-4da7-ab91-7ee2a2d00b5b%2Fremix-button.svg)](https://glitch.com/edit/#!/remix/prosemirror-demo-menu)

实现的大致思路是，创建一系列的界面操作元素，然后将他们绑定到 [commands](/docs/guide/#commands) 上。当点击的时候，它们就会在编辑器中执行相应的命令。

但是有个问题就是，如何处理一些并不总是可用的命令，比如当你光标在一个段落中的时候，是否应该将「将此元素转换成段落」的命令展示出来？如果是的话，是否应该将其置灰？这个示例将会简单的隐藏哪些当前不可用的命令按钮（译者注：命令是否可用与光标所在的位置紧密相关）。

为了能够做到这一点，就需要当编辑器的 state 更新的时候，同步更新菜单的 DOM 结构（取决于菜单中按钮命令的数量，以及需要决定命令是否可用的工作量，更新 DOM 的操作可能会比较「昂贵」。事实上针对这个问题除非让命令的数量尽可能的少，复杂性尽可能的低，或者当 state 改变的时候不要改变菜单的外观，否则并没有好的解决办法）。

如果你已经有了某种数据流的抽象，可以将菜单作为一个与 ProseMirror 分离的组件的同时还能将其编辑器的 state 状态绑定，那么它应该会工作良好。如果你还没有，那么一个 plugin 可能是最简单的实现菜单的方案。

菜单组件的样子看起来可能是下面这样：

PART(MenuView)

它是一些菜单项的数组，每个数组元素有 `command` 和 `dom` 属性，然后把他们都放到一个菜单栏元素中。然后，它设置了一个事件处理函数，监听哪些菜单被点击了，然后运行相应的命令。

为了在 state 更新的时候同步更新菜单，所有的命令都应该可以在没有 dispatch 函数的时候运行，然后那些返回 false 的命令对应的菜单项会被隐藏。

将这个组件放到编辑器 view 上的时候有点棘手--该组件需要在编辑器 view 初始化的时候访问它，但是与此同时，编辑器 view 的 [`dispatchTransaction`](##view.DirectEditorProps.dispatchTransaction) 属性需要调用该菜单组件的更新方法。因此，Plugins 在这里很有用。它允许你定义一个 [plugin view](##state.PluginSpec.view),就像下面这样：

PART(menuPlugin)

当一个编辑器 view 初始化的时候，或者当任一个 plugins 中的 state 变化的时候，那些定义了 plugin view 的 plugin 会将 plugin view 初始化。然后每当编辑器的 state 更新的时候，这些 plugin view 的 `update` 方法就会被调用，当 plugin 被销毁的时候，plugin view 的 `destory` 方法会被调用。因此，通过增加带有 plugin view 的 plugin 到编辑器的 view 上，我们可以确保菜单栏与编辑器的 view 同步更新。

真实的菜单项看上去可能与下面这个类似，它有一些基本的如加粗，斜体，以及一些 block 类型的按钮：

PART(menu)

[`prosemirror-menu` package](https://github.com/prosemirror/prosemirror-menu) 包做了类似的事情，不过它还增加了一些东西类似简单的拖入菜单和激活/失活图标（去高亮加粗按钮当选择了加粗的文本时候）。
