# 前端构建阶段
FROM alibaba-cloud-linux-3-registry.cn-hangzhou.cr.aliyuncs.com/alinux3/node:20.16 AS build
WORKDIR /app

# 1. 强力清理并显式设置用户（防止被基础镜像的 USER node 干扰）
USER root

# 2. 只有在没有 .dockerignore 时这段才重要，建议加上
# 移除旧的 unsafe-perm 命令，直接进行安装
COPY package*.json ./

# 如果还是报错，尝试加 --foreground-scripts 标志
RUN npm install

# 3. 复制剩余源码
COPY . .
RUN npm run build

# 运行阶段
FROM anolis-registry.cn-zhangjiakou.cr.aliyuncs.com/openanolis/nginx:1.14.1-8.6
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8124
CMD ["nginx", "-g", "daemon off;"]
