+++
date = '2025-05-05T15:38:43+08:00'
draft = false
title = '二叉搜索树'
categories = ['leetcode']
tags = ['二叉搜索树', '二叉树', '数据结构']
+++


二叉搜索树(Binary Search Tree, BST)是具有以下特性的二叉树：
- 左子树中的所有节点键值小于父节点的键值
- 右子树中的所有节点键值大于父节点的键值
- 左右子树本身也必须是二叉搜索树

这些特性使得二叉搜索树成为一种高效的数据结构，特别适合用于搜索、插入和删除操作。

## 二叉搜索树的操作复杂度

二叉搜索树各种操作的时间复杂度如下：

| 操作 | 平均情况 | 最坏情况 |
|------|----------|----------|
| 插入 | O(log n) | O(n) |
| 查找 | O(log n) | O(n) |
| 删除 | O(log n) | O(n) |
| 最小值 | O(log n) | O(n) |
| 最大值 | O(log n) | O(n) |
| 前驱 | O(log n) | O(n) |
| 后继 | O(log n) | O(n) |

值得注意的是，平均情况指的是在平衡树上执行操作所需的时间，而最坏情况则是在非平衡树上执行操作所需的时间。当树不平衡时（例如所有节点都在一侧），BST的性能会大幅下降。

## Python实现二叉搜索树

让我们用Python来实现一个二叉搜索树。首先，我们需要定义两个基本类：`BinarySearchTree`和`Node`。

### 基本结构

首先，我们定义一个空的`BinarySearchTree`类：

```python
class BinarySearchTree:
    def __init__(self):
        self.root = None
        self.size = 0

    def length(self):
        return self.size

    def __len__(self):
        return self.size
```

接下来，我们定义一个`Node`类，并实现一些辅助方法：

```python
class Node:
    def __init__(self, key, val, left=None, right=None, parent=None):
        self.key = key
        self.payload = val
        self.leftChild = left
        self.rightChild = right
        self.parent = parent

    def has_left_child(self):
        return self.leftChild

    def has_right_child(self):
        return self.rightChild

    def is_left_child(self):
        return self.parent and self.parent.leftChild == self

    def is_right_child(self):
        return self.parent and self.parent.rightChild == self

    def is_root(self):
        return not self.parent

    def is_leaf(self):
        return not (self.rightChild or self.leftChild)

    def has_any_children(self):
        return self.rightChild or self.leftChild

    def has_both_children(self):
        return self.rightChild and self.leftChild
```

### 插入操作

有了基本结构后，我们可以实现插入操作。插入方法`put()`会检查树是否已有根节点。如果没有，它会创建一个新节点并将其设为根节点；如果已有根节点，则调用私有的递归辅助函数`_put()`来按照二叉搜索树的属性搜索树并插入新节点：

```python
def put(self, key, val):
    if self.root:
        self._put(key, val, self.root)
    else:
        self.root = Node(key, val)
        self.size = self.size + 1

def _put(self, key, val, current_node):
    if key < current_node.key:
        if current_node.has_left_child():
            self._put(key, val, current_node.leftChild)
        else:
            current_node.leftChild = Node(key, val, parent=current_node)
    else:
        if current_node.has_right_child():
            self._put(key, val, current_node.rightChild)
        else:
            current_node.rightChild = Node(key, val, parent=current_node)

def __setitem__(self, k, v):
    self.put(k, v)
```

### 查找操作

查找操作比插入操作更简单。`get()`方法递归搜索树，直到找到匹配的键或到达叶节点。当找到匹配的键时，返回该节点的值：

```python
def get(self, key):
    if self.root:
        result = self._get(key, self.root)
        if result:
            return result.payload
        else:
            return None
    else:
        return None

def _get(self, key, current_node):
    if not current_node:
        return None
    elif current_node.key == key:
        return current_node
    elif key < current_node.key:
        return self._get(key, current_node.leftChild)
    else:
        return self._get(key, current_node.rightChild)

def __getitem__(self, key):
    return self.get(key)

def __contains__(self, key):
    if self._get(key, self.root):
        return True
    else:
        return False
```

### 删除操作

删除操作是二叉搜索树中最具挑战性的操作。首先，我们需要找到要删除的节点。如果树有多个节点，我们使用`_get()`方法查找；如果树只有一个节点，我们需要检查根节点的键是否匹配：

```python
def delete(self, key):
    if self.size > 1:
        node_to_remove = self._get(key, self.root)
        if node_to_remove:
            self.remove(node_to_remove)
            self.size = self.size - 1
        else:
            raise KeyError('Error, key not in tree')
    elif self.size == 1 and self.root.key == key:
        self.root = None
        self.size = self.size - 1
    else:
        raise KeyError('Error, key not in tree')

def __delitem__(self, key):
    self.delete(key)
```

找到要删除的节点后，我们需要考虑三种情况：
1. 要删除的节点没有子节点
2. 要删除的节点只有一个子节点
3. 要删除的节点有两个子节点

#### 情况1：没有子节点

如果节点是叶节点（没有子节点），我们只需将其父节点对应的引用设为None：

```python
def remove(self, current_node):
    if current_node.is_leaf(): # 叶节点
        if current_node == current_node.parent.leftChild:
            current_node.parent.leftChild = None
        else:
            current_node.parent.rightChild = None
```

#### 情况2：只有一个子节点

如果节点只有一个子节点，我们可以将子节点提升到父节点的位置：

```python
else: # 此节点有一个子节点
    if current_node.has_left_child():
        if current_node.is_left_child():
            current_node.leftChild.parent = current_node.parent
            current_node.parent.leftChild = current_node.leftChild
        elif current_node.is_right_child():
            current_node.leftChild.parent = current_node.parent
            current_node.parent.rightChild = current_node.leftChild
        else:
            current_node.replace_node_data(current_node.leftChild.key,
                                         current_node.leftChild.payload,
                                         current_node.leftChild.leftChild,
                                         current_node.leftChild.rightChild)
    else:
        if current_node.is_left_child():
            current_node.rightChild.parent = current_node.parent
            current_node.parent.leftChild = current_node.rightChild
        elif current_node.is_right_child():
            current_node.rightChild.parent = current_node.parent
            current_node.parent.rightChild = current_node.rightChild
        else:
            current_node.replace_node_data(current_node.rightChild.key,
                                         current_node.rightChild.payload,
                                         current_node.rightChild.leftChild,
                                         current_node.rightChild.rightChild)
```

#### 情况3：有两个子节点

如果节点有两个子节点，我们需要找到一个合适的节点来替换被删除的节点。这个节点应该是右子树中具有最小键值的节点（也称为后继节点）：

```python
elif current_node.has_both_children(): # 内部节点
    successor = current_node.find_successor()
    successor.splice_out()
    current_node.key = successor.key
    current_node.payload = successor.payload
```

寻找后继节点时，我们需要考虑以下情况：
1. 如果节点有右子节点，则后继是右子树中键值最小的节点
2. 如果节点没有右子节点且是其父节点的左子节点，则父节点是后继
3. 如果节点是其父节点的右子节点且自身没有右子节点，则该节点的后继是其父节点的后继（不包括该节点本身）

以下是实现这些辅助方法的代码：

```python
def splice_out(self):
    if self.is_leaf():
        if self.is_left_child():
            self.parent.leftChild = None
        else:
            self.parent.rightChild = None
    elif self.has_any_children():
        if self.has_left_child():
            if self.is_left_child():
                self.parent.leftChild = self.leftChild
            else:
                self.parent.rightChild = self.leftChild
            self.leftChild.parent = self.parent
        else:
            if self.is_left_child():
                self.parent.leftChild = self.rightChild
            else:
                self.parent.rightChild = self.rightChild
            self.rightChild.parent = self.parent

def find_successor(self):
    successor = None
    if self.has_right_child():
        successor = self.rightChild.find_min()
    else:
        if self.parent:
            if self.is_left_child():
                successor = self.parent
            else:
                self.parent.rightChild = None
                successor = self.parent.find_successor()
                self.parent.rightChild = self
    return successor

def find_min(self):
    current = self
    while current.has_left_child():
        current = current.leftChild
    return current

def replace_node_data(self, key, value, lc, rc):
    self.key = key
    self.payload = value
    self.leftChild = lc
    self.rightChild = rc
    if self.has_left_child():
        self.leftChild.parent = self
    if self.has_right_child():
        self.rightChild.parent = self
```

## 二叉搜索树的应用

二叉搜索树在计算机科学中有广泛的应用，包括：

1. **数据库索引**：许多数据库系统使用B树或B+树（二叉搜索树的变种）来实现高效的索引结构。

2. **符号表实现**：编译器和解释器使用二叉搜索树来存储变量名及其属性。

3. **优先队列**：二叉堆（一种特殊的二叉搜索树）用于实现优先队列。

4. **排序算法**：二叉搜索树可用于实现高效的排序算法，如树排序（Tree Sort）。

5. **搜索算法**：BST提供了高效的搜索机制，尤其是对于需要频繁查询、插入和删除操作的应用。

## 相关内容

查看其他相关文章：
- [二叉树基础]({{< ref "binary-tree.md" >}})

## 最后

二叉搜索树是一种功能强大的数据结构，在平衡状态下能够提供对数级别的时间复杂度，适用于大量的实际应用场景。然而，在最坏情况下（非平衡树），其性能可能会退化为线性级别。为了解决这个问题，人们开发了各种自平衡二叉搜索树，如红黑树、AVL树等，以确保树始终保持相对平衡的状态。
