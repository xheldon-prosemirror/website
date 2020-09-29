<style>
  .box {
    color: white;
    display: inline-block;
    border-radius: 5px;
    padding: 3px 6px;
    margin: 3px 0;
    vertical-align: top;
  }
</style>


ProseMirror defines its own [data structure](##model.Node) to
represent content documents. Since documents are the central element
around which the rest of the editor is built, it is helpful to
understand how they work.

@cn Prosemirror 定义了它自己的 [data structure](##model.Node) 来表示 document 内容. 因为 document 是构建一个编辑器的核心元素, 
因此理解 document 是如何工作的很有必要.

## Structure

A ProseMirror document is a [node](##model.Node), which holds a
[fragment](##model.Fragment) containing zero or more child nodes.

@cn 一个 Porsemirror 的 document 是一个 [node](##model.Node) 类型, 它含有一个 fragment 对象, 
[fragment](##model.Fragment) 对象又包含了 0 个或更多子 node.

This is a lot like the [browser
DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model),
in that it is recursive and tree-shaped. But it differs from the DOM
in the way it stores inline content.

@cn 这看起来很像 [浏览器 DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model) 结构, 
因为 Prosemirror 跟 DOM 一样是递归的树状结构. 不过, Prosemirror 在存储内联元素的方式上跟 DOM 有点不同.

In HTML, a paragraph with markup is represented as a tree, like this:

@cn 在 HTML 中, 一个 paragraph 及其中包含的标记, 表现形式就像一个树, 比如有以下 HTML 结构:

```html
<p>This is <strong>strong text with <em>emphasis</em></strong></p>
```

<div class=figure>
  <div class=box style="background: #77e">
    <strong>p</strong><br>
    "This is "
    <div class=box style="background: #55b">
      <strong>strong</strong><br>
      "strong text with "
      <div class=box style="background: #77e">
        <strong>em</strong><br>
        "emphasis"
      </div>
    </div>
  </div>
</div>

Whereas in ProseMirror, the inline content is modeled as a flat
sequence, with the markup attached as metadata to the nodes:

@cn 然而在 Prosemirror 中, 内联元素被表示成一个扁平的模型, 他们的节点标记被作为 metadata 信息附加到相应 node 上:

<div class=figure>
  <div class=box style="background: #77e">
    <strong>paragraph</strong><br>
    <div class=box style="background: #55b">
      "This is "
    </div>
    <div class=box style="background: #55b">
      "strong text with "<br>
      <div class=box style="background: #d94">
        <strong>strong</strong>
      </div>
    </div>
    <div class=box style="background: #55b">
      "emphasis"<br>
      <div class=box style="background: #d94">
        <strong>strong</strong>
      </div>
      <div class=box style="background: #d94">
        <strong>em</strong>
      </div>
    </div>
  </div>
</div>

This more closely matches the way we tend to think about
and work with such text. It allows us to represent positions in a
paragraph using a character offset rather than a path in a tree, and
makes it easier to perform operations like splitting or changing the
style of the content without performing awkward tree manipulation.

@cn 这种数据结构显然更符合我们心中的这类文本该有的样子. 它允许我们使用字符的偏移量而不是一个树节点的路径来表示其所处段落中的位置, 
并且使一些诸如 splitting 内容或者改变内容 style 的操作变得很容易, 而不是以一种笨拙的树的操作来修改内容.

This also means each document has _one_ valid representation. Adjacent
text nodes with the same set of marks are always combined together,
and empty text nodes are not allowed. The order in which marks appear
is specified by the schema.

@cn 这也意味着, 每个 document 只有 _一种_ 数据结构表示方式. 文本节点中相邻且相同的 marks 被合并在一起, 
而且不允许空文本节点. marks 的顺序在 schema 中指定.

So a ProseMirror document is a tree of block nodes, with most of the
leaf nodes being _textblocks_, which are block nodes that contain
text. You can also have leaf blocks that are simply empty, for example
a horizontal rule or a video element.

@cn 因此, 一个 Prosemirror document 就是一颗 block nodes 的树, 它的大多数 leaf nodes 是 _textblock_ 类型, 
该节点是包含 text 的 block nodes.你也可以有一些内容为空的简单的 leaf nodes, 比如一个水平分隔线 hr 元素, 或者一个 video 元素.

Node objects come with a number of properties that reflect the role
they play in the document:

@cn Node 对象有一系列属性来表示他在文档中的角色:
   

  * `isBlock` and `isInline` tell you whether a given node is a block
    or inline node.
    
    @cn `isBlock` 和 `isInline` 告诉你这个 node 是一个 block 类型的 node(类似 div)还是一个 inline 的 node(类似 span).
  * `inlineContent` is true for nodes that expect inline nodes as
    content.
    
    @cn `inlineContent` 为 true 表示该 node 只接受 inline 元素作为 content(可以通过判断此节点来决定下一步是否往里面加 inline node or not——译者注)
  * `isTextblock` is true for block nodes with inline content.
  
    @cn `isTextBlock` 为 true 表示这个 node 是个含有 inline content 的 block nodes.
  * `isLeaf` tells you that a node doesn't allow any content.
    
    @cn `isLeaf` 为 true 表示该 node 不允许含有任何 content.

So a typical `"paragraph"` node will be a textblock, whereas a
blockquote might be a block element whose content consists of other
blocks. Text, hard breaks, and inline images are inline leaf nodes,
and a horizontal rule node would be an example of a block leaf node.

@cn 因此, 一个典型的 `"paragraph"` node 是一个 textblock 类型的节点, 
然后一个 blockquote(引用元素)则是一个可能由其他 block 元素构成其内容的 block 元素. 
Text 节点, 回车, 和 inline 的 images 都是 inline leaf nodes, 
而水平分隔线(hr 元素)节点是一个典型的 block leaf nodes.(leaf nodes 翻译成 叶节点, 
表示其不能再含有子节点; leaf nodes 如上所说, 可能是 inline 的, 也可能是 block 的——译者注).

The [schema](#schema) is allowed to specify more precise
constraints on what may appear where—i.e. even though a node allows
block content, that doesn't mean that it allows _all_ block nodes as
content.

@cn [schema](#schema) 允许你可以对诸如”哪些元素允许出现在哪些地方”这种问题指定更多的约束条件. 
例如, 即使一个 node 允许 block content, 那也不意味着它允许 _所有的_ block nodes 作为
content(你可以通过 schema 手动指定例外——译者注).

## Identity and persistence

Another important difference between a DOM tree and a ProseMirror
document is the way the objects that represent nodes behave. In the
DOM, nodes are mutable objects with an _identity_, which means that a
node can only appear in one parent node, and that the node object
is mutated when it is updated.

@cn DOM 树与 ProseMirror document 的另一个不同是他们对 nodes 对象的表示方式. 
在 DOM 中, nodes 是带有 _identity_ 的 mutable 对象(不知道 mutable 对象是啥的可以搜索下), 
这意味着一个 node 只能出现在它的父级 node 下(如果它出现在别处, 那它在此处就没了, 因为有 identity, 
所以唯一——译者注), 当这个 node 更新的时候, 它就 mutated 了(node 更新是在原来的 node上更新, 
此谓之 mutated 即突变. 表示在原有基础上修改, 修改前后始终是一个对象——译者注).

In ProseMirror, on the other hand, nodes are simply _values_, and
should be approached much as you'd approach the value representing the
number 3. 3 can appear in multiple data structures at the same time,
it does not have a parent-link to the data structure it is currently
part of, and if you add 1 to it, you get a _new_ value, 4, without
changing anything about the original 3.

@cn 而在 Prosemirror 中却不同, nodes 仅仅是 values(区别于 DOM 的 mutable, values 是 unmutable 的), 
表示一个节点就像表示一个数字 3 一样. 3 可以同时出现在不同的数据结构中, 它不跟当前的数据结构绑定, 如果你对它增加 1, 
你将会得到一个新的 value: 4 而不用对原始的 3 做任何修改.

So it is with pieces of ProseMirror documents. They don't change, but
can be used as a starting value to compute a modified piece of
document. They don't know what data structures they are part of, but
can be part of multiple structures, or even occur multiple times in a
single structure. They are _values_, not stateful objects.

@cn 所以这就是 Prosemirror document 的机制. 它的值不会改变, 而且可以被当做一个原始值去计算一个新的 document. 
这些 document 的 nodes 们不知道它所处的数据结构是什么, 因为它们可以存在于多个结构中, 甚至可以在一个结构中重复多次. 
它们是 _values_, 不是拥有状态的对象.

This means that every time you update a document, you get a new
document value. That document value will share all sub-nodes that
didn't change with the original document value, making it relatively
cheap to create.

@cn 这意味着每次你更新 document, 你就会得到一个新的 document. 这个新的 document 共享旧的 document 的所有没有在这次更新中改变的子 nodes 的 value, 这让新建一个 document 变得很廉价.

This has a bunch of advantages. It makes it impossible to have an
editor in an invalid in-between state during an update, since the new
state, with a new document, can be swapped in instantaneously. It also
makes it easier to reason about documents in a somewhat mathematical
way, which is really hard if your values keep changing underneath you.
This helps make collaborative editing possible and allows ProseMirror
to run a very efficient DOM [update](##view.EditorView.update)
algorithm by comparing the last document it drew to the screen to the
current document.

@cn 这种机制有很多优点. 它让当 state 更新的时候编辑器始终可用, 因为新的 state 就代表了新的 document(如果更新未完成, 则 state 不会出现, 
因此 document 也没有, 编辑器仍然是之前的 state + document——译者注), 新旧状态可以瞬间切换(而没有中间状态). 
这种状态切换更可以以一种简单的数学推理的方式完成——而如果你的值在背后不断变化(指像 DOM 的节点一样突变——译者注), 
这种推理将非常困难. Prosemirror 的这种机制使得协同编辑成为可能, 而且能够通过比较之前绘制在屏幕上的 document 和当前的 document 算法来非常高效的 [update](##view.EditorView.update) DOM.
   

Because such nodes are represented by regular JavaScript objects, and
explicitly
[freezing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)
their properties hampers performance, it is actually _possible_ to
change them. But doing this is not supported, and will cause things to
break, because they are almost always shared between multiple data
structures. So be careful! And note that this also holds for the
arrays and plain objects that are _part_ of node objects, such as the
objects used to store node attributes, or the arrays of child nodes in
fragments.

@cn 因为 nodes 都被表示为正常的 JavaScript 对象, 而明确 [freezing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze) 他们的属性(防止 mutate)非常影响性能, 
因此事实上虽然 Prosemirror 的 document 以一种非突变的机制运行, 但是你还是能够手动修改他们. 
只是 Prosemirror 不支持这么做, 如果你强行 mutate 这些数据结构的话, 编辑器可能会崩溃, 因为这些数据结构总是在多处共享使用(修改一处, 影响其他你不知道的地方——译者注). 因此, 务必小心!!! 同时记住, 这个道理对一些 node 对象上存储的数组和对象同样适用, 比如 node attributes 对象, 或者存在 fragments 上的子 nodes.

## Data structures

The object structure for a document looks something like this:

@cn 一个 document 的数据结构看起来像下面这样:

<style>
  .classbox { border-radius: 8px; padding: 4px 10px; color: white; display: inline-block; vertical-align: middle; }
  .classbox td { vertical-align: top; padding: 0; border-right: 5px solid transparent; }
</style>
<div class=classbox style="background: #77e; margin-left: 20px">
  <table style="cell-spacing: collapse">
    <tr><td><strong>Node</strong></td></tr>
    <tr>
      <td>type:</td>
      <td><div class=classbox style="background: #446"><strong>NodeType</strong></div></td>
    </tr>
    <tr>
      <td>content:</td>
      <td><div class=classbox style="background: #44e"><strong>Fragment</strong><br>
        [<div class=classbox style="background: #77e"><strong>Node</strong></div>,
         <div class=classbox style="background: #77e"><strong>Node</strong></div>, ...]</td>
    </tr>
    <tr>
      <td>attrs:</td>
      <td><div class=classbox style="background: #99e"><strong>Object</strong></div></td>
    </tr>
    <tr>
      <td>marks:</td>
      <td>[<div class=classbox style="background: #55b">
        <table style="cell-spacing: collapse">
          <tr><td><strong>Mark</strong></td></tr>
          <tr>
            <td>type:</td>
            <td><div class=classbox style="background: #446"><strong>MarkType</strong></div></td>
          </tr>
          <tr>
           <td>attrs:</td>
           <td><div class=classbox style="background: #99e"><strong>Object</strong></div></td>
         </tr>
       </table></div>, ...]</td>
    </tr>
  </table>
</div>

Each node is represented by an instance of the [`Node`](##model.Node)
class. It is tagged with a [type](##model.NodeType), which knows the
node's name, the attributes that are valid for it, and so on. Node
types (and mark types) are created once per schema, and know which
schema they are part of.

@cn 每个 node 都是一个 [`Node`](##model.Node) 类的实例. 它们用 type 属性进行归类, 通过 [type](##model.NodeType) 属性可以知道 node 的名字, 它可以使用的 attributes, 诸如此类的信息. Node types(和 mark types) 只会被每个 schema 创建一次, 它们知道自己是属于哪个 schema.

The content of a node is stored in an instance of
[`Fragment`](##model.Fragment), which holds a sequence of nodes. Even
for nodes that don't have or don't allow content, this field is filled
(with the shared [empty fragment](##model.Fragment^empty)).

@cn node 的 content 被存储在一个指向 [`Fragment`](##model.Fragment) 实例的字段上, 它的内容是一个 nodes 数组. 
即使那些没有 content 或者不允许有 content 的 nodes 也是如此, 这些不许或没有 content 的节点被共享的 [empty fragment](##model.Fragment^empty) 替代.

Some node types allow attributes, which are extra values stored with
each node. For example, an image node might use these to store its alt
text and the URL of the image.

@cn 一些 nodes 类型允许有 attributes, 它们在每个 nodes 上以(不同于 content 的)额外的值存储着. 例如, 一个 image node 可能使用 attributes 存储 alt 文本信息和 URL 信息.

In addition, inline nodes hold a set of active marks—things like
emphasis or being a link—which are represented as an array of
[`Mark`](##model.Mark) instances.

@cn 除此之外, inline nodes 含有一些激活的 marks——marks 就是指那些像 emphasis 或者 一个 link 的东西——它们被表示成 [`Mark`](##model.Mark) 实例.

A full document is just a node. The document content is represented as
the top-level node's child nodes. Typically, it'll contain a series of
block nodes, some of which may be textblocks that contain inline
content. But the top-level node may also be a textblock itself, so
that the document contains only inline content.

@cn 整个 document 都是一个 node. document 的 content 作为顶级 node 的子 nodes. 
通常上来说, 这些顶级 node 的子 node 是一系列的 block nodes, 这些 block nodes 中有些可能包含 textblocks, 
这些 textblocks 有包含 inline content. 不过, 顶级 node 也可以只是一个 textblock, 
这样的话整个 document 就只包含 inline content.

What kind of node is allowed where is determined by the document's
[schema](#schema). To programatically create nodes, you must go
through the schema, for example using the
[`node`](##model.Schema.node) and [`text`](##model.Schema.text)
methods.

@cn 哪些 node 被允许出现在哪些位置是由 document 的 [schema](#schema) 决定的. 为了用编程的方式(而不是直接对编辑器输入内容的方式——译者注)创建 nodes, 
你必须遍历 schema, 比如下面的使用 [`node`](##model.Schema.node) 和 [`text`](##model.Schema.text) 方法.

```javascript
import {schema} from "prosemirror-schema-basic"

// (The null arguments are where you can specify attributes, if necessary.)
let doc = schema.node("doc", null, [
  schema.node("paragraph", null, [schema.text("One.")]),
  schema.node("horizontal_rule"),
  schema.node("paragraph", null, [schema.text("Two!")])
])
```

## Indexing

ProseMirror nodes support two types of indexing—they can be treated as
trees, using offsets into individual nodes, or they can be treated as
a flat sequence of tokens.

@cn Prosemirror nodes 支持两种类型的 indexing——它们既可以被当成树类型, 因为它们使用 offsets 来区别每个 nodes; 也可以被当成一个具有一系列 token 的扁平的结构(token 可以理解为一个计数单位).

The first allows you to do things similar to what you'd do with the
DOM—interacting with single nodes, directly accessing child nodes
using the [`child` method](##model.Node.child) and
[`childCount`](##model.Node.childCount), writing recursive functions
that scan through a document (if you just want to look at all nodes,
use [`descendants`](##model.Node.descendants) or
[`nodesBetween`](##model.Node.nodesBetween)).

@cn 第一种 index 允许你像在 DOM 中那样, 与单个 nodes 进行交互, 使用 [`child` method](##model.Node.child) 和
[`childCount`](##model.Node.childCount) 直接访问 child nodes, 写递归函数去遍历 document(如果你想遍历所有的 nodes,
使用 [`descendants`](##model.Node.descendants) 和 [`nodesBetween`](##model.Node.nodesBetween)).

The second is more useful when addressing a specific position in the
document. It allows any document position to be represented as an
integer—the index in the token sequence. These tokens don't actually
exist as objects in memory—they are just a counting convention—but the
document's tree shape, along with the fact that each node knows its
size, is used to make by-position access cheap.

@cn 第二种 index 当在文档定位一个指定的 position 的时候更有用. 它可以以一个整数表示文档中的任意位置——这个整数是 token 的顺序.
这些 token 对象在内存中其实并不存在——它们只是用来计数方便——不过 document 的树状结构以及每个 node 都知道它们自己的大小尺寸使得按位置访问它们变得廉价.

 * The start of the document, right before the first content, is
   position 0.
   
   @cn Document 的起始位置, 在所有 content 的开头, 位置是 0.

 * Entering or leaving a node that is not a leaf node (i.e. supports
   content) counts as one token. So if the document starts with a
   paragraph, the start of that paragraph counts as position 1.
   
   @cn 进入或者离开不是 leaf node 的节点(比如能够包含内容的节点, 都算是非 leaf node)计为 1 个 token. 所以如果 document 以一个 paragraph(标签是 p) 开头, 在段落开头的 position 是 1(即 <p> 之后的位置——译者注)

 * Each character in text nodes counts as one token. So if the
   paragraph at the start of the document contains the word “hi”,
   position 2 is after the “h”, position 3 after the “i”, and position
   4 after the whole paragraph.
   
   @cn Text nodes 的每个字符记为 1 个 token. 所以如果在 document 的开头的 paragraph 包含单词 “hi”, 那么 position 2 在 “h” 之后, position 3 在 “i” 之后, position 4 在整个段落之后(即 </p> 之后——译者注)

 * Leaf nodes that do not allow content (such as images) also count as
   a single token.
   
   @cn Leaf nodes 如果不允许 content 的(比如图片节点), 计做 1 个 token.

So if you have a document that, when expressed as HTML, would look
like this:

@cn 因此, 如果你有一个 document, 表示成 HTML 就像下面这样:

```html
<p>One</p>
<blockquote><p>Two<img src="..."></p></blockquote>
```

The token sequence, with positions, looks like this:

@cn Token 顺序和 position 则看起来像下面这样:

    0   1 2 3 4    5
     <p> O n e </p>

    5            6   7 8 9 10    11   12            13
     <blockquote> <p> T w o <img> </p> </blockquote>

Each node has a [`nodeSize`](##model.Node.nodeSize) property that
gives you the size of the entire node, and you can access
[`.content.size`](##model.Fragment.size) to get the size of the node's
_content_. Note that for the outer document node, the open and close
tokens are not considered part of the document (because you can't put
your cursor outside of the document), so the size of a document is
`doc.content.size`, **not** `doc.nodeSize`.

@cn 每个 node 都有一个 [`nodeSize`](##model.Node.nodeSize) 属性表示整个 node 的尺寸大小, 你还可以通过 [`.content.size`](##model.Fragment.size) 获得 node 的 _content_ 的尺寸大小. 
需要注意的是对于 document 的外层节点(即 DOM 中 contenteditable 属性所处的节点, 是整个 document 的根节点——译者注)来说, 
开始和关闭 token 不被认为是 document 的一部分(因为你无法将光标放到 document 的外面), 因此 document 的尺寸是 `doc.content.size`, 
而**不是** `doc.nodeSize`(虽然 document 的开关标签不被认为是 document 的一部分, 但是仍然计数. 后者始终比前者大2——译者注).

Interpreting such position manually involves quite a lot of counting.
You can call [`Node.resolve`](##model.Node.resolve) to get a more
descriptive [data structure](##model.ResolvedPos) for a position. This
data structure will tell you what the parent node of the position is,
what its offset into that parent is, what ancestors the parent has,
and a few other things.

@cn 如果手动计算这些位置涉及到相当数量的计算工作. (因此)你可以通过调用 [`Node.resolve`](##model.Node.resolve) 来获得一个 position 的更多数据结构的描述. 
这个 [数据结构](##model.ResolvedPos) 将会告诉你当前 position 的父级 node 是什么, 它在父级 node 中的偏移量是多少, 它的父级 node 的祖先 nodes 有哪些, 和其他一些信息.

Take care to distinguish between child indices (as per
[`childCount`](##model.Node.childCount)), document-wide positions, and
node-local offsets (sometimes used in recursive functions to represent
a position into the node that's currently being handled).

@cn 一定要注意区分子 node 的 index(比如每个 [`childCount`](##model.Node.childCount)), document 范围的 position, 
和 node 的偏移(有时候这个偏移会用在一个递归函数表示当前处理的 node 的位置, 此时就涉及到 node 的偏移)之间的区别.

## Slices

To handle things like copy-paste and drag-drop, it is necessary to be
able to talk about a slice of document, i.e. the content between two
positions. Such a slice differs from a full node or fragment in that
some of the nodes at its start or end may be ‘open’.

@cn 对于用户的复制粘贴和拖拽之类的操作, 涉及到一个叫做 slice of document 的概念(文档片段——译者注), 
例如在两个 position 之间的 content 就是一个 slice. 这种 slice 与一个完整的 node 或者 fragment 不同, 
slice 可能是 “open”(意思即一个 slice 包含的标签可能没有关闭, 比如 <p>123</p><p>456</p> 中, 一个 slice 可能是 23</p><p>45 ——译者注).

For example, if you select from the middle of one paragraph to the
middle of the next one, the slice you've selected has two paragraphs
in it, the first one open at the start, the second open at the end,
whereas if you node-select a paragraph, you've selected a closed node.
It may be the case that the content in such open nodes violates the
schema constraints, if treated like the node's full content, because
some required nodes fell outside of the slice.

@cn 例如, 如果你用光标选择从一个段落的中间到另一个段落的中间, 那么你选择的 slice 就是含有两个段落, 
第一个在开始的地方 open, 第二个在结束的地方 open, 然后如果你使用接口(而不是通过与 view 交互——译者注)选择了一个段落 node, 
那你就选择了一个 close 的 node. 如果对待 slice 像普通的 node content 一样的话, 
它的 content 可能不符合 schema 的约束, 因为某些所需要的 nodes(如使 slice content 是一个完整的 node 的标签, 
如上例中的开始部分的 <p> 和结束部分的 </p>) 落在了 slice 之外.

The [`Slice`](##model.Slice) data structure is used to represent such
slices. It stores a [fragment](##model.Fragment) along with an [open
depth](##model.Slice.openStart) on both sides. You can use the
[`slice` method](##model.Node.slice) on nodes to cut a slice out of a
document.

@cn [`Slice`](##model.Slice) 数据结构就是被用来表示这种的数据的. 
它存储了一个含有两侧 [open depth](##model.Slice.openStart) (意思就是相对于根节点的层级深度——译者注)信息的 [fragment](##model.Fragment). 你可以在 nodes 上使用 [`slice` 方法](##model.Node.slice) 来从 document 上 “切” 出去一片 “slice”.

```javascript
// doc holds two paragraphs, containing text "a" and "b"
let slice1 = doc.slice(0, 3) // The first paragraph
console.log(slice1.openStart, slice1.openEnd) // → 0 0
let slice2 = doc.slice(1, 5) // From start of first paragraph
                             // to end of second
console.log(slice2.openStart, slice2.openEnd) // → 1 1
```

## Changing

Since nodes and fragments are
[persistent](https://en.wikipedia.org/wiki/Persistent_data_structure),
you should **never** mutate them. If you have a handle to a document
(or node, or fragment) that object will stay the same.

@cn 因为 nodes 和 fragment 是一种 [持久化](https://en.wikipedia.org/wiki/Persistent_data_structure) 的数据结构(意即 immutable ——译者注), 
你**绝对不应该**直接修改他们. 如果你需要操作 document, 那么它就应该一直不变(操作后产生新的 document, 
旧的 document 一直不变——译者注).

Most of the time, you'll use [transformations](#transform) to
update documents, and won't have to directly touch the nodes. These
also leave a record of the changes, which is necessary when the
document is part of an editor state.

@cn 大多数情况下, 你需要使用 [transformations](#transform) 去更新 document 而不用直接修改 nodes. 
这也方便留下一个变化的记录, 变化的记录对作为编辑器 state 一部分的 document 是必要的.

In cases where you do want to 'manually' derive an updated document,
there are some helper methods available on the [`Node`](##model.Node)
and [`Fragment`](##model.Fragment) types. To create an updated version
of a whole document, you'll usually want to use
[`Node.replace`](##model.Node.replace), which replaces a given range
of the document with a [slice](##model.Slice) of new content. To
update a node shallowly, you can use its [`copy`](##model.Node.copy)
method, which creates a similar node with new content. Fragments also
have various updating methods, such as
[`replaceChild`](##model.Fragment.replaceChild) or
[`append`](##model.Fragment.append).

@cn 如果你非要去手动更新 document, Prosemirror 在 [`Node`](##model.Node) 和 [`Fragment`](##model.Fragment)
上提供了一些有用的辅助函数去新建一个 document 的全新版本. 你可能会常常用到 [`Node.replace`](##model.Node.replace) 方法,
该方法用一个含有新的 content 的 [slice](##model.Slice) 替换指定 document 的 range 内的内容. 
如果想要浅更新一个 node, 你可以使用 [`copy`](##model.Node.copy) 方法, 该方法新建了一个相同的 node, 
不过为这个相同的新 node 可以指定新的 content. Fragments 也有一些更新 document 的方法, 
比如 [`replaceChild`](##model.Fragment.replaceChild) 和 [`append`](##model.Fragment.append).
