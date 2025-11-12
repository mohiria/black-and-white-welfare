import { config, validateConfig } from './config.js';
import { sleep } from './utils/helpers.js';
import { createBrowser, createContext, handleAnnouncementPopup, checkLoginStatus } from './utils/browser.js';
import { claimDailySalary } from './tasks/salary.js';
import { claimLuckyWheel } from './tasks/wheel.js';
import { redeemCDK } from './tasks/redeem.js';

/**
 * 主函数：执行自动化任务
 */
async function main() {
  console.log('🚀 开始执行自动化任务...\n');

  // 验证配置
  if (!validateConfig()) {
    process.exit(1);
  }

  console.log('✅ 配置验证通过\n');

  let browser = null;
  let context = null;

  try {
    // 创建浏览器实例
    browser = await createBrowser();

    // 创建 CDK 站点上下文
    const result = await createContext(browser, config.cdk.cookie);
    context = result.context;
    const page = result.page;

    // 访问 CDK 站点
    console.log('🌐 正在访问网站:', config.cdk.url);
    await page.goto(config.cdk.url, {
      waitUntil: 'networkidle',
      timeout: config.timeout
    });

    // 等待页面加载
    await sleep(config.sleepDuration.long);

    // 处理公告弹窗
    await handleAnnouncementPopup(page);

    // 检查登录状态
    const isLoggedIn = await checkLoginStatus(page);

    if (!isLoggedIn) {
      console.error('❌ 登录失败，请检查 CDK_COOKIE_STRING 是否有效');
      await page.screenshot({ path: 'images/login-failed.png' });
      return;
    }

    console.log('✅ 登录成功！');

    // 任务1: 领取每日工资
    await claimDailySalary(page);

    // 任务2: 使用幸运转盘
    await claimLuckyWheel(page);

    // 关闭 CDK 站点的页面和上下文
    console.log('\n🔒 关闭 CDK 站点页面...');
    await page.close();
    await context.close();
    console.log('✅ CDK 站点页面已关闭');

    // 任务3: 兑换 CDK 码（通过 API 接口）
    await redeemCDK();

    console.log('\n🎉 所有任务执行完成！');

  } catch (error) {
    console.error('❌ 执行过程中发生错误:', error.message);

    // 保存错误截图
    try {
      if (context) {
        const page = context.pages()[0];
        if (page) {
          await page.screenshot({ path: 'images/error-screenshot.png' });
          console.log('📸 已保存错误截图');
        }
      }
    } catch (screenshotError) {
      console.error('保存截图失败:', screenshotError.message);
    }

    throw error;
  } finally {
    // 关闭浏览器
    if (browser) {
      await browser.close();
    }
  }
}

// 执行主函数
main().catch(error => {
  console.error('程序执行失败:', error);
  process.exit(1);
});
