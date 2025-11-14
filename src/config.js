import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

/**
 * 应用配置
 */
export const config = {
  // CDK 站点配置
  cdk: {
    url: 'https://cdk.hybgzs.com/'
  },

  // AI 站点配置
  ai: {
    url: 'https://ai.hybgzs.com/',
    apiKey: process.env.AI_API_KEY || '',
    redeemUrl: process.env.AI_REDEEM_URL || 'https://ai.hybgzs.com/api/user/topup'
  },

  // 浏览器配置
  browser: {
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
  },

  // 文件路径配置
  paths: {
    cdkFile: './tmp/cdk.txt'
  },

  // 其他配置
  maxSpins: 10, // 幸运转盘最大抽奖次数
  timeout: 30000, // 页面加载超时时间（毫秒）
  sleepDuration: {
    short: 2000,
    medium: 5000,
    long: 8000
  }
};

/**
 * 验证必需的配置项
 */
export function validateConfig() {
  const errors = [];

  // 检查 Linux.do 账号密码（必需）
  if (!process.env.LINUX_DO_USERNAME || !process.env.LINUX_DO_PASSWORD) {
    errors.push('❌ 缺少 Linux.do 登录凭证');
    errors.push('   请配置: LINUX_DO_USERNAME 和 LINUX_DO_PASSWORD');
  }

  if (!config.ai.apiKey) {
    errors.push('❌ 缺少环境变量: AI_API_KEY');
  }

  if (errors.length > 0) {
    console.error('\n配置验证失败:');
    errors.forEach(error => console.error(error));
    console.error('\n请在 .env 文件中配置必需的环境变量');
    return false;
  }

  console.log('✅ 使用 Linux.do 账号密码自动登录');
  return true;
}
