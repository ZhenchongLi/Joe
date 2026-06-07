+++
date = '2026-06-07T09:00:00+08:00'
draft = false
title = 'Sutskever 30 #15：给「每一对」加上权重，塞进记忆里'
description = '#14 的 Relation Network 把每一对对象等权算一遍再求和。Santoro et al. 2018 的 Relational Memory Core 把这个求和换成 softmax 加权（也就是 self-attention），再塞进一块循环记忆——让记忆槽每一步互相 attend。说白了，它就是一个 Transformer block，被当成记忆的更新规则用。附一个比 #14 更扎心的诚实发现：在这个最小版里，「让槽互相 attend」这一层不但没带来准确率，反而很难训——多数随机初始化下直接塌到瞎猜。'
categories = ['AI', 'Sutskever 30']
tags = ['Sutskever 30', 'Relational RNN', 'Relational Memory', 'Self-Attention', 'Memory', 'BPTT', 'Notebook Reading']
+++

## 从 #14 的「每一对」接过来

[#14 Relation Networks](/posts/ai/sutskever-14-relation-networks/) 的做法是：把每一对对象都过同一个小网络 `g`，**等权**求和，再读出答案。没有权重、没有路由，一视同仁。当时留了个尾巴——这个「所有对都算一遍」正是 self-attention 的骨架，只差把等权的求和换成加权的求和。

Santoro、Faulkner、Raposo 等人 2018 的 *Relational Recurrent Neural Networks*（模型叫 Relational Memory Core，下面简称 RMC）就把这两步补上了：

- 把等权求和换成 **softmax 加权**求和——这就是 self-attention。
- 把这套 attention **塞进一块循环记忆**——不是对输入对象两两算，而是让一组「记忆槽」每一步互相 attend、互相更新。

一句话：RMC 就是拿一个 Transformer block，当成记忆的更新规则用。下面拆开看——顺便会发现，这个想法漂亮，但在最小版里出乎意料地难训。

## RMC 是什么

记忆是 `S` 个槽、每个槽宽 `D` 的一块矩阵 `M`。每来一个输入，就把它嵌成一行 `e`，拼到记忆后面，然后对这 `S+1` 行做一个标准的 Transformer encoder block：

$$\tilde M = \mathrm{LN}\big(M + \mathrm{Attn}(M,\ [M; e])\big), \qquad M' = \mathrm{LN}\big(\tilde M + \mathrm{MLP}(\tilde M)\big)$$

attention 的 query 来自记忆槽，key / value 来自「槽 + 这一步的输入」——所以一个槽既能读别的槽（互相关系），也能读新来的输入。`M'` 就是下一步的记忆。整段序列走完，把最后的记忆拍平，读出一个答案。

跟 [#12 NTM](/posts/ai/sutskever-12-neural-turing-machine/) 的 location addressing、erase/add 那套比，这里干净得多：没有专门设计的读写头，记忆的更新规则**就是** self-attention 本身。这也正是它和 [#05 Transformer](/posts/ai/sutskever-05-transformer/) 的关系——同一个 block，Transformer 把它当整个模型的主干，RMC 把它当一块循环记忆的更新规则。

## 一个最小任务：顺序版的「线上第 N 远」

[#14](/posts/ai/sutskever-14-relation-networks/) 问的是「线上离某颜色最近的是谁」，一次性看全场景。这次把它改成**顺序**的，逼出记忆：

`K` 个对象一个个排在一条线上，每个对象一步喂进来（位置 + 编号）。全部喂完，最后一步才给出一个目标位置和一个名次 `N`，问：**离目标第 `N` 远的，是哪个对象？**

```
逐步喂入:  obj0@0.13  obj1@0.40  obj2@0.27  obj3@0.93  obj4@0.67  ...
查询(最后一步): 目标位置=0.40, N=2
答案: 离 0.40 第 2 远的对象编号
```

要答对，得先把所有对象都记在记忆里（查询到最后才来），再按到目标的距离排个序、挑出第 `N` 名。位置取整数线槽，距离不会打平（打平的样本重采样掉），答案编号的直方图是平的，没有「猜最常见」的捷径，瞎猜就是 `1/(K-1)`。

## 能训起来的时候，它确实学会了

notebook 里用纯 NumPy 写了 RMC：self-attention、LayerNorm、MLP、残差，全部手推 backprop，梯度穿过整段循环（BPTT），有限差分梯度检验中位相对误差 `1.3e-10`。`K=6`、`N` 取 1~3、Adam 训 50 个 epoch，在一个能训起来的初始化下，三个模型都学到了远超瞎猜（`0.200`）的程度：

![一个能训起来的种子下，RMC、去掉槽间 attention 的 RMC、LSTM 都学会了这个任务](rmc_training_curves.png)

没有人告诉它「该看目标和那个第 N 远的对象」。只给了序列和答案，这条「记住一组对象、按距离排序、挑出第 N 个」的本事，是从问答对里靠反向传播自己长出来的——跟前面几篇一样，端到端。注意上面那句限定词：**能训起来的时候**。

## 诚实的部分：关系那一层，娇气得很

换几个随机初始化重训，画面就裂开了。

![换 3 个初始化重训：关系版多数会塌到瞎猜，另外两个稳定](rmc_robustness.png)

同样的任务、同样的预算，只换初始化的随机种子：

- **LSTM（单个状态向量）**：稳，三次都在 `0.86` 上下，标准差 `0.01`。
- **RMC，但去掉槽间 attention**（每个槽只能看自己和当前输入）：更稳，`0.92`，标准差 `0.01`。
- **完整 RMC（槽互相 attend）**：3 次里有 2 次**直接塌到瞎猜**（`0.172`），只有 1 次训起来。平均 `0.41`，标准差 `0.34`。

塌的原因不难想：几个记忆槽一开始长得差不多，self-attention 一上来就是近似均匀的，把所有槽平均到一起——槽越来越像，梯度越来越平，整个网络卡在起步线上动不了。这是 self-attention 自己的老毛病（rank collapse 的小型版）。给每个槽不同的初始化能把对称性打破、救回来一部分（上图那次训起来的就是），但远谈不上稳。

所以在这么小的任务上，真正的结论比 [#14](/posts/ai/sutskever-14-relation-networks/) 还要扎心一层：**「让槽互相 attend」这层关系计算，没换来准确率，只换来了训练上的脆弱。** 它就训起来那一次，也不过追平了去掉它的版本。关系这一层的价值，跟 #14 里 RN 多出来的成对结构一个命运——是给论文里那种更难的关系（带视觉、要多步比较的 benchmark）准备的保险，得换个更大的舞台才兑现。况且论文的完整 RMC 还带**多头** attention 和一道门控，是我为了看清核心给砍掉的，那些设计本身也在缓解这种脆弱。

## 这条路通向哪里

把三篇摆一起，self-attention 这件事的形状越来越清楚：

- **[#14](/posts/ai/sutskever-14-relation-networks/) RN**：对一组对象，每一对过共享 `g`，**等权**求和。
- **RMC**：对一组记忆槽，每一对做点积、softmax **加权**求和，而且**每步循环**地做。
- **[#05](/posts/ai/sutskever-05-transformer/) Transformer**：把这套加权 all-pairs 直接当成整个模型的主干。

RMC 是中间那一环：它把「加权的 all-pairs」从「对输入算一次」升级成「记忆的更新规则」，离 Transformer 只差一步。而上面那个「一训就塌」的坑，恰恰是这条路上最关键的工程。**怎么把堆叠的 self-attention 训稳——LayerNorm 摆在残差前还是后、要不要 warmup、怎么初始化——正是 Transformer 那篇真正解决的事**。RMC 把 self-attention 请进了记忆，Transformer 才让它当上主角；中间隔着的，一大半是把它训起来的那些技巧。

RN、NTM、Memory Networks、Relational Memory，这几篇 2015–2018 的 attention 变体，最后大多被 Transformer 一个结构收编了进去。往应用那头，两条线还在收口：content-addressed read（[#13](/posts/ai/sutskever-13-memory-networks/)）通向检索增强（RAG）；all-pairs interaction（[#14](/posts/ai/sutskever-14-relation-networks/) → RMC）通向 self-attention。

## 代码

完整 notebook 在 [ZhenchongLi/sutskever-30-reading](https://github.com/ZhenchongLi/sutskever-30-reading)，是在原始的 `18_relational_rnn.ipynb`（只有前向、未训练）上扩出训练后重跑的版本，文件 `18_relational_rnn_rerun_20260607.ipynb`。

跑了五件事：

1. 顺序第 N 远任务：对象逐步喂入，最后给目标位置 + 名次，问离目标第 N 远的对象编号——答对必须先记住全部、再按距离排序
2. 纯 NumPy 实现 RMC：self-attention + LayerNorm + MLP + 残差，当成记忆的更新规则，附手推 BPTT 的有限差分梯度检验（RMC 和 LSTM 各检一遍）
3. 在一个能训起来的初始化下，训 RMC 和两个对照（LSTM 单状态、RMC 去掉槽间 attention），看训练曲线
4. 换 3 个随机初始化重训，量「关系那一层」到底带来准确率还是脆弱——完整 RMC 多数塌到瞎猜，去掉它和 LSTM 都稳
5. 在训起来的那次，按问的名次 N 拆开准确率，确认它真在做排序（名次越细越难）

---

### Run Metadata

- repo: [ZhenchongLi/sutskever-30-reading](https://github.com/ZhenchongLi/sutskever-30-reading)
- notebook: `18_relational_rnn_rerun_20260607.ipynb`（在 `18_relational_rnn.ipynb` 基础上加训练后重跑）
- 2026-06-07 执行通过（`jupyter nbconvert --to notebook --execute --ExecutePreprocessor.timeout=1200`），无报错
- 关键输出：梯度检验中位相对误差 RMC `1.3e-10` / LSTM `9.9e-10`；3 个种子下的测试准确率——完整 RMC（槽互相 attend）`0.41`±`0.34`（其中 2 次塌到瞎猜 `0.172`）/ RMC 去掉槽间 attention `0.92`±`0.01` / LSTM `0.86`±`0.01`（瞎猜 `0.200`）
- Python `3.13.2` / NumPy `2.4.4` / Matplotlib `3.10.8`

### 怎么跑

```bash
cd ~/code/sutskever-30-implementations
jupyter lab 18_relational_rnn_rerun_20260607.ipynb
```

选 kernel `Python (sutskever-30)`。

### 备注

- Santoro, Faulkner, Raposo, Rae, Chrzanowski, Weber, Wierstra, Vinyals, Pascanu, Lillicrap 2018 *Relational Recurrent Neural Networks*（NeurIPS 2018，arXiv 1806.01822）是这一篇的原始论文，模型叫 Relational Memory Core（RMC）
- 原论文的 RMC 用**多头** attention（不同的头学不同的关系）外加一道 LSTM 式的门控（控制每步往记忆里写多少）。这篇 demo 砍成单头、无门控的最小版——目的是看清「self-attention 当记忆更新规则」这个核心。代价是脆弱：多头和门控本身也在帮着稳住训练，砍掉之后塌得更明显
- 那个「槽塌到一起」的坑值得单独记一笔：几个槽初始化得太像，self-attention 会把它们平均成一个，网络卡在瞎猜起步。这正是后来 Transformer 要靠 normalization 摆位、warmup、初始化来驯服的同一个毛病——也是为什么这一篇是通往 [Transformer](/posts/ai/sutskever-05-transformer/) 的关键一环
- 任务用「线上第 N 远」是为了呼应 [#14](/posts/ai/sutskever-14-relation-networks/) 的「线上最近」：把一次性看全场景改成顺序喂入，逼出对记忆的需求；一维距离也好让小模型学得动（论文里是 16 维向量、8 个、N 到 8，那个规模才看得出关系那层的价值）
- 一条线串下来：[Pointer Networks（#10）](/posts/ai/sutskever-10-pointer-networks/) 让 attention 当输出，[NTM（#12）](/posts/ai/sutskever-12-neural-turing-machine/) 让 attention 读写一块 memory，[Memory Networks（#13）](/posts/ai/sutskever-13-memory-networks/) 砍到只读多跳，[Relation Networks（#14）](/posts/ai/sutskever-14-relation-networks/) 把「挑」也砍了、改成所有对等权算一遍，Relational Memory 再把这个求和加上权重、塞进循环记忆。content-addressed read 这条通向 RAG，all-pairs interaction 这条通向 [Transformer](/posts/ai/sutskever-05-transformer/) 的 self-attention

---

$$\text{article}^* = \underset{\theta}{\arg\min}\ \mathcal{L}_{\text{lizcc}}(\theta), \quad \theta \in \lbrace\text{Joe, Weaver, Ruyi, Thorn}\rbrace$$
