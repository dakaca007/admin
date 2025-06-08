# 使用官方Go镜像作为基础
FROM golang:1.21-alpine

# 设置工作目录
WORKDIR /app

# 安装必要的工具
RUN apk add --no-cache \
    git \
    build-base \
    nodejs \
    npm \
    python3 \
    py3-pip \
    python3-dev \
    py3-virtualenv

# 安装Go Air用于热重载开发
RUN go install github.com/cosmtrek/air@latest

# 创建前端目录
RUN mkdir -p /app/web
WORKDIR /app/web

# 安装前端依赖 - 修复：只复制 package.json
COPY web/package.json ./  # 只复制 package.json
RUN npm install

# 复制前端代码
COPY web .

# 创建后端目录
WORKDIR /app/server

# 复制Go模块文件
COPY server/go.mod server/go.sum ./
RUN go mod download

# 复制后端代码
COPY server .

# 构建Go后端
RUN go build -o /app/main
# 创建并激活虚拟环境
RUN python3 -m venv /venv
ENV PATH="/venv/bin:$PATH"
# 在虚拟环境中安装 Flask
RUN pip install --no-cache-dir flask
# 暴露端口
EXPOSE 8080 9000

# 设置启动脚本
COPY run.sh /app/
RUN chmod +x /app/run.sh

# 启动服务
CMD ["/app/run.sh"]