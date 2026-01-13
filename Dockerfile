# 前端构建阶段
FROM alibaba-cloud-linux-3-registry.cn-hangzhou.cr.aliyuncs.com/alinux3/node:20.16 AS build
WORKDIR /app

# 安装 pnpm (利用 pnpm-lock.yaml 锁定依赖)
RUN npm install -g pnpm

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 构建应用
COPY . .
RUN pnpm run build

# 运行阶段 - 使用 nginx 托管静态文件
FROM anolis-registry.cn-zhangjiakou.cr.aliyuncs.com/openanolis/nginx:1.14.1-8.6
# 复制构建产物到 nginx 静态文件目录
COPY --from=build /app/dist /usr/share/nginx/html
# 复制自定义 nginx 配置替换默认配置
COPY nginx.conf /etc/nginx/conf.d/default.conf
# 暴露端口
EXPOSE 8124
# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]