# CDK 自动领取工具

使用 Playwright 自动化工具，每日自动领取 https://cdk.hybgzs.com/ 的每日工资和幸运转盘奖励。

## 功能特点

- ✅ 自动领取每日工资
- ✅ 自动使用幸运转盘
- ✅ 通过 Cookie 实现免登录
- ✅ 支持环境变量参数化配置
- ✅ GitHub Actions + Environments 定时自动执行
- ✅ 错误截图自动保存
- ✅ 灵活的选择器匹配策略

## 快速开始

### 本地测试（3 步）

```bash
# 1. 安装依赖
npm install

# 2. 获取 Cookies（会自动打开浏览器）
npm run save-cookies

# 3. 运行脚本测试
npm start
```

📖 **详细说明：** [本地验证指南 →](LOCAL_TEST_GUIDE.md)

### GitHub Actions 自动化部署

1. 推送代码到 GitHub
2. 创建 Environment（名称：`production`）
3. 在 Environment 中配置 Secret：`COOKIES_JSON`
4. 启用 GitHub Actions 并测试运行

📖 **详细说明：** [GitHub Actions 配置指南 →](GITHUB_ACTIONS_SETUP.md)

---

## 项目结构

```
.
├── .github/workflows/
│   └── daily-task.yml              # GitHub Actions 工作流
├── config/
│   └── cookies.example.json        # Cookies 示例
├── src/
│   ├── index.js                    # 主程序（支持环境变量）
│   └── utils/
│       └── saveCookies.js          # Cookies 保存工具
├── LOCAL_TEST_GUIDE.md             # 本地验证指南
├── GITHUB_ACTIONS_SETUP.md         # GitHub Actions 配置指南
└── README.md                       # 项目说明
```

---

## Cookie 登录方案说明

### ✅ 可行性分析

本项目通过 **Cookie 免登录** 方式实现自动化：

1. 使用真实浏览器手动登录一次
2. 保存完整的 Cookie 信息（session、token 等）
3. 后续访问时自动注入 Cookie 实现免登录
4. 支持环境变量和本地文件两种配置方式

### 配置方式

项目支持多种 Cookie 配置方式，优先级从高到低：

1. 环境变量 `COOKIE_STRING`（简单字符串，推荐）
2. 环境变量 `COOKIES_JSON`（完整 JSON 格式）
3. 本地文件 `config/cookie.txt`
4. 本地文件 `config/cookies.json`

#### 方式 1：使用 .env 文件（本地开发推荐）

```bash
# 1. 获取 Cookies
npm run save-cookies

# 2. 复制环境变量配置模板
cp .env.example .env

# 3. 将脚本输出的 COOKIE_STRING 复制到 .env 文件中
# COOKIE_STRING=sessionid=xxx; token=yyy; ...

# 4. 运行脚本
npm start
```

#### 方式 2：使用配置文件（传统方式）

```bash
npm run save-cookies  # 保存到 config/cookies.json
npm start             # 自动从文件读取
```

#### 方式 3：GitHub Actions 环境变量

在 GitHub Repository 的 Settings → Secrets and variables → Actions 中添加：

- Secret 名称：`COOKIE_STRING`（推荐）或 `COOKIES_JSON`
- Secret 值：从 `npm run save-cookies` 命令输出中复制

**示例：**
```bash
# 运行 save-cookies 后，复制输出的环境变量格式
npm run save-cookies

# 输出示例：
# ============================================================
# 方式1 - COOKIE_STRING 格式（推荐，适用于本地和 GitHub Actions）:
# COOKIE_STRING=sessionid=abc123; token=xyz789; ...
# ============================================================
```

---

## 定时执行

当前配置：每天北京时间 9:00（UTC 1:00）自动执行

修改时间：编辑 [.github/workflows/daily-task.yml](.github/workflows/daily-task.yml) 中的 cron 表达式

---

## 文档导航

- 📘 [本地验证指南](LOCAL_TEST_GUIDE.md) - 详细的本地测试和调试说明
- 📗 [GitHub Actions 配置](GITHUB_ACTIONS_SETUP.md) - Environment 配置、定时任务、通知等

---

## 注意事项

### 🔒 安全

- 不要将 `config/cookies.json`、`config/cookie.txt` 或 `.env` 文件提交到公开仓库
- `.gitignore` 已配置忽略这些敏感文件
- 使用 GitHub Environments + Secrets 存储敏感信息
- 定期更换密码和 Cookies（建议每月）

### ⚠️ Cookie 失效处理

Cookies 可能因以下原因失效：
- 过期时间到期
- 密码被修改
- 网站更新认证机制
- IP 地址变化限制

解决方案：重新运行 `npm run save-cookies` 并更新 Environment Secrets

### 📝 合规使用

- 本工具仅供学习和个人使用
- 请遵守网站的使用条款
- 不要用于商业用途或滥用

---

## 故障排查

| 问题 | 可能原因 | 解决方案 |
|------|---------|---------|
| 登录失败 | Cookies 过期 | 重新获取 cookies |
| 未找到按钮 | 网站结构变化 | 查看截图，更新选择器 |
| Actions 未运行 | 工作流被禁用 | 检查 Actions 设置 |
| 环境变量未读取 | Environment 配置错误 | 确认名称为 `production` |

详细排查指南：
- [本地测试故障排查](LOCAL_TEST_GUIDE.md#常见问题排查)
- [GitHub Actions 故障排查](GITHUB_ACTIONS_SETUP.md#故障排查)

---

## License

MIT

## 免责声明

本项目仅供学习交流使用，使用本工具产生的任何后果由使用者自行承担。请遵守相关网站的使用条款和法律法规。
