# 🎉 自动登录完整指南

## 方案说明

通过配置 Linux.do 账号密码，实现**每次运行自动登录**，获取全新的 session，**彻底解决cookie频繁过期的问题**。

---

## 🔄 工作原理

### 传统方式（会过期）

```
用户手动登录 CDK 网站
  ↓
打开浏览器 F12，复制 cookie
  ↓
粘贴到配置文件
  ↓
7-30天后 cookie 过期
  ↓
重复上述流程 ❌
```

### 新方式（永不过期）

```
配置一次 Linux.do 账号密码
  ↓
每次运行自动执行：
  1. 登录 Linux.do
  2. 访问 CDK 网站
  3. 自动 OAuth 授权
  4. 获取全新 session
  ↓
永不过期 ✅
```

---

## 📋 详细登录流程

### 阶段1：Linux.do 登录

```
1. 访问 https://linux.do/login
2. 定位 id="login-account-name" 输入框
3. 填写用户名
4. 定位 id="login-account-password" 输入框
5. 填写密码
6. 点击 id="login-button" 按钮
7. 等待 id="toggle-current-user" 出现
   ✅ Linux.do 登录成功
```

### 阶段2：CDK OAuth 授权

```
1. 访问 https://cdk.hybgzs.com/
2. 检查是否已登录（查找用户信息元素）
   - 如果已登录：跳过后续步骤
   - 如果未登录：继续
3. 点击"立即开始"按钮
   xpath: //a[@class='btn btn-light btn-lg']
4. 点击"使用 LinuxDo 登录"按钮
   xpath: //button[contains(normalize-space(.), '使用 LinuxDo 登录')]
5. 等待跳转到 linux.do OAuth 授权页
6. 点击"允许"链接
   xpath: //a[contains(normalize-space(.), '允许')]
7. 等待跳转回 CDK 网站
8. 检测 xpath: //span[@class='navbar-text me-3']
   ✅ CDK 登录成功
```

---

## ⚙️ 配置方法

### 1. 本地开发配置

创建/编辑 `.env` 文件：

```env
# Linux.do 账号密码
LINUX_DO_USERNAME=your_username_or_email
LINUX_DO_PASSWORD=your_password

# AI 站点配置
AI_API_KEY=sk-xxxxx
AI_REDEEM_URL=https://ai.hybgzs.com/api/user/topup
```

### 2. GitHub Actions 配置

在仓库 Settings → Secrets and variables → Actions 中添加：

```
LINUX_DO_USERNAME
LINUX_DO_PASSWORD
AI_API_KEY
```

---

## 🧪 测试方法

### 首次使用建议先测试

```bash
npm install
npm run test-login
```

测试脚本会：
- ✅ 以可视化模式运行（可以看到登录过程）
- ✅ 显示详细的步骤日志
- ✅ 登录成功后保持浏览器打开5秒
- ✅ 如果失败，保存截图并保持浏览器打开

### 测试成功的标志

```
✅ Linux.do 登录成功！
✅ CDK 登录成功！
🎉 完整登录流程成功完成！

📝 检查清单：
  [✓] Linux.do 登录成功
  [✓] CDK OAuth 授权成功
  [✓] CDK 网站登录成功

💡 现在可以正常运行 npm start 了！
```

---

## 📊 方案对比

| 对比项 | 传统Cookie方式 | 新的自动登录方式 |
|-------|--------------|----------------|
| **cookie有效期** | 7-30天 | ✅ 每次都是新的，永不过期 |
| **维护频率** | 每月1-4次 | ✅ 无需维护 |
| **配置难度** | 需要F12复制 | ✅ 填写账号密码即可 |
| **配置项数量** | 3个 | 3个 |
| **GitHub Actions** | ✅ 支持 | ✅ 完美支持 |
| **Headless模式** | ✅ 支持 | ✅ 支持 |
| **安全性** | 一般 | ✅ 更安全（密码加密存储） |
| **可靠性** | 经常过期 | ✅ 永不过期 |

---

## ⚠️ 潜在问题与解决方案

### 问题1：Linux.do 有验证码

**症状**：
- 测试时卡在登录页面
- 截图显示验证码图片

**解决方案**：
1. 运行 `npm run test-login` 查看是否有验证码
2. 如果有图片验证码：**无法使用自动登录**，需回退到Cookie方式
3. 如果有滑块验证码：可能需要手动处理一次

**当前状态**：根据测试，Linux.do 通常**没有验证码**，可以直接使用。

### 问题2：Linux.do 启用了2FA（两步验证）

**症状**：
- 登录后要求输入验证码
- 截图显示2FA输入框

**解决方案**：
- **方案A**：关闭2FA（不推荐，安全性降低）
- **方案B**：使用应用专用密码（如果 Linux.do 支持）
- **方案C**：回退到Cookie方式

### 问题3：频繁登录被检测为异常

**症状**：
- 登录时提示"请求过于频繁"
- 账号被临时限制登录

**解决方案**：
- 当前配置：每30分钟运行一次，频率适中
- 如果被限制：修改 `.github/workflows/daily-task.yml` 中的 cron，减少频率
- 建议频率：每1-2小时运行一次

---

## 🔧 故障排查

### 测试失败checklist

- [ ] 检查账号密码是否正确
- [ ] 检查 Linux.do 是否能正常访问
- [ ] 查看截图文件了解失败原因：
  - `images/linux-do-login-failed.png` - Linux.do 登录失败
  - `images/cdk-login-failed.png` - CDK 授权失败
  - `images/auto-login-error.png` - 其他错误
- [ ] 检查网络连接
- [ ] 确认 Linux.do 没有维护

### 常见错误信息

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| Timeout waiting for #login-account-name | 页面加载慢 | 检查网络，增加 timeout |
| Invalid username or password | 账号密码错误 | 检查 .env 配置 |
| Timeout waiting for #toggle-current-user | 登录失败 | 查看截图，可能有验证码 |
| 未找到允许按钮 | 已授权过 | 正常，会自动跳过 |

---

## 🚀 降级机制

程序有智能降级机制：

```
1. 尝试使用账号密码自动登录
   ↓ 失败
2. 尝试使用 Cookie（如果配置了 CDK_COOKIE_STRING）
   ↓ 失败
3. 报错并退出
```

你可以同时配置账号密码和Cookie作为备份：

```env
# 优先使用（推荐）
LINUX_DO_USERNAME=username
LINUX_DO_PASSWORD=password

# 备用方案
CDK_COOKIE_STRING=your_cookie
```

---

## 📈 使用统计

**推荐使用场景** ✅：
- 你有 Linux.do 账号
- Linux.do 没有复杂的验证码
- 希望彻底解决cookie过期问题
- 想要真正的"一劳永逸"

**不推荐使用场景** ❌：
- Linux.do 有复杂验证码（图片/滑块）
- 启用了2FA且不能关闭
- 没有 Linux.do 账号（可以注册一个）

---

## 🎯 总结

### 核心优势

1. **永不过期** - 每次都是新session
2. **零维护** - 配置一次，永久使用
3. **更安全** - 密码加密存储
4. **更可靠** - 不依赖易过期的cookie

### 立即开始

```bash
# 1. 配置账号密码
vim .env

# 2. 测试登录
npm run test-login

# 3. 正式运行
npm start
```

**就这么简单！** 🎉

---

查看快速开始：[QUICK_START.md](QUICK_START.md)
