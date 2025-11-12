# 项目结构说明

## 📁 目录结构

```
black-and-white-welfare/
├── src/
│   ├── index.js              # 主入口文件 ⭐
│   ├── config.js             # 配置管理
│   ├── utils/                # 工具模块
│   │   ├── helpers.js        # 辅助函数（文件操作、时间等）
│   │   └── browser.js        # 浏览器相关工具
│   └── tasks/                # 任务模块
│       ├── salary.js         # 领取每日工资
│       ├── wheel.js          # 幸运转盘
│       └── redeem.js         # CDK 兑换
├── images/                   # 截图文件目录 ⭐
├── tmp/                      # 临时文件目录
│   └── cdk.txt               # CDK 码存储文件
├── .env                      # 环境变量配置（需自行创建）
├── .env.example              # 环境变量配置示例
├── .gitignore                # Git 忽略规则
├── PROJECT_STRUCTURE.md      # 项目结构文档
└── package.json              # 项目依赖

```

## 🔧 配置说明

### 1. 环境变量配置

复制 `.env.example` 为 `.env`，并填写必需的配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# CDK 站点 Cookie（必需）
CDK_COOKIE_STRING=your_cookie_here

# AI 站点 API Key（必需）
AI_API_KEY=your_api_key_here

# AI 站点兑换接口 URL（可选）
AI_REDEEM_URL=https://ai.hybgzs.com/api/user/topup

# 浏览器无头模式（可选，默认 false）
HEADLESS=false
```

### 2. 获取 Cookie 和 API Key

#### 获取 CDK_COOKIE_STRING

1. 使用浏览器访问 https://cdk.hybgzs.com/
2. 登录后打开开发者工具（F12）
3. 切换到 Network 标签
4. 刷新页面
5. 找到请求头中的 Cookie 字段，复制完整值

#### 获取 AI_API_KEY

1. 访问 AI 站点获取 API Key
2. 将 API Key 填入 .env 文件

## 🚀 使用方法

```bash
node src/index.js
```

## 📦 模块说明

### config.js - 配置管理

统一管理所有配置项，包括：
- CDK 站点配置
- AI 站点配置
- 浏览器配置
- 文件路径配置
- 其他运行参数

提供配置验证功能，确保必需的环境变量已配置。

### utils/helpers.js - 工具函数

提供通用的辅助函数：
- `sleep()` - 延时等待
- `parseCookieString()` - Cookie 字符串解析
- `readCDKFile()` - 读取 CDK 文件
- `appendCDKToFile()` - 追加 CDK 到文件
- `writeCDKFile()` - 写入 CDK 文件
- `clearFile()` - 清空文件
- `ensureDirectoryExists()` - 确保目录存在
- `getAbsolutePath()` - 获取绝对路径

### utils/browser.js - 浏览器工具

提供浏览器相关的功能：
- `createBrowser()` - 创建浏览器实例
- `createContext()` - 创建浏览器上下文
- `handleAnnouncementPopup()` - 处理公告弹窗
- `checkLoginStatus()` - 检查登录状态

### tasks/ - 任务模块

每个任务独立成一个模块：

#### salary.js - 领取每日工资
1. 点击工资按钮
2. 读取 CDK 码
3. 保存到文件
4. 关闭弹窗

#### wheel.js - 幸运转盘
1. 检查剩余次数
2. 循环抽奖
3. 保存 CDK 码
4. 处理弹窗

#### redeem.js - CDK 兑换
1. 读取 CDK 文件
2. 通过 API 逐个兑换
3. 统计结果
4. 更新文件（只保留失败的）

## 📊 执行流程

1. **配置验证** - 检查必需的环境变量
2. **创建浏览器** - 启动并最大化浏览器窗口
3. **访问 CDK 站点** - 加载 Cookie，访问首页
4. **处理弹窗** - 自动关闭公告弹窗
5. **检查登录** - 验证登录状态
6. **领取工资** - 获取每日工资 CDK
7. **幸运转盘** - 循环抽奖获取 CDK
8. **关闭页面** - 关闭 CDK 站点
9. **兑换 CDK** - 通过 API 接口兑换
10. **完成任务** - 关闭浏览器

## 📸 截图说明

所有截图文件统一保存在 `images/` 目录下：

- `login-failed.png` - 登录失败截图
- `error-screenshot.png` - 程序错误截图
- `wage-button-not-found.png` - 工资按钮未找到
- `cdk-element-not-found.png` - CDK 元素未找到
- `copy-close-button-not-found.png` - 复制关闭按钮未找到
- `claim-salary-error.png` - 领取工资错误
- `lucky-div-not-found.png` - 幸运转盘按钮未找到
- `lucky-wheel-unknown-popup.png` - 未知弹窗
- `lucky-wheel-error.png` - 幸运转盘错误

这些截图有助于调试和排查问题。

## 💡 优势

### 代码结构优化
- ✅ 模块化设计，职责清晰
- ✅ 易于维护和扩展
- ✅ 代码复用性高

### 配置管理
- ✅ 统一使用 .env 配置
- ✅ 配置验证机制
- ✅ 支持默认值

### 错误处理
- ✅ 完善的错误捕获
- ✅ 详细的日志输出
- ✅ 自动截图保存到 images/ 目录

## 🐛 故障排查

### Cookie 失效
- 重新从浏览器获取 Cookie
- 更新 .env 中的 CDK_COOKIE_STRING

### API Key 无效
- 检查 AI_API_KEY 是否正确
- 确认 API 接口 URL 是否正确

### 兑换失败
- 查看日志中的具体错误信息
- 检查 CDK 码是否有效
- 确认 API Key 权限
- 查看 images/ 目录中的错误截图

## 📝 注意事项

1. 不要提交 `.env` 文件到版本控制
2. 不要提交 `images/` 目录到版本控制（已在 .gitignore 中配置）
3. 定期更新 Cookie 避免过期
4. CDK 兑换失败会保留在文件中，下次运行会重试
5. 建议在本地测试无误后再部署到服务器
6. 所有截图自动保存在 `images/` 目录，便于统一管理
