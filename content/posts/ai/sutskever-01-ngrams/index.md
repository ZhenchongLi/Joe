+++
date = '2026-04-21T09:00:00+08:00'
draft = false
title = 'Sutskever 30 #01：在神经网络之前，人们怎么猜下一个词？'
description = '神经网络接管语言之前，语言模型主要靠数频率。前几个词出现过什么、后面常接什么，就照着统计表往下猜。表越做越大，句子里的关系还是留在表外。'
categories = ['AI', 'Sutskever 30']
tags = ['Sutskever 30', 'Language Modeling', 'n-gram', 'Bengio', 'Notebook Reading']
+++

## 一个老问题

给你一句话的前半截，猜下一个词是什么。

这是语言模型最早也最直接的版本。从 1948 年 Shannon 开始，到 2010 年代神经网络接管之前，几代人都在做同一件事：**给词的下一个位置算一个概率分布**。

后面几篇会讲神经网络怎么把这个问题接过去，先学内部状态，再学更长的记忆，最后学会看整段上下文。这一篇先回到起点：在神经网络敢碰语言之前，那一套老办法长什么样，又是怎么走到尽头的。

## n-gram：数频率

最朴素的版本叫 n-gram：用前 n-1 个词预测第 n 个。

$$P(w_t \mid w_{t-n+1}, \ldots, w_{t-1})$$

n=2 是 bigram，看前 1 个词；n=3 是 trigram，看前 2 个；n=5 看前 4 个。怎么算？数。把语料里所有"前 n-1 个词出现，紧跟着 X"的次数除以"前 n-1 个词出现"的总次数，就是 X 的概率。

这就是全部。没有梯度，没有反向传播，只有一张大表。

它的好处是：你拿到一份足够大的语料，按公式跑一遍，就能拿到一个能用的语言模型。便宜、快、可解释。

## 它在生产里跑了几十年

这套东西在那几十年里不是玩具。它是真在线上的：

- 语音识别：你说的句子声学上歧义很多（"recognize speech" 和 "wreck a nice beach" 听起来几乎一样），n-gram 给一个语言概率，把听起来对、读起来不对的解码砸下去
- 机器翻译：早期的 SMT 系统用 n-gram 给翻译候选打分
- 输入法：你打"明天"，下一个词候选"晚上 / 见面 / 早上"按 n-gram 概率排序

你今天用的搜索引擎、十年前的输入法，背后都站着一层这种东西。它解决的是排序问题：哪个候选更像一句人会说的话。

## 卡在哪

n-gram 能算短搭配。句子一长，它就只剩下局部统计。主要卡在两件事：**窗口太短**和**没有泛化**。

**窗口太短**。trigram 看 2 个词的上下文，5-gram 看 4 个。再多就开始爆。词表 5 万的话，5-gram 要面对大约 $50{,}000^4 \approx 6.25 \times 10^{18}$ 种上下文，没有任何语料能填满这张表。结果是：模型对长一点的句子结构没感觉。"小明今天没去上学，因为他___"——人会想到"病了 / 累了 / 不想去"，n-gram 看到的只是"因为他"这三个词。前面那半截"小明今天没去上学"对它没意义。

**没有泛化**。每一对词都是独立的整数 ID，"猫"和"狗"在它眼里完全无关。哪怕语料里"猫吃鱼"出现过 100 次、"狗吃肉"出现过 100 次，它也不会推断"猫吃肉"或"狗吃鱼"的概率。它只会数它见过的那个东西。

工程上的应对叫 smoothing——见到没见过的组合，分一点点概率给它，免得整句概率变成 0。Kneser-Ney smoothing 是 90 年代末做到很强的版本，很多系统都靠这种细致的平滑继续往前挤性能。但所有 smoothing 都是在已有数据上做插值和回退，没法让模型学会"猫和狗都是动物"这种事。

所以最后的感觉是：**你看得到它在算词，但你感觉不到它在理解句子。**

它能数频率到极致，能在语音识别和翻译里把候选排序做得很稳，但它一直停在词表面那一层。

## Bengio 2003 开了一个口子

2003 年，Bengio 那篇 *A Neural Probabilistic Language Model* 提了一个想法：既然 one-hot 这么死，能不能先给每个词学一个低维的向量表示，再用神经网络去做预测？

那篇文章里第一次出现了"词嵌入"——每个词被映射到一个几十维的向量，意思相近的词在向量空间里也相近。这一下，"猫吃肉"和"狗吃肉"之间就有桥了：因为"猫"和"狗"的向量本来就靠在一起。

Bengio 那篇当时还没有把整个领域翻过来。算力跟不上，训练慢，效果也只是和最强的 n-gram 持平、没碾压。它更像一个门缝：路通，但门没推开。

这扇门真正被推开，还要等接下来十年——RNN 出现，有人开始用神经网络去做"猜下一个字符 / 下一个词"，这才是 Sutskever 30 系列下一篇要讲的东西。

## 接到下一篇

[#02](/posts/ai/sutskever-02-char-rnn/) 讲 char-RNN：把"猜下一个字符"这件事交给一个最小的循环神经网络去做。

n-gram 数频率，char-RNN 改成学一个内部状态——同样是猜下一个，方法整个换了。换了之后能做什么、卡在哪、为什么 LSTM 又比它强一截，就是后面几篇要讲的事。

## 代码

完整 notebook 在 [ZhenchongLi/sutskever-30-reading](https://github.com/ZhenchongLi/sutskever-30-reading)，文件是 `01_ngrams_lm.ipynb`。

toy 实验示范了：

1. 在小语料上数 trigram 频率，建一张概率表
2. 用 add-one smoothing 处理零概率
3. 让 trigram 自己生成文本，看输出长什么样
4. 算 perplexity 在不同 n 下的变化

数据是合成语料加一段公共领域中文，不追求最强效果。展示的是"数频率"这件事跑起来之后的形态和上限。

---

### Run Metadata

- repo: [ZhenchongLi/sutskever-30-reading](https://github.com/ZhenchongLi/sutskever-30-reading)
- notebook: `01_ngrams_lm.ipynb`
- Python `3.13.2` / NumPy `2.4.4`

### 怎么跑

```bash
cd ~/code/sutskever-30-implementations
jupyter lab 01_ngrams_lm.ipynb
```

选 kernel `Python (sutskever-30)`。

### 备注

- Shannon 1948 *A Mathematical Theory of Communication* 是统计语言模型的源头，他在文里就用 n-gram 模拟过英文
- Kneser-Ney smoothing 出自 Kneser & Ney 1995 *Improved backing-off for M-gram language modeling*，是 90 年代末最稳的 smoothing
- Bengio et al. 2003 *A Neural Probabilistic Language Model* 是词嵌入的起点
- "recognize speech" / "wreck a nice beach" 这个例子来自语音识别教材，Jurafsky & Martin 的 *Speech and Language Processing* 反复用过

---

$$\text{article}^* = \underset{\theta}{\arg\min}\ \mathcal{L}_{\text{lizcc}}(\theta), \quad \theta \in \lbrace\text{Joe, Weaver, Ruyi, Thorn}\rbrace$$
