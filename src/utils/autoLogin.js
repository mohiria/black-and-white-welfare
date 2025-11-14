import { sleep } from './helpers.js';
import { config } from '../config.js';

/**
 * 自动登录 Linux.do
 * @param {Page} page - 页面对象
 * @param {string} username - Linux.do 用户名
 * @param {string} password - Linux.do 密码
 * @returns {Promise<boolean>} 是否登录成功
 */
async function loginLinuxDo(page, username, password) {
  console.log('\n🔐 步骤1: 登录 Linux.do...');

  try {
    // 1. 打开登录页面（使用 domcontentloaded 而不是 networkidle）
    console.log('  - 访问 https://linux.do/login');
    await page.goto('https://linux.do/login', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // 2. 等待登录表单加载完成
    console.log('  - 等待登录表单加载');
    await page.waitForSelector('#login-account-name', {
      state: 'visible',
      timeout: 10000
    });
    await sleep(1000);

    // 3. 输入用户名
    console.log('  - 填写用户名');
    const usernameInput = await page.locator('#login-account-name');
    await usernameInput.fill(username);
    await sleep(500);

    // 4. 输入密码
    console.log('  - 填写密码');
    const passwordInput = await page.locator('#login-account-password');
    await passwordInput.fill(password);
    await sleep(500);

    // 5. 点击登录按钮
    console.log('  - 点击登录按钮');
    const loginButton = await page.locator('#login-button');
    await loginButton.click();

    // 6. 等待登录成功（等待用户菜单出现）
    console.log('  - 等待登录完成...');
    await page.waitForSelector('#toggle-current-user', {
      state: 'visible',
      timeout: 180000
    });

    console.log('✅ Linux.do 登录成功！\n');
    return true;

  } catch (error) {
    console.error(`❌ Linux.do 登录失败: ${error.message}`);

    // 检查是否有错误提示
    try {
      const errorAlert = await page.$('.alert-error, #modal-alert');
      if (errorAlert) {
        const errorText = await errorAlert.textContent();
        console.error(`  错误信息: ${errorText.trim()}`);
      }
    } catch (e) {
      // 忽略
    }

    await page.screenshot({ path: 'images/linux-do-login-failed.png' });
    console.log('📸 已保存错误截图: images/linux-do-login-failed.png');
    return false;
  }
}

/**
 * CDK OAuth 授权登录
 * @param {Page} page - 页面对象（已登录 Linux.do）
 * @returns {Promise<boolean>} 是否登录成功
 */
async function loginCDKOAuth(page) {
  console.log('🌐 步骤2: CDK OAuth 授权登录...');

  try {
    // 1. 打开 CDK 首页（使用 domcontentloaded）
    console.log('  - 访问 https://cdk.hybgzs.com/');
    await page.goto('https://cdk.hybgzs.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    await sleep(2000);

    // 检查是否已经登录
    const alreadyLoggedIn = await page.$('//span[@class="navbar-text me-3"]');
    if (alreadyLoggedIn) {
      console.log('✅ 检测到已登录状态，跳过授权流程\n');
      return true;
    }

    // 2. 点击"立即开始"按钮
    console.log('  - 点击"立即开始"按钮');
    const startButton = await page.waitForSelector('//a[@class="btn btn-light btn-lg"]', {
      state: 'visible',
      timeout: 10000
    });
    await startButton.click();
    await sleep(2000);

    // 3. 点击"使用 LinuxDo 登录"按钮
    console.log('  - 点击"使用 LinuxDo 登录"按钮');
    const linuxDoLoginButton = await page.waitForSelector(
      '//button[contains(normalize-space(.), "使用 LinuxDo 登录")]',
      { state: 'visible', timeout: 10000 }
    );
    await linuxDoLoginButton.click();
    await sleep(2000);

    // 4. 点击"允许"按钮（OAuth 授权）
    console.log('  - 等待 OAuth 授权页面');

    // 等待页面跳转（可能跳转到 linux.do 或直接授权）
    try {
      const allowButton = await page.waitForSelector(
        '//a[contains(normalize-space(.), "允许")]',
        { state: 'visible', timeout: 8000 }
      );
      console.log('  - 点击"允许"按钮');
      await allowButton.click();
    } catch (e) {
      // 可能已经授权过，直接跳过
      console.log('  - 未找到允许按钮（可能已授权）');
    }

    await sleep(3000);

    // 5. 等待登录成功（检测用户信息元素）
    console.log('  - 等待 CDK 登录完成...');
    await page.waitForSelector('//span[@class="navbar-text me-3"]', {
      state: 'visible',
      timeout: 15000
    });

    console.log('✅ CDK 登录成功！\n');
    return true;

  } catch (error) {
    console.error(`❌ CDK 登录失败: ${error.message}`);
    await page.screenshot({ path: 'images/cdk-login-failed.png' });
    console.log('📸 已保存错误截图: images/cdk-login-failed.png');
    return false;
  }
}

/**
 * 完整的自动登录流程：Linux.do 登录 → CDK OAuth 授权
 * @param {Browser} browser - 浏览器实例
 * @param {string} username - Linux.do 用户名
 * @param {string} password - Linux.do 密码
 * @returns {Promise<{success: boolean, context: BrowserContext, page: Page}>}
 */
export async function autoOAuthFlow(browser, username, password) {
  console.log('\n🚀 开始完整的自动登录流程...');
  console.log('━'.repeat(60));

  if (!username || !password) {
    console.error('❌ 缺少 Linux.do 账号或密码');
    return { success: false };
  }

  let context = null;

  try {
    // 创建浏览器上下文（基础隐藏自动化特征）
    context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      viewport: config.browser.headless ? { width: 1920, height: 1080 } : null,
      locale: 'zh-CN',
      timezoneId: 'Asia/Shanghai',
      permissions: ['geolocation'],
      colorScheme: 'light',
      extraHTTPHeaders: {
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    // 隐藏 webdriver 特征
    await context.addInitScript(() => {
      // 删除 navigator.webdriver
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined
      });

      // 模拟 Chrome 插件
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5]
      });

      // 模拟语言
      Object.defineProperty(navigator, 'languages', {
        get: () => ['zh-CN', 'zh', 'en']
      });

      // 隐藏自动化痕迹
      window.chrome = {
        runtime: {}
      };

      // 覆盖 permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );
    });

    const page = await context.newPage();

    // 步骤1：登录 Linux.do
    const linuxDoSuccess = await loginLinuxDo(page, username, password);
    if (!linuxDoSuccess) {
      console.error('❌ Linux.do 登录失败，终止流程');
      await context.close();
      return { success: false };
    }

    // 步骤2：CDK OAuth 授权登录
    const cdkSuccess = await loginCDKOAuth(page);
    if (!cdkSuccess) {
      console.error('❌ CDK 授权失败，终止流程');
      await context.close();
      return { success: false };
    }

    console.log('━'.repeat(60));
    console.log('🎉 完整登录流程成功完成！\n');

    return {
      success: true,
      context: context,
      page: page
    };

  } catch (error) {
    console.error(`❌ 自动登录流程异常: ${error.message}`);

    if (context) {
      try {
        const page = context.pages()[0];
        if (page) {
          await page.screenshot({ path: 'images/auto-login-error.png' });
          console.log('📸 已保存错误截图: images/auto-login-error.png');
        }
      } catch (e) {
        // 忽略截图错误
      }
      await context.close();
    }

    return { success: false };
  }
}
