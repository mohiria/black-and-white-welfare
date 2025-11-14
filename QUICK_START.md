# 🚀 快速开始指南

## 📋 前置要求

- Node.js 20 或更高版本
- npm 包管理器
- **Linux.do 账号**（重要！）

---

## ⚡ 极简配置（3步完成）

### 1. 安装依赖

```bash
npm install
```

### 2. 配置账号密码

编辑 `.env` 文件：

```env
# Linux.do 账号密码（访问 https://linux.do 注册/登录）
LINUX_DO_USERNAME=your_username_or_email
LINUX_DO_PASSWORD=your_password

# AI 站点 API Key（访问 https://ai.hybgzs.com 获取）
AI_API_KEY=sk-xxxxx
```

### 3. 运行测试

```bash
npm run test-login
```

如果测试通过，即可正式运行：

```bash
npm start
```

---

## 🔍 详细说明

### 登录流程

程序会自动执行以下步骤：

```
1. 访问 https://linux.do/login
2. 自动填写用户名密码
3. 点击登录按钮
4. 等待登录成功
   ↓
5. 访问 https://cdk.hybgzs.com/
6. 点击"立即开始"
7. 点击"使用 LinuxDo 登录"
8. 自动点击"允许"（OAuth 授权）
9. CDK 登录完成 ✅
   ↓
10. 开始执行领取任务
```

### 获取 Linux.do 账号

1. 访问 https://linux.do
2. 点击"注册"
3. 填写邮箱、用户名、密码
4. 完成注册后即可使用

### 获取 AI API Key

1. 访问 https://ai.hybgzs.com
2. 使用 Linux.do 账号登录
3. 进入 **个人设置** → **其他** → **访问令牌**
4. 点击"创建新令牌"
5. 复制 API Key

---

## 🎯 GitHub Actions 配置

在仓库 Settings → Secrets and variables → Actions 中添加：

| Secret 名称 | 说明 | 必需 |
|------------|------|------|
| `LINUX_DO_USERNAME` | Linux.do 用户名或邮箱 | ✅ |
| `LINUX_DO_PASSWORD` | Linux.do 密码 | ✅ |
| `AI_API_KEY` | AI 站点 API Key | ✅ |

**安全提示**：密码存储在 GitHub Secrets 中，只有仓库拥有者可见，GitHub 会加密保存。

---

## ✅ 优势

### 与传统 Cookie 方式对比

| 对比项 | Cookie 方式 | 自动登录方式 |
|-------|-----------|------------|
| **cookie 有效期** | 7-30天 | ✅ 每次新session，永不过期 |
| **维护频率** | 每月1-4次 | ✅ 零维护 |
| **配置难度** | 需要 F12 复制 | ✅ 填写账号密码 |
| **GitHub Actions** | 支持 | ✅ 完美支持 |
| **安全性** | 一般 | ✅ 密码加密存储 |

---

## 🛠️ 可用命令

```bash
npm start          # 运行主程序（生产模式）
npm run test-login # 测试自动登录（可视化，推荐首次使用）
npm test           # 运行测试
```

---

## ❓ 常见问题

### Q: 需要手动复制 Cookie 吗？

**A:** 不需要！配置账号密码后，每次自动登录获取新 session。

### Q: 多久需要更新一次配置？

**A:** 永远不需要！只要 Linux.do 账号密码不变，就能一直运行。

### Q: Linux.do 账号安全吗？

**A:** 安全。密码存储在 `.env` 文件（本地）或 GitHub Secrets（云端），都有加密保护。

### Q: 测试失败怎么办？

**A:**

1. 检查账号密码是否正确
2. 查看截图文件：
   - `images/linux-do-login-failed.png`
   - `images/cdk-login-failed.png`
3. 确认 Linux.do 没有验证码或2FA

### Q: GitHub Actions 如何运行？

**A:**

1. 在仓库 Secrets 中配置账号密码
2. 每次 workflow 运行时自动登录
3. 无需任何维护操作

---

## 🎉 就这么简单！

只需 **3 个环境变量**，即可实现**完全自动化，永不过期**的运行方式！

查看详细文档：[README.md](README.md)
