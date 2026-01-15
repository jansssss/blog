/**
 * OHYESS Human Phrase Pool 테스트
 * 실행: npx ts-node lib/ohyess/humanPhrases.test.ts
 * 또는: npx tsx lib/ohyess/humanPhrases.test.ts
 */

import {
  OHYESS_HUMAN_PHRASES_V1,
  pickHumanPhrases,
  getTotalPhraseCount
} from './humanPhrases.v1'
import {
  buildColumnistPrompt,
  validateColumnistOutput
} from '../prompts/columnist'

// 테스트 유틸
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`)
    process.exit(1)
  }
  console.log(`✅ PASS: ${message}`)
}

function runTests() {
  console.log('\n🧪 OHYESS Human Phrase Pool 테스트 시작\n')
  console.log('='.repeat(50))

  // 테스트 1: 문구풀 개수 확인
  console.log('\n📝 테스트 1: 문구풀 기본 검증')
  assert(OHYESS_HUMAN_PHRASES_V1.length === 24, '문구풀은 24개여야 함')
  assert(getTotalPhraseCount() === 24, 'getTotalPhraseCount()도 24 반환')

  // 테스트 2: pickHumanPhrases 기본 동작
  console.log('\n📝 테스트 2: pickHumanPhrases 기본 동작')
  const result1 = pickHumanPhrases(6, 10)
  assert(result1.phrases.length >= 6, '최소 6개 이상 선택')
  assert(result1.phrases.length <= 10, '최대 10개 이하 선택')
  assert(typeof result1.seed === 'string', 'seed는 문자열')
  assert(result1.seed.length > 0, 'seed는 비어있지 않음')

  // 테스트 3: 중복 없이 선택
  console.log('\n📝 테스트 3: 중복 없이 선택')
  const result2 = pickHumanPhrases(10, 10)
  const uniquePhrases = new Set(result2.phrases)
  assert(uniquePhrases.size === result2.phrases.length, '중복 없이 선택됨')

  // 테스트 4: 랜덤성 확인 (3번 실행하여 다른 결과 확인)
  console.log('\n📝 테스트 4: 랜덤성 확인')
  const results = [
    pickHumanPhrases(6, 10),
    pickHumanPhrases(6, 10),
    pickHumanPhrases(6, 10)
  ]
  const allSame = results.every(r => r.seed === results[0].seed)
  assert(!allSame, '각 호출마다 다른 seed 생성')

  // 테스트 5: buildColumnistPrompt 동작
  console.log('\n📝 테스트 5: buildColumnistPrompt 동작')
  const sampleDraft = '테스트 초안 내용입니다. 금리가 0.25% 인상되었습니다.'
  const { systemPrompt, userPrompt } = buildColumnistPrompt({
    cleanDraft: sampleDraft,
    humanPhrases: result1.phrases
  })

  assert(systemPrompt.includes('Human Phrase Pool'), '시스템 프롬프트에 Human Phrase Pool 포함')
  assert(systemPrompt.includes(result1.phrases[0]), '선택된 문구가 프롬프트에 포함')
  assert(userPrompt.includes(sampleDraft), '유저 프롬프트에 초안 포함')

  // 테스트 6: validateColumnistOutput - 성공 케이스
  console.log('\n📝 테스트 6: validateColumnistOutput - 성공 케이스')
  const validMarkdown = `# 금리 인상, 내 대출에는 어떤 영향?

뉴스를 보다가 그냥 지나쳤다면, 대부분은 이렇게 생각합니다. "금리가 올랐네." 그런데 이게 나랑 무슨 상관일까요?

숫자가 크게 보이지만, 막상 내 상황에 대입하면 느낌이 달라집니다.

이 글을 읽고 나면 대출 이자 계산의 기준점을 잡을 수 있습니다.

## 사례

35세 직장인 김씨는 주택담보대출 3억 원을 갖고 있습니다. 금리 인상 소식에 고민이 깊어졌습니다.

왜 이런 고민이 생길까요? 월 이자 부담이 달라지기 때문입니다.

## 정리

결국 판단 기준을 어디에 두느냐가 결과를 만듭니다.`

  const validResult = validateColumnistOutput(validMarkdown)
  assert(validResult.isValid, '유효한 마크다운은 통과해야 함')
  assert(validResult.failures.length === 0, '실패 항목 없음')

  // 테스트 7: validateColumnistOutput - 실패 케이스 (금지 표현)
  console.log('\n📝 테스트 7: validateColumnistOutput - 금지 표현 감지')
  const invalidMarkdown1 = `# 금리 인상 알아보기

이 글을 통해 금리 인상에 대해 알아보겠습니다.

고민했던 부분이 있었습니다.`

  const invalidResult1 = validateColumnistOutput(invalidMarkdown1)
  assert(!invalidResult1.isValid, '금지 표현 포함 시 실패')
  assert(invalidResult1.failures.some(f => f.includes('이 글을 통해')), '"이 글을 통해" 감지')
  assert(invalidResult1.failures.some(f => f.includes('알아보겠습니다')), '"알아보겠습니다" 감지')

  // 테스트 8: validateColumnistOutput - 실패 케이스 (물음표 없음)
  console.log('\n📝 테스트 8: validateColumnistOutput - 물음표 없음 감지')
  const invalidMarkdown2 = `# 금리 인상 정리

금리가 올랐습니다. 이는 중요한 변화입니다.

대출자들에게 영향을 줄 것입니다.

여러 가지 고민이 생기는 시점입니다.`

  const invalidResult2 = validateColumnistOutput(invalidMarkdown2)
  assert(!invalidResult2.isValid, '물음표 없으면 실패')
  assert(invalidResult2.failures.some(f => f.includes('물음표')), '물음표 없음 감지')

  // 테스트 9: validateColumnistOutput - 실패 케이스 (감정 표현 없음)
  console.log('\n📝 테스트 9: validateColumnistOutput - 감정 표현 없음 감지')
  const invalidMarkdown3 = `# 금리 인상 안내

금리가 올랐는데, 어떻게 해야 할까요?

대출자에게 영향이 있습니다.

김씨는 대출금을 갖고 있습니다. 이자가 올랐습니다.`

  const invalidResult3 = validateColumnistOutput(invalidMarkdown3)
  assert(!invalidResult3.isValid, '감정 표현 없으면 실패')
  assert(invalidResult3.failures.some(f => f.includes('감정 표현')), '감정 표현 없음 감지')

  // 테스트 10: 샘플 초안 3개로 프롬프트 빌드 테스트
  console.log('\n📝 테스트 10: 샘플 초안 3개 프롬프트 빌드')
  const sampleDrafts = [
    '한국은행이 기준금리를 0.25%p 인상했습니다. 이에 따라 대출 이자 부담이 커질 전망입니다.',
    '비트코인이 10만 달러를 돌파했습니다. 시장에서는 추가 상승을 기대하는 분위기입니다.',
    'KB국민은행이 주담대 금리를 0.1%p 인하했습니다. 타 은행도 따라갈지 주목됩니다.'
  ]

  sampleDrafts.forEach((draft, idx) => {
    const { phrases } = pickHumanPhrases(6, 10)
    const { systemPrompt, userPrompt } = buildColumnistPrompt({
      cleanDraft: draft,
      humanPhrases: phrases
    })

    console.log(`  - 샘플 ${idx + 1}: 문구 ${phrases.length}개 주입, 프롬프트 ${systemPrompt.length}자`)
    assert(systemPrompt.length > 1500, `샘플 ${idx + 1} 프롬프트 충분히 길어야 함`)
    assert(userPrompt.includes(draft), `샘플 ${idx + 1} 초안 포함 확인`)
  })

  console.log('\n' + '='.repeat(50))
  console.log('🎉 모든 테스트 통과!\n')
}

// 테스트 실행
runTests()
