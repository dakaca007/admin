#!/bin/sh

# 启动Go服务
/app/main &

# 启动前端开发服务器
cd /app/web
npm run dev &

# 保持容器运行
tail -f /dev/null