import { validateConfig } from './config.js';
import { createBrowser, handleAnnouncementPopup } from './utils/browser.js';
import { autoOAuthFlow } from './utils/autoLogin.js';
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

    // 使用 Linux.do 账号密码自动登录
    console.log('🔐 使用 Linux.do 账号密码自动登录...\n');

    const autoLoginResult = await autoOAuthFlow(
      browser,
      process.env.LINUX_DO_USERNAME,
      process.env.LINUX_DO_PASSWORD
    );

    if (!autoLoginResult.success) {
      console.error('❌ 自动登录失败，脚本终止执行');
      process.exit(1);
    }

    // 自动登录成功，使用返回的上下文和页面
    context = autoLoginResult.context;
    const page = autoLoginResult.page;

    console.log('✅ 自动登录成功，开始执行任务...\n');

    // 处理公告弹窗
    await handleAnnouncementPopup(page);

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
    const redeemResult = await redeemCDK();

    console.log('\n🎉 所有任务执行完成！');

    // 如果有兑换失败的 CDK，返回失败状态码
    if (redeemResult && redeemResult.failCount > 0) {
      console.error('\n⚠️  存在兑换失败的 CDK，退出码: 1');
      process.exit(1);
    }

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
