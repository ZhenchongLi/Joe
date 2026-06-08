+++
date = '2026-06-08T09:00:00+08:00'
draft = false
title = 'Sutskever 30 #16：深网络越加越差?加一根捷径就好了'
description = 'He et al. 2015 的 ResNet。深网络有个怪毛病:层数加多了,连训练误差都往上走——不是过拟合,是根本训不动。一行修正 y = x + F(x):每层从恒等映射起步,顺便给梯度修了条直达后门。纯 NumPy 复现两张经典图:plain 网络越深训得越差,残差网络纹丝不动;以及为什么——plain 的梯度在靠近输入的层里直接蒸发,残差那根 skip 线把它一路接住。这次是个干净、能复现的「有用」结论。'
categories = ['AI', 'Sutskever 30']
tags = ['Sutskever 30', 'ResNet', 'Residual Learning', 'Vanishing Gradients', 'Deep Networks', 'BPTT', 'Notebook Reading']
+++

## 从 #15 的「难训」接过来

[#15 Relational Memory](/posts/ai/sutskever-15-relational-rnn/) 收在一个坑上:把 self-attention 堆成一块深层循环记忆,出乎意料地难训——槽容易塌、梯度容易废,得靠 normalization、warmup、残差这些招数才稳得住。那篇最后说,这些招数里最关键的一个,是这篇要讲的。

He、Zhang、Ren、Sun 2015 的 *Deep Residual Learning for Image Recognition*(ResNet)针对的是一个更基本的怪事:**网络越深,训练误差反而越高。**

这不合直觉。一个深网络至少能模仿浅网络——把多出来的层都设成恒等映射(什么都不改),就退化成浅网络了,误差不该变差。可实际上 plain 的深网络做不到这件最简单的事,连训练集都拟合不好。问题不在容量,在**优化**:它训不动。

ResNet 的修正只有一行。让每一层不再从零学一个变换,而是学一个**增量**:

$$y = x + F(x)$$

`F` 学不到东西就退回 0,这一层自动是恒等映射——「至少不比浅的差」这件事被直接内建了。下面用纯 NumPy 把它和它的代价拆开看。

## ResNet 的核心:残差块

两个网络,同样的宽度、同样多的权重层,**唯一**的区别是那根 skip 线:

- **plain** 块:`h ← tanh(W h)`
- **残差**块:`h ← h + W₂ tanh(W₁ h)`

为什么这根线管用,一行微积分就够。过一个残差块,

$$\frac{\partial y}{\partial x} = I + \frac{\partial F}{\partial x}$$

那个 `I` 把上游梯度原样拷贝过去——哪怕 `∂F/∂x` 小到可以忽略,梯度也跌不到 `I` 以下。叠 `L` 层,最靠前的层照样能听见清楚的信号。plain 块没有这一项,它的梯度是 `L` 个雅可比矩阵连乘,深度一上去就成几何级数地缩小。

## 一个最小任务:螺旋

三条缠在一起的螺旋臂,一个二维非线性分类——**浅**网络就能轻松解出来。这正是关键:任务本身不需要深度,所以深网络一旦翻车,翻的是优化,不是任务太难。

## 结果一:plain 越深越差

同样的宽度、同样的权重层数、同样的优化器和预算,只把深度从浅拉到深。浅的几档两个网络都满分;深度一上去,plain 的**训练**准确率就往瞎猜(`0.333`)塌,而残差网络纹丝不动:

![plain 网络越深训练准确率越塌,残差网络一直满分](resnet_degradation.png)

| 深度(权重层数) | plain | 残差 |
|---|---|---|
| 8 | `1.000` | `1.000` |
| 16 | `0.978` | `1.000` |
| 24 | `0.628` | `1.000` |
| 32 | `0.520` | `1.000` |
| 48 | `0.502` | `1.000` |

注意这是**训练**准确率,不是测试——plain 网络深到一定程度,连它浅的时候能轻松拟合的数据都拟合不了了。残差网络参数一模一样,却毫发无伤。多出来的不是容量,是那根 skip 线。

## 结果二:为什么——梯度高速公路

拿一个没训练过的深网络,做一次反向传播,看看梯度传到每一层时还剩多大。plain 网络里,梯度往靠近输入的层走,**一路蒸发**,差了好几个数量级——前面的层几乎收不到信号,自然学不动。残差网络里,那个 `I` 项把梯度一路接住,无论多深,每一层听见的都差不多:

![plain 梯度在靠近输入的层里指数级蒸发,残差那根 skip 线把梯度一路接住](resnet_gradient_flow.png)

40 层深、初始化时实测:plain 网络最靠输入那层的梯度只有 `2.0e-10`,到输出端是 `9.0e-5`——差了约 **`5e5` 倍**;残差网络两头分别是 `8.7e-4` 和 `1.4e-4`,基本是平的。上图的纵轴是 log,plain 那条直线就是「每层乘一个小于 1 的数」连乘出来的几何衰减,残差那条几乎贴平。

手推的 backprop(残差块的反向要把那条 identity skip 的梯度加回来)过了有限差分梯度检验,plain / 残差的中位相对误差分别 `5.9e-8` / `5.1e-9`。

[#03 LSTM](/posts/ai/sutskever-03-lstm/) 其实早就用过同一个思路对付梯度消失——它的 cell 状态 `c` 一路加性地往前传,门控决定加多少,本质也是给梯度修一条不被反复挤压的通道。ResNet 把这个「加性直通」从时间方向搬到了**深度**方向。

## 诚实的边界

这次是个干净的「有用」结论(跟 [#14](/posts/ai/sutskever-14-relation-networks/)、[#15](/posts/ai/sutskever-15-relational-rnn/) 那种「玩具上没赢」不一样),但有几条边界得说清楚:

- **赢在深度,不在任务。** 浅网络不需要 skip,plain 和残差一样满分;skip 的好处只有深到梯度撑不住时才显出来。
- **我用了 tanh + 小初始化**,就是为了把梯度消失这件事看得清楚。换成现代的 ReLU + 好的初始化,纯粹的梯度消失会缓解很多——但 ResNet 原论文用的是 ReLU + BatchNorm,梯度本来就健康,**深网络照样退化**。也就是说 skip 干的事不止「救梯度」,它还把优化的地形整个改平了。这一层在玩具上没专门复现,记着就行。
- **它不加容量。** 残差网络和 plain 参数完全一样,改的只是优化能不能走到。

## 这条路通向哪里

深度曾经是一堵墙:理论上越深越强,实践里越深越训不动。ResNet 用一根 skip 线把墙推倒了——之后几百层、上千层的网络成了常规操作。

更重要的是,这根线现在无处不在。[#15](/posts/ai/sutskever-15-relational-rnn/) 的记忆块里有残差,[#05 Transformer](/posts/ai/sutskever-05-transformer/) 的每一个 block 都是「attention + 残差 + LayerNorm」「MLP + 残差 + LayerNorm」——没有残差和归一化,那种深度根本堆不起来。换句话说:#15 给了我们想堆的东西(self-attention 当层),ResNet 这一篇给了能堆起来的办法。两件事一凑,才有了后面的一切。

## 代码

完整 notebook 在 [ZhenchongLi/sutskever-30-reading](https://github.com/ZhenchongLi/sutskever-30-reading),是在原始的 `10_resnet_deep_residual.ipynb`(只有前向、未训练)上扩出训练后重跑的版本,文件 `10_resnet_deep_residual_rerun_20260608.ipynb`。

跑了四件事:

1. 螺旋分类任务:三条螺旋臂,浅网络就能解——好让深网络的翻车只能归因于优化
2. 纯 NumPy 实现 plain 和残差两个深网络(同宽、同权重层数,只差一根 skip 线),附手推 backprop 的有限差分梯度检验
3. 深度扫描:从浅到深训两个网络,看 plain 的训练准确率怎么随深度塌、残差怎么不塌(退化问题)
4. 梯度流:对没训练的深网络做一次反向传播,量每一层收到的梯度大小,看 plain 怎么蒸发、残差怎么被 skip 接住

---

### Run Metadata

- repo: [ZhenchongLi/sutskever-30-reading](https://github.com/ZhenchongLi/sutskever-30-reading)
- notebook: `10_resnet_deep_residual_rerun_20260608.ipynb`(在 `10_resnet_deep_residual.ipynb` 基础上加训练后重跑)
- 2026-06-08 执行通过(`jupyter nbconvert --to notebook --execute --ExecutePreprocessor.timeout=600`),无报错
- 关键输出:梯度检验中位相对误差 plain `5.9e-8` / 残差 `5.1e-9`(worst 是接近零梯度 / tanh 饱和处的有限差分噪声);训练准确率随深度——plain `1.000`(8 层)→ `0.628`(24 层)→ `0.502`(48 层),残差全程 `1.000`(瞎猜 `0.333`);40 层时最靠输入层的梯度 plain `2.0e-10` vs 残差 `8.7e-4`
- Python `3.13.2` / NumPy `2.4.4` / Matplotlib `3.10.8`

### 怎么跑

```bash
cd ~/code/sutskever-30-implementations
jupyter lab 10_resnet_deep_residual_rerun_20260608.ipynb
```

选 kernel `Python (sutskever-30)`。

### 备注

- He, Zhang, Ren, Sun 2015 *Deep Residual Learning for Image Recognition*(CVPR 2016,arXiv 1512.03385)是这一篇的原始论文;后续的 *Identity Mappings in Deep Residual Networks*(He et al. 2016,arXiv 1603.05027)把「为什么恒等的 skip 最好」讲得更透,本文那条 `∂y/∂x = I + ∂F/∂x` 的论证就是它的核心
- 原论文是 CNN 做 ImageNet,残差块里是卷积 + BatchNorm;这篇 demo 是最小版——全连接、tanh、二维螺旋,好让纯 NumPy 的深网络干净地复现退化和梯度消失这两件事
- 用 tanh + 小初始化是为了把梯度消失显出来。现代 ReLU + 合适初始化下纯梯度消失会轻很多,但退化问题在 ReLU + BatchNorm(梯度健康)时依然存在——所以 skip 不只是救梯度,更是改善了优化地形。这一点玩具上没单独复现
- 残差和 plain 参数量完全一样,差别只在那根 skip 线;它修的是「梯度走不走得到、优化能不能收敛」,不是表达能力
- 一条线串下来:[#15 Relational Memory](/posts/ai/sutskever-15-relational-rnn/) 想把 self-attention 堆成深层记忆却很脆弱,ResNet 这根 skip 线(配上归一化)正是让深层堆叠训得动的关键;今天 [Transformer](/posts/ai/sutskever-05-transformer/) 的每个 block 都立在残差 + LayerNorm 上

---

$$\text{article}^* = \underset{\theta}{\arg\min}\ \mathcal{L}_{\text{lizcc}}(\theta), \quad \theta \in \lbrace\text{Joe, Weaver, Ruyi, Thorn}\rbrace$$
