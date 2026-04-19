+++
date = '2026-04-19T17:00:00+08:00'
draft = false
title = 'Sutskever 30 #07：相信之前，需要一次证明'
description = '2020 年 scaling laws 把规模和性能的关系写成了公式。但在那之前，得先有人相信「深网络 + GPU + 大数据」这条路走得通。2012 年的 AlexNet 是那个证明。'
categories = ['AI', 'Sutskever 30']
tags = ['Sutskever 30', 'AlexNet', 'CNN', 'Krizhevsky', 'Hinton', 'Sutskever', 'Notebook Reading']
+++

## 上一篇留下的问题

[上一篇](/posts/ai/sutskever-06-scaling-laws/) 讲的是 scaling laws——loss 随着参数、数据、算力按 power law 下降。2020 年 Kaplan 把它写成公式之后，大家已经习惯了"模型更大、数据更多、算力更强，结果就会更好"。

但有一个更早的问题：**大家为什么会愿意相信这条路？**

今天回头看，这条路像常识。2012 年之前，它一点也不像——深度学习几度陷入寒冬，SVM / boosting 一度是主流。

往回走一步，看 **2012 年那场比赛到底发生了什么**。

## ImageNet 2012

ImageNet 是 Fei-Fei Li 团队搞的图像识别比赛，有 120 万张标注图片，分成 1000 类。2010、2011 两年，最好的系统 top-5 错误率在 25% 上下。这是靠手工设计特征 + SVM 的时代，进步以每年 1-2 个百分点计。

2012 年 9 月，结果出来——

| | 2010 冠军 | 2011 冠军 | 2012 AlexNet | 2012 第二名 |
|---|---|---|---|---|
| top-5 错误率 | 28.2% | 25.8% | **15.3%** | 26.2% |

领先第二名 10 个百分点。这个分差一出来，大家就知道事情变了。

论文标题：*ImageNet Classification with Deep Convolutional Neural Networks*。三个作者：Alex Krizhevsky（一作）、Ilya Sutskever、Geoffrey Hinton，都来自多伦多大学。

## 之前为什么不行

AlexNet 里没有哪一样东西是凭空冒出来的。数据、GPU、训练技巧，之前都有人做过。2012 年第一次不一样，是这些东西终于一起工作了。

卷积神经网络（CNN）这个结构 LeCun 1989 年就做出来了。反向传播 1986 年就有了。AlexNet 里几乎所有思路，2012 年之前都已经存在。

先是数据。ImageNet 2009 年才建成。在它之前，公开可用的图像数据集只有几万张——对深网络来说太少，模型很容易把训练集背下来。ImageNet 一下给了 120 万张。

然后是算力。深网络训练要做大量矩阵乘法。2010 年之前大家用 CPU，训一个能用的模型要几个月。等到 CUDA 成熟、GTX 580 这种消费级 GPU 能跑起来，训练时间从几个月压到了几天。

还差最后一块：训练得真的跑起来。深网络训不动这件事，2012 年之前是个拦路石——梯度要么消失、要么爆炸，正则化又把有用信息也磨掉。AlexNet 把几个已有但零散的 trick 组合到一起，让一个 8 层的网络真的收敛了。

## AlexNet 到底做对了什么

**ReLU 替代 sigmoid/tanh**。激活函数从 $\tanh(x)$ 换成 $\max(0, x)$。好处是正区间不饱和——梯度不会随着层数加深而消失。训练速度快 6 倍。

**Dropout**。全连接层训练时随机丢掉 50% 的神经元。相当于每次都在训一个小一点的网络，再集成起来。过拟合明显减弱。这个技术是 Hinton 组先提的，Sutskever 参与了在 AlexNet 上的落地。

**数据增强**。训练时对每张图随机裁剪、翻转、颜色抖动。等价于把 120 万图放大成几千万。

**GPU 训练**。用 2 张 GTX 580，显存加起来 6GB，把 8 层网络压进去跑。这是 Sutskever 最关键的贡献——说服团队把整套反向传播训练流程搬到 GPU 上。没有这一步，训练根本跑不完。

ReLU、dropout、数据增强、GPU，单看都不是第一次出现。AlexNet 特别的地方，是这些东西第一次在同一个训练流程里一起跑通了。

## 2012 → 2020：这条信念怎么传开的

AlexNet 之后的 8 年，深度学习一路扩张：

- **2014**：VGG（19 层）、GoogLeNet（22 层）继续加深
- **2015**：ResNet（152 层）用残差连接把"深"这件事推到极致
- **2017**：[Transformer](/posts/ai/sutskever-05-transformer/) 把深度学习从图像扩展到语言
- **2020**：[Scaling laws](/posts/ai/sutskever-06-scaling-laws/) 把"深 + 大 + 多"的关系量化

起点就是 2012。AlexNet 之前也有 CNN，也有深网络，它是第一个在公开比赛里把对手甩开十个百分点的。从那一刻起，你可以不喜欢深网络，但很难再假装它没发生。

## Sutskever 在这里面做了什么

Ilya Sutskever 是 Hinton 的学生。在 AlexNet 里他的名字挂二作，Hinton 后来在多个访谈里讲过 Sutskever 的作用：

- 在组里最早相信"网络应该更深"的人之一
- 推动了整套反向传播训练流程在 GPU 上的实现
- 对 dropout 的工程落地有参与

这些事拆开看没有哪一件能当新闻标题，放在一起才是 AlexNet 真正能跑起来的原因。这个风格后来延续到了他在 OpenAI 做 GPT 系列——别人还在争论语言模型能做多大，他的判断是"就是要做大，做到最大"。

## 和上一篇的关系

上一篇讲的是：大家已经信了规模有用，接下来怎么算、怎么堆。AlexNet 讲的是更早的一步：大家是从哪一刻开始信的。2012 年那个 15.3%，至少把一件事提前说服了整个行业。

## 代码

完整 notebook 在 [ZhenchongLi/sutskever-30-reading](https://github.com/ZhenchongLi/sutskever-30-reading)，文件是 `07_alexnet_cnn.ipynb`。

toy model 示范了 AlexNet 里几个关键部件：

1. 卷积层与池化的前向传播
2. ReLU 激活和 sigmoid 的训练速度对比
3. Dropout 在训练和推理阶段的差别
4. 数据增强（翻转、裁剪、颜色抖动）对训练的影响

数据是合成的，不追求和 ImageNet 真实精度对齐——展示的是各部件的形态。

---

### Run Metadata

- repo: [ZhenchongLi/sutskever-30-reading](https://github.com/ZhenchongLi/sutskever-30-reading)
- notebook: `07_alexnet_cnn.ipynb`
- Python `3.13.2` / NumPy `2.4.4` / Matplotlib `3.10.8`

### 怎么跑

```bash
cd ~/code/sutskever-30-implementations
jupyter lab 07_alexnet_cnn.ipynb
```

选 kernel `Python (sutskever-30)`。

### 备注

- Krizhevsky, Sutskever, Hinton 2012 *ImageNet Classification with Deep Convolutional Neural Networks* 是原始论文
- AlexNet 原版把网络拆到 2 张 GTX 580 上训，这是消费级 GPU 上跑深网络最早的工程样本之一
- Dropout 更早的提出在 Hinton 组 2012 年技术报告 *Improving neural networks by preventing co-adaptation of feature detectors*
- 2011 → 2012 这一年，ImageNet top-5 错误率从 25.8% 跌到 15.3%，之前每年只动 1-2 个百分点

---

$$\text{article}^* = \underset{\theta}{\arg\min}\ \mathcal{L}_{\text{lizcc}}(\theta), \quad \theta \in \lbrace\text{Joe, Weaver, Ruyi, Thorn}\rbrace$$
