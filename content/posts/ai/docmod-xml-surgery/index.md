+++
date = '2026-03-27T14:00:00+08:00'
draft = false
title = 'Docmod：Word文档的XML手术刀'
description = 'AI改Word文档，改完格式全炸。Docmod的解法：把docx转成扁平HTML让AI局部编辑，再用XML手术把改动精确patch回去。'
categories = ['AI']
tags = ['Docmod', 'AI Agent', 'Word', 'Document Processing', 'XML Surgery']
+++

## 一个被忽视的问题

让AI改一份Word文档，改完之后SmartArt没了，图表炸了，批注消失了，页眉页脚全乱了。它把你的文档拆了，用碎片拼了一个新的。

目前缺少一个好的工具让AI在保留文档完整性的前提下做局部编辑。Docmod就是为了解决这个问题。

## 问题的根源

`.docx`本质上是一个**ZIP压缩包**，里面装着结构化的XML：

```
report.docx (ZIP)
├── [Content_Types].xml
├── word/
│   ├── document.xml      ← 正文
│   ├── styles.xml        ← 样式定义
│   ├── comments.xml      ← 批注
│   ├── header1.xml       ← 页眉
│   ├── footer1.xml       ← 页脚
│   └── media/            ← 图片
└── _rels/                ← 关系定义
```

现有方案用OpenXML SDK或python-docx把文档解析成对象模型，让AI操作对象模型，再序列化回docx。**在实践中，大多数库的序列化会重写整个XML树**。SDK不认识的元素、自定义的命名空间、精心调过的格式——全部丢失。改一个错别字，输出的是一份"长得像原文"的全新文档。

## 走过的弯路

**让AI直接输出OpenXML？** OpenXML的复杂度远超AI的舒适区。一个加粗的段落：

```xml
<w:r><w:rPr><w:b/></w:rPr><w:t>文字</w:t></w:r>
```

让AI在这种层级的XML里精确操作，错误率极高，调试极痛苦。

**用Markdown作为中间格式？** 表达力不够。表格合并、精确的字体大小、段落缩进——这些Word文档的核心价值在Markdown中无法表达。用Markdown做中转等于主动丢弃信息。

三个条件交叉筛选——AI的训练数据中大量存在、能表达Word文档的结构和样式、可以做精确的元素级diff——符合的格式只有一个：**扁平化的HTML**。

## 核心洞察：扁平HTML作为可diff的中间表示

**1995年风格的HTML**——每个元素自带完整的内联样式，没有外部CSS，没有继承，没有级联。现代HTML把样式藏在CSS文件里，需要级联计算才能确定最终效果；扁平HTML把这层复杂性彻底消除了。

```html
<h1 data-id="p1" style="font-size:22pt; font-weight:bold;">
  季度报告
</h1>

<p data-id="p2" style="font-size:10.5pt; text-indent:2em;">
  营收同比增长<b>23%</b>。
</p>
```

**两个元素的字符串相等，就代表它们在语义上完全相同。** 没有CSS级联干扰，变更检测退化为简单的字符串比较。

每个元素上的`data-id`是手术的定位标记。docx转HTML时，转换器按顺序为每个body元素分配ID，同时建立一张**映射表**：`data-id` → 原始`document.xml`中对应XML节点的`(Start, End)`索引范围。这张映射表是后续精准定位的坐标系。

## 全局流程

![Docmod 管线流程](pipeline.svg)

传统方案和Docmod的对比：

![传统方案 vs Docmod](comparison.svg)

## AI只说出它想改什么

传统方案让AI输出整份文档。一份50页的报告约80K tokens的HTML，AI可能只改了3个段落——却要重新生成全部内容。按GPT-4o的价格，光输出就要花0.6美元，还没算输入。

Docmod让AI只输出**变更片段（Changes Fragment）**——通常只有几百个tokens：

```html
<!-- 替换：通过data-id定位，改了一个数字 -->
<p data-id="p2" style="font-size:10.5pt; text-indent:2em;">
  营收同比增长<b>32%</b>。
</p>

<!-- 删除 -->
<p data-id="p8" data-delete="true" />

<!-- 插入：放在p2后面 -->
<p data-after="p2" style="font-size:10.5pt;">
  这是新增的一段分析。
</p>
```

替换、删除、插入——三种操作覆盖绝大多数编辑场景。

## XML手术

拿到AI的变更片段后，Patch引擎开始工作：

1. **对比**：将变更片段与基线HTML逐元素比较。扁平HTML下对比就是字符串比较——通过`data-id`将每个变化分类为：保留、替换、删除或插入。

2. **定位**：通过映射表（`data-id` → `(Start, End)`索引范围），O(1)定位到原始`document.xml`中对应的XML节点。

3. **手术**：直接操作`document.xml`的XDocument对象——
   - **保留**的元素：原始XML一个字节都不碰
   - **替换**的元素：生成新的OpenXML节点，精确替换
   - **删除**的元素：移除对应节点
   - **插入**的元素：在`data-after`指定的位置后添加新节点

4. **缝合**：将修改后的`document.xml`放回ZIP包。styles.xml、media、headers原封不动。

未被AI修改的元素——包括SmartArt、图表、批注链路——在整个过程中保持字节级不变。

## 边界在哪里

**完全支持的**：段落、标题、表格、列表、图片、超链接、粗斜体、批注、脚注尾注、页眉页脚、水印、Word样式体系。

**有意不碰的**：SmartArt、图表、嵌入的OLE对象。这些元素在HTML中不可见，AI看不到也改不了，但patch引擎不碰它们，编辑后完好保留。

**已知限制**：编辑父表格的任意单元格时，嵌套的子表格结构会丢失。公式只保留文本内容和OMML源码，无法通过HTML精确编辑数学结构。WPS文档中SDT（内容控件）内的段落可能在转换过程中丢失。

## 写在最后

AI帮你改三行字，剩下的497页应该一个字节都不变。Docmod就是为了做到这件事。
