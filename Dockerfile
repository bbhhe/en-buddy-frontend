# 前端构建阶段
FROM alibaba-cloud-linux-3-registry.cn-hangzhou.cr.aliyuncs.com/alinux3/node:20.16 AS build
WORKDIR /app

# 1. 复制依赖描述文件
COPY package*.json ./

# 2. 设置权限并安装 (解决 exit code 243)
RUN npm config set unsafe-perm true && \
    npm install

# 3. 复制源代码并构建
COPY . .
RUN npm run build

# 运行阶段
FROM anolis-registry.cn-zhangjiakou.cr.aliyuncs.com/openanolis/nginx:1.14.1-8.6
# 复制构建产物
COPY --from=build /app/dist /usr/share/nginx/html
# 复制自定义 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8124
CMD ["nginx", "-g", "daemon off;"]
