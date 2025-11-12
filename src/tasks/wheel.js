import { config } from '../config.js';
import { sleep, appendCDKToFile, getAbsolutePath } from '../utils/helpers.js';

/**
 * 使用幸运转盘
 * @param {Page} page - 页面对象
 */
export async function claimLuckyWheel(page) {
  console.log('\n🎰 开始使用幸运转盘...');

  try {
    await sleep(config.sleepDuration.medium);

    // 检查剩余次数
    try {
      const remainingSpinsElement = await page.$('//small[@id="wheelRemainingSpinsText"]');
      if (remainingSpinsElement) {
        const remainingText = await remainingSpinsElement.textContent();
        const match = remainingText.match(/(\d+)\/(\d+)/);

        if (match) {
          const remaining = match[1];
          const total = match[2];
          console.log(`幸运转盘剩余次数: ${remaining}/${total}`);

          if (remaining === '0') {
            console.log('✅ 幸运转盘今日次数已用完，跳过');
            return;
          }
        }
      }
    } catch (err) {
      console.log('未找到剩余次数元素，继续尝试');
    }

    // 导航到幸运转盘页面
    console.log('步骤1: 导航到幸运转盘页面...');
    await page.goto('https://cdk.hybgzs.com/wheel.php', {
      waitUntil: 'networkidle',
      timeout: config.timeout
    });
    await sleep(config.sleepDuration.medium);

    const cdkFilePath = getAbsolutePath(config.paths.cdkFile);
    let spinCount = 0;

    // 循环抽奖
    while (spinCount < config.maxSpins) {
      spinCount++;
      console.log(`\n第 ${spinCount} 次抽奖...`);

      // 检查是否已经没有次数了
      const disabledMessage = await page.$('//div[@class="disabled-message"]');
      if (disabledMessage) {
        console.log('✅ 检测到次数已用完，幸运转盘结束');
        break;
      }

      // 点击抽奖按钮
      const luckyDiv = await page.$('//div[@id="my-lucky"]');
      if (!luckyDiv) {
        console.log('⚠️  未找到抽奖按钮 #my-lucky');
        await page.screenshot({ path: 'images/lucky-div-not-found.png' });
        break;
      }

      console.log('✅ 找到抽奖按钮，点击中心位置...');
      const box = await luckyDiv.boundingBox();
      if (box) {
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      } else {
        await luckyDiv.click();
      }

      // 等待弹窗出现
      await sleep(config.sleepDuration.long);

      // 检查弹窗类型
      const continueButton = await page.$("//div[@class='reward-popup']//button[contains(normalize-space(.), '继续参与')]");

      if (continueButton) {
        console.log('✅ 检测到"继续参与"按钮，点击继续...');
        await continueButton.click();
        await sleep(config.sleepDuration.medium);
        continue;
      }

      // 读取 CDK 码
      const cdkElement = await page.$("//div[@id='cdk-0']");
      if (cdkElement) {
        const cdkText = await cdkElement.textContent();
        console.log('✅ 获得 CDK 码:', cdkText);

        // 写入到文件
        try {
          appendCDKToFile(cdkFilePath, cdkText);
          console.log('✅ CDK 码已保存到:', cdkFilePath);
        } catch (writeError) {
          console.error('❌ 保存 CDK 码失败:', writeError.message);
        }

        // 点击"确认收下"按钮
        const copyCloseButton = await page.$("//div[@class='reward-popup']//button[contains(normalize-space(.), '确认收下')]");
        if (copyCloseButton) {
          console.log('✅ 点击"确认收下"按钮...');
          await copyCloseButton.click();
          await sleep(config.sleepDuration.short);
        } else {
          console.log('⚠️  未找到"确认收下"按钮');
          // 尝试关闭弹窗的其他方式
          const closeButton = await page.$('//div[@class="reward-popup"]//button');
          if (closeButton) {
            await closeButton.click();
            await sleep(config.sleepDuration.short);
          }
        }
      } else {
        console.log('⚠️  未找到 CDK 元素和继续参与按钮，跳出循环');
        await page.screenshot({ path: 'images/lucky-wheel-unknown-popup.png' });
        break;
      }
    }

    if (spinCount >= config.maxSpins) {
      console.log('⚠️  已达到最大抽奖次数限制');
    }

    console.log('✅ 幸运转盘流程完成！');

  } catch (error) {
    console.error('❌ 使用幸运转盘失败:', error.message);
    try {
      await page.screenshot({ path: 'images/lucky-wheel-error.png' });
      console.log('📸 已保存错误截图到 images/lucky-wheel-error.png');
    } catch (e) {
      console.error('保存截图失败:', e.message);
    }
  }
}
