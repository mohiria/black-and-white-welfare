import { chromium } from 'playwright';
import { config } from '../config.js';
import { parseCookieString, sleep } from './helpers.js';

/**
 * 创建浏览器实例
 * @returns {Promise<Browser>} 浏览器实例
 */
export async function createBrowser() {
  return await chromium.launch({
    headless: config.browser.headless,
    args: config.browser.args
  });
}

/**
 * 创建浏览器上下文
 * @param {Browser} browser - 浏览器实例
 * @param {string} cookieString - Cookie 字符串
 * @returns {Promise<{context: BrowserContext, page: Page}>}
 */
export async function createContext(browser, cookieString) {
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: null // 使用最大化窗口
  });

  // 添加 cookies
  if (cookieString) {
    const cookies = parseCookieString(cookieString);
    await context.addCookies(cookies);
  }

  const page = await context.newPage();
  return { context, page };
}

/**
 * 处理公告弹窗
 * @param {Page} page - 页面对象
 */
export async function handleAnnouncementPopup(page) {
  try {
    console.log('🔍 检查是否有公告弹窗...');

    const announcementPopup = await page.$('//div[@class="announcement-popup"]');

    if (announcementPopup) {
      console.log('✅ 检测到公告弹窗，尝试关闭...');

      const closeButton = await page.$('//button[contains(normalize-space(.), "我知道了")]');

      if (closeButton) {
        console.log('✅ 找到"我知道了"按钮，点击关闭...');
        await closeButton.click();
        await sleep(config.sleepDuration.short);
        console.log('✅ 公告弹窗已关闭');
      } else {
        console.log('⚠️  未找到"我知道了"按钮');
      }
    } else {
      console.log('✅ 未检测到公告弹窗');
    }
  } catch (error) {
    console.error('❌ 处理公告弹窗时出错:', error.message);
  }
}

/**
 * 检查登录状态
 * @param {Page} page - 页面对象
 * @returns {Promise<boolean>} 是否已登录
 */
export async function checkLoginStatus(page) {
  try {
    // 检查是否有登录按钮
    const loginButton = await page.$('text=/登录|登陆|sign in/i');
    if (loginButton) {
      console.log('检测到登录按钮，用户未登录');
      return false;
    }

    // 检查是否有用户信息相关元素
    const userInfo = await page.$('[class*="user"], [class*="avatar"], [class*="profile"]');
    if (userInfo) {
      console.log('检测到用户信息元素，用户已登录');
      return true;
    }

    // 检查页面 URL 是否被重定向到登录页
    const currentUrl = page.url();
    if (currentUrl.includes('login') || currentUrl.includes('signin')) {
      console.log('页面重定向到登录页，用户未登录');
      return false;
    }

    // 如果没有明确的登录标识，假设已登录
    console.log('未检测到明确的登录状态，假设已登录');
    return true;

  } catch (error) {
    console.error('检查登录状态时出错:', error.message);
    return false;
  }
}
