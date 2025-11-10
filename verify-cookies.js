// 验证 cookies.json 格式是否正确
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const COOKIES_PATH = path.join(__dirname, 'config/cookies.json');

try {
  if (!fs.existsSync(COOKIES_PATH)) {
    console.error('❌ 未找到 config/cookies.json 文件');
    process.exit(1);
  }

  const cookiesData = fs.readFileSync(COOKIES_PATH, 'utf-8');
  const cookies = JSON.parse(cookiesData);

  if (!Array.isArray(cookies)) {
    console.error('❌ cookies.json 必须是数组格式');
    process.exit(1);
  }

  if (cookies.length === 0) {
    console.error('❌ cookies.json 不能为空数组');
    process.exit(1);
  }

  console.log('✅ Cookie 格式验证通过！');
  console.log(`📊 找到 ${cookies.length} 个 Cookie:\n`);

  cookies.forEach((cookie, index) => {
    console.log(`${index + 1}. ${cookie.name}`);
    console.log(`   Domain: ${cookie.domain}`);
    console.log(`   Value: ${cookie.value.substring(0, 20)}...`);
    console.log(`   HttpOnly: ${cookie.httpOnly}`);
    console.log(`   Secure: ${cookie.secure}`);
    console.log('');
  });

  // 检查必需字段
  const requiredFields = ['name', 'value', 'domain', 'path'];
  let hasError = false;

  cookies.forEach((cookie, index) => {
    requiredFields.forEach(field => {
      if (!cookie[field]) {
        console.error(`❌ Cookie ${index + 1} 缺少必需字段: ${field}`);
        hasError = true;
      }
    });
  });

  if (hasError) {
    process.exit(1);
  }

  console.log('🎉 所有 Cookie 都包含必需字段！');
  console.log('\n现在可以运行: npm start');

} catch (error) {
  console.error('❌ 验证失败:', error.message);
  if (error instanceof SyntaxError) {
    console.error('💡 提示: 请检查 JSON 格式是否正确');
  }
  process.exit(1);
}
