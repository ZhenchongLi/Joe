+++
date = '2025-05-04T20:20:46+08:00'
draft = false
title = '322. 零钱兑换'
categories = ['leetcode']
+++

[LeetCode链接](https://leetcode.com/problems/coin-change/)

## 问题描述

给定不同面额的硬币 coins 和一个总金额 amount。编写一个函数来计算可以凑成总金额所需的最少的硬币个数。如果没有任何一种硬币组合能组成总金额，返回 -1。

你可以认为每种硬币的数量是无限的。

## 解题思路

### 动态规划方法
1. 定义 `dp[i]` 表示组成金额 i 所需的最少硬币数
2. 初始化：`dp[0] = 0` (金额0不需要硬币)
3. 状态转移：
   - 对于每个金额 i，遍历所有硬币面额
   - 如果硬币面额 <= i，则 `dp[i] = min(dp[i], dp[i - coin] + 1)`
4. 最终结果为 `dp[amount]`，如果仍为初始值则返回-1

## 复杂度分析

- 时间复杂度：O(n * m)，其中n是金额，m是硬币种类数
- 空间复杂度：O(n)，需要存储dp数组

## 代码实现

```python
class Solution:
    def coinChange(self, coins: list[int], amount: int) -> int:
        dp = [float("inf")] * (amount + 1)
        dp[0] = 0

        for coin in coins:
            for i in range(coin, amount + 1):
                dp[i] = min(dp[i], dp[i - coin] + 1)

        return int(dp[amount]) if dp[amount] != float("inf") else -1
```
