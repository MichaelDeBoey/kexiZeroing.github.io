---
title: "Algorithm basics and LeetCode problems"
description: ""
added: ""
top: true
order: 4
updatedDate: "Feb 16 2025"
---

### TOC
- [TOC](#toc)
- [Binary Search](#binary-search)
- [Bubble Sort](#bubble-sort)
- [Selection Sort](#selection-sort)
- [Insertion Sort](#insertion-sort)
- [Quick Sort](#quick-sort)
- [Merge Sort](#merge-sort)
- [Linked List](#linked-list)
- [Shuffle an array](#shuffle-an-array)
- [Traverse Binary Tree](#traverse-binary-tree)
- [Graph DFS](#graph-dfs)
- [Heap](#heap)
- [LRU](#lru)
- [DP](#dp)
- [LeetCode Problems](#leetcode-problems)

### Binary Search

```js
const binarySearch = (nums, target) => {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    // parseInt(i + (j - i) / 2)
    let mid = Math.floor((left + right) / 2);

    if (nums[mid] === target) {
      return mid;
    } else if (nums[mid] > target) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }

  // If the target is not found,
  // return the index where it would be if it were inserted in order.
  return left;
}
```

### Bubble Sort

```js
function bubbleSort(nums) {
  for (let i = nums.length - 1; i > 0; i--) {
    for (let j = 0; j < i; j++) {
      if (nums[j] > nums[j + 1]) {
        let tmp = nums[j];
        nums[j] = nums[j + 1];
        nums[j + 1] = tmp;
      }
    }
  }
}
```

### Selection Sort

```js
function selectionSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    let min = i;
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[min] > arr[j]) {
        min = j;
      }
    }
    if (min !== i) {
      let tmp = arr[i];
      arr[i] = arr[min];
      arr[min] = tmp;
    }
  }
  return arr;
}
```

### Insertion Sort

```js
function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j = j - 1;
    }
    arr[j + 1] = key;
  }
  return arr;
}
```

### Quick Sort

```js
function quickSort(arr, lo, hi) {
  if (lo >= hi) {
    return;
  }
  const pivot = partition(arr, lo, hi);
  quickSort(arr, lo, pivot - 1);
  quickSort(arr, pivot + 1, hi);
}

function partition(nums, left, right) {
  let pivot = nums[right];
  let i = left;
  for (let j = left; j < right; j++) {
    if (nums[j] <= pivot) {
      swap(nums, i, j);
      i++;
    }
  }
  swap(nums, i, right);
  return i;
}
```

> 1. Quick sort is an in-place algorithm, but the stack due to recursive calls adds additional storage space proportional to the recursive depth.
> 
> 2. It's not recommended to choose the first or last element to be the pivot, your pivot value is always the largest value on already sorted or nearly sorted arrays. One way to choose the pivot to avoid this is to pick the pivot randomly or choose the median of the first, middle and last element. This makes it unlikely to hit the worst case, and so on average will work well.

```js
function medianOfThree(nums, left, right) {
  const mid = Math.floor((left + right) / 2);
  const a = nums[left];
  const b = nums[mid];
  const c = nums[right];

  if ((a - b) * (c - a) >= 0) return left;
  if ((b - a) * (c - b) >= 0) return mid;
  return right;
}

function partition(nums, left, right) {
  const pivotIndex = medianOfThree(nums, left, right);
  swap(nums, pivotIndex, right);  // Move pivot to end
  
  let pivot = nums[right];
  // ...
}
```

### Merge Sort

```js
function merge(arr1, arr2) {
  const merged = [];
  let i = 0;
  let j = 0;
  
  while (i < arr1.length && j < arr2.length) {
    if (arr1[i] <= arr2[j]) {
      merged.push(arr1[i]);
      i++;
    } else {
      merged.push(arr2[j]);
      j++;
    }
  }

  merged.push(...arr1.slice(i), ...arr2.slice(j));
  return merged;
}

function mergeSort(arr) {
  if (arr.length < 2) {
    return arr.slice(0);
  }

  const split = Math.floor(arr.length / 2);
  const left = arr.slice(0, split);
  const right = arr.slice(split, arr.length);

  return merge(mergeSort(left), mergeSort(right));
}
```

### Linked List

```js
class ListNode {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

// Basic operations for a linked list:
// 1. Find the middle node of a linked list
// 2. Check if a linked list has a cycle
// 3. Reverse a linked list

function getMiddleNode(head) {
  if (head === null) {
    return null;
  }

  let slow = head;
  let fast = head;

  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
  }

  return slow;
}

function hasCycle(head) {
  if (head === null || head.next === null) {
    return false;
  }

  let slow = head;
  let fast = head;

  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;

    if (slow === fast) {
      return true;
    }
  }

  return false;
}

function reverseList(head) {
  if (head === null || head.next === null) {
    return head;
  }

  let current = head;
  let prev = null;

  while (current !== null) {
    const next = current.next;
    current.next = prev;
    prev = current;
    current = next;
  }

  return prev;
}

function reverseBetween(head, left, right) {
  const dummy = new ListNode(0);
  dummy.next = head;
  
  let p0 = dummy;
  for (let i = 0; i < left - 1; i++) {
    p0 = p0.next;
  }

  let current = p0.next;
  let prev = null;
  
  for (let i = 0; i < right - left + 1; i++) {
    const next = current.next;
    current.next = prev;
    prev = current;
    current = next;
  }

  p0.next.next = current;
  p0.next = prev;
  return dummy.next;
}
```

### Shuffle an array
The Art of Computer Programming, Vol. 2, section 3.4.2 “Random sampling and shuffling” describes two solutions:
- If the number of items to sort is small, then simply put all possible orderings in a table and select one ordering at random. For example with 5 items, the table would need `5! = 120` rows.
- Fisher-Yates Shuffle

```js
// Fisher-Yates Algorithm
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// Note that sorting is an `O(N log N)` operation where the Fisher-Yates algorithm is `O(N)`.
```

### Traverse Binary Tree

```js
var preorderTraversal = function(root) {
  if (root == null) return [];
  let stack = [];
  let result = [];
  stack.push(root);

  while (stack.length > 0) {
    let node = stack.pop();
    result.push(node.val);
    if (node.right) {
      stack.push(node.right);
    }
    if (node.left) {
      stack.push(node.left);
    }
  }
  return result;
};

var inorderTraversal = function(root) {
  if (root == null) return [];
  let result = [];
  let stack = [];
  let current = root;

  while (stack.length > 0 || current !== null) {
    if (current !== null) {
      stack.push(current);
      current = current.left;
    } else {
      current = stack.pop();
      result.push(current.val);
      current = current.right;
    }
  }
  return result;
};

var postorderTraversal = function (root) {
  if (root == null) return [];
  
  let result = [];
  let stack = [root];
  let cur = null;

  while (stack.length) {
    cur = stack.pop();
    result.push(cur.val);
    cur.left && stack.push(cur.left);
    cur.right && stack.push(cur.right);
  }
  return result.reverse();
};

var levelOrderTraversal = function(root) {  
  if (!root) return [];

  let nodeQueue = [root];
  let result = [];

  while (nodeQueue.length) {
    let size = nodeQueue.length;
    let level = [];

    for (let i = 0; i < size; i++) {
      let curNode = nodeQueue.shift();
      level.push(curNode.val);

      if (curNode.left) {
        nodeQueue.push(curNode.left);
      }
      if (curNode.right) {
        nodeQueue.push(curNode.right);
      }
    }

    // Reverse the order for zigzag pattern
    // if (!isLeftToRight) {
    //   level.reverse();
    // }
    // isLeftToRight = !isLeftToRight;
    result.push(level);
  }

  return result;
};
```

```js
// Max and Min depth of Binary Tree
var maxDepth = function(root) {
  if (!root) return 0;

  const left = maxDepth(root.left);
  const right = maxDepth(root.right);

  return Math.max(left, right) + 1;
}

var minDepth = function(root) {
  if (!root) return 0;
  
  const nodeQueue = [root];
  let depth = 0;

  while (nodeQueue.length) {
    const size = nodeQueue.length;
    depth++;

    for (let i = 0; i < size; i++) {
      const curNode = nodeQueue.shift();
      // If it's a leaf node, return the depth
      if (!curNode.left && !curNode.right) {
        return depth;
      }
      if (curNode.left) {
        nodeQueue.push(curNode.left);
      }
      if (curNode.right) {
        nodeQueue.push(curNode.right);
      }
    }
  }
  return depth;
}
```

### Graph DFS

```js
function dfs(i, j, visited, params) {
  if (i < 0 || i >= rows || j < 0 || j >= cols || visited[i][j] || !isValid(i, j, params)) {
    return;
  }

  visited[i][j] = true;

  processNode(i, j, params);

  dfs(i - 1, j, visited, params);
  dfs(i + 1, j, visited, params);
  dfs(i, j - 1, visited, params);
  dfs(i, j + 1, visited, params);

  visited[i][j] = false;
}
```

The `visited` array is global or shared across all recursive calls. If you are searching for **one valid path** (e.g., finding a path in a maze), there's no need to restore the visited array. Once a node is marked as visited, it remains visited throughout the traversal. If you are searching for **all possible paths** (e.g., finding all routes in a graph), you must restore the visited array. After exploring a path, you backtrack by marking the node as unvisited to allow its reuse in other paths.

> DFS traversal always needs a way to track visited cells. If you can modify the grid in-place, that's equivalent to using a `visited` array.

```js
function escapeMaze(maze, i, j) {
  if (i < 0 || j < 0 || i >= maze.size() || j >= maze[0].size() || maze[i][j] == 'X') {
    return false;
  }
  if (i == maze.size() - 1 && j == maze[0].size() - 1) {
    return true;
  }
  maze[i][j] = 'X';
  
  return escapeMaze(maze, i + 1, j) || escapeMaze(maze, i - 1, j) || escapeMaze(maze, i, j + 1) || escapeMaze(maze, i, j - 1);
}
```

### Heap

```js
function Heap () {
  this.items = [];
}

Heap.prototype.swap = function (index1, index2) {
  let temp = this.items[index1];
  this.items[index1] = this.items[index2];
  this.items[index2] = temp;
}

Heap.prototype.parentIndex = function (index) {
  return Math.floor((index - 1) / 2);
}

Heap.prototype.leftChildIndex = function (index) {
  return index * 2 + 1;
}

Heap.prototype.rightChildIndex = function (index) {
  return index * 2 + 2;
}

Heap.prototype.parent = function (index) {
  return this.items[this.parentIndex(index)];
}

Heap.prototype.leftChild = function (index) {
  return this.items[this.leftChildIndex(index)];
}

Heap.prototype.rightChild = function (index) {
  return this.items[this.rightChildIndex(index)];
}

Heap.prototype.peek = function (index) {
  return this.items[0];
}

Heap.prototype.size = function () {
  return this.items.length;
}

function MinHeap () {
  this.items = [];
}

MinHeap.prototype = Object.create(Heap.prototype);

// add at the last position and then re-order the heap
MinHeap.prototype.add = function (item) {
  this.items[this.items.length] = item;
  this.bubbleUp();
}

// remove the minimum element and need to keep the heap order
MinHeap.prototype.poll = function () {
  let item = this.items[0];
  this.items[0] = this.items[this.items.length - 1];
  this.items.pop();
  this.bubbleDown();
  return item;
}

MinHeap.prototype.bubbleUp = function () {
  let index = this.items.length - 1;
  while (this.parent(index) && this.parent(index) > this.items[index]) {
    this.swap(this.parentIndex(index), index);
    index = this.parentIndex(index);
  }
}

MinHeap.prototype.bubbleDown = function () {
  let index = 0;
  while (this.leftChild(index)) {
    let smallerIndex = this.leftChildIndex(index);
    if (this.rightChild(index) && this.rightChild(index) < this.leftChild(index)) {
      smallerIndex = this.rightChildIndex(index);
    }
    if (this.items[index] <= this.items[smallerIndex]) break;
    this.swap(index, smallerIndex);
    index = smallerIndex;
  }
}
```

### LRU

```js
/* 
  LRU cache is implemented using a doubly linked list and hash table.
  - Map is used to search the node in O(1); 
  - List maintains the order in O(1) with head and tail.
*/

function DLLNode(key, data) {
  this.key = key;
  this.data = data;
  this.next = null;
  this.prev = null;
}

function LRUCache(capacity) {
  this.map = new Map();
  this.capacity = capacity;
  this.head = new DLLNode("", null);
  this.tail = new DLLNode("", null);
  this.head.next = this.tail;
  this.tail.prev = this.head;
}

LRUCache.prototype.addNode = function(node) {
  let realTail = this.tail.prev;
  realTail.next = node;
  this.tail.prev = node;
  node.prev = realTail;
  node.next = this.tail;
}

LRUCache.prototype.removeNode = function(node) {
  let prev = node.prev;
  let next = node.next;
  prev.next = next;
  next.prev = prev;
}

LRUCache.prototype.get = function(key) {
  let node = this.map.get(key);
  if (node === undefined) {
    return -1;
  } else {
    this.removeNode(node);
    this.addNode(node);
    return node.data;
  }
}

LRUCache.prototype.put = function(key, value) {
  let node = this.map.get(key);
  if (node) {
    this.removeNode(node);
  }
  let newNode = new DLLNode(key, value);
  this.addNode(newNode);
  this.map.set(key, newNode);

  if (this.map.size > this.capacity) {
    let realHead = this.head.next;
    this.removeNode(realHead);
    this.map.delete(realHead.key)
  }
}
```

### DP

```js
/*
  You are climbing a stair case. It takes n steps to reach to the top.
  Each time you can either climb 1 or 2 steps. 
  How many distinct ways can you climb to the top?
*/ 
let climbStairs = function(n) {
  const dp = Array(n+1).fill(0);
  dp[1] = 1;
  dp[2] = 2;
  
  for (let i = 3; i < dp.length; i++) {
    dp[i] = dp[i-1] + dp[i-2];
  }
  
  return dp[n];
};
```

```js
/*
  Given a list of non-negative integers representing the amount of money of each house, and the adjacent houses have security system,
  determine the maximum amount of money you can rob without alerting the police.
*/
let rob = function(nums) {
  const dp = Array(nums.length).fill(0);
  dp[0] = nums[0];
  dp[1] = Math.max(nums[0], nums[1]);

  for (let i = 2; i < nums.length; i++) {
    dp[i] = Math.max(dp[i - 2] + nums[i], dp[i - 1]);
  }

  return dp[nums.length - 1];
};

// All houses at this place are arranged in a circle.
let rob2 = function(nums) {
  const len = nums.length;
  if (len === 1) return nums[0];
  
  // the first house and the last house cannot be robbed together
  return Math.max(robRange(nums.slice(0, -1)), robRange(nums.slice(1)));

  function robRange(range) {
    const n = range.length;
    const dp = Array(n).fill(0);
    dp[0] = range[0];
    dp[1] = Math.max(range[0], range[1]);
    
    for (let i = 2; i < n; i++) {
      dp[i] = Math.max(dp[i - 2] + range[i], dp[i - 1]);
    }
    
    return dp[n - 1];
  };
};
```

```js
// Compute the fewest number of coins that you need to make up that amount. You have an infinite number of each kind of coin.
let coinChange = function(coins, amount) {
  if (amount === 0) {
    return 0;
  }
  const dp = Array(amount + 1).fill(Number.MAX_VALUE)
  dp[0] = 0;

  for (let i = 1; i < dp.length; i++) {
    for (let j = 0; j < coins.length; j++) {
      // e.g. dp[11] = min(dp[10], dp[9], dp[6]) + 1
      if (i - coins[j] >= 0) {
        dp[i] = Math.min(dp[i], dp[i - coins[j]] + 1);
      }
    }
  }

  return dp[dp.length - 1] === Number.MAX_VALUE ? -1 : dp[dp.length - 1];
};
```

### LeetCode Problems

Given an integer array nums, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`. Notice that the solution set must not contain duplicate triplets.

```js
var threeSum = function(nums) {
  let res = [];
  nums.sort((a, b) => a - b);
  
  for (let i = 0; i < nums.length; i++) {
    if (i > 0 && nums[i] === nums[i-1]) {
      continue;
    }
        
    let j = i + 1;
    let k = nums.length - 1;

    while (j < k) {
      let total = nums[i] + nums[j] + nums[k];

      if (total === 0) {
        res.push([nums[i], nums[j], nums[k]]);
        // remove the duplicate result
        while (nums[j] === nums[j+1] && j < k) {
          j++;
        }
        while (nums[k] === nums[k-1] && j < k) {
          k--;
        }
        j++;
        k--;
      } else if (total > 0) {
        k--;
      } else {
        j++;
      }
    }
  }

  return res;
};
```

Given a non-empty array of integers, return the `k` most frequent elements.

```js
var topKFrequent = function(nums, k) {
  const res = [];
  const map = new Map();
  const bucket = Array(nums.length + 1);
  
  // key is nums[i], value is its count
  for (let n of nums) {
    if (map.has(n)) {
      map.set(n, map.get(n) + 1);
    } else {
      map.set(n, 1);
    }
  }
  
  // the same frequency in the same bucket
  for (let [key, val] of map.entries()) {
    if (!bucket[val]) {
      bucket[val] = [];
    }
    bucket[val].push(key);
  } 
  
  // collect buckets from the end
  for (let pos = bucket.length - 1; pos >= 0 && res.length < k; pos--) {
    if (bucket[pos]) {
      res.push(...bucket[pos]);
    }
  }
  
  return res;
};
```

Find the `kth` largest element in an unsorted array. Note that it is the `kth` largest element in the sorted order, not the `kth` largest distinct element. You may assume `k` is always valid.

```js
var findKthLargest = function(nums, k) {
  let left = 0;
  let right = nums.length - 1;
  
  while (left <= right) {
    let pos = partition(nums, left, right);
    // if pos is 3, it is the 4th largest element
    if (pos === k - 1) return nums[pos];
    else if (pos > k - 1) right = pos - 1;
    else left = pos + 1;
  }
  
  // elements before i >= pivot; every elements after i < pivot
  function partition(nums, low, high) {
    let pivot = nums[high];
    let i = low;
    for (let j = low; j < high; j++) {
      if (nums[j] >= pivot) {
        swap(nums, i, j);
        i++;
      }
    }
    swap(nums, i, high);
    return i;
  }

  function swap(nums, i, j) {
    let tmp = nums[i];
    nums[i] = nums[j];
    nums[j] = tmp;
  }
};
```

```js
// Ask to return the top k largest elements
while (left <= right) {
  let pos = partition(nums, left, right);
  if (pos === k - 1) {
    break;
  } else if (pos > k - 1) {
    right = pos - 1;
  } else {
    left = pos + 1;
  }
}

return nums.slice(0, k).sort((a, b) => b - a); 
```

You are given two integer arrays `nums1` and `nums2`, sorted in non-decreasing order, and two integers `m` and `n`, representing the number of elements in nums1 and nums2 respectively. Merge nums1 and nums2 into a single array in non-decreasing order stored inside the array `nums1`.

```js
var merge = function (nums1, m, nums2, n) {
  if (!n) return;

  let i = m - 1;
  let j = n - 1;

  for (let k = m + n - 1; k >= 0; k--) {
    if (j < 0 || nums1[i] >= nums2[j]) {
      nums1[k] = nums1[i];
      i--;
    } else {
      nums1[k] = nums2[j];
      j--;
    }
  }
};
```

Given two strings needle and haystack, return the index of the first occurrence of needle in haystack, or -1 if needle is not part of haystack.

```js
var strStr = function (haystack, needle) {
  let i = 0;
  let j = 0;

  while (i < haystack.length) {
    if (haystack[i] === needle[j]) {
      j++;
      i++;
      if (j === needle.length) {
        return i - j;
      }
    } else {
      i = i - j + 1; // 退回j个位置的下一位
      j = 0;
    }
  }

  return -1;
};
```

Given an array of integers citations for their paper, return the researcher's h-index. The h-index is the largest number h such that the researcher has h papers, each cited at least h times.

```js
// 你要找一个最大的数字 H
// 满足 至少有 H 个数 ≥ H
var hIndex = function (citations) {
  let n = citations.length;
  let bucket = new Array(n + 1).fill(0);

  for (let c of citations) {
    if (c >= n) {
      bucket[n]++;
    } else {
      bucket[c]++;
    }
  }

  let count = 0;
  for (let i = n; i >= 0; i--) {
    count += bucket[i];
    if (count >= i) {
      return i;
    }
  }
};
```

Given an array of strings, group anagrams together. i.e. Input: `["eat", "tea", "tan", "ate", "nat", "bat"]`, Output: `[ ["ate","eat","tea"], ["nat","tan"], ["bat"] ]`

```js
var groupAnagrams = function(strs) {
  const hashTable = new Map();
  function sort(str) {
    return str.split("").sort().join("");
  }

  for (let i = 0; i < strs.length; i++) {
    const str = strs[i];
    const key = sort(str);
    /**
      * Another way to construct the key: 
      * 
      * const counts = Array(26).fill(0);
      * for (let j = 0; j < str.length; j++) {
      *   counts[str[j].charCodeAt(0) - 'a'.charCodeAt(0)]++;
      * }
      * const key = counts.join("");
    **/
      
    if (!hashTable.has(key)) {
      hashTable.set(key, [str]);
    } else {
      hashTable.get(key).push(str);
    }
  }

  return [...hashTable.values()];
};
```

Given two strings `ransomNote` and `magazine`, return true if `ransomNote` can be constructed by using the letters from `magazine` and false otherwise.

```js
var canConstruct = function(ransomNote, magazine) {
  let cnt = Array(26).fill(0);
  for (let c of magazine) {
    cnt[c.charCodeAt(0) - 'a'.charCodeAt(0)]++;
  }

  for (let c of ransomNote) {
    cnt[c.charCodeAt(0) - 'a'.charCodeAt(0)]--;

    if (cnt[c.charCodeAt(0) - 'a'.charCodeAt(0)] < 0) {
      return false;
    }
  }
  return true;
};
```

A happy number is a number defined by starting with any positive integer, replace the number by the sum of the squares of its digits. Repeat the process until the number equals 1. Return true if n is a happy number, and false if not.

```js
var isHappy = function (n) {
  let set = new Set();

  function getNext(m) {
    let num = 0;

    while (m > 0) {
      let digit = m % 10;
      num += digit * digit;
      m = Math.floor(m / 10);
    }
    return num;
  }

  while (true) {
    let val = getNext(n);
    if (val === 1) {
      return true;
    }
    if (set.has(val)) {
      return false;
    } else {
      set.add(val);
    }
    n = val;
  }
};
```

Given a string, find the length of the longest substring without repeating characters.

```js
var lengthOfLongestSubstring = function(s) {
  let maxLength = 0;
  let charMap = new Map();
  let left = 0;

  for (let right = 0; right < s.length; right++) {
    charMap.set(s[right], (charMap.get(s[right]) || 0) + 1);
      
    while (charMap.get(s[right]) > 1) {
      charMap.set(s[left], charMap.get(s[left]) - 1);
      left++;
    }
    maxLength = Math.max(maxLength, right - left + 1);
  }
  
  return maxLength;
};
```

Given an array of positive integers nums and a positive integer target, return the minimal length of a subarray whose sum is greater than or equal to target.

```js
var minSubArrayLen = function(target, nums) {
  let minLength = Infinity;
  let sum = 0;
  let left = 0;

  for (let right = 0; right < nums.length; right++) {    
    sum += nums[right];

    while (sum >= target) {
      minLength = Math.min(minLength, right - left + 1);
      sum -= nums[left];
      left++;
    }
  }
  return minLength === Infinity ? 0 : minLength;
};
```

Find All Anagrams in a String. Given two strings `s` and `p`, return an array of all the start indices of `p`'s anagrams in `s`. For example, Input: s = "cbaebabacd", p = "abc"; Output: [0,6].

```js
var findAnagrams = function(s, p) {
  let res = [];
  let dict = Array(26).fill(0);

  for (let i = 0; i < p.length; i++) {
    dict[p.charCodeAt(i) - 'a'.charCodeAt(0)]++;
  }

  let windowSet = Array(26).fill(0);
  let i = 0;
  for (let j = 0; j < s.length; j++) {
    windowSet[s.charCodeAt(j) - 'a'.charCodeAt(0)]++;
    if (isSame(windowSet, dict)) {
      res.push(i);
    }

    if (j >= p.length - 1) {
      windowSet[s.charCodeAt(i) - 'a'.charCodeAt(0)]--;
      i++;
    }
  }

  return res;
}

function isSame(dict1, dict2) {
  for (let i = 0; i < 26; i++) {
    if (dict1[i] !== dict2[i]) {
      return false;
    }
  }
  return true;
}
```

Given two strings s1 and s2, return true if s2 contains a permutation of s1 (one of s1's permutations is the substring of s2).

```js
// different from `ransomNote` and `magazine`
// s1 = "abc"
// s2 = "aabbcc"
var checkInclusion = function(s1, s2) {
  let len1 = s1.length;
  let len2 = s2.length;
  if (len1 > len2) return false;
  let count = Array(26).fill(0);

  for (let i = 0; i < len1; i++) {
    // 97 -> 'a'.charCodeAt(0)
    count[s1.charCodeAt(i) - 97]++;
    count[s2.charCodeAt(i) - 97]--;
  }
  if (count.every(i => i === 0)) {
    return true;
  }

  for (let i = len1; i < len2; i++) {
    // slide a window 
    count[s2.charCodeAt(i) - 97]--;
    count[s2.charCodeAt(i - len1) - 97]++;
    if (count.every(e => e === 0)) {
      return true;
    }
  }
  return false;
};
```

You are given a string s and an integer k. You can choose any character of the string and change it to any other character. You can perform this operation at most k times. Return the length of the longest substring containing the same letter you can get after performing the above operations.

```js
var characterReplacement = function(s, k) {
  let left = 0;
  let maxCharCount = 0;
  let visited = {};

  for (let right = 0; right < s.length; right++) {
    let char = s[right];
    visited[char] = (visited[char] || 0) + 1;

    maxCharCount = Math.max(maxCharCount, visited[char]);

    // right - left + 1: current window size
    // # of char in the window that are different from the most frequent character
    if (right - left + 1 - maxCharCount > k) {
      visited[s[left]]--;
      left++;
      // moving left does not make our current window shorter
    }
  }

  // the size of the final valid window
  return s.length - left;
};
```

You are given a string s. We want to partition the string into as many parts as possible so that each letter appears in at most one part. Return a list of the size of these parts.

```js
var partitionLabels = function(s) {
  let last = Array(26).fill(-1);
  let partitions = [];
  let left = 0;
  let end = 0;
  
  // lastIndexOf
  for (let i = 0; i < s.length; i++) {
    last[s.charCodeAt(i) - 'a'.charCodeAt(0)] = i;
  }
  
  for (let i = 0; i < s.length; i++) {
    end = Math.max(end, last[s.charCodeAt(i) - 'a'.charCodeAt(0)]);
    if (i === end) {
      partitions.push(i - left + 1);
      left = i + 1;
    }
  }
  return partitions;
};
```

Given a string s, return the longest palindromic substring in s.

```js
var longestPalindrome = function(s) {
  let left = 0, right = 0, maxLength = 0;

  const extend = (s, i, j, n) => {
    while (i >= 0 && j < n && s[i] === s[j]) {
      if (j - i + 1 > maxLength) {
        left = i;
        right = j;
        maxLength = j - i + 1;
      }

      i--;
      j++;
    }
  }

  for (let i = 0; i < s.length; i++) {
    extend(s, i, i, s.length);     // i is the center
    extend(s, i, i + 1, s.length); // i and i + 1 are the center
  }

  return s.slice(left, right + 1);
};
```

Given an array nums of size n, return the majority element. The majority element is the element that appears more than `⌊n / 2⌋` times. (assume it always exists)

```js
var majorityElement = function(nums) {
  let count = 0;
  let candidate = 0;

  for (let num of nums) {
    if (count === 0) {
      candidate = num;
    }
    if (num === candidate) {
      count += 1;
    } else {
      count -= 1;
    }
  }
  return candidate;
};
```

Given a string containing just the characters '(' and ')', return the length of the longest valid parentheses substring.

```js
var longestValidParentheses = function(s) {
  let stack = [];
  let maxLength = 0;
  let start = 0;

  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') {
      stack.push(i);
    } else {
      if (stack.length === 0) {
        start = i + 1;
      } else {
        stack.pop();
        if (stack.length === 0) {
          maxLength = Math.max(maxLength, i - start + 1);
        } else {
          maxLength = Math.max(maxLength, i - stack[stack.length - 1]);
        }
      }
    }
  }
};
```

Given a string s representing a valid expression, implement a basic calculator to evaluate it. s consists of digits, `'+'`, `'-'`, `'('`, `')'`, and `' '`.

```js
var calculate = function (s) {
  let res = 0;
  let stack = [];
  let number = 0;
  let sign = 1;

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === " ") continue;

    if (c >= "0" && c <= "9") {
      number = number * 10 + Number(c);
    }
    else if (c === "+" || c === "-") {
      res += number * sign;
      number = 0;
      sign = c === "-" ? -1 : 1;
    }
    else if (c === "(") {
      stack.push(res);
      stack.push(sign);
      res = 0;
      sign = 1;
    }
    else if (c === ")") {
      res += number * sign;
      number = 0;
      res *= stack.pop();
      res += stack.pop();
    }
  }
  
  return res + number * sign;
};
```

Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string "".

```js
var longestCommonPrefix = function(strs) {
  strs.sort();

  for (let i = 0; i < strs[0].length; i++) {
    if (strs[0][i] !== strs[strs.length - 1][i]){
      return strs[0].slice(0, i);
    } 
  }

  return strs[0];
};
```

Given an unsorted integer array nums. Return the smallest positive integer that is not present in nums.

```js
var firstMissingPositive = function(nums) {
  const numSet = new Set(nums.filter(num => num > 0)); 
  let i = 1;
  
  while (numSet.has(i)) {
    i++;
  }
  return i;
};
```

Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence. Take `[10, 4, 20, 1, 3, 2]` as an example, the longest consecutive elements sequence is `[1, 2, 3, 4]`.

```js
var longestConsecutive = function(nums) {
  let numSet = new Set(nums);
  let longest = 0;

  for (let n of nums) {
    // check if n starts a new sequence
    if (!numSet.has(n - 1)) {
      let length = 1;

      while (numSet.has(n + length)) {
        length++;
      }
      longest = Math.max(longest, length);
    }
  }
  return longest;
};
```

Given an integer array nums, return an array answer such that `answer[i]` is equal to the product of all the elements of nums except `nums[i]`.

```js
var productExceptSelf = function(nums) {
  let n = nums.length;
  let output = [];

  let leftProducts = [];
  let rightProducts = [];
  leftProducts[0] = 1;
  rightProducts[n - 1] = 1;

  for (let i = 1; i < n; i++) {
    leftProducts[i] = leftProducts[i - 1] * nums[i - 1];
  }

  for (let i = n - 2; i >= 0; i--) {
    rightProducts[i] = rightProducts[i + 1] * nums[i + 1];
  }

  for (let i = 0; i < n; i++) {
    output[i] = leftProducts[i] * rightProducts[i];
  }
  return output;
};
```

Given an array of integers temperatures represents the daily temperatures, return an array answer such that `answer[i]` is the number of days you have to wait after the `ith` day to get a warmer temperature. If there is no future day for which this is possible, keep `answer[i] == 0` instead.

```js
var dailyTemperatures = function(temperatures) {
  let stack = [];
  let res = new Array(temperatures.length).fill(0);

  for (let i = 0; i < temperatures.length; i++) {
    while (stack.length > 0 && temperatures[i] > temperatures[stack[stack.length - 1]]) {
      let preIndex = stack.pop();
      res[preIndex] = i - preIndex;
    }
    // push the index, not the value
    stack.push(i);
  }

  return res;  
};
```

The next greater element of x in an array is the first greater element that is to the right of x in the same array. You are given two distinct arrays, where nums1 is a subset of nums2. For each `0 <= i < nums1.length`, find the index j such that `nums1[i] == nums2[j]` and determine the next greater element of `nums2[j]` in nums2. If there is no next greater element, then the answer for this query is -1.

```js
var nextGreaterElement = function(nums1, nums2) {
  // key is a number from nums2
  // value is its next greater number
  let map = new Map();
  let stack = [];

  for (let num of nums2) {
    while (stack.length && num > stack[stack.length - 1]) {
      map.set(stack.pop(), num);
    }
    stack.push(num);
  }

  for (let i = 0; i < nums1.length; i++) {
    nums1[i] = map.has(nums1[i]) ? map.get(nums1[i]) : -1;
  }

  return nums1;
};
```

Given string num representing a non-negative integer num, and an integer k, return the smallest possible integer after removing k digits from num.

```js
var removeKdigits = function(num, k) {
  let stack = [];
  for (let c of num) {
    while (stack.length && k > 0 && c < stack[stack.length-1]) {
      stack.pop();
      k--;
    }
    stack.push(c);
  }

  while (stack.length && k > 0) {
    stack.pop();
    k--;
  }
  // remove all the leading zeros
  while (stack.length && stack[0] === '0') {
    stack.shift();
  }

  return stack.join('') || "0";  
};
```

Given an array of integers nums, calculate the pivot index of this array. The pivot index is the index where the sum of all the numbers strictly to the left of the index is equal to the sum of all the numbers strictly to the index's right.

```js
var pivotIndex = function(nums) {
  let total = nums.reduce((a, b) => a + b, 0);
  let leftTotal = 0;

  for (let i = 0; i < nums.length; i++) {
    let rightTotal = total - leftTotal - nums[i];
    if (rightTotal === leftTotal) {
      return i;
    }

    leftTotal += nums[i];
  }
  return -1;    
};
```

Given an array of integers and an integer `k`, you need to find the total number of continuous subarrays whose sum equals to `k`. For example, Input: nums = `[1,1,1]`, k = 2; Output: 2

```js
// the sum of subarray can be get by `sum[0,j] - sum[0,i]`
var subarraySum = function(nums, k) {
  let sum = 0, res = 0;
  let map = new Map();  // key is the sum, value is the # of way to get that sum
  map.set(0, 1);

  for (let i = 0; i < nums.length; i++) {
    sum += nums[i];
    if (map.has(sum - k)) {
      res += map.get(sum - k);
    }
    
    if (map.get(sum)) {
      map.set(sum, map.get(sum) + 1);
    } else {
      map.set(sum, 1);
    }
  }
  return res;
};
```

Given an array of integers nums and an integer k. A continuous subarray is called nice if there are k odd numbers on it. Return the number of nice sub-arrays.

```js
var numberOfSubarrays = function(nums, k) {
  let oddCount = 0;
  let result = 0;
  let count = new Map();
  // key is the count of odd numbers encountered so far 
  // value is the # of times we've encountered that particular count of odd numbers.
  count.set(0, 1);

  for (const num of nums) {
    if (num % 2 === 1) {
      oddCount += 1;
    }
    if (oddCount >= k && count.has(oddCount - k)) {
      result += count.get(oddCount - k);
    }

    count.set(oddCount, (count.get(oddCount) || 0) + 1);
  }
  return result;
};
```

Given an array of positive integers arr, return the sum of all possible odd-length subarrays of arr.

```js
var sumOddLengthSubarrays = function(arr) {
  let ans = 0;
  // preSum[i] stores the sum of elements from index 0 to i-1.
  // if arr = [1, 2, 3], then preSum will be [0, 1, 3, 6].
  let preSum = Array(arr.length + 1).fill(0);

  for (let i = 0; i < arr.length; i++) {
    preSum[i + 1] = preSum[i] + arr[i];
  }

  for (let i = 0; i < arr.length; i++) {
    for (let j = 1; i + j <= arr.length; j += 2) {
      ans += preSum[i + j] - preSum[i];
    }
  }

  return ans;
};
```

Given an array of integers and an integer `k`, find out whether there are two distinct indices `i` and `j` in the array such that `nums[i] = nums[j]` and the absolute difference between `i` and `j` is at most `k`.

```js
var containsNearbyDuplicate = function(nums, k) {
  const map = new Map();  // key is nums[i], value is its index
  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];
    if (map.has(num) && i - map.get(num) <= k) {
      return true;
    }
    map.set(num, i);
  }
  return false;
};
```

Given an array nums, write a function to move all 0's to the end of it while maintaining the relative order of the non-zero elements. You must do this in-place without making a copy of the array.

```js
var moveZeroes = function(nums) {
  let index = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) {
      nums[index] = nums[i];
      index++;
    }
  }

  for(let i = index; i < nums.length; i++) {
    nums[i] = 0;
  }
};
```

Given an integer array nums, find the subarray with the largest sum, and return its sum.

```js
var maxSubArray = function(nums) {
  let sum = 0;
  let max = -Infinity;

  for (let i = 0; i < nums.length; i++) {
    sum += nums[i];
    max = Math.max(max, sum);

    // It's better to start a fresh subarray from the next element
    // rather than carrying forward a negative sum.
    if (sum < 0) {
      sum = 0;
    }
  }
  return max;
};
```

Given a circular integer array nums of length n, return the maximum possible sum of a non-empty subarray of nums.

```js
var maxSubarraySumCircular = function (nums) {
  let total = 0;
  let curMax = 0, maxSum = -Infinity;
  let curMin = 0, minSum = Infinity;

  for (let n of nums) {
    total += n;

    curMax = Math.max(curMax + n, n);
    maxSum = Math.max(maxSum, curMax);

    curMin = Math.min(curMin + n, n);
    minSum = Math.min(minSum, curMin);
  }

  // 如果 maxSum < 0，说明所有数都是负数，只能取最大的那个
  if (maxSum < 0) return maxSum;

  // 比较最大子数组和（不跨越头尾），有跨越的子数组（中间有一段被跳过）
  return Math.max(maxSum, total - minSum);
};
```

Given a non-empty array of integers nums, the degree of this array is defined as the maximum frequency of any one of its elements. Your task is to find the smallest possible length of a subarray of nums, that has the same degree as nums.

```js
var findShortestSubArray = function(nums) {
  let firstOccurrence = new Map();
  let lastOccurrence = new Map();
  let frequencyMap = new Map();

  nums.forEach((num, index) => {
    if (firstOccurrence.get(num) === undefined) {
      firstOccurrence.set(num, index);
    }
    lastOccurrence.set(num, index);
    frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
  });

  let ans = nums.length;
  let degree = Math.max(...frequencyMap.values());

  for (let [num, frequency] of frequencyMap) {
    if (frequency === degree) {
      ans = Math.min(ans, lastOccurrence.get(num) - firstOccurrence.get(num) + 1);
    }
  }
  return ans;
};
```

Given an integer array containing 0's and 1's, where 0 means empty and 1 means not empty, and an integer n, return true if n new flowers can be planted in the flowerbed. Flowers cannot be planted in adjacent plots.

```js
var canPlaceFlowers = function(flowerbed, n) {
  for (let i = 0; i < flowerbed.length && n > 0;) {
    if (flowerbed[i] === 1) {
      i += 2;
    }
    // current position is empty
    else if (i === flowerbed.length - 1 || flowerbed[i + 1] === 0) {
      n--;
      i += 2;
    }
    // current position is empty but the next position has a flower
    else {
      i += 3;
    }
  }

  return n <= 0;
};
```

You are given an integer array nums. Each element in the array represents your maximum jump length at that position. Return true if you can reach the last index, or false otherwise.

```js
var canJump = function(nums) {
  let reachable = nums[0];

  for (let i = 1; i < nums.length; i++) {
    if (i > reachable) {
      return false;
    }
    if (i + nums[i] > reachable) {
      reachable = i + nums[i];
    }
  }

  return true;
};
```

You are initially positioned at `nums[0]`. Return the minimum number of jumps to reach `nums[n - 1]`. 

```js
var jump = function(nums) {
  // greedy approach
  let res = 0;
  let reachable = 0;
  let end = 0;

  for (let i = 0; i < nums.length - 1; i++) {
    reachable = Math.max(reachable, i + nums[i]);

    if (i === end) {
      res++;
      end = reachable;
    }
  }

  return res;
};

// i === end 不是实际的跳跃位置
// 是 “当前这一步走到了之前跳跃能达到的最远边界”
```

There are n gas stations along a circular route. Your car costs `cost[i]` of gas to travel from the ith station to its next station. You begin the journey with an empty tank at one of the gas stations. Return the starting gas station's index if you can travel around the circuit once in the clockwise direction, otherwise return -1.

```js
var canCompleteCircuit = function(gas, cost) {
  let totalTank = 0;
  let currentTank = 0;
  let start = 0;

  for (let i = 0; i < gas.length; i++) {
    const netCost = gas[i] - cost[i];
    totalTank += netCost;
    currentTank += netCost;

    if (currentTank < 0) {
      start = i + 1;
      currentTank = 0;
    }
  }
  return totalTank < 0 ? -1 : start;

  // 关键点：
  // 1. totalTank >= 0 时，一定存在解
  // 2. 如果某一段总和小于 0，说明整段任何子区间作为起点都不行
  // 3. 当 currentTank < 0 时，可以放心地跳过 start ~ i，直接让 start = i + 1
};
```

Suppose an array sorted in ascending order is rotated at some pivot unknown to you beforehand. (i.e., `[0,1,2,4,5,6,7]` might become `[4,5,6,7,0,1,2]`). You are given a target value to search. If found in the array return its index, otherwise return -1. You may assume no duplicate exists in the array.

```js
var search = function(nums, target) {
  let start = 0;
  let end = nums.length - 1;

  while (start <= end) {
    const mid = Math.floor((start + end) / 2);
    if (nums[mid] === target) return mid;

    // [mid, end] is ascending order
    if (nums[mid] < nums[end]) {
      if (target > nums[mid] && target <= nums[end]) {
        start = mid + 1;
      } else {
        end = mid - 1;
      }
    }
    // [start, mid] is ascending order
    else {
      if (target >= nums[start] && target < nums[mid]) {
        end = mid - 1;
      } else {
        start = mid + 1;
      }
    }
  }

  return -1;
};
```

You are given an m x n integer matrix. Each row is sorted in non-decreasing order. The first integer of each row is greater than the last integer of the previous row. Given an integer target, return true if target is in matrix or false otherwise.

```js
var searchMatrix = function(matrix, target) {
  let left = 0; 
  let right = matrix.length - 1;
  let mid;

  while (left <= right) {
    mid = Math.floor((left + right ) / 2);
    if (target >= matrix[mid][0] && target <= matrix[mid][matrix[mid].length - 1]) {
      break;
    }
    if (target > matrix[mid][0]) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return binarySearch(matrix[mid], target);
};
```

Given an array of integers nums sorted in non-decreasing order, find the starting and ending position of a given target value. If target is not found in the array, return [-1, -1].

```js
var searchRange = function(nums, target) {
  const binarySearch = (nums, target, isSearchingLeft) => {
    let left = 0;
    let right = nums.length - 1;
    // index of either the leftmost or rightmost occurrence of the target
    let idx = -1;
    
    while (left <= right) {
      let mid = Math.floor((left + right) / 2);
      
      if (nums[mid] > target) {
        right = mid - 1;
      } else if (nums[mid] < target) {
        left = mid + 1;
      } else {
        idx = mid;
        if (isSearchingLeft) {
          right = mid - 1;
        } else {
          left = mid + 1;
        }
      }
    }
    return idx;
  };
  
  let left = binarySearch(nums, target, true);
  let right = binarySearch(nums, target, false);
  
  return [left, right];    
};
```

a) Find the integer square root; b) Check if a number is the perfect square number.

```js
function getSquareRoot(num) {
  let i = 0;
  let j = num;

  while (i <= j) {
    let mid = Math.floor((i + j) / 2);
    if (mid * mid === num) {
      return mid;
    } else if (mid * mid < num) {
      i = mid + 1;
    } else {
      j = mid - 1;
    }
  }

  return -1;
}

function checkPerfectSquare(num) {
  let i = 0;
  let j = num;

  while (i <= j) {
    let mid = Math.floor((i + j) / 2);
    if (mid * mid === num) {
      return true;
    }
    if (mid * mid < num) {
      i = mid + 1;
    } else {
      j = mid - 1;
    }
  }

  return false;
}
```

Given a collection of intervals, merge all overlapping intervals. i.e. Input: `[[1,3],[2,6],[8,10],[15,18]]`; Output: `[[1,6],[8,10],[15,18]]`.

```js
var merge = function(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);

  for (let i = 0; i < intervals.length - 1; i++) {
    const cur = intervals[i];
    const next = intervals[i + 1];

    if (cur[1] >= next[0]) {
      intervals[i] = undefined;
      intervals[i + 1] = [Math.min(cur[0], next[0]), Math.max(cur[1], next[1])];
    }
  }
  return intervals.filter(q => q); // fiter to pass undefined value
};
```

Given an array of meeting time intervals consisting of start and end times, find the minimum number of conference rooms required. For example, Given `[[0, 30],[5, 10],[15, 20]]`, return 2.

```js
var minMeetingRooms = function(intervals) {
  if (intervals.length === 0) return 0;
  intervals.sort((a, b) => a[0] - b[0]);
  
  let rooms = [intervals[0][1]];
  
  for (let i = 1; i < intervals.length; i++) {
    // check if it can reuse the existing room
    if (intervals[i][0] >= rooms[0]) {
      rooms[0] = intervals[i][1];
    } else {
      rooms.push(intervals[i][1]);
    }

    // mock PriorityQueue to find the earliest ending time
    rooms.sort((a, b) => a - b);
  }
  return rooms.length;
}
```

Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.

```js
var trap = function(height) {
  const stack = [];
  let res = 0;

  for (let i = 0; i < height.length; i++) {
    const curH = height[i];
    while (stack.length && curH > height[stack[stack.length - 1]]) {
      const preIndex = stack.pop();

      if (stack.length) {
        // i -> right boundary
        // stack[stack.length - 1] -> left boundary
        const heightVal = Math.min(height[stack[stack.length - 1]], curH) - height[preIndex];
        const length = i - stack[stack.length - 1] - 1;
        res += heightVal * length;
      }
    }
    stack.push(i);
  }

  return res;
};
```

You are given an integer array `height` of length n. There are n vertical lines. Find two lines that together with the x-axis form a container, such that the container contains the most water.

```js
var maxArea = function(height) {
  let i = 0, j = height.length - 1;
  let res = 0;

  while (i < j) {
    const cap = Math.min(height[i], height[j]) * (j - i);
    res = Math.max(res, cap);

    if (height[i] < height[j]) {
      i += 1;
    } else {
      j -= 1;
    }
  }
  return res;  
};
```

The next permutation of an array of integers is the next lexicographically greater permutation of its integer. If such arrangement is not possible, the array must be rearranged as the lowest possible order.

```js
var nextPermutation = function(nums) {
  // Find the first pair from the right where nums[i] < nums[i+1]
  let i;
  for (i = nums.length - 2; i >= 0; i--) {
    if (nums[i] < nums[i + 1]) {
      break;
    }
  }

  if (i >= 0) {
    // Find the first number on the right side of nums[i] that is greater than nums[i]
    let j;
    for (j = nums.length - 1; j > i; j--) {
      if (nums[j] > nums[i]) {
        break;
      }
    }
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }

  // The subarray to the right of 'i' is guaranteed to be in descending order
  reverse(nums, i + 1, nums.length - 1);
}

function reverse(nums, start, end) {
  for (let left = start, right = end; left < right; left++, right--) {
    [nums[left], nums[right]] = [nums[right], nums[left]];
  }
}
```

Given an array nums of distinct integers, return all the possible permutations. You can return the answer in any order.

```js
var permute = function(nums) {
  const result = [];
    
  function backtrack(path) {
    if (path.length === nums.length) {
      result.push([...path]);
      return;
    }
    
    for (let i = 0; i < nums.length; i++) {
      const num = nums[i];
      if (path.includes(num)) continue;

      path.push(num);
      backtrack(path);
      path.pop();
    }
  }

  backtrack([]);
  return result;
};
```

```js
function backtrack(当前路径 path, 可选列表 choices) {
  if (满足结束条件) {
    收集结果(path)
    return
  }

  for (let choice of choices) {
    if (当前选择不合法) continue;

    做选择(choice)
    backtrack(更新后的路径, 剩下的选择)
    撤销选择(choice)
  }
}
```

Given an integer array nums of unique elements, return all possible subsets.

```js
var subsets = function(nums) {
  const result = [];

  function backtrack(path, start) {
    result.push([...path]);

    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);
      backtrack(path, i + 1);
      path.pop();
    }
  }

  backtrack([], 0);
  return result;
};
```

Given two integers n and k, return all possible combinations of k numbers chosen from the range [1, n]. You may return the answer in any order.

```js
var combine = function(n, k) {
  const result = [];

  function backtrack(path, start) {
    if (path.length === k) {
      result.push([...path]);
      return;
    }

    for (let i = start; i <= n; i++) {
      path.push(i);
      backtrack(path, i + 1);
      path.pop();
    }
  }

  backtrack([], 1);
  return result;
};
```

Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent. A mapping of digits to letters (just like on the telephone buttons) is `2->abc` ... `9->wxyz`.

```js
var letterCombinations = function(digits) {
  if (!digits.length) return [];

  const digitToLetters = {
    '2': 'abc',
    '3': 'def',
    '4': 'ghi',
    '5': 'jkl',
    '6': 'mno',
    '7': 'pqrs',
    '8': 'tuv',
    '9': 'wxyz'
  };
  const result = [];

  function backtrack(path, index) {
    if (path.length === digits.length) {
      result.push(path.join(''));
      return;
    }

    const digit = digits[index];
    const letters = digitToLetters[digit];

    for (let letter of letters) {
      path.push(letter);
      backtrack(path, index + 1);
      path.pop();
    }
  }

  backtrack([], 0);
  return result;
};
```

Given the root of a binary tree, invert the tree, and return its root.

```js
var invertTree = function(root) {
  if (root === null) return root;
  
  [root.left, root.right] = [root.right, root.left];
  invertTree(root.left);
  invertTree(root.right);
  
  return root;
};
```

Given a binary tree, find the lowest common ancestor (LCA) of two given nodes in the tree.

```js
var lowestCommonAncestor = function(root, p, q) {
  if (!root || root === p || root === q) return root;

  let left = lowestCommonAncestor(root.left, p, q);
  let right = lowestCommonAncestor(root.right, p, q);

  if (left && right) return root;

  return left ? left : right;
};
```

Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes in the BST.

```js
var lowestCommonAncestor = function(root, p, q) {
  if (!root || root === p || root === q) return root;

  if (p.val < root.val && q.val < root.val) {
    return lowestCommonAncestor(root.left, p, q);
  }

  if (p.val > root.val && q.val > root.val) {
    return lowestCommonAncestor(root.right, p, q);
  }
  return root;
};
```

Given the root of a binary tree and an integer targetSum, return true if the tree has a root-to-leaf path such that adding up all the values along the path equals targetSum.

```js
var hasPathSum = function(root, targetSum) {
  if (root === null) {
    return false;
  }
  if (root.val === targetSum && (root.left === null && root.right === null)) {
    return true;
  }
  
  return hasPathSum(root.left, targetSum - root.val) || hasPathSum(root.right, targetSum - root.val);
};
```

Given the root of a binary tree, return the maximum path sum of any non-empty path. A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them.

```js
var maxPathSum = function(root) {
  let maxSum = -Infinity;
  
  const maxHelper = (node) => {
    if (!node) return 0;
        
    let leftGain = Math.max(maxHelper(node.left), 0);
    let rightGain = Math.max(maxHelper(node.right), 0);
    let currentPathSum = node.val + leftGain + rightGain;
        
    maxSum = Math.max(maxSum, currentPathSum);
    // We can only choose one path (left or right) return to parent
    return node.val + Math.max(leftGain, rightGain);
  };
  
  maxHelper(root);
  return maxSum;
};
```

Given the roots of two binary trees root and subRoot, return true if there is a subtree of root with the same structure and node values of subRoot and false otherwise.

```js
var isSubtree = function(root, subRoot) {
  if (subRoot === null) return true;
  if (root === null) return false;

  if (isSameTree(root, subRoot)) {
    return true;
  }
  return (isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot));
};

function isSameTree(p, q) {
  if (p === null || q === null) {
    return p === q;
  }

  return (p.val === q.val && isSameTree(p.left, q.left) && isSameTree(p.right, q.right));
}
```

Given the root of a binary tree, check whether it is a mirror of itself (i.e., symmetric around its center).

```js
var isSymmetric = function(root) {
  function isMirror(p, q) {
    if (p === null || q === null) {
      return p === q;
    }
    return (p.val === q.val && isMirror(p.left, q.right) && isMirror(p.right, q.left));
  }

  return isMirror(root.left, root.right);
};
```

Given a binary tree, determine if it is height-balanced (depth of the two subtrees of every node never differs by more than one).

```js
var isBalanced = function(root) {
  function checkHeight(node) {
    if (node === null) return 0;
    
    let leftH = checkHeight(node.left);
    let rightH = checkHeight(node.right);

    if (leftH === -1 || rightH === -1 || Math.abs(leftH - rightH) > 1) {
      return -1;
    }
    return Math.max(leftH, rightH) + 1;
  }
  
  return checkHeight(root) !== -1;
};
```

Given the root of a binary tree, determine if it is a valid binary search tree.

```js
var isValidBST = function(root) {
  const helper = (root, min, max) => {
    if (root === null) return true;
    
    if (root.val < min || root.val > max) return false;
    
    return helper(root.left, min, root.val) && helper(root.right, root.val, max);
  }

  return helper(root, -Infinity, Infinity);
};
```

You are given the root of a binary tree containing digits from 0 to 9 only. Each root-to-leaf path in the tree represents a number. Return the total sum of all root-to-leaf numbers.

```js
var sumNumbers = function (root) {
  function dfs(node, sum) {
    if (!node) {
      return 0;
    }
    sum = sum * 10 + node.val;
    if (!node.left && !node.right) {
      return sum;
    }
    return dfs(node.left, sum) + dfs(node.right, sum);
  }

  return dfs(root, 0);
};
```

Construct binary tree from pre-order and in-order traversal.

```js
var buildTree = function(preorder, inorder) {
  if (preorder.length === 0) {
    return null;
  }

  const root = new TreeNode(preorder[0]);
  const mid = inorder.indexOf(preorder[0]);

  // the # of elements in the left subtree is the same in both traversals
  root.left = buildTree(preorder.slice(1, mid + 1), inorder.slice(0, mid));
  root.right = buildTree(preorder.slice(mid + 1), inorder.slice(mid + 1));

  return root;
};
```

Given an integer array nums where the elements are sorted in ascending order, convert it to a height-balanced binary search tree.

```js
var sortedArrayToBST = function (nums) {
  function build (left, right) {
    if (right < left) {
      return null;
    }

    let mid = Math.floor((left + right) / 2);
    let node = new TreeNode(nums[mid]);

    node.left = build(left, mid - 1);
    node.right = build(mid + 1, right);

    return node;
  }

  return build(0, nums.length - 1);
};
```

Given the root of a binary search tree, and an integer k, return the kth smallest value (1-indexed) of all the values of the nodes in the tree.

```js
var kthSmallest = function(root, k) {
  // BST -> in-order traversal
  let stack = [];
  let current = root;
  let count = 0;

  while (stack.length > 0 || current !== null) {
    if (current !== null) {
      stack.push(current);
      current = current.left;
    } else {
      current = stack.pop();
      count++;
        
      if (count === k) {
        return current.val;
      }
      
      current = current.right;
    }
  } 
  return null; // If k is greater than the number of nodes in the BST
};
```

Given the root of a binary tree, flatten the tree into a "linked list". The "linked list" should use the same TreeNode class. The "linked list" should be in the same order as a pre-order traversal of the binary tree.

```js
var flatten = function (root) {
  if (!root) return;

  let stack = [root];
  let prev = null;

  while (stack.length) {
    let node = stack.pop();

    if (prev) {
      prev.right = node;
      prev.left = null;
    }

    if (node.right) stack.push(node.right);
    if (node.left) stack.push(node.left);

    prev = node;
  }
};
```

Given the root of a binary tree, imagine yourself standing on the right side of it, return the values of the nodes you can see ordered from top to bottom.

```js
var rightSideView = function(root) {
  if (!root) return [];

  let result = [];
  let queue = [root];
  while (queue.length) {
    let levelSize = queue.length;

    for (let i = 0; i < levelSize; i++) {
      let node = queue.shift();

      if (i === levelSize - 1) {
        result.push(node.val);
      }

      if (node.left) {
        queue.push(node.left);
      }
      if (node.right) {
        queue.push(node.right);
      }
    }
  }
  return result;
};
```

Given the head of a linked list, remove the nth node from the end of the list and return its head.

```js
// fast pointer moves forward `n` steps first,
// then fast and slow pointers move forward together,
// until the fast pointer reaches the end of the linked list.
var removeNthFromEnd = function(head, n) {
  let dummy = new ListNode(0, head);
  let fast = dummy;
  let slow = dummy;

  for (let i = 0; i < n; i++) {
    fast = fast.next;
  }
  while (fast.next) {
    slow = slow.next;
    fast = fast.next;
  }
  slow.next = slow.next.next;
  
  return dummy.next;
};
```

You are given the heads of two sorted linked lists. Merge the two lists into one sorted list.

```js
var mergeTwoLists = function(list1, list2) {
  let dummy = new ListNode();
  let cur = dummy;

  while (list1 && list2) {
    if (list1.val > list2.val) {
      cur.next = list2;
      list2 = list2.next;
    } else {
      cur.next = list1;
      list1 = list1.next;
    }
    cur = cur.next;
  }

  cur.next = list1 || list2;
  return dummy.next;
};
```

Given a reference of a node in a connected undirected graph. Return a clone of the graph.

```js
var cloneGraph = function (node) {
  if (!node) return null;

  // Map<orginal node, cloned node>
  const visited = new Map(); 

  function dfs(n) {
    if (visited.has(n)) {
      return visited.get(n);
    }

    const clone = new Node(n.val);
    visited.set(n, clone);

    for (const nei of n.neighbors) {
      clone.neighbors.push(dfs(nei));
    }

    return clone;
  }

  return dfs(node);
};
```

Given a 2d grid map of '1's (land) and '0's (water), count the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges are all surrounded by water.

```js
var numIslands = function(grid) {
  let count = 0;
  let rows = grid.length;
  if (rows === 0) return 0;
  let cols = grid[0].length;
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j] === '1') {
        dfs(grid, i, j, rows, cols);  
        count++;
      }
    }
  }
  return count;
};

function dfs(grid, i, j, rows, cols) {
  if (i < 0 || j < 0 || i > rows - 1 || j > cols - 1 || grid[i][j] === '0') {
    return;
  }

  grid[i][j] = '0';

  dfs(grid, i + 1, j, rows, cols);
  dfs(grid, i, j + 1, rows, cols);
  dfs(grid, i - 1, j, rows, cols);
  dfs(grid, i, j - 1, rows, cols);
}
```

You are given an `m x n` binary matrix grid. An island is a group of 1's connected 4-directionally. The area of an island is the number of cells with a value 1. Return the maximum area of an island in grid.

```js
var maxAreaOfIsland = function(grid) {
  let n = grid.length;
  let m = grid[0].length;
  let ans = 0;
  
  function dfs(i, j) {
    if (i < 0 || j < 0 || i > n-1 || j > m-1 || !grid[i][j]) {
      return 0;
    }
    grid[i][j] = 0;
    
    return 1 + dfs(i-1, j) + dfs(i, j-1) + dfs(i+1, j) + dfs(i, j+1);
  }

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (grid[i][j]) {
        ans = Math.max(ans, dfs(i, j));
      }
    }
  }
  return ans;
};
```

Given an m x n grid of characters board and a string word, return true if word exists in the grid. The word can be constructed from letters of sequentially adjacent cells (horizontally or vertically).

```js
var exist = function(board, word) {
  let m = board.length;
  let n = board[0].length;
  let visited = Array.from(Array(m), () => Array(n).fill(false));
  
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (dfs(board, word, i, j, 0, visited))
        return true;
    }
  }
  return false;
};

// k is the current position in the word
function dfs(board, word, i, j, k, visited) {
  let m = board.length;
  let n = board[0].length;
  
  if (k === word.length) {
    return true;
  }
  
  if (i < 0 || i > m-1 || j < 0 || j > n-1 || visited[i][j] || board[i][j] !== word.charAt(k)) {
    return false;
  }

  visited[i][j] = true;
  if (dfs(board, word, i + 1, j, k + 1, visited) ||
      dfs(board, word, i - 1, j, k + 1, visited) ||
      dfs(board, word, i, j + 1, k + 1, visited) ||
      dfs(board, word, i, j - 1, k + 1, visited))
      return true;

  visited[i][j] = false;
  return false;
}
```

Given two words, `beginWord` and `endWord`, and a dictionary `wordList`, return the number of words in the shortest transformation sequence from `beginWord` to `endWord`, or 0 if no such sequence exists. Every adjacent pair of words differs by a single letter.

```js
var ladderLength = function(beginWord, endWord, wordList) {
  let wordSet = new Set(wordList)
  let queue = [beginWord];
  let steps = 1;
  
  while (queue.length) {
    let size = queue.length;
    for (let i = 0; i < size; i++) {
      let word = queue.shift();
      if (word === endWord) {
        return steps;
      }
      
      for (let j = 0; j < word.length; j++) {
        for (let k = 0; k < 26; k++) {
          let newWord = word.slice(0, j) + String.fromCharCode(k + 97) + word.slice(j + 1);
          if (wordSet.has(newWord)) {
            queue.push(newWord);
            // wordSet acts as a visited tracker 
            wordSet.delete(newWord);
          }
        }
      }
    }
    
    steps++;
  }

  return 0;
};
```

A gene string can be represented by an 8-character long string, with choices from 'A', 'C', 'G', and 'T'. Given the two gene strings `startGene` and `endGene` and the gene bank, return the minimum number of mutations needed to mutate from `startGene` to `endGene`. If there is no such a mutation, return -1.

```js
var minMutation = function (startGene, endGene, bank) {
  let step = 0;
  let queue = [startGene];
  let bankSet = new Set(bank);
  let genes = ["A", "C", "G", "T"];

  while (queue.length) {
    let size = queue.length;

    for (let i = 0; i < size; i++) {
      let cur = queue.shift();
      if (cur === endGene) {
        return step;
      }
      for (let j = 0; j < cur.length; j++) {
        for (let g of genes) {
          if (cur[j] === g) continue;
          let newGene = cur.slice(0, j) + g + cur.slice(j + 1);

          if (bankSet.has(newGene)) {
            queue.push(newGene);
            bankSet.delete(newGene);
          }
        }
      }
    }
    step++;
  }

  return -1;
};
```

There are a total of numCourses courses you have to take, labeled from `0` to `numCourses - 1`. Prerequisites `[a, b]` indicates that you must take course `b` first if you want to take course `a`. Return true if you can finish all courses. 

```js
var canFinish = function (numCourses, prerequisites) {
  let inDegree = Array(numCourses).fill(0);
  let adj = Array.from({ length: numCourses }, () => []);

  for (let [course, prereq] of prerequisites) {
    adj[prereq].push(course);
    inDegree[course]++;
  }

  let queue = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) {
      queue.push(i);
    }
  }
  
  let processed = 0;
  while (queue.length > 0) {
    let c = queue.shift();
    processed++;

    for (const next of adj[c]) {
      inDegree[next]--;
      if (inDegree[next] === 0) {
        queue.push(next);
      }
    }
  }
  return processed === numCourses;
}
```

The message is decoded via the following mapping: `"1" -> 'A'` ... `"26" -> 'Z'`. There are many different ways you can decode the message because some codes are contained in other codes ("2" and "5" vs "25"). Given a string s containing only digits, return the number of ways to decode it.

```js
var numDecodings = function (s) {
  if (!s || s.length === 0 || s[0] === '0') {
    return 0;
  }
  let dp = Array(s.length + 1).fill(0);

  dp[0] = 1;
  dp[1] = 1;

  for (let i = 2; i <= s.length; i++) {
    if (s[i - 1] !== '0') {
      dp[i] += dp[i - 1];
    }

    const twoDigits = parseInt(s[i - 2] + s[i - 1]);
    if (twoDigits >= 10 && twoDigits <= 26) {
      dp[i] += dp[i - 2];
    }
  }
  return dp[s.length];
};
```

Given an integer array nums, return the length of the longest strictly increasing subsequence. For example, `[10,9,2,5,3,7,101,18]`'s longest increasing subsequence is `[2,3,7,101]`.

```js
var lengthOfLIS = function(nums) {
  if (nums.length === 0) {
    return 0;
  }
  // dp[i] represents the length of the LIS ending at index i
  let dp = Array(nums.length).fill(1);
  let maxLength = 1;

  for (let i = 1; i < nums.length; i++) {
    // iterate index before i
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
    maxLength = Math.max(maxLength, dp[i]);
  }
  return maxLength;
};
```

Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words. For example, `s = "leetcode"`, `wordDict = ["leet","code"]`, output is true.

```js
var wordBreak = function (s, wordDict) {
  let dp = new Array(s.length + 1).fill(false);
  dp[0] = true;

  for (let i = 1; i <= s.length; i++) {
    for (let w of wordDict) {
      let start = i - w.length;
      if (start >= 0 && dp[start] && s.slice(start, i) === w) {
        dp[i] = true;
        break;
      }
    }
  }
  return dp[s.length];
};
```

Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0. For example, text1 = "abcde", text2 = "ace", then the longest common subsequence is "ace" and its length is 3.

```js
var longestCommonSubsequence = function(text1, text2) {
  let m = text1.length;
  let n = text2.length;
  // dp[i][j] means the LCS of first i characters in text1 and first j characters in text2
  // 1. X[m-1] == Y[n-1] -> LCS(Xm-1，Yn-1)
  // 2. X[m-1] != Y[n-1] -> max(LCS(Xm-1, Yn), LCS(Xm, Yn-1))
  let dp = Array.from(Array(m + 1), () => Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }  
    }
  }
  return dp[m][n];
};
```

Best Time to Buy and Sell Stock. You are given an array prices where `prices[i]` is the price of a given stock on the `ith` day.

```js
// only one transaction
var maxProfit = function(prices) {
  let min = prices[0];
  let maxProfit = 0;

  for (let i = 0; i < prices.length; i++) {
    if (prices[i] < min) {
      min = prices[i];
    } else if (prices[i] - min > maxProfit) {
      maxProfit = prices[i] - min;
    }
  }
  return maxProfit;
};

// multiple transactions (greedy)
var maxProfit = function(prices) {
  let maxProfit = 0;
    
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > prices[i - 1]) {
      maxProfit += prices[i] - prices[i - 1];
    }
  }
  return maxProfit;
};

// multiple transactions but with transaction fee for each one
var maxProfit = function(prices, fee) {
  // dp[i] represents two states
  // 1. dp[i][0]: max profit on day i if you hold a stock.
  // 2. dp[i][1]: max profit on day i if you do not hold a stock.
  let dp = Array.from(Array(prices.length), () => Array(2).fill(0));
  dp[0][0] = 0 - prices[0];
  dp[0][1] = 0;

  for (let i = 1; i < prices.length; i++) {
    dp[i][0] = Math.max(dp[i - 1][0], dp[i - 1][1] - prices[i]);
    dp[i][1] = Math.max(dp[i - 1][1], dp[i - 1][0] + prices[i] - fee);
  }

  return dp[prices.length - 1][1];
};

// After you sell your stock, you cannot buy stock on the next day
var maxProfit = function(prices) {
  if (prices.length === 0) return 0;

  // dp[i][0]: Hold or buy
  // dp[i][1]: Stay idle or cooldown is over
  // dp[i][2]: Sell today
  const n = prices.length;
  const dp = Array.from({ length: n }, () => Array(3).fill(0));

  dp[0][0] = -prices[0];
  dp[0][1] = 0;
  dp[0][2] = 0;

  for (let i = 1; i < n; i++) {
    dp[i][0] = Math.max(dp[i - 1][0], dp[i - 1][1] - prices[i]);
    dp[i][1] = Math.max(dp[i - 1][1], dp[i - 1][2]);
    dp[i][2] = dp[i - 1][0] + prices[i];
  }

  return Math.max(dp[n - 1][1], dp[n - 1][2]);
};
```
