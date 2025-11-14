import { chromium } from 'playwright';
import { config } from '../config.js';
import { sleep } from './helpers.js';

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
