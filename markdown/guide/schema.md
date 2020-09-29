Each ProseMirror [document](#doc) has a [schema](##model.Schema)
associated with it. The schema describes the kind of
[nodes](##model.Node) that may occur in the document, and the way they
are nested. For example, it might say that the top-level node can
contain one or more blocks, and that paragraph nodes can contain any
number of inline nodes, with any [marks](##model.Mark) applied to
them.

@cn 每个 Prosemirror [document](#doc) 都有一个与之相关的 [schema](##model.Schema). 这个 schema 描述了存在于 document 中的 [nodes](##model.Node) 类型,
和 nodes 们的嵌套关系. 例如, schema 可以规定, 顶级节点可以包含一个或者更多的 blocks, 
同时段落 paragraph nodes 可以包含含有任意数量的 inline nodes, 这些 inline nodes 可以含有任意数量的 [marks](##model.Mark).

There is a package with a [basic schema](##schema-basic) available,
but the nice thing about ProseMirror is that it allows you to define
your own schemas.

@cn 关于 schema 的用法, 这里有一个 [basic schema](##schema-basic) 的包可以作为示例看一下, 
不过 Prosemirror 有个比较棒的点在于它允许你定义你自己的 schemas.

## Node Types

Every node in a document has a [type](##model.NodeType), which
represents its semantic meaning and its properties, such as the way it
is rendered in the editor.

@cn 在 document 中的每个节点都有一个 [type](##model.NodeType), 它代表了一个 node 的语义化上意思和 node 的属性, 这些属性包括在编辑器中的渲染方式.

When you define a schema, you enumerate the node types that may occur
within it, describing each with a [spec object](##model.NodeSpec):

@cn 当你定义一个 schema 的时候, 你需要列举每一个用到的 node types, 用一个 [spec object](##model.NodeSpec) 描述它们:

```javascript
const trivialSchema = new Schema({
  nodes: {
    doc: {content: "paragraph+"},
    paragraph: {content: "text*"},
    text: {inline: true},
    /* ... and so on */
  }
})
```

That defines a schema where the document may contain one or more
paragraphs, and each paragraph can contain any amount of text.

@cn 上述代码定义了一个允许 document 包含一个或更多 paragraphs 的 schema, 每个 paragraph 又能包含任意数量的 text.

Every schema must at least define a top-level node type (which
defaults to the name `"doc"`, but you can
[configure](##model.Schema.topNodeType) that), and a `"text"` type for
text content.

@cn 每个 schema 至少得定义顶级 node 的 type(顶级 node 的名字默认是 “doc”, 不过你可以 [configure](##model.Schema.topNodeType) 它), 和规定 text content 的 “text” type.

Nodes that count as inline must declare this with the
[`inline`](##model.NodeSpec.inline) property (though for the `text`
type, which is inline by definition, you may omit this).

@cn 作为 inline 类型来计算 index 等的 nodes 必须声明它的 [`inline`](##model.NodeSpec.inline) 属性(回想一下 text 类型, 它就被定义成 inline 了——这一点你可能忽略了)

## Content Expressions

The strings in the [`content`](##model.NodeSpec.content) fields in the
example schema above are called _content expressions_. They control
what sequences of child nodes are valid for this node type.

@cn 上面 schema 示例代码中的 [`content`](##model.NodeSpec.content) 字段的字符串值被叫做 _content expressions_. 他们控制着对于当前 type 的 node 来说, 哪些 child nodes 类型可用.

You can say, for example `"paragraph"` for “one paragraph”, or
`"paragraph+"` to express “one or more paragraphs”. Similarly,
`"paragraph*"` means “zero or more paragraphs” and `"caption?"` means
“zero or one caption node”. You can also use regular-expression-like
ranges, such as `{2}` (“exactly two”) `{1, 5}` (“one to five”) or
`{2,}` (“two or more”) after node names.

@cn 比如说, (content 字段的内容是) `"paragraph"` 意思就是 “一个 paragraph”, 
`"paragraph+"` 意思就是 “一个或者更多 paragraph”.与此相似, `"paragraph*"` 意思就是 “0 个或者更多 paragraph”, 
`"caption?"` 意思就是 “0 个或者 1 个 caption node”. 你也可以在 node 名字之后使用类似于正则表达式中表示范围含义的表达式, 
比如 `{2}`(正好 2 个), `{1, 5}`(1 个到 5 个), 或者`{2,}`(两个或更多).

Such expressions can be combined to create a sequence, for example
`"heading paragraph+"` means ‘first a heading, then one or more
paragraphs’. You can also use the pipe `|` operator to indicate a
choice between two expressions, as in `"(paragraph | blockquote)+"`.

@cn 这种表达式可以被联合起来创建一个系列, 例如 `"heading paragraph+"` 表示 “开头一个 heading, 
之后一个或更多 paragraphs”. 你也可以使用管道符号 `|` 操作符来表示在两个表达式中选择一个, 比如 `"(paragraph | blockquote)+"`.

Some groups of element types will appear multiple types in your
schema—for example you might have a concept of “block” nodes, that may
appear at the top level but also nested inside of blockquotes. You can
create a node group by giving your node specs a
[`group`](##model.NodeSpec.group) property, and then refer to that
group by its name in your expressions.

@cn 一些元素 type 的 group 可能在你的 schema 会出现多次, 比如你有一个 “block” 概念的 nodes, 
他们可以出现在顶级元素之下, 也可以嵌套进 blockquote 类型的 node 内. 你可以通过指定 schema 的 [`group`](##model.NodeSpec.group)
属性来创建一个 node group, 然后在你的其他表达式中填 group 的名字即可:

```javascript
const groupSchema = new Schema({
  nodes: {
    doc: {content: "block+"},
    paragraph: {group: "block", content: "text*"},
    blockquote: {group: "block", content: "block+"},
    text: {}
  }
})
```

Here `"block+"` is equivalent to `"(paragraph | blockquote)+"`.

@cn 上面示例中, `"block+"` 等价于 `"(paragraph | blockquote)+"`.

It is recommended to always require at least one child node in nodes
that have block content (such as `"doc"` and `"blockquote"` in the
example above), because browsers will completely collapse the node
when it's empty, making it rather hard to edit.

@cn 建议在允许 block content 的 nodes(在示例中就是 `"doc"` 和 `"blockquote"`)中设置为至少有一个 child node, 
因为如果 node 为空的话浏览器将折叠它, 使它无法编辑(这句话的意思是, 如果上述 doc 或者 blockquote 的 content
设置为 block* 而不是 block+ 就表示允许不存在 child nodes 存在的情况(它沿用了通用的正则符号: * 表示0个或更多, 
+ 表示1个或更多), 那么此时编辑的话浏览器输入的是 text node, 是 inline 节点, 导致无法输入, 读者可以试试——译者注).

The order in which your nodes appear in an or-expression is
significant. When creating a default instance for a non-optional node,
for example to make sure a document still conforms to the schema after
a [replace step](##transform.ReplaceStep) the first type in the
expression will be used. If that is a group, the first type in the
group (determined by the order in which the group's members appear in
your `nodes` map) is used. If I switched the positions of
`"paragraph"` and `"blockquote"` in the the example schema, you'd get
a stack overflow as soon as the editor tried to create a block
node—it'd create a `"blockquote"` node, whose content requires at
least one block, so it'd try to create another `"blockquote"` as
content, and so on.

@cn 在 schema 中, nodes 的书写顺序很重要. 当对一个必选的 node 新建一个默认实例的时候, 
比如在应用了一个 [replace step](##transform.ReplaceStep) 之后, 为了保持当前文档仍然符合 schema 的约束, 
会使用能满足 schema 约束的第一个 node 的 expression. 如果 node 的 expression 是一个 group, 
则这个 group 的第一个 node type(决定于当前 group 的成员 node 出现在 schema 的 `nodes` 中的顺序)将被使用. 
如果我在上述的 schema 示例中调换了 `"paragraph"` 和 `"blockquote"` 的顺序, 
当编辑器试图新建一个 block node 的时候将会报 stack overflow——因为编辑器会首先尝试新建一个 `"blockquote"` node, 
但是这个 node 需要至少一个 block node, 于是它就首先又需要创建一个 `"blockquote"` node 作为内容, 以此往复.

Not every node-manipulating function in the library checks that it is
dealing with valid content—higher level concepts like
[transforms](#transform) do, but primitive node-creation methods
usually don't and instead put the responsibility for providing sane
input on their caller. It is perfectly possible to use, for example
[`NodeType.create`](##model.NodeType.create), to create a node with
invalid content. For nodes that are ‘open’ on the edge of
[slices](#doc.slices), this is even a reasonable thing to do. There
is a separate [`createChecked`
method](##model.NodeType.createChecked), as well as an after-the-fact
[`check` method](##model.Node.check) that can be used to assert that a
given node's content is valid.

@cn 不是每个 Prosemirror 库中的 node 操作函数都会检查它当前处理 content 的可用性——高级概念例如 [transforms](#transform) 会检查, 
但是底层的 node 新建方法通常不会, 这些底层方法通常将可用性检查交给它们的调用者. 它们(即使当前操作的 content 不可用, 
但是这些底层方法也)完全可能可用, 比如, [`NodeType.create`](##model.NodeType.create), 它会创建一个含有不可用 content 的节点. 
对于在一个 [slices](#doc.slices) 的 “open” 一边的 node 而言, 这甚至是情有可原的(因为 slice 不是一个可用的节点, 
但是又需要直接操作 slice ——总不能让用户手动补全吧?——译者注). 有一个 [`createChecked` method](##model.NodeType.createChecked) 方法可以检查给定 content
是否符合 schema, 也有一个 [`check` method](##model.Node.check) 方法来 assert 给定的 content 是否可用.

## Marks

Marks are used to add extra styling or other information to inline
content. A schema must declare all mark types it allows in its
[schema](##model.Schema). [Mark types](##model.MarkType) are objects
much like node types, used to tag mark objects and provide additional
information about them.

@cn Marks 通常被用来对 inline content 增加额外的样式和其他信息. 
[schema](##model.Schema) 必须声明当前 document 允许的所有 schema(就像声明 nodes 那样——译者注). 
[Mark types](##model.MarkType) 是一个有点像 node types 的对象, 它用来给不同的 mark 分类和提供额外的信息.

By default, nodes with inline content allow all marks defined in the
schema to be applied to their children. You can configure this with
the [`marks`](##model.NodeSpec.marks) property on your node spec.

@cn 默认情况下, 允许有 inline content 的 nodes 允许所有的定义在 schema 的 marks 应用于它的 child nodes. 
你可以在 node spec 中的 [`marks`](##model.NodeSpec.marks) 字段配置之.

Here's a simple schema that supports strong and emphasis marks on
text in paragraphs, but not in headings:

@cn 下面是一个简单的 schema 示例, 支持在 paragraphs 中设置文本的 strong 和 emphasis marks, 
不过 heading 则不允许设置这两种 marks.

```javascript
const markSchema = new Schema({
  nodes: {
    doc: {content: "block+"},
    paragraph: {group: "block", content: "text*", marks: "_"},
    heading: {group: "block", content: "text*", marks: ""},
    text: {inline: true}
  },
  marks: {
    strong: {},
    em: {}
  }
})
```

The set of marks is interpreted as a space-separated string of mark
names or mark groups—`"_"` acts as a wildcard, and the empty string
corresponds to the empty set.

@cn marks 字段的值可以写成用逗号分隔开的 marks 名字, 或者 mark groups——`"_"`, 它是通配符的意思, 
允许所有的 marks. 空字符串表示不允许任何 marks.

## Attributes

The document schema also defines which _attributes_ each node or mark
has. If your node type requires extra node-specific information to be
stored, such as the level of a heading node, that is best done with an
attribute.

@cn Document 的 schema 也定义了 node 和 mark 允许有哪些 _attributes_. 如果你的 node type 需要外的 node 专属的信息, 比如 heading node 的 level 信息(H1, H2等等——译者注), 此时适合使用 attribute.

Attribute sets are represented as plain objects with a predefined (per
node or mark) set of properties holding any JSON-serializeable values.
To specify what attributes it allows, use the optional `attrs` field
in a node or mark spec.

@cn Attribute 是一个普通的纯对象, 它有一些预先定义好的(在每个 node 或 mark 上)属性, 指向可以被 JSON 序列化的值. 为了指定哪些 attributes 被允许出现, 可以在 node spec 和 mark 的 spec 中使用可选的 attr 属性:

```javascript
  heading: {
    content: "text*",
    attrs: {level: {default: 1}}
  }
```

In this schema, every instance of the `heading` node will have a
`level` attribute under `.attrs.level`. If it isn't specified when the
node is [created](##model.NodeType.create), it will default to 1.

@cn 在上面这个 schema 中, 每个 `heading` node 实例都有一个 `level` 属性通过 `.attrs.level` 访问. 
如果在 [created](##model.NodeType.create) heading 的时候没有指定, level 默认是 1.

<a id="generatable"></a>When you don't give a default value for an
attribute, an error will be raised when you attempt to create such a
node without specifying that attribute.

@cn <a id="generatable"></a>如果你在定义 node 的时候没有给一个 attribute 默认值的话, 当新建这个 node 的时候, 如果没有显式传入 attribute 就会报错. 

That will also make it impossible for the library to generate such
nodes as filler to satisfy schema constraints during a transform or
when calling [`createAndFill`](##model.NodeType.createAndFill). This
is why you are not allowed to put such nodes in a required position in
the schema—in order to be able to enforce the schema constraints, the
editor needs to be able to generate empty nodes to fill missing pieces
in the content.

@cn 这也让 Prosemirror 在调用一些接口如 [`createAndFill`](##model.NodeType.createAndFill) 来生成满足 schema 约束的 node 的时候变得不可能.
这就是为什么你不能将这样的节点放到一个必须的位置，因为编辑器需要能够生成一个空的节点以填充缺失的内容部分。

## Serialization and Parsing

In order to be able to edit them in the browser, it must be possible
to represent document nodes in the browser DOM. The easiest way to do
that is to include information about each node's DOM representation in
the schema using the [`toDOM` field](##model.NodeSpec.toDOM) in the
node spec.

@cn 为了能在浏览器中编辑元素, 就必须使 document nodes 以 DOM 的形式展示出来. 
最简单的方式就是在 schema 中对每个 node 注明如何在 DOM 中显示. 
这可以在 schema 的每个 node spec 中指定 [`toDOM` 字段](##model.NodeSpec.toDOM) 来实现.

This field should hold a function that, when called with the node as
argument, returns a description of the DOM structure for that node.
This may either be a direct DOM node or an [array describing
it](##model.DOMOutputSpec), for example:

@cn 这个字段应该指向一个函数, 这个函数将当前 node 作为参数, 返回 node 的 DOM 结构描述. 
这可以直接是一个 DOM node, 或者一个 [array 描述它](##model.DOMOutputSpec), 例如:

```javascript
const schema = new Schema({
  nodes: {
    doc: {content: "paragraph+"},
    paragraph: {
      content: "text*",
      toDOM(node) { return ["p", 0] }
    },
    text: {}
  }
})
```

The expression `["p", 0]` declares that a paragraph is rendered as an
HTML `<p>` tag. The zero is the ‘hole’ where its content should be
rendered. You may also include an object with HTML attributes after
the tag name, for example `["div", {class: "c"}, 0]`. Leaf nodes don't
need a hole in their DOM representation, since they don't have
content.

@cn 上面示例中, `["p", 0]` 的含义是 paragraph 节点在 HTML 中被渲染成 `<p>` 标签. 
0 代表一个 “hole”, 表示该 node 的内容应该被渲染的地方(意思就是如果这个节点预期是有内容的, 
就应该在数组最后写上 0). 你也可以在标签后面加上一个对象表示 HTML 的 attributes, 例如 `["div", {class: "c"}, 0]`. leaf nodes 不需要 “hole” 在它们的 DOM 中, 因为他们没有内容.

Mark specs allow a similar [`toDOM`](##model.MarkSpec.toDOM) method,
but they are required to render as a single tag that directly wraps
the content, so the content always goes directly in the returned node,
and the hole doesn't need to be specified.

@cn Mark 的 specs 有一个跟 nodes 相似的 [`toDOM`](##model.MarkSpec.toDOM) 方法, 
不同的是他们需要渲染成单独的标签去直接包裹着 content, 所以这些 content 直接在返回的 node 中, 所以上面的 “hole” 就不用专门指定了.

You'll also often need to _parse_ a document from DOM data, for
example when the user pastes or drags something into the editor. The
model module also comes with functionality for that, and you are
encouraged to include parsing information directly in your schema with
the [`parseDOM` property](##model.NodeSpec.parseDOM).

@cn 你也会经常 _格式化_ HTML DOM 的内容为 Prosemirror 识别的 document. 例如, 当用户粘贴或者拖拽东西到编辑器中的时候. 
Prosemirror-model 模块有些函数来处理这些事情, 不过你也应该有勇气在 schema 中的 [`parseDOM` 属性](##model.NodeSpec.parseDOM) 中直接包含如何格式化的信息.

This may list an array of [_parse rules_](##model.ParseRule), which
describe DOM constructs that map to a given node or mark. For example,
the basic schema has these for the emphasis mark:

@cn 这里列出了一组 [_parse rules_](##model.ParseRule), 描述了 DOM 如何映射成 node 或者 mark. 例如, 基本的 schema 对于 emphasis mark 写成下面这样:

```javascript
  parseDOM: [
    {tag: "em"},                 // Match <em> nodes
    {tag: "i"},                  // and <i> nodes
    {style: "font-style=italic"} // and inline 'font-style: italic'
  ]
```

The value given to [`tag`](##model.ParseRule.tag) in a parse rule can
be a CSS selector, so you can do thing like `"div.myclass"` too.
Similarly, [`style`](##model.ParseRule.style) matches inline CSS
styles.

@cn 上面中的 parse rule 的 [`tag`](##model.ParseRule.tag) 字段也可以是一个 CSS selector, 
所以你也可以传入类似于 `"div.myclass"` 这种的字符串. 与此相似, [`style`](##model.ParseRule.style) 字段匹配行内 CSS 样式.

When a schema includes `parseDOM` annotations, you can create a
[`DOMParser`](##model.DOMParser) object for it with
[`DOMParser.fromSchema`](##model.DOMParser^fromSchema). This is done
by the editor to create the default clipboard parser, but you can
also [override](##view.EditorProps.clipboardParser) that.

@cn 当一个 schema 包含 `parseDOM` 字段时, 你可以使用 [`DOMParser.fromSchema`](##model.DOMParser^fromSchema) 创建一个 [`DOMParser`](##model.DOMParser) 对象. 
编辑器在新建默认的剪切板内容 parser 的时候就是这么干的, 不过你可以 [override](##view.EditorProps.clipboardParser) 它.

Documents also come with a built-in JSON serialization format. You can
call [`toJSON`](##model.Node.toJSON) on them to get an object that can
safely be passed to
[`JSON.stringify`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify),
and schema objects have a [`nodeFromJSON` method](##model.Schema.nodeFromJSON)
that can parse this representation back into a document.

@cn Document 也有一个内置的 JSON 序列化方式. 你可以在 node 上调用 [`toJSON`](##model.Node.toJSON)
来生成一个可以安全地传给 [`JSON.stringify`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
函数的对象(感觉这个目的是为了方便调试?——译者注), 此外 schema 对象有一个 [`nodeFromJSON` 方法](##model.Schema.nodeFromJSON) 可以将 toJSON 的结果再转回原始的 node.

## Extending a schema

The `nodes` and `marks` options passed to the [`Schema`
constructor](##model.Schema) take [`OrderedMap`
objects](https://github.com/marijnh/orderedmap#readme) as well as
plain JavaScript objects. The resulting schema's
[`spec`](##model.Schema.spec)`.nodes` and `spec.marks` properties are
always `OrderedMap`s, which can be used as the basis for further
schemas.

@cn 传给 [`Schema` constructor](##model.Schema) 构造器来设置 `nodes` 和 `marks` 选项的参数可以是
[`OrderedMap` objects](https://github.com/marijnh/orderedmap#readme) 类型的对象, 也可以是纯 JavaScript 对象. 
生成的 schema 上的 [`spec`](##model.Schema.spec)`.nodes` 和 `.spec.marks` 属性则总是 `OrderedMap`s, 它可以被用来作为其他 schemes 的基础.

Such maps support a number of methods to conveniently create updated
versions. For example you could say
`schema.markSpec.remove("blockquote")` to derive a set of nodes
without the `blockquote` node, which can then be passed as the `nodes`
field for a new schema.

@cn OrderedMaps 这种 map 支持很多方法去方便的新建新的 schema. 比如, 你可以通过调用
`schema.markSpec.remove("blockquote")` 后, 将调用结果传给 Schema 构造器的参数的 `nodes` 字段, 
来生成一个没有 `blockquote` node 的 schema.

The [schema-list](##schema-list) module exports a [convenience
method](##schema-list.addListNodes) to add the nodes exported by those
modules to a nodeset.

@cn [schema-list](##schema-list) 模块导出了一个 [很方便的方法](##schema-list.addListNodes) 以添加由该模块导出的 nodes 到一个 node 集合中。
