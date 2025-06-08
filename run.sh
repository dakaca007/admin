#!/bin/sh

# 启动Go服务
/app/main &

# 启动前端开发服务器
cd /app/web
npx vite --host 0.0.0.0 --port 9000 &

# 保持容器运行
tail -f /dev/null