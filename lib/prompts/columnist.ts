/**
 * OHYESS 칼럼니스트(pass2) 프롬프트 빌더
 * 사람 문구풀을 주입하여 더 자연스러운 글을 생성
 */

export interface ColumnistPromptParams {
  cleanDraft: string
  humanPhrases: string[]
}

/**
 * 칼럼니스트 프롬프트를 생성합니다.
 * @param params cleanDraft와 humanPhrases를 포함한 객체
 * @returns 시스템 프롬프트와 유저 프롬프트
 */
export function buildColumnistPrompt(params: ColumnistPromptParams): {
  systemPrompt: string
  userPrompt: string
} {
  const { cleanDraft, humanPhrases } = params

  // 선택된 문구를 bullet 형태로 포맷
  const phraseBullets = humanPhrases.map(p => `- "${p}"`).join('\n')

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

[도입부 규칙 — 3문단 고정]
1문단: 일상에서 뉴스 스쳐본 상황 묘사 + 질문 1개 (물음표 필수)
2문단: 이 뉴스가 왜 내 자산·판단과 연결되는지 설명
3문단: 이 글을 읽고 나면 무엇을 판단할 수 있는지 제시

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

[고정 섹션 순서]
1) H1
2) 도입부 3문단
3) 한 줄 요약
4) 이슈 배경
5) 나에게 미치는 영향
6) 계산 예시
7) 구체적 사례
8) 실제 활용 방법
9) FAQ 3개
10) 정리
11) 주의사항
12) SEO 태그 3개

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

  return { systemPrompt, userPrompt }
}

/**
 * 컬럼니스트 결과물의 품질을 검증합니다.
 * @param markdown 생성된 마크다운 본문
 * @returns 검증 결과 (성공 여부, 실패 이유)
 */
export function validateColumnistOutput(markdown: string): {
  isValid: boolean
  failures: string[]
} {
  const failures: string[] = []

  // 1. 금지 표현 검사
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

  // 2. 도입부 물음표 검사 (첫 3문단, 대략 처음 1000자 내)
  const introSection = markdown.slice(0, 1500)
  if (!introSection.includes('?')) {
    failures.push('도입부(첫 1500자)에 질문(물음표)이 없습니다')
  }

  // 3. 사례 섹션 감정 표현 검사
  const emotionWords = ['고민', '망설', '부담', '걱정', '불안', '조심']
  const hasEmotionWord = emotionWords.some(word => markdown.includes(word))
  if (!hasEmotionWord) {
    failures.push(`사례에 감정 표현이 없습니다 (필요: ${emotionWords.join(', ')} 중 하나)`)
  }

  return {
    isValid: failures.length === 0,
    failures
  }
}
