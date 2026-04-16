# Claude Code Instructions — ohyess.kr Blog

## 계산기 페이지 디자인 시스템

아래 규칙은 `app/calculator/` 하위 모든 계산기 페이지에 적용된다.
**loan-interest 페이지(`app/calculator/loan-interest/page.tsx`)가 기준 레퍼런스.**

---

### 색상 팔레트

| 역할 | 값 |
|------|-----|
| 메인 액센트 | `indigo-600` / `#6366f1` |
| 슬라이더 트랙 채움 | `#6366f1` → `#c7d2fe` |
| 슬라이더 빈 트랙 | `#c7d2fe` |
| 입력 패널 배경 | `bg-gradient-to-br from-indigo-50 via-white to-blue-50` |
| 입력 패널 테두리 | `border-indigo-100` |
| 결과 히어로 배경 | `linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)` |
| 긍정/이익 | `#10b981` (emerald-500) |
| 경고/손실 | `#f59e0b` (amber-400) |
| 위험/비용 | `#ef4444` (red-500) |
| 카드 배경 | `bg-white`, `border border-gray-100 shadow-sm` |

---

### 레이아웃

- **컨테이너**: `container max-w-6xl py-8`
- **데스크탑 2컬럼**: `lg:grid lg:grid-cols-[2fr_3fr] lg:gap-8 lg:items-start`
  - 좌측(입력): `lg:sticky lg:top-8` — 스크롤해도 고정
  - 우측(결과): `space-y-6 mt-8 lg:mt-0`
- **하단 가이드 콘텐츠**: 2컬럼 그리드 밖, 풀 width `space-y-6 mt-8`
- **모바일**: 단일 컬럼 자동 적층

---

### 컴포넌트 패턴

#### 헤더
```tsx
<div className="mb-8 text-center">
  <div className="inline-flex items-center gap-2 bg-indigo-100 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 mb-3">
    ⚡ 슬라이더 조작 즉시 계산
  </div>
  <h1 className="text-2xl sm:text-3xl font-bold mb-2">페이지 제목</h1>
  <p className="text-muted-foreground text-sm sm:text-base">부제목</p>
</div>
```

#### 프리셋 버튼 (pill 스타일)
```tsx
<button className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors shadow-sm">
  프리셋명
</button>
```

#### SliderInput 컴포넌트
- 라벨 좌측, 현재값 우측 (`text-indigo-700 font-bold`)
- 트랙: `linear-gradient(to right, #6366f1 … #c7d2fe …)` 동적 퍼센트
- thumb: `width:20px; height:20px; background:#6366f1; box-shadow: 0 0 0 4px rgba(99,102,241,0.2)`
- 최솟값/최댓값 힌트 텍스트 `text-xs text-gray-400`

#### KPI 카드
- 일반: `rounded-2xl p-4 bg-white border border-gray-100 shadow-sm`
- 강조(accent): `rounded-2xl p-4 bg-indigo-600 text-white`
- 레이블: `text-[10px] font-bold uppercase tracking-widest`
- 값: `text-lg font-extrabold leading-tight`

#### 결과 히어로 카드 (최상단 핵심 결과)
```tsx
<div className="rounded-2xl p-6 sm:p-8 mb-5 text-white"
  style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)' }}>
  <p className="text-indigo-200 text-sm mb-1">레이블</p>
  <p className="text-4xl sm:text-5xl font-bold mb-1 tracking-tight">값</p>
</div>
```

#### 차트 영역 카드
```tsx
<div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
  <h3 className="font-bold text-sm text-gray-700 mb-4">차트 제목</h3>
  {/* recharts ResponsiveContainer */}
</div>
```

#### 계산식 요약 박스
```tsx
<div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600 space-y-1">
  <p className="font-semibold text-gray-700 mb-2 text-xs">📌 계산 방식</p>
  <p>• 공식 설명</p>
</div>
```

---

### UX 원칙

1. **버튼 없이 즉시 계산** — `useMemo`로 슬라이더 조작 즉시 결과 반영, 계산하기 버튼 없음
2. **슬라이더 우선** — 숫자 직접 입력 대신 슬라이더. 단, 큰 금액은 `hint`로 정확 값 표시
3. **실시간 시각화** — 핵심 결과는 recharts로 차트화 (BarChart / PieChart / AreaChart)
4. **상태 색상** — 이익/긍정 → emerald, 경고 → amber, 비용/위험 → red, 중립 → indigo
5. **하단 가이드 유지** — 기존 SEO 가이드 텍스트 카드는 항상 보존

---

### 외부 라이브러리

- **recharts** — 차트 전용 (`BarChart`, `PieChart`, `AreaChart` 등)
- **lucide-react** — 아이콘 (필요 시)
- **shadcn/ui** (`@/components/ui/card` 등) — 하단 가이드 섹션에서만 사용 가능; 입력/결과 영역은 직접 구현 선호
- `DisclaimerNotice` — 모든 계산기 페이지 하단에 반드시 포함
