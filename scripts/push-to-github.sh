#!/bin/bash
# VisaPilot - GitHub 推送脚本
# 使用方法: bash scripts/push-to-github.sh <你的GitHub用户名>

set -e

if [ -z "$1" ]; then
  echo "请提供你的 GitHub 用户名"
  echo "用法: bash $0 <GitHub用户名>"
  exit 1
fi

USERNAME="$1"
REPO_NAME="visapilot"
REMOTE_URL="https://github.com/${USERNAME}/${REPO_NAME}.git"

echo "=============================================="
echo " VisaPilot GitHub 推送助手"
echo "=============================================="
echo ""
echo "前置条件："
echo "  1. 在 GitHub 上创建一个空仓库: ${REPO_NAME}"
echo "     地址: https://github.com/new"
echo "  2. 确保已安装 gh CLI（已安装）"
echo "  3. 在终端执行 gh auth login 完成登录"
echo ""
echo "将要执行的命令："
echo "  1. git remote add origin ${REMOTE_URL}"
echo "  2. git push -u origin main"
echo ""

read -p "继续执行吗？(y/n): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
  echo "已取消"
  exit 0
fi

git remote add origin "${REMOTE_URL}" 2>/dev/null || git remote set-url origin "${REMOTE_URL}"
echo "远程仓库: ${REMOTE_URL}"

git push -u origin main
echo "推送成功！"
