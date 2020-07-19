This is the reference manual for the
[ProseMirror](https://prosemirror.net) rich text editor. It lists and
describes the full public API exported by the library. For more
introductory material, please see the [guide](/docs/guide/).

本页面是富文本编辑器 ProseMirror 的 API 手册，它列出和描述了该库导出的全部接口。想了解更多关于它的介绍，请访问:[中文指南](https://www.xheldon.com/prosemirror-guide-chinese.html)

ProseMirror is structured as a number of separate modules. This
reference manual describes the exported API per module. If you want to
use something from the [`prosemirror-state`](#state) module, for
example, you can import it like this:

```javascript
var EditorState = require("prosemirror-state").EditorState
var state = EditorState.create({schema: mySchema})
```

Or, using ES6 syntax:

```javascript
import {EditorState} from "prosemirror-state"
let state = EditorState.create({schema: mySchema})
```
