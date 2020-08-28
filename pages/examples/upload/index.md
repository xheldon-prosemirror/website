!{"template": "example", "title": "ProseMirror 图片上传示例"}

# 处理上传

一些编辑涉及到异步的操作，但是你想要将它们作为单个动作呈现为给用户，例如，当用户从本地插入图片，你只能在
用户上传到服务端完成并拿到了 URL 后才能访问实际的图片。但是你不想让用户经历先上传图片，然后等待上传图片后再将图片插入的漫长过程。

理想情况下，选择图片后，你应该立即在文档中插入一个占位符以开始上传。然后，当上传完成后将占位符替换为最终图片。

@HTML

[![Remix on Glitch](https://cdn.glitch.com/2703baf2-b643-4da7-ab91-7ee2a2d00b5b%2Fremix-button.svg)](https://glitch.com/edit/#!/remix/prosemirror-demo-upload)

由于上传可能需要一点时间，因此用户可能在等待的时候对文档做出其他更改，所以这个占位符应该随着上下文的更改进行移动，当最终的图片插入成功后，它应该替换掉此时占位符的位置。

实现这个方案最简单的方式是将占位符作为一个 [decoration](/docs/guide/#view.decorations) ，这样的话它就仅存在于用户的 UI 界面。让我们从写一个管理这个 decoration 的 plugin 开始： 

PART(placeholderPlugin)

这是一个 [decoration set](##view.DecorationSet) 的简单包裹--它必须是一个 _集合_ ，因为多个上传可能同时发生。
plugin 的 meta 信息可以被用来通过 ID 增加或者删除 widget decoration。

该 plugin 有个通过给定 ID 返回占位符当前位置的函数（如果该占位符仍然存在的话）：

PART(findPlaceholder)

当编辑器下方的选择文件按钮被点击之后，事件处理函数会检查一些条件，然后在一些情况下触发上传：

PART(event)

核心的功能发生在 `startImageUpload` 函数中。工具函数 `uploadFile` 会返回一个 promise，它最终会 resolve 文件的 URL
（在这个 Demo 中，它实际上只是等待了一会儿然后返回了一个 `data:` URL)：

PART(startImageUpload)

因为 placeholder plugin 通过一个 transaction [maps(映射)](##view.DecorationSet.map) 它的 decorations，因此，
即使文档在文件上传期间被修改过，`findPlaceholder` 也会得到图片的正确位置。
