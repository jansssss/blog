# 계산기 템플릿 사용 가이드

## 새 계산기 페이지 만들기

1. `app/calculator/{slug}/page.tsx` 생성
2. `CalculatorShell` 컴포넌트로 레이아웃 구성
3. `InputCard` + `InputField`로 입력 폼 작성
4. `ResultSection` + `KpiGrid/KpiCompare`로 결과 표시
5. `PresetChips`로 빠른 시작 예시 추가
6. `Interpretation`으로 결과 해석 문구 추가
7. `DisclaimerNotice`로 면책 문구 추가
8. `RelatedTools`로 관련 계산기 링크 연결
9. `layout.tsx`에 SEO 메타데이터 설정

## 공통 컴포넌트

```tsx
import {
  CalculatorShell,
  InputCard,
  InputField,
  ResultSection,
  KpiGrid,
  KpiCompare,
  PresetChips,
  Interpretation,
  RelatedTools
} from '@/components/calculators'
```

## 유틸리티

```tsx
import { formatKRW, formatNumber, parseNumberInput } from '@/lib/calculators/format'
import type { Preset, KpiItem, RelatedTool } from '@/lib/calculators/types'
```

## 예제

`app/calculator/repayment-compare/page.tsx` 참고
