# 更新日志

## [2.0.0] - 重构版本

### ✨ 新增功能
- 模块化架构：将代码拆分为多个独立模块
- 配置管理：统一使用 `.env` 文件管理配置
- 截图管理：所有截图统一保存到 `images/` 目录

### 🔧 改进
- **代码结构优化**
  - 创建 `src/config.js` 配置管理模块
  - 创建 `src/utils/` 工具模块目录
    - `helpers.js` - 通用辅助函数
    - `browser.js` - 浏览器相关工具
  - 创建 `src/tasks/` 任务模块目录
    - `salary.js` - 领取每日工资
    - `wheel.js` - 幸运转盘
    - `redeem.js` - CDK 兑换

- **配置管理统一**
  - 移除 `config/` 目录，改用 `.env` 文件
  - Cookie 和 API Key 统一从环境变量读取
  - 提供配置验证功能

- **文件管理优化**
  - 创建 `images/` 目录统一存放截图
  - 更新 `.gitignore` 忽略规则
  - 添加 `.gitkeep` 确保空目录可提交

### 🗑️ 移除
- 删除旧版 `src/index-old.js` 文件
- 移除 `config/` 目录相关代码
- 清理无效的配置路径常量

### 📝 文档更新
- 更新 `PROJECT_STRUCTURE.md` 项目结构文档
- 添加截图文件说明
- 更新使用方法和故障排查指南

### 🔄 迁移指南

从旧版本迁移到新版本：

1. **创建 `.env` 文件**
   ```bash
   cp .env.example .env
   ```

2. **配置环境变量**
   ```env
   CDK_COOKIE_STRING=your_cookie_here
   AI_API_KEY=your_api_key_here
   ```

3. **运行新版本**
   ```bash
   node src/index.js
   ```

### ⚠️ 破坏性变更
- 不再支持从 `config/` 目录读取配置文件
- 必须使用 `.env` 文件配置 Cookie 和 API Key

---

## [1.0.0] - 初始版本

### 功能
- 自动领取每日工资
- 自动使用幸运转盘
- 自动兑换 CDK 码
- 支持多种 Cookie 配置方式
- 浏览器自动化操作
