!{"template": "example", "title": "ProseMirror 追踪变更示例"}

> 本文较为复杂本人理解不深，因此一些代码中的注释可能翻译的不准确，需要的话可以去 [查看原文](https://prosemirror.net/examples/track/)

# 追踪修改

「修改」是 ProseMirror 中的一等公民（这句翻译使用了一些书介绍 JavaScript 中函数时的说法：「函数」是 JavaScript 中的一等公民）。
你可以持有它的引用然后用它做一些事情。比如 [rebasing（中文意译成变基）](/docs/guide/#transform.rebasing)、反转修改或者检查它看它做了什么。

这个示例使用了上述的这些特性，以允许你「提交」你的修改，或者反转某个独立的提交，亦或者发现某个文本变化源自何处：

@HTML

[![Remix on Glitch](https://cdn.glitch.com/2703baf2-b643-4da7-ab91-7ee2a2d00b5b%2Fremix-button.svg)](https://glitch.com/edit/#!/remix/prosemirror-demo-track)

鼠标悬浮在某个提交上，以高亮该提交的所做的文本修改。

当前页面不会列出来 [所有的源码](https://github.com/ProseMirror/website/blob/master/example/track/index.js)，而只会说明一些大家最感兴趣的部分。

首先，我们需要做的事情是实现提交历史追踪。用编辑器插件比较适合做这个事情，因为它可以接收到任何一个修改。这个插件的 state 看起来应该是这个样子：

PART(TrackState)

插件本身仅仅只是接收所有的 transactions 然后更新自身的 state。当该插件设置了一个 meta 信息到 transaction 的时候，就表示该 transaction 是一个提交 transaction，
meta 的属性值即为提交信息：

PART(trackPlugin)

像这样一样追踪历史允许各种有用的事情，比如可以搞清楚是谁何时添加了一段内容，或者反转一个独立的提交。

反转一个旧的 setps 需要 [rebasing](/docs/guide/#transform.rebasing) 该 step 到最新 step 之间的所有的 step，这也是下面这个函数所做的工作：

PART(revertCommit)

因为当合并一些改变的时候会导致一些隐藏的冲突，因此复杂的反转步骤可能导致一些不甚直观的结果（尤其是对相同内容先后做不同更改的时候）。
在一个生产环境的应用中，也许应该在检测到这种情况的时候提供给用户一个交互界面，以让用户手动解决冲突。
