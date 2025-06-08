document.addEventListener('DOMContentLoaded', () => {
  // 初始化CodeMirror编辑器
  const editor = CodeMirror(document.getElementById('editor'), {
    mode: "go",
    theme: "one-dark",
    lineNumbers: true,
    indentUnit: 4,
    tabSize: 4,
    autoCloseBrackets: true,
    matchBrackets: true,
    value: `package main

import (
    "fmt"
    "time"
)

func main() {
    fmt.Println("欢迎使用Go在线编译器！")
    fmt.Println("当前时间:", time.Now().Format("2006-01-02 15:04:05"))
    
    // 示例计算
    a, b := 15, 27
    fmt.Printf("%d + %d = %d\\n", a, b, a+b)
    
    // 斐波那契数列示例
    fmt.Println("斐波那契数列(前10项):")
    for i := 0; i < 10; i++ {
        fmt.Print(fib(i), " ")
    }
}

func fib(n int) int {
    if n <= 1 {
        return n
    }
    return fib(n-1) + fib(n-2)
}`
  });

  const output = document.getElementById('output');
  const runBtn = document.getElementById('runBtn');
  const formatBtn = document.getElementById('formatBtn');
  const exampleBtn = document.getElementById('exampleBtn');

  // 运行代码
  runBtn.addEventListener('click', async () => {
    const code = editor.getValue();
    output.textContent = '编译运行中...';
    
    try {
      const startTime = Date.now();
      const response = await fetch('/compile', {
        method: 'POST',
        body: code,
        headers: { 'Content-Type': 'text/plain' }
      });
      
      const result = await response.text();
      const elapsed = Date.now() - startTime;
      
      if (response.ok) {
        output.textContent = `${result}\n\n执行时间: ${elapsed}ms`;
      } else {
        output.textContent = `编译错误:\n${result}`;
      }
    } catch (err) {
      output.textContent = `网络错误: ${err.message}`;
    }
  });

  // 格式化代码
  formatBtn.addEventListener('click', () => {
    const code = editor.getValue();
    output.textContent = '格式化中...';
    
    fetch('/format', {
      method: 'POST',
      body: code,
      headers: { 'Content-Type': 'text/plain' }
    })
    .then(response => response.text())
    .then(formatted => {
      if (formatted.startsWith('错误')) {
        output.textContent = formatted;
      } else {
        editor.setValue(formatted);
        output.textContent = '代码已格式化 ✓';
      }
    })
    .catch(err => {
      output.textContent = `格式化错误: ${err.message}`;
    });
  });

  // 加载示例代码
  exampleBtn.addEventListener('click', () => {
    editor.setValue(`package main

import (
    "fmt"
    "math/rand"
    "time"
)

func main() {
    rand.Seed(time.Now().UnixNano())
    
    // 生成随机数组
    arr := make([]int, 10)
    for i := range arr {
        arr[i] = rand.Intn(100)
    }
    
    fmt.Println("原始数组:", arr)
    bubbleSort(arr)
    fmt.Println("排序后数组:", arr)
    
    // 二分查找示例
    target := arr[rand.Intn(len(arr))]
    index := binarySearch(arr, target)
    fmt.Printf("元素 %d 的位置: %d\\n", target, index)
}

func bubbleSort(arr []int) {
    n := len(arr)
    for i := 0; i < n-1; i++ {
        for j := 0; j < n-i-1; j++ {
            if arr[j] > arr[j+1] {
                arr[j], arr[j+1] = arr[j+1], arr[j]
            }
        }
    }
}

func binarySearch(arr []int, target int) int {
    low, high := 0, len(arr)-1
    for low <= high {
        mid := low + (high-low)/2
        if arr[mid] == target {
            return mid
        } else if arr[mid] < target {
            low = mid + 1
        } else {
            high = mid - 1
        }
    }
    return -1
}`);
    output.textContent = '已加载排序算法示例 ✓';
  });
});