/**
 * OHYESS 사례 분석 콘텐츠 프롬프트 빌더 (v3)
 *
 * v3 변경사항:
 * - 1인칭 가상 경험담 패턴(INTRO_PATTERNS, OUTRO_ACTION_HINTS) 전면 제거
 * - 사례 분석 리포트 포맷으로 교체 (계산 가정 → 결과 → 시나리오 → 계산기 CTA)
 * - validateColumnistOutput: YMYL 8개 기준으로 교체
 */

export interface ColumnistPromptParams {
  cleanDraft: string
  humanPhrases?: string[]  // v3에서는 미사용 (하위호환성 유지)
}

// ============================================
// [1] 사례 분석 아웃라인 템플릿 4종
// ============================================
const CASE_ANALYSIS_TEMPLATES = [
  {
    id: 'CA1_CALC_FIRST',
    name: '계산 결과 선행형',
    order: ['H1', '기준일+주의문', '핵심 질문 제시', '계산 가정 표', '계산 결과 요약', '조건별 시나리오 비교', '결과를 바꾸는 변수', '계산기 CTA', 'FAQ 3개', '참고 출처', '면책 고지'],
    emphasis: '첫 섹션에서 계산 조건과 결과를 먼저 제시하고, 이후 시나리오 비교로 전개한다.',
  },
  {
    id: 'CA2_QUESTION_FIRST',
    name: '핵심 질문 선행형',
    order: ['H1', '기준일+주의문', '독자 핵심 질문', '왜 이 계산이 필요한가 (배경)', '계산 가정 표', '계산 결과', '시나리오 비교 표', '계산기 CTA', 'FAQ 3개', '참고 출처', '면책 고지'],
    emphasis: '독자가 이 글을 찾게 된 질문에서 시작해 계산 가정·결과 순으로 안내한다.',
  },
  {
    id: 'CA3_SCENARIO_MATRIX',
    name: '시나리오 매트릭스형',
    order: ['H1', '기준일+주의문', '핵심 질문', '계산 가정 표', '기본 시나리오 결과', '소득 구간별 비교', '기존 부채 유무 비교', '계산기 CTA', 'FAQ 3개', '참고 출처', '면책 고지'],
    emphasis: '여러 조건 조합(소득 구간, 부채 유무, 금리 변동)을 매트릭스 형태로 비교한다.',
  },
  {
    id: 'CA4_VARIABLE_FOCUS',
    name: '변수 중심 분석형',
    order: ['H1', '기준일+주의문', '핵심 질문', '계산 가정 표', '기본 결과', '변수①이 결과에 미치는 영향', '변수②가 결과에 미치는 영향', '계산기 CTA', 'FAQ 3개', '참고 출처', '면책 고지'],
    emphasis: '결과를 바꾸는 주요 변수(금리, 기존부채, 대출기간)를 하나씩 분석한다.',
  },
]

// ============================================
// [유틸리티] 배열 랜덤 선택
// ============================================
function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

// ============================================
// [메인] 사례 분석 프롬프트 빌드
// ============================================
export function buildColumnistPrompt(params: ColumnistPromptParams): {
  systemPrompt: string
  userPrompt: string
  variationMeta: {
    outlineId: string
    introId: string
    outroHints: string[]
  }
} {
  const { cleanDraft } = params

  const template = pickRandom(CASE_ANALYSIS_TEMPLATES)

  const systemPrompt = `너는 ohyess.kr의 금융 사례 분석 콘텐츠 작성자다.
공식자료와 계산 가정을 바탕으로 독자의 금융 질문에 검증 가능한 방식으로 답한다.

[절대 금지]
- "저는/제가/지난주에/직접 해봤다" 등 가상 1인칭 경험담
- "전문가로서 확신한다", "반드시 승인됩니다", "무조건 유리합니다" 등 확정 표현
- 출처 없는 단독 수치 (수치에는 반드시 출처 기관명 또는 "계산 가정 기준" 표기)
- "서울 직장인 A씨는" 같은 가상 인물 일화형 도입
- "이 글을 통해", "알아보겠습니다", "살펴봅니다" 등 기사체 도입

[필수 포함 요소]
1. 기준일과 주의 문구: "이 글은 [기준년월] 공시 기준으로 작성했습니다. 금리·규제는 변동될 수 있으므로 실제 한도는 금융기관에 확인하세요."
2. 계산 가정 표: 연소득, 금리, 기간, DSR 상한, LTV 상한 등 이 글의 계산 조건 명시
3. 계산 결과: 가정 적용 결과 수치 + 공식/산식 간략 표기
4. 시나리오 비교: 2~3개 조건 변경 시 결과 비교 (소득 구간, 금리, 기존부채)
5. 결과를 바꾸는 변수: 한도·결과를 줄이거나 늘리는 요인 열거
6. 계산기 CTA 2개 이상: 본문 내 ohyess.kr 계산기·가이드 링크 (cleanDraft에 있는 URL 우선)
7. FAQ 3개: 검색 의도 기반 질문 + 2~3문장 구체적 답변 (수치 포함)
8. 참고 출처: 인용 기관명 + 연도
9. 면책 고지: "이 글은 정보 제공 목적으로 작성되었으며, 금융기관 심사 결과를 보장하지 않습니다. 실제 대출 여부 및 한도는 신청 금융기관의 기준에 따라 달라질 수 있습니다."

[이번 글 아웃라인 템플릿: ${template.name}]
섹션 순서: ${template.order.join(' → ')}
강조점: ${template.emphasis}

[섹션 헤딩 원칙]
- 조건 명시형: "DSR 40% 기준, 월급 400만 원의 주담대 한도는?"
- 비교형: "자동차 할부가 있을 때 한도가 얼마나 줄어드나"
- 결과 선행형: "계산 가정: 연소득 5,000만 원 · 금리 3.5% · 30년 · DSR 40%"

[수치 해석 규칙]
숫자·계산 결과 뒤에 반드시 해석 문장 추가:
- "이 경우 월 납입액은 약 XX만 원으로, 월 소득의 X%에 해당한다"
- "DSR 기준 월상환 가능액 대비 X% 수준이다"

[계산기 CTA 형식]
cleanDraft에 포함된 ohyess.kr 계산기 URL을 본문에 자연스럽게 삽입:
- "→ <a href='/calculator/dsr-dti-ltv'>DSR·DTI·LTV 계산기에서 직접 확인하기</a>"
- "→ <a href='/calculator/loan-limit'>대출 한도 계산기로 내 한도 계산하기</a>"

[스타일]
- 분석적·설명적 어조 (감정 공감 없이 계산과 조건으로 안내)
- 한국어, 전문적이되 평이한 문장
- 금융 확정 표현 금지: "반드시" → "계산 가정 기준으로는"

[출력 구조 — write_blog_post 도구 호출]
- title: SEO H1 제목 (40~60자, 핵심 수치·조건 포함)
- meta_description: 150~170자
- subtitle: 부제목 30~60자
- slug: 영문 소문자+하이픈, 3~6단어, 날짜 없이 주제 중심
- tags: SEO 태그 3개
- summary_points: 요약 1개 (60자 이상, 계산 가정+결과+조건 가변성 포함)
- sections: 본문 섹션 (아웃라인 순서 준수, 계산 가정 표·시나리오·CTA 포함)
  - heading: H2 제목
  - paragraphs: 문단 2~3개 (수치+출처 포함)
  - expert_insight: 핵심 포인트 1문장 (없으면 빈 문자열 "")
- calculator_ctas: [{label, url}] 2개 이상
- action_tips: 5~6개 (계산기 URL 포함 가능, 구체적 행동+수치)
- faqs: 3개 [{question, answer}]
- sources: 인용 출처 목록
- disclaimer: 면책 고지 문구`

  const userPrompt = `다음 초안을 사례 분석 리포트 형식으로 재작성해주세요:

${cleanDraft}`

  return {
    systemPrompt,
    userPrompt,
    variationMeta: {
      outlineId: template.id,
      introId: 'CASE_ANALYSIS',
      outroHints: [],
    },
  }
}

// ============================================
// [검증] YMYL 품질 검증 함수 (v3)
// ============================================
export function validateColumnistOutput(content: string): {
  isValid: boolean
  failures: string[]
  warnings: string[]
} {
  const failures: string[] = []
  const warnings: string[] = []

  // 1. 계산 가정 명시 여부 [실패]
  const hasCalcAssumption = /계산\s*가정|가정\s*기준|연소득|DSR\s*(40|50)%|LTV\s*(70|80)%/.test(content)
  if (!hasCalcAssumption) {
    failures.push('계산 가정이 명시되지 않았습니다 — 연소득·금리·DSR 상한 등 계산 조건 표 필요')
  }

  // 2. 출처 없는 단독 수치 패턴 [경고]
  // 수치 뒤에 출처 표기(기관명, 연도, "계산 가정") 없이 단독으로 쓰인 경우
  const hasSourcedNumbers = /\d+[\s]*(만원|억원|%|bp|원)[\s\S]{0,30}(한국은행|금융위원회|금융감독원|국토교통부|통계청|계산\s*가정|가정\s*기준)/.test(content)
  if (!hasSourcedNumbers) {
    warnings.push('수치 뒤 출처 표기가 확인되지 않습니다 — 숫자에 출처 기관명 또는 "계산 가정 기준" 표기 권장')
  }

  // 3. 확정 표현 사용 [실패]
  const certaintyPhrases = ['반드시 됩니다', '무조건 유리', '확실히 승인', '반드시 승인', '100% 가능']
  for (const phrase of certaintyPhrases) {
    if (content.includes(phrase)) {
      failures.push(`확정 표현 발견: "${phrase}" — "계산 가정 기준으로는" 등으로 완화 필요`)
    }
  }

  // 4. 실제 승인 가능성 단정 [실패]
  const approvalCertain = /대출이\s*(됩니다|가능합니다|나옵니다)(?!\s*만|[\s\S]{0,10}(가정|기준|조건에\s*따라))/.test(content)
  if (approvalCertain) {
    failures.push('대출 승인 가능성을 단정하는 표현이 있습니다 — "계산 가정 기준" 또는 "실제 심사 결과는 달라질 수 있음" 추가 필요')
  }

  // 5. 계산기 링크 존재 여부 [실패]
  const hasCalculatorLink = /\/calculator\/|\/guide\//.test(content)
  if (!hasCalculatorLink) {
    failures.push('ohyess.kr 계산기 또는 가이드 링크가 없습니다 — /calculator/ 또는 /guide/ URL 2개 이상 포함 필요')
  } else {
    const calcLinkCount = (content.match(/\/calculator\/|\/guide\//g) || []).length
    if (calcLinkCount < 2) {
      warnings.push(`계산기·가이드 링크가 ${calcLinkCount}개입니다 — 2개 이상 권장`)
    }
  }

  // 6. 가상 경험담·1인칭 허구 표현 [실패]
  const fakeExperiencePhrases = [
    '저는 지난주', '저는 직접', '제가 해봤', '지난달에 계산해봤',
    '저도 처음엔', '저한테는', '제 경우엔', '저는 어제',
  ]
  for (const phrase of fakeExperiencePhrases) {
    if (content.includes(phrase)) {
      failures.push(`가상 경험담 표현 발견: "${phrase}" — 계산 가정 기반 서술로 대체 필요`)
    }
  }

  // 7. 기준일 문구 존재 여부 [실패]
  const hasNoticeDate = /기준\s*(으로|으)?\s*작성|공시\s*기준|년\s*(기준|공시)|기준일/.test(content)
  if (!hasNoticeDate) {
    failures.push('기준일 문구가 없습니다 — "이 글은 YYYY년 MM월 공시 기준으로 작성했습니다" 포함 필요')
  }

  // 8. 면책 고지 존재 여부 [실패]
  const hasDisclaimer = /정보\s*제공\s*목적|심사\s*결과를\s*보장|금융기관의\s*기준에\s*따라|달라질\s*수\s*있습니다/.test(content)
  if (!hasDisclaimer) {
    failures.push('면책 고지가 없습니다 — "이 글은 정보 제공 목적으로 작성되었으며..." 문구 필요')
  }

  // 9. FAQ 3개 존재 여부 [경고]
  const faqCount = (content.match(/FAQ|자주\s*묻는|Q\.|Q\d|질문\s*\d/gi) || []).length
  if (faqCount < 2) {
    warnings.push(`FAQ 섹션이 부족해 보입니다 (${faqCount}회 감지) — FAQ 3개 이상 필요`)
  }

  // 10. 기존 가이드 과도 중복 [경고]
  const guideTopics = ['DSR·DTI·LTV 완전 정리', '대출이자 계산법 완전 정리', '상환방식 완전 비교', '중도상환수수료 정리']
  for (const topic of guideTopics) {
    if (content.includes(topic)) {
      warnings.push(`기존 정적 가이드 제목과 중복 가능: "${topic}" — 링크로 대체 권장`)
    }
  }

  // 11. 금지 도입부 표현 [실패]
  const forbiddenIntros = ['이 글을 통해', '알아보겠습니다', '살펴봅니다', '살펴보겠습니다']
  for (const phrase of forbiddenIntros) {
    if (content.includes(phrase)) {
      failures.push(`금지 도입부 표현: "${phrase}"`)
    }
  }

  // 12. 구체적 숫자 존재 여부 [경고]
  const numberMatches = content.match(/\d+[만천백억원%개월일년]/g) || []
  if (numberMatches.length < 5) {
    warnings.push(`구체적 숫자 부족 (${numberMatches.length}개) — 계산 결과·가정 수치 5개 이상 권장`)
  }

  return {
    isValid: failures.length === 0,
    failures,
    warnings,
  }
}

// ============================================
// [Export] 템플릿 메타데이터 (디버깅용)
// ============================================
export const VARIATION_OPTIONS = {
  outlines: CASE_ANALYSIS_TEMPLATES.map(t => ({ id: t.id, name: t.name })),
  intros: [{ id: 'CASE_ANALYSIS', name: '사례 분석형 (계산 가정 기반)' }],
  outroCount: 0,
}
