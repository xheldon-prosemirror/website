
> 本文档手册上次更新日期为：**2021年6月13日**，文档更新总览请查看：[X_CHANGELOG](https://github.com/xheldon-prosemirror/prosemirror/blob/master/X_CHANGELOG.md)。

> 注：自 [2020年9月29日全部翻译完成](https://twitter.com/ProseMirror/status/1310952477265727495) 以来，之后的每一次对应模块的更新都是与上游仓库进行合并，以保持翻译文档的最新版本，因此可能存在版本落后的问题，如果发现版本落后，请查看 [原始文档](https://prosemirror.net/docs/ref/)，同时在 [电报群](https://t.me/xheldon_saloon) 里找我合并一下上游仓库，我会尽快更新中文版。

<b>
译者前言：

1. 鼠标悬浮在中文上会出现英文原文，方便读者在觉得翻译质量不行的时候直接查看原文。
2. 专有名词不翻译，如 Schema、State、View 等，以让读者能在阅读源码或者在社区提问的时候对应上相应的概念。
3. 因为有些接口需要上下文，因此译者的增加了注释以对此进行额外的说明，以灰色背景块显示出来，代表了译者对某个接口的理解。
4. 本文档与 [官网](https://prosemirror.net/docs/ref/) 保持同步（译者不定期检查原仓库，然后 Merge 最新的代码，最后翻译完成后更新本文档）。
5. 本文档翻译工作是作者业余时间完成，你如果觉得有帮助可以 [赏杯咖啡钱](https://www.xheldon.com/donate/) 。
</b>

---

This is the reference manual for the
[ProseMirror](https://prosemirror.net) rich text editor. It lists and
describes the full public API exported by the library. For more
introductory material, please see the [guide](/docs/guide/).

@cn 本页面是富文本编辑器 [ProseMirror](https://prosemirror.xheldon.com) 的 API 手册，它列出和描述了该库导出的全部接口。想了解更多关于它的介绍，请访问：[指南](/docs/guide/)

ProseMirror is structured as a number of separate modules. This
reference manual describes the exported API per module. If you want to
use something from the [`prosemirror-state`](#state) module, for
example, you can import it like this:

@cn ProseMirror 由多个单独的模块构成。这个手册描述了每个模块导出的 API。例如，如果你想使用 [`prosemirror-state`](#state) 模块，你可以像下面这样导入即可：

```javascript
var EditorState = require("prosemirror-state").EditorState
var state = EditorState.create({schema: mySchema})
```

Or, using ES6 syntax:

@cn 或者使用 ES6 的语法：

```javascript
import {EditorState} from "prosemirror-state"
let state = EditorState.create({schema: mySchema})
```
