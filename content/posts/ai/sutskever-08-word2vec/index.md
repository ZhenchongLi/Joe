+++
date = '2026-04-22T09:00:00+08:00'
draft = false
title = 'Sutskever 30 #08：词第一次有了位置'
description = 'n-gram 只会查表，猫和狗只是两个互不相干的编号。word2vec 换了一种做法：让每个词学一个向量位置。位置近，关系就近。'
categories = ['AI', 'Sutskever 30']
tags = ['Sutskever 30', 'Word Embeddings', 'word2vec', 'Mikolov', 'Notebook Reading']
+++

## 从查表开始

[#01](/posts/ai/sutskever-01-ngrams/) 最后留了一个问题：

n-gram 看见的"猫"和"狗"完全是两个互不相干的整数 ID，哪怕语料里"猫吃鱼"和"狗吃肉"各出现 100 次，它也不会推断"猫吃肉"或"狗吃鱼"。它只数它见过的那个东西。

2013 年 Mikolov 那两篇 word2vec 论文（[*Efficient Estimation of Word Representations in Vector Space*](https://arxiv.org/abs/1301.3781) 和 [*Distributed Representations of Words and Phrases and their Compositionality*](https://arxiv.org/abs/1310.4546)）往这里走了一步：把词从整数 ID 变成向量。

## 换一个看法：把词放进一个向量空间

n-gram 的世界里，每个词是一个 ID。词表 5 万，那"猫"可能是 723，"狗"可能是 4912，"汽车"可能是 18。这三个数字之间没有任何意义——723 和 4912 在数轴上相距 4189，但它没告诉你"猫"和"狗"在概念上多近。

word2vec 把这层抽掉。每个词不再是一个 ID，而是一个几十维到几百维的实数向量。比如 100 维：

```
猫     → [0.12, -0.34, 0.81, ..., 0.05]   (100 个数)
狗     → [0.18, -0.29, 0.77, ..., 0.09]
汽车   → [-0.66,  0.41, -0.12, ..., 0.88]
```

"猫"和"狗"的向量在这 100 维空间里挨得很近，"汽车"在远处。这套向量怎么来的？训练。

## 训练目标：让常一起出现的词靠在一起

word2vec 的直觉很朴素：一个词经常和哪些词一起出现，那个词的位置就由这些邻居慢慢推出来。

训练任务因此也简单——给一个中心词，预测它附近会出现哪些词；或者反过来，给一个上下文窗口，预测中间是什么。前者叫 skip-gram，后者叫 CBOW。

Skip-gram 的版本是这样：

```
... 我家的 [猫] 喜欢 吃 鱼 ...
                 ↑
              中心词
```

中心词是"猫"，目标是让模型对窗口内的词（"我家的"、"喜欢"、"吃"、"鱼"）打高分，对其他随机抽的词（"汽车"、"代码"、"今天"）打低分。

模型只有两张表：一张输入向量表，一张输出向量表。中心词查输入表拿一个向量 $v_c$，每个候选词查输出表拿一个向量 $u_o$，两者点积，得到一个分数。分数越高，模型越认为这两个词应该一起出现。

$$P(o \mid c) = \frac{\exp(u_o^\top v_c)}{\sum_{w \in V} \exp(u_w^\top v_c)}$$

训练就是最大化窗口内真实词的概率。loss 还是熟悉的负对数似然——和 [#02 char-RNN](/posts/ai/sutskever-02-char-rnn/) 那一篇里一样。

为了不用每次扫完整个词表，word2vec 用 hierarchical softmax 或 negative sampling 加速。实际最常用的是 negative sampling：一个真邻居，配几个随机假邻居，让真邻居分数高、假邻居分数低。

整个训练就是：扫语料、滑窗口、对每个中心词更新它的向量和窗口词的向量。语料扫几遍，每个词的向量就稳定下来了。

## 位置开始有意义

训练完，每个词得到一个固定向量。这张表本身就能玩很多事。

**最近邻**。给"king"找余弦相似度最高的几个词，会出来 "queen"、"prince"、"monarch"、"emperor"。给"Paris"找，会出来 "France"、"Berlin"、"Madrid"、"London"。语义近的词在向量空间里也近。

**类比**。这是 word2vec 最出名的演示：

$$\text{vec(king)} - \text{vec(man)} + \text{vec(woman)} \approx \text{vec(queen)}$$

把"king"的向量减掉"man"的，加上"woman"的，结果落在"queen"附近。同样能跑出 "Paris" − "France" + "Italy" ≈ "Rome"。

为什么能这样？因为训练目标是"上下文相似的词向量也相似"，而"性别"和"皇室"这两个概念在大规模语料里以相对独立的方式分布——"king" 和 "man" 共享"男性"上下文，"queen" 和 "woman" 共享"女性"上下文。学完之后，"性别"这个差异就被压到了向量里某个大致一致的方向上。

类比能跑通是这件事的副产品，不是 Mikolov 设计的目标。它说明了一件事：这张向量表里不只有"谁常跟谁出现"，还出现了可以计算的关系。

## 学不到的东西

word2vec 给每个词一个向量。一个词，一个向量。

这意味着：

- "bank" 在"river bank"和"investment bank"里是同一个向量。一词多义被压平了
- 长一点的组合（"New York Times"）只能拼起来取平均，没有专门的位置
- 句子级别的意思也很难处理：同样的词换个顺序，意思会变，静态词向量本身看不到这个变化

这些限制后来由 ELMo / BERT / Transformer 那条线解决，让一个词的向量根据上下文动态变化。但起点还是 word2vec：先承认每个词应该有个向量。

## 接到下一篇

word2vec 之后，"词嵌入"成了 NLP 的默认前菜——下游任务（分类、翻译、问答）都先用一张预训练好的词向量表初始化输入层，再训自己的部分。

但词向量本身是静态的。一旦训完，"bank"就只有一个向量。要让向量根据上下文变化，需要把上下文信息整个塞进编码过程里——这就是几年后 ELMo（2018）、BERT（2018）的方向。

Sutskever 30 系列接下来要讲的，是这条 NLP 线的另一个分支：Bahdanau attention（2014），让 [#04 seq2seq](/posts/ai/sutskever-04-seq2seq/) 里那个被压扁的 thought vector 重新打开。

## 代码

完整 notebook 在 [ZhenchongLi/sutskever-30-reading](https://github.com/ZhenchongLi/sutskever-30-reading)，文件是 `08_word2vec.ipynb`。

toy 实验示范了：

1. 在小语料上跑 skip-gram + negative sampling，hidden size 50
2. 训完取出"猫"/"狗"/"汽车"几个词的向量，算两两余弦相似度
3. 跑一次类比："king − man + woman" 找最近邻
4. 把所有向量降到 2 维（PCA / t-SNE）画散点图，看语义聚类

数据是合成中文语料加一段公共领域英文，不追求最强效果。展示的是"每个词学一个向量"这件事跑起来之后能产生什么。

---

### Run Metadata

- repo: [ZhenchongLi/sutskever-30-reading](https://github.com/ZhenchongLi/sutskever-30-reading)
- notebook: `08_word2vec.ipynb`
- Python `3.13.2` / NumPy `2.4.4`

### 怎么跑

```bash
cd ~/code/sutskever-30-implementations
jupyter lab 08_word2vec.ipynb
```

选 kernel `Python (sutskever-30)`。

### 备注

- Mikolov et al. 2013a *Efficient Estimation of Word Representations in Vector Space* 是 skip-gram / CBOW 的原始论文
- Mikolov et al. 2013b *Distributed Representations of Words and Phrases and their Compositionality* 引入 hierarchical softmax 和 negative sampling
- "king − man + woman ≈ queen" 是英文 Google News 语料上训出来的；中文语料上能跑出类似的几何，但需要分词一致
- GloVe (Pennington et al. 2014) 是另一条路线：直接对全局共现矩阵分解，不走滑窗口预测。同期、同质量、思路不同
- word2vec 之前 Bengio 2003 已经提了"先学词向量再做语言模型"；word2vec 把这个想法做轻、做快，让它真正普及

---

$$\text{article}^* = \underset{\theta}{\arg\min}\ \mathcal{L}_{\text{lizcc}}(\theta), \quad \theta \in \lbrace\text{Joe, Weaver, Ruyi, Thorn}\rbrace$$
