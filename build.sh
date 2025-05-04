#!/bin/bash

# 设置默认的baseURL
BASE_URL="fists.cc"

# 检查Netlify环境变量
if [ ! -z "$DEPLOY_PRIME_URL" ]; then
  BASE_URL="$DEPLOY_PRIME_URL"
fi

# 检查Cloudflare Pages环境变量（如果存在会覆盖Netlify的变量）
if [ ! -z "$CF_PAGES_URL" ]; then
  BASE_URL="$CF_PAGES_URL"
fi

echo "Using base URL: $BASE_URL"

# 执行Hugo构建
hugo --minify -b "$BASE_URL"