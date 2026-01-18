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
    id: 'P1_PERSONAL_DISCOVERY',
    name: '개인적 발견형',
    guide: '첫 문장을 "저는 지난주에 ○○을 알게 됐어요"처럼 개인 경험으로 시작. 독자가 "나도 그런 적 있는데" 하며 공감하게 만든다.',
    example: '저는 지난주 월요일 아침에 출근길 버스에서 우연히 이 뉴스를 봤어요. 처음엔 대충 넘길까 했는데, 숫자 하나가 눈에 확 들어오더라고요.'
  },
  {
    id: 'P2_MOMENT_OF_REALIZATION',
    name: '깨달음의 순간형',
    guide: '첫 문장에서 "○○했을 때 깨달았어요"처럼 특정 순간의 인사이트를 공유. 스토리에 빠져들게 만든다.',
    example: '제가 직접 계산기를 두드려봤을 때 깨달았어요. "아, 이거 내 얘기구나" 하고요.'
  },
  {
    id: 'P3_HONEST_CONFESSION',
    name: '솔직 고백형',
    guide: '첫 문장에서 "사실 저도 처음엔 ○○라고 생각했어요"처럼 솔직한 고백으로 시작. 독자와의 거리를 좁힌다.',
    example: '사실 저도 처음엔 "이런 뉴스가 나한테 무슨 상관이야" 하고 넘겼어요. 그런데 직접 확인해보니 완전 다르더라고요.'
  },
  {
    id: 'P4_SPECIFIC_ACTION',
    name: '구체적 행동형',
    guide: '첫 문장에서 "저는 어제 ○○을 해봤어요"처럼 구체적 행동으로 시작. 독자가 "나도 해봐야지" 느끼게 만든다.',
    example: '저는 어제 퇴근하고 바로 은행 앱을 켜봤어요. 제 대출 금리가 얼마나 바뀌었는지 확인하려고요.'
  },
  {
    id: 'P5_EMOTIONAL_HOOK',
    name: '감정 훅형',
    guide: '첫 문장에서 "○○했을 때 정말 놀랐어요"처럼 강한 감정으로 시작. 독자의 호기심을 자극한다.',
    example: '계산 결과를 보고 정말 놀랐어요. 저는 월 12만 원 정도 차이 날 거라고 예상했는데, 실제로는 완전 달랐거든요.'
  },
  {
    id: 'P6_PLOT_TWIST',
    name: '반전형',
    guide: '첫 부분에서 A라고 예상했다가 B였던 경험으로 시작. "○○인 줄 알았는데, 알고보니 ○○였어요" 구조. 독자가 "헐 진짜?" 하며 끝까지 읽게 만든다.',
    example: '저는 이번 금리 인상이 제 대출에 월 5만 원 정도 영향 줄 거라고 생각했어요. 그런데 실제로 계산해보니까... 15만 원이 늘어나더라고요. 완전히 예상 밖이었죠.'
  }
]

// ============================================
// [3] 결론/행동힌트 문장 템플릿 10종
// ============================================
const OUTRO_ACTION_HINTS = [
  '저는 일단 ○○만 확인해봤어요. 여러분도 그것만 먼저 체크해보시면 좋을 것 같아요.',
  '제 경우엔 ○○을 먼저 했더니 상황이 훨씬 명확해지더라고요.',
  '처음엔 복잡해 보였는데, 막상 ○○을 해보니까 생각보다 간단했어요.',
  '저는 이번 주 안에 ○○만 해볼 계획이에요. 급하게 결정할 필요는 없으니까요.',
  '전부 다 바꿀 필요는 없더라고요. 저는 ○○ 하나만 확인했는데도 충분했어요.',
  '제가 가장 먼저 한 건 ○○ 앱에서 제 상태를 확인한 거예요. 5분도 안 걸렸어요.',
  '최악의 상황을 피하려면, 저처럼 최소한 ○○은 알고 계셔야 할 것 같아요.',
  '저는 ○○에 관한 알림을 켜뒀어요. 나중에 놓칠까봐요.',
  '당장 판단하지 않아도 돼요. 저도 일단 ○○만 메모해뒀어요.',
  '저한테 가장 중요했던 건 "내가 해당되는지 아닌지"였어요. ○○에서 바로 확인할 수 있더라고요.'
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
- 정보 나열이 아닌 경험과 감정 중심의 스토리텔링으로 작성
- 실제 사람의 경험담처럼 생생하고 공감 가는 글쓰기
- "이렇게 하면 됩니다" ❌ → "저는 이렇게 해서 이런 결과를 얻었어요" ✅
- 조회수를 높이는 핵심: 독자가 "나도 해봐야지" 느끼게 만들기

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

[경험담 작성 규칙 - 매우 중요!]
글 전체를 1인칭 경험담 형식으로 작성하라:

✅ 좋은 예시:
"저는 작년 3월부터 매일 아침 6시에 일어나서 30분씩 플랭크를 했어요. 처음엔 10초도 버티기 힘들었는데, 3일차부터는 '이거 정말 효과 있을까?' 하는 의심이 들더라고요. 그런데 2주가 지나니까 배에 힘이 들어가는 게 느껴지기 시작했어요. 20일 후 체중계에 올라갔을 때 10kg이 빠진 걸 확인하고 정말 놀랐습니다."

❌ 나쁜 예시:
"플랭크 운동은 코어 근육을 강화하는 효과가 있습니다. 매일 30분씩 꾸준히 하면 다이어트에 도움이 됩니다."

필수 요소:
- 구체적인 시점 (작년 3월, 지난주 월요일 등)
- 숫자로 표현된 경험 (30분, 10kg, 20일 등)
- 과정 중 느낀 감정 (의심, 놀람, 걱정, 기대, 실망 등)
- 결과에 대한 솔직한 반응
- "저는/제가" 시점 유지

[반전 요소 활용 - 조회수 폭발 핵심!]
주제의 특성상 반전이 가능한 경우, 적극적으로 활용하라:

✅ 반전 예시 1 (기대 vs 현실):
"저는 이번 정책이 월 3만 원 정도 아낄 수 있을 거라 예상했어요. 그런데 막상 계산해보니 월 15만 원이 절약되더라고요. 1년이면 180만 원이에요!"

✅ 반전 예시 2 (오해 → 진실):
"처음엔 '이거 고소득자만 해당되겠지' 했어요. 그런데 알고보니 연봉 3천만 원대도 충분히 혜택 받을 수 있더라고요."

✅ 반전 예시 3 (손해인 줄 알았는데 이득):
"금리가 오른다니까 당연히 손해라고 생각했죠. 근데 제 경우엔 오히려 예금 이자가 늘어나서 플러스였어요."

반전 구조:
1. 처음 생각/기대 → 2. 실제 확인/계산 → 3. 놀라운 결과 → 4. 구체적 숫자로 증명

[계산 예시 규칙]
- 기존 수치를 다시 설명하는 용도만 허용
- "이 숫자를 어떻게 해석하면 좋은지" 설명 문장 1개 필수
- 미래 예측·수익 단정 금지

[문체 규칙]
- 경험담·후기 톤 (뉴스 기사체 X, 교과서체 X, 설명서체 X)
- 1인칭 시점 유지 (저는/제가/저희)
- 구어체 자연스럽게 섞기 ("~더라고요", "~했어요", "~네요")
- 짧은 문장과 긴 문장 섞어서 리듬감 살리기
- 독자에게 경험을 공유하듯 서술

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
- 1인칭 시점("저는/제가") 3회 미만 사용
- 구체적 숫자(날짜, 금액, 기간 등) 5개 미만
- 감정 표현("놀랐다/걱정됐다/기뻤다" 등) 없음
- 경험 공유 톤이 아닌 설명 톤으로 작성됨`

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

  // 3. 1인칭 시점 검사 - 실패
  const firstPersonCount = (markdown.match(/저는|제가|저도|제|저한테/g) || []).length
  if (firstPersonCount < 3) {
    failures.push(`1인칭 시점 부족 (${firstPersonCount}회, 최소 3회 필요)`)
  }

  // 4. 감정 표현 검사 - 실패
  const emotionWords = ['놀랐', '기뻤', '걱정', '불안', '조심', '고민', '망설', '부담', '확인', '깨달', '느꼈', '생각했']
  const hasEmotionWord = emotionWords.some(word => markdown.includes(word))
  if (!hasEmotionWord) {
    failures.push(`감정 표현이 없습니다 (필요: ${emotionWords.join(', ')} 중 하나)`)
  }

  // 5. 구어체 표현 검사 - 경고
  const colloquialCount = (markdown.match(/더라고요|했어요|네요|거든요|였어요/g) || []).length
  if (colloquialCount < 2) {
    warnings.push(`구어체 표현 부족 (${colloquialCount}회, 최소 2회 권장)`)
  }

  // 6. 한 줄 요약 존재 여부 - 경고
  if (!markdown.includes('한 줄 요약') && !markdown.includes('핵심 요약') && !markdown.includes('한줄 요약') && !markdown.includes('핵심 숫자')) {
    warnings.push('한 줄 요약 섹션이 명시적으로 보이지 않습니다')
  }

  // 7. FAQ 존재 여부 - 경고
  const faqCount = (markdown.match(/Q\d|FAQ|자주 묻는|질문/gi) || []).length
  if (faqCount < 2) {
    warnings.push('FAQ 섹션이 부족해 보입니다 (최소 3개 권장)')
  }

  // 8. 정리 섹션 존재 여부 - 경고
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
