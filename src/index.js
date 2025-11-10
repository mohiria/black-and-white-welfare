import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://cdk.hybgzs.com/';
const COOKIES_PATH = path.join(__dirname, '../config/cookies.json');
const COOKIE_STRING_PATH = path.join(__dirname, '../config/cookie.txt');

/**
 * 将 cookie 字符串解析为 Playwright 格式
 */
function parseCookieString(cookieString) {
  const cookies = [];
  const pairs = cookieString.split(';').map(s => s.trim());

  for (const pair of pairs) {
    const [name, value] = pair.split('=');
    if (name && value) {
      cookies.push({
        name: name.trim(),
        value: value.trim(),
        domain: '.hybgzs.com',
        path: '/',
        expires: -1,
        httpOnly: false,
        secure: true,
        sameSite: 'Lax'
      });
    }
  }

  return cookies;
}

/**
 * 加载保存的 cookies（支持多种方式）
 * 优先级：环境变量 COOKIE_STRING > 环境变量 COOKIES_JSON > cookie.txt > cookies.json
 */
function loadCookies() {
  try {
    // 1. 优先从环境变量 COOKIE_STRING 读取（简单字符串格式）
    if (process.env.COOKIE_STRING) {
      console.log('📌 从环境变量 COOKIE_STRING 加载 cookies');
      return parseCookieString(process.env.COOKIE_STRING);
    }

    // 2. 从环境变量 COOKIES_JSON 读取（JSON 格式）
    if (process.env.COOKIES_JSON) {
      console.log('📌 从环境变量 COOKIES_JSON 加载 cookies');
      return JSON.parse(process.env.COOKIES_JSON);
    }

    // 3. 从 cookie.txt 文件读取（简单字符串格式）
    if (fs.existsSync(COOKIE_STRING_PATH)) {
      console.log('📌 从文件加载 cookies:', COOKIE_STRING_PATH);
      const cookieString = fs.readFileSync(COOKIE_STRING_PATH, 'utf-8').trim();
      return parseCookieString(cookieString);
    }

    // 4. 从 cookies.json 文件读取（JSON 格式）
    if (fs.existsSync(COOKIES_PATH)) {
      console.log('📌 从文件加载 cookies:', COOKIES_PATH);
      return JSON.parse(fs.readFileSync(COOKIES_PATH, 'utf-8'));
    }

    console.warn('⚠️  未找到 cookies 配置');
  } catch (error) {
    console.error('❌ 读取 cookies 失败:', error.message);
  }
  return null;
}

/**
 * 等待指定时间
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 主函数：执行自动化任务
 */
async function main() {
  console.log('🚀 开始执行自动化任务...');

  const browser = await chromium.launch({
    headless: true, // GitHub Actions 中使用 headless 模式
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  try {
    // 加载 cookies
    const cookies = loadCookies();
    if (cookies) {
      console.log('📝 加载 cookies 并尝试登录...');
      await context.addCookies(cookies);
    } else {
      console.warn('⚠️  未找到 cookies 文件，可能需要手动登录');
    }

    const page = await context.newPage();

    // 访问网站
    console.log('🌐 正在访问网站:', SITE_URL);
    await page.goto(SITE_URL, { waitUntil: 'networkidle', timeout: 30000 });

    // 等待页面加载
    await sleep(3000);

    // 检查是否成功登录
    const isLoggedIn = await checkLoginStatus(page);

    if (!isLoggedIn) {
      console.error('❌ 登录失败，请检查 cookies 是否有效');
      await page.screenshot({ path: 'login-failed.png' });
      return;
    }

    console.log('✅ 登录成功！');

    // 任务1: 领取每日工资
    await claimDailySalary(page);

    // 任务2: 使用幸运转盘
    await claimLuckyWheel(page);

    console.log('🎉 所有任务执行完成！');

  } catch (error) {
    console.error('❌ 执行过程中发生错误:', error.message);

    // 保存错误截图
    try {
      const page = context.pages()[0];
      if (page) {
        await page.screenshot({ path: 'error-screenshot.png' });
        console.log('📸 已保存错误截图');
      }
    } catch (screenshotError) {
      console.error('保存截图失败:', screenshotError.message);
    }

    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * 检查登录状态
 */
async function checkLoginStatus(page) {
  try {
    // 常见的登录检查方式：
    // 1. 检查是否存在登录按钮（如果存在说明未登录）
    // 2. 检查是否存在用户信息元素
    // 3. 检查特定的已登录标识

    // 方法1: 检查是否有登录/注册按钮
    const loginButton = await page.$('text=/登录|登陆|sign in/i');
    if (loginButton) {
      console.log('检测到登录按钮，用户未登录');
      return false;
    }

    // 方法2: 检查是否有用户信息相关元素
    const userInfo = await page.$('[class*="user"], [class*="avatar"], [class*="profile"]');
    if (userInfo) {
      console.log('检测到用户信息元素，用户已登录');
      return true;
    }

    // 方法3: 检查页面 URL 是否被重定向到登录页
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

/**
 * 领取每日工资
 */
async function claimDailySalary(page) {
  console.log('\n💰 开始领取每日工资...');

  try {
    // 等待页面加载完成
    await sleep(2000);

    // 首先检查是否已经领取过
    try {
      const claimedButton = await page.$('//button[@class="btn btn-outline-secondary btn-claimed"]');
      if (claimedButton) {
        const buttonText = await claimedButton.textContent();
        if (buttonText && buttonText.includes('今日已领取')) {
          console.log('✅ 今日工资已经领取过了，跳过');
          return;
        }
      }
    } catch (err) {
      // 没找到"已领取"按钮，继续尝试领取
    }

    // 尝试多种可能的选择器
    const selectors = [
      'text=/每日工资|日工资|签到|daily.*salary/i',
      'button:has-text("每日工资")',
      'a:has-text("每日工资")',
      '[class*="daily"], [class*="salary"], [class*="sign"]',
      'button[class*="claim"], button[class*="receive"]'
    ];

    let clicked = false;

    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          // 检查元素是否可见
          const isVisible = await element.isVisible();
          if (isVisible) {
            console.log(`找到每日工资按钮，使用选择器: ${selector}`);
            await element.click();
            clicked = true;
            await sleep(2000);

            // 检查是否有确认弹窗
            const confirmButton = await page.$('text=/确认|确定|ok|yes/i');
            if (confirmButton) {
              await confirmButton.click();
              console.log('点击确认按钮');
              await sleep(1000);
            }

            console.log('✅ 每日工资领取成功！');
            break;
          }
        }
      } catch (err) {
        // 继续尝试下一个选择器
        continue;
      }
    }

    if (!clicked) {
      console.log('⚠️  未找到每日工资按钮，可能已经领取或页面结构不同');
      // 保存截图用于调试
      await page.screenshot({ path: 'daily-salary-not-found.png' });
    }

  } catch (error) {
    console.error('❌ 领取每日工资失败:', error.message);
  }
}

/**
 * 使用幸运转盘
 */
async function claimLuckyWheel(page) {
  console.log('\n🎰 开始使用幸运转盘...');

  try {
    await sleep(2000);

    // 首先检查剩余次数
    try {
      const remainingSpinsElement = await page.$('//small[@id="wheelRemainingSpinsText"]');
      if (remainingSpinsElement) {
        const remainingText = await remainingSpinsElement.textContent();

        // 提取数字格式 X/6
        const match = remainingText.match(/(\d+)\/(\d+)/);
        if (match) {
          const remaining = match[1];
          const total = match[2];
          console.log(`幸运转盘剩余次数: ${remaining}/${total}`);

          if (remaining === '0') {
            console.log('✅ 幸运转盘今日次数已用完，跳过');
            return;
          }
        } else {
          console.log('未能解析剩余次数，继续尝试');
        }
      }
    } catch (err) {
      console.log('未找到剩余次数元素，继续尝试');
    }

    // 查找幸运转盘入口按钮 //a[@class='btn btn-lg']
    let wheelButton = null;
    try {
      wheelButton = await page.$('//a[@class="btn btn-lg"]');
      if (wheelButton) {
        const isVisible = await wheelButton.isVisible();
        if (isVisible) {
          console.log('找到幸运转盘入口按钮');
          await wheelButton.click();
          await sleep(3000); // 等待转盘页面加载
        } else {
          wheelButton = null;
        }
      }
    } catch (err) {
      console.log('未找到幸运转盘入口按钮，尝试其他方式');
    }

    // 如果上面的方法没找到，尝试其他选择器
    if (!wheelButton) {
      const selectors = [
        'text=/幸运转盘|转盘|抽奖|lucky.*wheel/i',
        'button:has-text("转盘")',
        'a:has-text("幸运转盘")',
        '[class*="wheel"], [class*="lottery"], [class*="lucky"]',
        'button[class*="spin"], button[class*="draw"]'
      ];

      let clicked = false;

      for (const selector of selectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            const isVisible = await element.isVisible();
            if (isVisible) {
              console.log(`找到幸运转盘按钮，使用选择器: ${selector}`);
              await element.click();
              clicked = true;
              await sleep(3000); // 等待转盘页面加载
              break;
            }
          }
        } catch (err) {
          continue;
        }
      }

      if (!clicked) {
        console.log('⚠️  未找到幸运转盘入口，可能已经使用或页面结构不同');
        await page.screenshot({ path: 'lucky-wheel-not-found.png' });
        return;
      }
    }

    // 已经进入转盘页面，尝试点击抽奖按钮
    const spinSelectors = [
      'text=/开始|抽奖|spin|start|draw/i',
      'button[class*="start"]',
      'button[class*="spin"]',
      '[class*="draw-button"]'
    ];

    let spun = false;
    for (const selector of spinSelectors) {
      try {
        const spinButton = await page.$(selector);
        if (spinButton) {
          const isVisible = await spinButton.isVisible();
          if (isVisible) {
            console.log('点击抽奖按钮');
            await spinButton.click();
            await sleep(5000); // 等待转盘动画完成

            console.log('✅ 幸运转盘使用成功！');
            spun = true;
            break;
          }
        }
      } catch (err) {
        continue;
      }
    }

    if (!spun) {
      console.log('⚠️  未找到抽奖按钮');
    }

  } catch (error) {
    console.error('❌ 使用幸运转盘失败:', error.message);
  }
}

// 执行主函数
main().catch(error => {
  console.error('程序执行失败:', error);
  process.exit(1);
});
