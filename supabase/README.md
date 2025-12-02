# Supabase 데이터베이스 설정 가이드

이 문서는 블로그 프로젝트의 Supabase 데이터베이스를 설정하는 방법을 안내합니다.

## 📋 목차

1. [Supabase 프로젝트 생성](#1-supabase-프로젝트-생성)
2. [데이터베이스 스키마 생성](#2-데이터베이스-스키마-생성)
3. [시드 데이터 삽입](#3-시드-데이터-삽입)
4. [관리자 계정 생성](#4-관리자-계정-생성)
5. [환경변수 설정](#5-환경변수-설정)

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com) 접속 후 로그인
2. "New Project" 버튼 클릭
3. 프로젝트 정보 입력:
   - **Name**: blog-project (원하는 이름)
   - **Database Password**: 안전한 비밀번호 설정 (저장해두세요!)
   - **Region**: Northeast Asia (Seoul) 선택 권장
4. "Create new project" 클릭 (약 2분 소요)

## 2. 데이터베이스 스키마 생성

1. Supabase 대시보드에서 **SQL Editor** 메뉴 클릭
2. "New query" 버튼 클릭
3. `supabase/schema.sql` 파일의 내용을 복사하여 붙여넣기
4. **Run** 버튼 클릭하여 실행

### 생성되는 테이블

- **admins**: 관리자 계정 정보
- **posts**: 블로그 게시글
- **categories**: 카테고리 정보
- **comments**: 댓글 (향후 확장용)

## 3. 시드 데이터 삽입

1. SQL Editor에서 새 쿼리 생성
2. `supabase/seed.sql` 파일의 내용을 복사하여 붙여넣기
3. **Run** 버튼 클릭하여 실행

이제 5개의 샘플 게시글이 데이터베이스에 저장됩니다.

## 4. 관리자 계정 생성

### 방법 1: Supabase Authentication 사용 (권장)

1. Supabase 대시보드에서 **Authentication** > **Users** 메뉴로 이동
2. "Add user" > "Create new user" 클릭
3. 이메일과 비밀번호 입력
4. 생성된 사용자를 `admins` 테이블에 추가:

```sql
-- Supabase Auth에서 생성한 사용자 ID를 확인한 후
INSERT INTO admins (id, email, name)
VALUES (
  'AUTH_USER_ID',  -- Supabase Auth의 사용자 ID
  'admin@example.com',
  'Admin User'
);
```

### 방법 2: 직접 관리자 계정 생성 (테스트용)

애플리케이션에서 bcrypt를 사용하여 비밀번호를 해시한 후:

```sql
INSERT INTO admins (email, password_hash, name)
VALUES (
  'admin@example.com',
  'BCRYPT_HASHED_PASSWORD',  -- bcrypt로 해시된 비밀번호
  'Admin User'
);
```

### bcrypt 비밀번호 해시 생성 (Node.js)

```javascript
const bcrypt = require('bcrypt');
const password = 'your-password';
const hash = await bcrypt.hash(password, 10);
console.log(hash);
```

## 5. 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가합니다:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase Service Role (서버 사이드 전용, 공개하지 마세요!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 환경변수 값 찾기

1. Supabase 대시보드에서 **Settings** > **API** 메뉴로 이동
2. **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`에 사용
3. **Project API keys** 섹션:
   - `anon` `public` key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 사용
   - `service_role` `secret` key: `SUPABASE_SERVICE_ROLE_KEY`에 사용

## 📊 데이터베이스 구조

### admins 테이블
```
id (UUID, PK)
email (VARCHAR, UNIQUE)
password_hash (TEXT)
name (VARCHAR)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
last_login_at (TIMESTAMP)
```

### posts 테이블
```
id (UUID, PK)
title (VARCHAR)
slug (VARCHAR, UNIQUE)
summary (TEXT)
content (TEXT)
category (VARCHAR)
tags (TEXT[])
thumbnail_url (TEXT)
published (BOOLEAN)
published_at (TIMESTAMP)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
author_id (UUID, FK -> admins)
view_count (INTEGER)
```

## 🔒 보안 설정 (Row Level Security)

스키마에는 기본적인 RLS 정책이 포함되어 있습니다:

- **게시글**: 발행된 글은 누구나 조회 가능, 관리자만 작성/수정/삭제 가능
- **카테고리**: 누구나 조회 가능
- **댓글**: 승인된 댓글만 공개, 관리자는 모든 댓글 조회 가능

## 🛠️ 유용한 SQL 함수

### 조회수 증가
```sql
SELECT increment_post_view_count('post-slug-here');
```

### 관련 게시글 가져오기
```sql
SELECT * FROM get_related_posts('post-uuid-here', 3);
```

## 📝 다음 단계

1. ✅ Supabase 프로젝트 생성
2. ✅ 데이터베이스 스키마 실행
3. ✅ 시드 데이터 삽입
4. ✅ 관리자 계정 생성
5. ✅ 환경변수 설정
6. ⬜ 프론트엔드에서 Supabase 클라이언트 설정
7. ⬜ API 라우트 작성
8. ⬜ 관리자 로그인 기능 구현
9. ⬜ 게시글 CRUD 기능 연동

## 🆘 문제 해결

### RLS 정책 오류
만약 데이터 조회/수정 시 권한 오류가 발생하면, SQL Editor에서:
```sql
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
```
(개발 중에만 사용, 프로덕션에서는 권장하지 않음)

### 테이블 초기화
모든 데이터를 삭제하고 다시 시작하려면:
```sql
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
```
그 후 `schema.sql`을 다시 실행합니다.

## 📚 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [PostgreSQL 문서](https://www.postgresql.org/docs/)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
