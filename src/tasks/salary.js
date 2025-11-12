import { config } from '../config.js';
import { sleep, appendCDKToFile, getAbsolutePath } from '../utils/helpers.js';

/**
 * 领取每日工资
 * @param {Page} page - 页面对象
 */
export async function claimDailySalary(page) {
  console.log('\n💰 开始领取每日工资...');

  try {
    await sleep(config.sleepDuration.medium);

    // 检查工资是否已领取
    console.log('检查工资领取状态...');
    const claimedButton = await page.$('//button[@class="btn btn-outline-secondary btn-claimed"]');

    if (claimedButton) {
      console.log('✅ 今日工资已领取，跳过领取任务');
      return;
    }

    // 步骤1: 点击工资按钮
    console.log('步骤1: 查找并点击工资按钮...');
    const wageButton = await page.$('//button[@class="wage-button"]');

    if (!wageButton) {
      console.log('⚠️  未找到工资按钮，可能已经领取或页面结构不同');
      await page.screenshot({ path: 'images/wage-button-not-found.png' });
      return;
    }

    const isVisible = await wageButton.isVisible();
    if (!isVisible) {
      console.log('⚠️  工资按钮不可见');
      return;
    }

    console.log('✅ 找到工资按钮，点击...');
    await wageButton.click();
    await sleep(config.sleepDuration.medium);

    // 步骤2: 读取 CDK 码
    console.log('步骤2: 读取 CDK 码...');
    const cdkElement = await page.$('//div[@class="cdk-single"]');

    if (!cdkElement) {
      console.log('⚠️  未找到 CDK 元素');
      await page.screenshot({ path: 'images/cdk-element-not-found.png' });
      return;
    }

    const cdkText = await cdkElement.textContent();
    console.log('✅ 获得每日工资 CDK 码:', cdkText);

    // 步骤3: 保存 CDK 码到文件
    const cdkFilePath = getAbsolutePath(config.paths.cdkFile);
    try {
      appendCDKToFile(cdkFilePath, cdkText);
      console.log('✅ CDK 码已追加保存到:', cdkFilePath);
    } catch (writeError) {
      console.error('❌ 保存 CDK 码失败:', writeError.message);
    }

    // 步骤4: 点击"复制并关闭"按钮
    console.log('步骤4: 查找并点击"复制并关闭"按钮...');
    const copyCloseButton = await page.$('//div[@class="reward-popup"]//button[contains(normalize-space(.), "复制并关闭")]');

    if (!copyCloseButton) {
      console.log('⚠️  未找到"复制并关闭"按钮');
      await page.screenshot({ path: 'images/copy-close-button-not-found.png' });
      return;
    }

    console.log('✅ 找到"复制并关闭"按钮，点击...');
    await copyCloseButton.click();
    await sleep(config.sleepDuration.short);

    console.log('✅ 每日工资领取流程完成！');

  } catch (error) {
    console.error('❌ 领取每日工资失败:', error.message);
    try {
      await page.screenshot({ path: 'images/claim-salary-error.png' });
      console.log('📸 已保存错误截图到 images/claim-salary-error.png');
    } catch (e) {
      console.error('保存截图失败:', e.message);
    }
  }
}
