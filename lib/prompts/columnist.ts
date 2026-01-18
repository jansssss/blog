/**
 * OHYESS 칼럼니스트(pass2) 프롬프트 빌더
 * 사람 문구풀을 주입하여 더 자연스러운 글을 생성
 *
 * v2: 아웃라인 템플릿 + 도입부 패턴 + 결론 힌트 랜덤화로 "비슷비슷함" 해소
 */

export interface ColumnistPromptParams {
  cleanDraft: string
  humanPhrases: string[]
}

// ============================================
// [1] 아웃라인 템플릿 5종 (섹션 순서 + 강조점)
// ============================================
const OUTLINE_TEMPLATES = [
  {
    id: 'T1_STANDARD',
    name: '문제제기형 (기본)',
    order: ['H1', '도입부 3문단', '한 줄 요약', '이슈 배경', '나에게 미치는 영향', '계산 예시', '구체적 사례', '실제 활용 방법', 'FAQ 3개', '정리', '주의사항', 'SEO 태그 3개'],
    emphasis: '도입부에서 "왜 이게 내 돈과 관련 있는가?"를 명확히 제기하고, 이후 논리적으로 풀어나간다.'
  },
  {
    id: 'T2_NUMBER_FIRST',
    name: '숫자 요약 선행형',
    order: ['H1', '핵심 숫자 3개 요약', '도입부 2문단', '이슈 배경', '쟁점(찬반 또는 해석 차이)', '나에게 미치는 영향', '구체적 사례', '계산 예시', '실제 활용 방법', 'FAQ 3개', '정리', '주의사항', 'SEO 태그 3개'],
    emphasis: '글 초반에 핵심 숫자 3개를 먼저 던지고, 독자가 "이게 뭐지?" 하며 읽게 만든다.'
  },
  {
    id: 'T3_CASE_OPENING',
    name: '사례 오프닝 강화형',
    order: ['H1', '사례 힌트 도입(1문단)', '도입부 2문단', '한 줄 요약', '이슈 배경', '나에게 미치는 영향', '체크리스트 3개', '계산 예시', '구체적 사례(확장)', 'FAQ 3개', '정리', '주의사항', 'SEO 태그 3개'],
    emphasis: '도입 첫 문장에 가상 인물 상황을 암시하고, 독자가 "나도 저럴 수 있겠다"고 느끼게 한다.'
  },
  {
    id: 'T4_QA_CENTRIC',
    name: 'Q&A 중심형',
    order: ['H1', '핵심 질문 3개 제시', '질문1 답변(배경+영향)', '질문2 답변(계산+사례)', '질문3 답변(활용 방법)', '추가 FAQ 2개', '정리', '주의사항', 'SEO 태그 3개'],
    emphasis: '글 전체를 질문-답변 구조로 전개하여 독자가 궁금증을 따라가며 읽게 한다.'
  },
  {
    id: 'T5_MISTAKE_PREVENTION',
    name: '실수 방지형',
    order: ['H1', '도입부 2문단', '❌ 하지 말아야 할 것 3가지', '✅ 체크포인트 3가지', '이슈 배경', '나에게 미치는 영향', '계산 예시', '구체적 사례', 'FAQ 3개', '정리', '주의사항', 'SEO 태그 3개'],
    emphasis: '"이건 하지 마세요"를 먼저 제시해 독자의 주의를 끌고, 이후 올바른 방향을 안내한다.'
  }
]

// ============================================
// [2] 도입부 전개 패턴 5종
// ============================================
const INTRO_PATTERNS = [
  {
    id: 'P1_QUESTION',
    name: '질문형',
    guide: '첫 문장에서 "혹시 … 해본 적 있나요?", "…라고 생각해본 적 있나요?" 형태로 질문을 던진다. 독자가 자신의 경험을 떠올리게 만든다.',
    example: '혹시 대출 금리 뉴스를 보면서 "이게 나한테 무슨 상관이지?" 하고 그냥 넘긴 적 있나요?'
  },
  {
    id: 'P2_CASE_HINT',
    name: '사례형',
    guide: '첫 문장에서 "30대 직장인 A씨가 어느 날…"처럼 가상 인물의 상황으로 시작한다. 이야기에 빠져들게 만든다.',
    example: '30대 직장인 김씨는 어느 날 퇴근길 지하철에서 이 뉴스 제목을 봤습니다. 처음엔 남 얘기 같았는데…'
  },
  {
    id: 'P3_MYTH_BUSTER',
    name: '통념반박형',
    guide: '첫 문장에서 "다들 ○○라고 생각하지만, 실제로는…"처럼 일반적인 생각을 뒤집는다. 의외성으로 관심을 끈다.',
    example: '다들 금리가 오르면 무조건 손해라고 생각하지만, 실제로는 상황에 따라 다릅니다.'
  },
  {
    id: 'P4_CHECKLIST',
    name: '체크리스트형',
    guide: '첫 문장에서 "오늘 이 뉴스에서 확인할 3가지는…"처럼 미리 체크포인트를 제시한다. 읽는 목적이 명확해진다.',
    example: '오늘 이 뉴스에서 확인할 3가지: ① 나에게 해당되는지 ② 얼마나 영향받는지 ③ 뭘 해야 하는지.'
  },
  {
    id: 'P5_NUMBER_HOOK',
    name: '숫자요약형',
    guide: '첫 문장에서 "핵심 숫자 3개: ○○%, ○○원, ○○일"처럼 숫자로 임팩트를 준다. 구체성이 신뢰를 높인다.',
    example: '핵심 숫자 3개: 0.25%p 인상, 월 12,000원 증가, 7월 1일 시행.'
  }
]

// ============================================
// [3] 결론/행동힌트 문장 템플릿 10종
// ============================================
const OUTRO_ACTION_HINTS = [
  '오늘은 결론 내리지 말고, ○○만 확인하세요.',
  '다음 행동은 1개면 충분합니다: ○○.',
  '손실을 막는 관점에서 보면, ○○부터 점검이 먼저입니다.',
  '급하게 결정하기보다, 이번 주 안에 ○○만 체크해 보세요.',
  '모든 걸 바꿀 필요는 없습니다. ○○ 하나만 확인해도 충분합니다.',
  '지금 당장 할 일: ○○ 앱/사이트에서 내 현재 상태 확인하기.',
  '최악을 피하려면, 최소한 ○○은 알고 있어야 합니다.',
  '이 글을 읽었다면, ○○에 관한 알림만 켜두세요.',
  '판단은 나중에 해도 됩니다. 오늘은 ○○만 메모해 두세요.',
  '가장 중요한 건 "내가 해당되는지 아닌지"입니다. ○○에서 확인하세요.'
]

// ============================================
// [유틸리티] 배열 셔플 함수
// ============================================
function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// ============================================
// [메인] 칼럼니스트 프롬프트 빌드
// ============================================
/**
 * 칼럼니스트 프롬프트를 생성합니다.
 * @param params cleanDraft와 humanPhrases를 포함한 객체
 * @returns 시스템 프롬프트와 유저 프롬프트, 변주 메타데이터
 */
export function buildColumnistPrompt(params: ColumnistPromptParams): {
  systemPrompt: string
  userPrompt: string
  variationMeta: {
    outlineId: string
    introId: string
    outroHints: string[]
  }
} {
  const { cleanDraft, humanPhrases } = params

  // [랜덤 선택] 아웃라인 템플릿
  const outline = OUTLINE_TEMPLATES[Math.floor(Math.random() * OUTLINE_TEMPLATES.length)]

  // [랜덤 선택] 도입부 패턴
  const intro = INTRO_PATTERNS[Math.floor(Math.random() * INTRO_PATTERNS.length)]

  // [랜덤 선택] 결론 힌트 2~3개
  const shuffledOutros = shuffle(OUTRO_ACTION_HINTS)
  const outroCount = Math.floor(Math.random() * 2) + 2 // 2 or 3
  const outros = shuffledOutros.slice(0, outroCount)

  // 선택된 문구를 bullet 형태로 포맷
  const phraseBullets = humanPhrases.map(p => `- "${p}"`).join('\n')
  const outroBullets = outros.map(o => `- ${o}`).join('\n')

  const systemPrompt = `너는 지금부터 "컬럼니스트(pass2)"다.

[전제]
- clean_draft는 이미 편집장(pass1)에서 팩트·수치·과장 제거 완료된 상태다.
- 너는 새로운 사실·숫자·계산을 절대 추가하지 않는다.

[목표]
- 사람이 직접 쓴 것처럼 자연스럽고 풍성한 블로그 본문 작성
- 설명이 충분하고, 문장에 온기가 느껴지도록 할 것
- 애드센스·SEO·체류시간에 적합한 정보 제공 톤 유지

[핵심 원칙]
- 규칙만 따르지 말고, 아래 'Human Phrase Pool'의 문구를 적극 활용해 문장을 구성하라.
- 같은 표현을 반복하지 말고, 설명을 풀어서 쓰는 것을 허용한다.
- 한 문단에 최소 1번은 '설명 덧붙이기'를 시도한다.

[Human Phrase Pool — 반드시 섞어서 사용할 것]
아래 문구들은 그대로 쓰거나, 자연스럽게 변형해서 사용해도 된다.
최소 4개 이상의 문구를 본문에 녹여서 사용하라.

${phraseBullets}

═══════════════════════════════════════════
🎲 이번 글의 변주 규칙 (이번 요청에만 적용)
═══════════════════════════════════════════

[선택된 아웃라인 템플릿: ${outline.name}]
섹션 순서: ${outline.order.join(' → ')}
강조점: ${outline.emphasis}

※ 위 순서를 우선하되, 기존 필수 섹션(FAQ 3개, 사례, 계산 예시, 정리, 주의사항)은 반드시 포함할 것.
※ 템플릿에 없는 섹션이라도 필수 섹션이면 적절한 위치에 삽입한다.

[선택된 도입부 패턴: ${intro.name}]
가이드: ${intro.guide}
예시: "${intro.example}"

※ 도입부 첫 문장은 위 패턴을 따르되, 기계적으로 복사하지 말고 뉴스 내용에 맞게 자연스럽게 변형할 것.

[선택된 결론/행동 힌트]
아래 힌트 중 1~2개를 정리 섹션에 자연스럽게 녹여서 사용하라:
${outroBullets}

※ ○○ 부분은 실제 뉴스 내용에 맞는 구체적 행동으로 대체할 것.

═══════════════════════════════════════════

[절대 금지 표현]
다음 표현이 포함되면 실패로 간주된다:
- "이 글을 통해"
- "알아보겠습니다"
- "살펴봅니다"
- "살펴보겠습니다"
- 기사형·교과서형 시작

[사례 규칙]
- 가상 인물(연령+직업)
- 숫자 1개
- 감정 표현 1개 이상 필수 (고민했다, 망설였다, 부담됐다, 걱정됐다 등)
- 행동을 확정하지 말고 열린 상태로 마무리
- 사례 뒤에 설명 문단 1개를 추가해 '왜 이런 고민이 나오는지' 풀어쓸 것

[계산 예시 규칙]
- 기존 수치를 다시 설명하는 용도만 허용
- "이 숫자를 어떻게 해석하면 좋은지" 설명 문장 1개 필수
- 미래 예측·수익 단정 금지

[문체 규칙]
- 설명형 칼럼 톤 (뉴스 기사체 X, 교과서체 X)
- 문장 길이 다양화
- 짧은 문장도 섞기
- 독자에게 말 걸듯 서술

[출력 형식 — JSON만]
{
  "title": "SEO H1",
  "meta_description": "150~170자 요약",
  "tags": ["태그1","태그2","태그3"],
  "markdown": "최종 본문 (마크다운)"
}

[자동 실패 조건]
아래 중 2개 이상 미충족 시 오류로 간주:
- 도입부에 질문(물음표) 없음
- Human Phrase Pool 계열 문장 미사용
- 사례에 감정 표현 없음
- 정리 문단에서 독자 판단 기준 제시 없음`

  const userPrompt = `다음 초안을 블로그 글로 재작성해주세요:

${cleanDraft}`

  return {
    systemPrompt,
    userPrompt,
    variationMeta: {
      outlineId: outline.id,
      introId: intro.id,
      outroHints: outros
    }
  }
}

// ============================================
// [검증] 품질 검증 함수
// ============================================
/**
 * 컬럼니스트 결과물의 품질을 검증합니다.
 * @param markdown 생성된 마크다운 본문
 * @returns 검증 결과 (성공 여부, 실패/경고 이유)
 */
export function validateColumnistOutput(markdown: string): {
  isValid: boolean
  failures: string[]
  warnings: string[]
} {
  const failures: string[] = []
  const warnings: string[] = []

  // 1. 금지 표현 검사 (실패)
  const forbiddenPhrases = [
    '이 글을 통해',
    '알아보겠습니다',
    '살펴봅니다',
    '살펴보겠습니다'
  ]

  for (const phrase of forbiddenPhrases) {
    if (markdown.includes(phrase)) {
      failures.push(`금지 표현 발견: "${phrase}"`)
    }
  }

  // 2. 도입부 물음표 검사 (첫 1500자 내) - 실패
  const introSection = markdown.slice(0, 1500)
  if (!introSection.includes('?')) {
    failures.push('도입부(첫 1500자)에 질문(물음표)이 없습니다')
  }

  // 3. 사례 섹션 감정 표현 검사 - 실패
  const emotionWords = ['고민', '망설', '부담', '걱정', '불안', '조심']
  const hasEmotionWord = emotionWords.some(word => markdown.includes(word))
  if (!hasEmotionWord) {
    failures.push(`사례에 감정 표현이 없습니다 (필요: ${emotionWords.join(', ')} 중 하나)`)
  }

  // 4. 한 줄 요약 존재 여부 - 경고
  if (!markdown.includes('한 줄 요약') && !markdown.includes('핵심 요약') && !markdown.includes('한줄 요약') && !markdown.includes('핵심 숫자')) {
    warnings.push('한 줄 요약 섹션이 명시적으로 보이지 않습니다')
  }

  // 5. FAQ 존재 여부 - 경고
  const faqCount = (markdown.match(/Q\d|FAQ|자주 묻는|질문/gi) || []).length
  if (faqCount < 2) {
    warnings.push('FAQ 섹션이 부족해 보입니다 (최소 3개 권장)')
  }

  // 6. 정리 섹션 존재 여부 - 경고
  if (!markdown.includes('정리') && !markdown.includes('마무리') && !markdown.includes('마치며')) {
    warnings.push('정리/마무리 섹션이 명시적으로 보이지 않습니다')
  }

  return {
    isValid: failures.length === 0,
    failures,
    warnings
  }
}

// ============================================
// [Export] 템플릿 메타데이터 (디버깅용)
// ============================================
export const VARIATION_OPTIONS = {
  outlines: OUTLINE_TEMPLATES.map(t => ({ id: t.id, name: t.name })),
  intros: INTRO_PATTERNS.map(p => ({ id: p.id, name: p.name })),
  outroCount: OUTRO_ACTION_HINTS.length
}
