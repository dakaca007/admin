package main

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"time"
)

func main() {
	http.HandleFunc("/compile", compileHandler)
	http.HandleFunc("/format", formatHandler)
	http.Handle("/", http.FileServer(http.Dir("/app/web")))
	
	fmt.Println("Go在线编译器服务已启动，监听端口 :8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Printf("服务器错误: %v\n", err)
		os.Exit(1)
	}
}

func compileHandler(w http.ResponseWriter, r *http.Request) {
	code, _ := io.ReadAll(r.Body)
	defer r.Body.Close()

	// 创建临时目录
	dir, _ := os.MkdirTemp("", "go-compile-*")
	defer os.RemoveAll(dir)

	// 写入Go代码
	filePath := filepath.Join(dir, "main.go")
	if err := os.WriteFile(filePath, code, 0644); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintf(w, "文件写入错误: %v", err)
		return
	}

	// 编译代码
	cmd := exec.Command("go", "build", "-o", filepath.Join(dir, "output"), filePath)
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, "编译错误:\n%s", stderr.String())
		return
	}

	// 运行程序
	runCmd := exec.Command(filepath.Join(dir, "output"))
	output, _ := runCmd.CombinedOutput()

	w.Header().Set("Content-Type", "text/plain")
	w.Write(output)
}

func formatHandler(w http.ResponseWriter, r *http.Request) {
	code, _ := io.ReadAll(r.Body)
	defer r.Body.Close()

	// 创建临时文件
	file, err := os.CreateTemp("", "go-format-*.go")
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintf(w, "错误: 无法创建临时文件")
		return
	}
	defer os.Remove(file.Name())

	// 写入代码
	if _, err := file.Write(code); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintf(w, "错误: 无法写入代码")
		return
	}
	file.Close()

	// 格式化代码
	cmd := exec.Command("gofmt", "-s", "-w", file.Name())
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, "格式化错误:\n%s", stderr.String())
		return
	}

	// 读取格式化后的代码
	formatted, err := os.ReadFile(file.Name())
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintf(w, "错误: 无法读取格式化后的代码")
		return
	}

	w.Header().Set("Content-Type", "text/plain")
	w.Write(formatted)
}