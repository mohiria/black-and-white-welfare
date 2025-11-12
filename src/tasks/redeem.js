import { config } from '../config.js';
import { sleep, readCDKFile, writeCDKFile, clearFile, getAbsolutePath } from '../utils/helpers.js';

/**
 * 兑换 CDK 码（通过 API 接口）
 */
export async function redeemCDK() {
  console.log('\n💎 开始兑换 CDK 码...');

  try {
    const cdkFilePath = getAbsolutePath(config.paths.cdkFile);

    // 读取 CDK 文件
    const cdkLines = readCDKFile(cdkFilePath);

    if (cdkLines.length === 0) {
      console.log('⚠️  CDK 文件为空，跳过兑换');
      return;
    }

    console.log(`📋 共找到 ${cdkLines.length} 个 CDK 码待兑换`);

    // 验证 API Key
    if (!config.ai.apiKey) {
      console.error('❌ 未找到 AI_API_KEY 环境变量，无法进行兑换');
      return;
    }

    console.log('📝 已加载 API Key');

    // 记录兑换结果
    const results = [];

    // 循环兑换每个 CDK
    for (let i = 0; i < cdkLines.length; i++) {
      const cdk = cdkLines[i];
      console.log(`\n[${i + 1}/${cdkLines.length}] 兑换 CDK: ${cdk}`);

      try {
        // 调用兑换接口
        const response = await fetch(config.ai.redeemUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.ai.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ key: cdk })
        });

        const data = await response.json();

        // 根据 success 字段判断是否成功
        if (data.success === true) {
          const amount = data.data || 0;
          console.log(`✅ 兑换成功! 获得: ${amount}`);
          results.push({ cdk, success: true });
        } else {
          const errorMsg = data.message || '兑换失败';
          console.log(`❌ 兑换失败: ${errorMsg}`);
          results.push({ cdk, success: false, reason: errorMsg });
        }

      } catch (err) {
        console.error(`❌ 兑换 CDK ${cdk} 时出错:`, err.message);
        results.push({ cdk, success: false, reason: err.message });
      }

      // 等待一下再处理下一个
      await sleep(config.sleepDuration.short);
    }

    // 统计兑换结果
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log('\n📊 兑换结果统计:');
    console.log(`✅ 成功: ${successCount}/${cdkLines.length}`);
    console.log(`❌ 失败: ${failCount}/${cdkLines.length}`);

    // 只有全部成功才清空文件
    if (failCount === 0) {
      console.log('\n✅ 所有 CDK 兑换成功，清空文件...');
      clearFile(cdkFilePath);
      console.log('✅ CDK 文件已清空');
    } else {
      console.log('\n⚠️  部分 CDK 兑换失败，保留文件内容');
      console.log('失败的 CDK:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.cdk}: ${r.reason}`);
      });

      // 将失败的 CDK 写回文件
      const failedCdks = results.filter(r => !r.success).map(r => r.cdk);
      if (failedCdks.length > 0) {
        writeCDKFile(cdkFilePath, failedCdks);
        console.log('✅ 已将失败的 CDK 写回文件');
      }
    }

  } catch (error) {
    console.error('❌ 兑换 CDK 失败:', error.message);
  }
}
