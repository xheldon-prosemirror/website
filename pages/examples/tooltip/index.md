!{"template": "example", "title": "ProseMirror tooltip example"}

# Tooltips

我使用「Tooltips」意指一个小的 UI 元素显示于文档之上。这对于编辑器来说将其用来显示控制菜单或者额外的信息很有用，比如
显示一个类似于「Medium」风格的编辑 UI 组件（Medium 是一个知名的博客平台），它的控制按钮一般是隐藏的，除非你选中了一些文本。
此时它会在选区上方弹出来一个小的悬浮菜单。
 
在 ProseMirror 中通常有两种途径来实现这个 tooltips 效果。最简单的方式是插入一个 widget [decorations(装饰器)](/docs/guide/#view.decorations)
然后绝对定位之。如果你没有指定一个位置信息（即含有 `left` 和 `bottom` 的对象），该 widget 就会出现在你默认放置它的地方（新建一个 widget 需要一个 ProseMirror 中的位置 pos 坐标）。
如果该 tooltips 依赖一个你指定的位置的话，这挺好用的。

如果你想将一些东西置于选区之上，或者你想对这些元素使用动画，亦或者你需要能够允许当编辑器的 `overflow` 属性不是 `visible` 的时候，这个 tooltips 能够固定在编辑器之外（例如让
编辑器能滚动），那么上面的 decoration（装饰器）可能不太可行。在这种场景下，你将需要「手动」的来定位你的 tooltips。

@HTML

[![Remix on Glitch](https://cdn.glitch.com/2703baf2-b643-4da7-ab91-7ee2a2d00b5b%2Fremix-button.svg)](https://glitch.com/edit/#!/remix/prosemirror-demo-tooltip)

不过你仍然可以充分利用 ProseMirror 的更新逻辑，以让 tooltips 和编辑器的 state 保持同步。我们可以使用 [plugin view(插件视图)](##state.PluginSpec.view) 来创建一个 view component（视图组件）
来将其加到编辑器的更新周期中。

PART(plugin)

实际的 view 会创建一个 DOM 节点来表示该 tooltips，然后将其插入到编辑器文档中。

PART(tooltip)

无论何时编辑器的 state 更新了，它都会检查是否需要去更新 tooltips。它的位置计算可能有点麻烦，但是 CSS 就是这样。
基本上讲，它使用了 ProseMirror 的 [`coordsAtPos` 方法](##view.EditorView.coordsAtPos) 来找到选区的位置坐标，
然后使用该左边设置了一个 `left` 和 `bottom` 属性以让该 tooltips 相对于父级节点进行偏移，该父级节点指的是理它最近的 position 属性是 relative 或者 absolute 的元素。
