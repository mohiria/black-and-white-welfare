import { config } from '../config.js';
import { sleep, appendCDKToFile, getAbsolutePath, getCDKElement, cleanCDKText } from '../utils/helpers.js';

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

      // 查找抽奖按钮，如果未找到则滚动页面查找
      let luckyDiv = await page.$("//div[@id='my-lucky']");

      if (!luckyDiv) {
        console.log('⚠️  未在当前视图找到抽奖按钮，开始滚动查找...');
        let scrollAttempts = 0;
        const maxScrollAttempts = 10;
        let previousHeight = 0;

        while (!luckyDiv && scrollAttempts < maxScrollAttempts) {
          // 滚动页面
          await page.evaluate(() => window.scrollBy(0, 500));
          await sleep(config.sleepDuration.short);

          // 再次查找元素
          luckyDiv = await page.$("//div[@id='my-lucky']");

          // 检查是否已滚动到底部
          const currentHeight = await page.evaluate(() => window.pageYOffset);
          if (currentHeight === previousHeight) {
            // 页面无法继续滚动，说明已到达底部
            console.log('❌ 已滚动到页面底部，仍未找到抽奖按钮 #my-lucky');
            await page.screenshot({ path: 'images/lucky-div-not-found.png' });
            throw new Error('未找到抽奖按钮 #my-lucky，工作流失败');
          }

          previousHeight = currentHeight;
          scrollAttempts++;
        }

        if (luckyDiv) {
          console.log(`✅ 滚动后找到抽奖按钮（尝试 ${scrollAttempts} 次）`);
        }
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

      // 等待弹窗完全显示（确保动画完成）
      try {
        await page.waitForSelector("//div[@class='reward-popup']", {
          state: 'visible',
          timeout: 5000
        });
        console.log('✅ 弹窗已显示');
      } catch (e) {
        console.log('⚠️  未检测到弹窗，继续尝试...');
      }

      // 额外等待确保弹窗内容完全渲染（headless模式需要）
      await sleep(1000);

      // 检查弹窗类型
      let continueButton = null;
      try {
        continueButton = await page.waitForSelector(
          "//div[@class='reward-popup']//button[contains(normalize-space(.), '继续参与')]",
          { state: 'visible', timeout: 3000 }
        );
      } catch (e) {
        console.log('未找到"继续参与"按钮，检查是否为CDK弹窗...');
      }

      if (continueButton) {
        console.log('✅ 检测到"继续参与"按钮，点击继续...');
        await continueButton.click();
        await sleep(config.sleepDuration.medium);
        continue;
      }

      // 读取 CDK 码
      const { element: cdkElement, method } = await getCDKElement(page);

      if (cdkElement) {
        console.log(`✅ 通过 ${method} 定位找到 CDK 元素`);

        const cdkTextRaw = await cdkElement.textContent();
        console.log('原始 CDK 内容:', cdkTextRaw);

        // 清理 CDK 码：移除 emoji、换行符、空白字符等
        const cdkText = cleanCDKText(cdkTextRaw);
        console.log('✅ 获得 CDK 码:', cdkText);

        // 写入到文件
        try {
          appendCDKToFile(cdkFilePath, cdkText);
          console.log('✅ CDK 码已保存到:', cdkFilePath);
        } catch (writeError) {
          console.error('❌ 保存 CDK 码失败:', writeError.message);
        }

        // 点击"确认收下"按钮
        try {
          const copyCloseButton = await page.waitForSelector(
            "//div[@class='reward-popup']//button[contains(normalize-space(.), '确认收下')]",
            { state: 'visible', timeout: 3000 }
          );
          if (copyCloseButton) {
            console.log('✅ 点击"确认收下"按钮...');
            await copyCloseButton.click();
            await sleep(config.sleepDuration.short);
          }
        } catch (e) {
          console.log('⚠️  未找到"确认收下"按钮');
          // 尝试关闭弹窗的其他方式
          try {
            const closeButton = await page.waitForSelector(
              '//div[@class="reward-popup"]//button',
              { state: 'visible', timeout: 2000 }
            );
            if (closeButton) {
              await closeButton.click();
              await sleep(config.sleepDuration.short);
            }
          } catch (e2) {
            console.log('⚠️  也未找到其他关闭按钮');
          }
        }
      } else {
        // 未找到CDK和继续参与按钮，尝试重新查找5次
        console.log('⚠️  未找到 CDK 元素和继续参与按钮，开始重试...');
        let retryCount = 0;
        const maxRetries = 5;
        let foundElement = false;

        while (retryCount < maxRetries && !foundElement) {
          retryCount++;
          console.log(`第 ${retryCount} 次重试查找 CDK 或继续参与按钮...`);
          await sleep(config.sleepDuration.medium);

          // 重新检查继续参与按钮（使用waitForSelector）
          try {
            const retryContiuneButton = await page.waitForSelector(
              "//div[@class='reward-popup']//button[contains(normalize-space(.), '继续参与')]",
              { state: 'visible', timeout: 2000 }
            );
            if (retryContiuneButton) {
              console.log('✅ 重试后找到"继续参与"按钮');
              await retryContiuneButton.click();
              await sleep(config.sleepDuration.medium);
              foundElement = true;
              continue;
            }
          } catch (e) {
            // 继续查找CDK元素
          }

          // 重新检查CDK元素
          const { element: retryCdkElement, method: retryMethod } = await getCDKElement(page);
          if (retryCdkElement) {
            console.log(`✅ 重试后通过 ${retryMethod} 找到 CDK 元素`);
            foundElement = true;

            const cdkTextRaw = await retryCdkElement.textContent();
            const cdkText = cleanCDKText(cdkTextRaw);
            console.log('✅ 获得 CDK 码:', cdkText);

            try {
              appendCDKToFile(cdkFilePath, cdkText);
              console.log('✅ CDK 码已保存到:', cdkFilePath);
            } catch (writeError) {
              console.error('❌ 保存 CDK 码失败:', writeError.message);
            }

            try {
              const copyCloseButton = await page.waitForSelector(
                "//div[@class='reward-popup']//button[contains(normalize-space(.), '确认收下')]",
                { state: 'visible', timeout: 2000 }
              );
              if (copyCloseButton) {
                await copyCloseButton.click();
                await sleep(config.sleepDuration.short);
              }
            } catch (e) {
              console.log('⚠️  未找到"确认收下"按钮');
            }
          }
        }

        // 如果5次重试后仍未找到，刷新页面继续下一次循环
        if (!foundElement) {
          console.log('⚠️  重试5次后仍未找到 CDK 或继续参与按钮，刷新页面...');
          await page.screenshot({ path: 'images/lucky-wheel-unknown-popup.png' });
          await page.reload({ waitUntil: 'networkidle', timeout: config.timeout });
          await sleep(config.sleepDuration.medium);
          console.log('✅ 页面已刷新，继续下一次循环');
          continue;
        }
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
