import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 等待指定时间
 * @param {number} ms - 等待的毫秒数
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 将 cookie 字符串解析为 Playwright 格式
 * @param {string} cookieString - Cookie 字符串
 * @returns {Array} Playwright cookie 对象数组
 */
export function parseCookieString(cookieString) {
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
 * 确保目录存在，如果不存在则创建
 * @param {string} dirPath - 目录路径
 */
export function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * 读取 CDK 文件内容
 * @param {string} filePath - 文件路径
 * @returns {Array<string>} CDK 码数组
 */
export function readCDKFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return fileContent.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

/**
 * 追加 CDK 码到文件
 * @param {string} filePath - 文件路径
 * @param {string} cdk - CDK 码
 */
export function appendCDKToFile(filePath, cdk) {
  ensureDirectoryExists(path.dirname(filePath));
  fs.appendFileSync(filePath, cdk + '\n', 'utf-8');
}

/**
 * 写入 CDK 码到文件（覆盖）
 * @param {string} filePath - 文件路径
 * @param {Array<string>} cdks - CDK 码数组
 */
export function writeCDKFile(filePath, cdks) {
  ensureDirectoryExists(path.dirname(filePath));
  const content = cdks.length > 0 ? cdks.join('\n') + '\n' : '';
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * 清空文件内容
 * @param {string} filePath - 文件路径
 */
export function clearFile(filePath) {
  fs.writeFileSync(filePath, '', 'utf-8');
}

/**
 * 获取绝对路径
 * @param {string} relativePath - 相对路径
 * @returns {string} 绝对路径
 */
export function getAbsolutePath(relativePath) {
  return path.join(__dirname, '..', relativePath);
}

/**
 * 清理 CDK 码文本：移除 emoji、换行符、空白字符等，只保留字母数字
 * @param {string} rawText - 原始 CDK 文本
 * @returns {string} 清理后的 CDK 码
 */
export function cleanCDKText(rawText) {
  if (!rawText) return '';

  return rawText
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // 移除控制字符
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '') // 移除 emoji（4字节）
    .replace(/[\u2000-\u3300]/g, '') // 移除各种符号和 emoji
    .replace(/[\uFE00-\uFE0F]/g, '') // 移除变体选择符
    .replace(/\s+/g, '') // 移除所有空白字符（空格、换行、制表符等）
    .trim();
}

/**
 * 获取 CDK 元素（支持两种定位方式）
 * @param {Page} page - 页面对象
 * @returns {Promise<{element: ElementHandle|null, method: string}>} CDK 元素和使用的定位方法
 */
export async function getCDKElement(page) {
  // 优先使用 ID 定位
  let element = await page.$('#cdk-0');
  if (element) {
    return { element, method: 'id' };
  }

  // 备用 class 定位
  element = await page.$('//div[@class="cdk-single"]');
  if (element) {
    return { element, method: 'class' };
  }

  return { element: null, method: 'none' };
}
