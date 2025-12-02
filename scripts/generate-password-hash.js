// 관리자 비밀번호 해시 생성 스크립트
// 실행 방법: node scripts/generate-password-hash.js

const bcrypt = require('bcrypt');

async function generateHash() {
  const password = 'admin123'; // 원하는 비밀번호로 변경
  const saltRounds = 10;

  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('\n=================================');
    console.log('비밀번호 해시가 생성되었습니다!');
    console.log('=================================\n');
    console.log('원본 비밀번호:', password);
    console.log('\n해시 값:');
    console.log(hash);
    console.log('\n\n다음 SQL을 Supabase에서 실행하세요:');
    console.log('=================================\n');
    console.log(`INSERT INTO admins (email, password_hash, name)
VALUES (
  'admin@example.com',
  '${hash}',
  'Admin User'
);`);
    console.log('\n=================================');
  } catch (error) {
    console.error('오류 발생:', error);
  }
}

generateHash();
