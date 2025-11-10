import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://cdk.hybgzs.com/';
const COOKIES_PATH = path.join(__dirname, '../../config/cookies.json');

/**
 * 保存 cookies 的脚本
 * 运行这个脚本会打开浏览器，让你手动登录，然后保存 cookies
 */
async function saveCookies() {
  console.log('🚀 启动浏览器，准备保存 cookies...');
  console.log('📌 请在打开的浏览器中手动登录网站');

  const browser = await chromium.launch({
    headless: false, // 非 headless 模式，显示浏览器窗口
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  try {
    // 访问网站
    console.log('🌐 正在访问网站:', SITE_URL);
    await page.goto(SITE_URL, { waitUntil: 'networkidle' });

    console.log('\n⏳ 请在浏览器中完成登录操作...');
    console.log('✋ 登录完成后，请按 Enter 键继续...\n');

    // 等待用户按下 Enter
    await waitForUserInput();

    // 获取 cookies
    const cookies = await context.cookies();

    // 确保目录存在
    const configDir = path.dirname(COOKIES_PATH);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // 保存 cookies
    fs.writeFileSync(COOKIES_PATH, JSON.stringify(cookies, null, 2));

    console.log('✅ Cookies 已成功保存到:', COOKIES_PATH);
    console.log('📊 保存的 cookies 数量:', cookies.length);

    // 显示保存的 cookie 名称
    console.log('\n保存的 cookie 信息:');
    cookies.forEach(cookie => {
      console.log(`  - ${cookie.name}: ${cookie.value.substring(0, 20)}...`);
    });

  } catch (error) {
    console.error('❌ 保存 cookies 时发生错误:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * 等待用户输入
 */
function waitForUserInput() {
  return new Promise((resolve) => {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.on('line', () => {
      rl.close();
      resolve();
    });
  });
}

// 执行保存 cookies
saveCookies().catch(error => {
  console.error('程序执行失败:', error);
  process.exit(1);
});
