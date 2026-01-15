/**
 * OHYESS 사람 문구풀 v1
 * 블로그 글을 더 자연스럽고 인간적으로 만드는 24개 문구
 */

export const OHYESS_HUMAN_PHRASES_V1: string[] = [
  // 도입/공감 계열 (1-5)
  "뉴스를 보다가 그냥 지나쳤다면, 대부분은 이렇게 생각합니다.",
  "처음엔 내 얘기 같지 않아서 스킵하기 쉬운 소식입니다.",
  "숫자가 크게 보이지만, 막상 내 상황에 대입하면 느낌이 달라집니다.",
  "이런 뉴스는 '누가 부자 됐다'로 끝나기 쉬운데, 포인트는 따로 있습니다.",
  "겉으로는 먼 이야기 같지만, 의외로 내 자산과 연결되는 경우가 많습니다.",

  // 전환/질문 계열 (6-11)
  "이 지점에서 많은 사람들이 '그래서 나는 뭘 보면 되지?' 하고 멈춥니다.",
  "핵심은 '뉴스 자체'가 아니라, 그 뉴스가 만드는 시장 신호입니다.",
  "당장 체감이 없더라도, 기준점이 바뀌면 선택도 바뀝니다.",
  "중요한 건 한 번의 등락이 아니라, 흐름이 어디로 향하느냐입니다.",
  "이 변화는 크고 작음을 떠나 '판단 프레임'을 바꿔 놓습니다.",
  "결국 내 돈에 영향을 주는 건 '이름'이 아니라 '가격의 방향'입니다.",

  // 행동/판단 계열 (12-18)
  "여기서부터는 감이 아니라, 숫자로 한 번만 확인하면 됩니다.",
  "지금 당장 결론을 내릴 필요는 없습니다. 다만 점검은 필요합니다.",
  "정답은 사람마다 다릅니다. 대신 기준은 만들 수 있습니다.",
  "한쪽만 보고 결정하면 오히려 흔들리기 쉽습니다.",
  "모든 상승이 기회가 되는 건 아니고, 모든 하락이 위기도 아닙니다.",
  "내가 감당할 수 있는 변동 폭이 어느 정도인지부터 보는 게 먼저입니다.",
  "이럴 땐 '추가로 뭘 하느냐'보다 '무엇을 확인하느냐'가 더 중요합니다.",

  // 정리/마무리 계열 (19-24)
  "결론은 단순합니다. 내 상황에서 의미 있는 지점만 챙기면 됩니다.",
  "오늘 할 일은 '예측'이 아니라 '현재 상태 확인'입니다.",
  "이해하고 나면, 같은 뉴스를 봐도 해석이 달라집니다.",
  "알고 지나가는 것만으로도 불필요한 선택을 줄일 수 있습니다.",
  "결국 판단 기준을 어디에 두느냐가 결과를 만듭니다.",
  "급하게 움직이기보다, 한 번 정리하고 나서 선택해도 늦지 않습니다."
]

/**
 * 사람 문구풀에서 랜덤하게 문구를 선택합니다.
 * @param min 최소 선택 개수 (기본값: 6)
 * @param max 최대 선택 개수 (기본값: 10)
 * @returns 선택된 문구 배열과 시드값
 */
export function pickHumanPhrases(min = 6, max = 10): { phrases: string[]; seed: string } {
  // 선택할 개수 결정 (min ~ max 사이 랜덤)
  const count = Math.floor(Math.random() * (max - min + 1)) + min

  // 시드값 생성 (디버깅용)
  const seed = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

  // 인덱스 배열 생성 후 셔플
  const indices = Array.from({ length: OHYESS_HUMAN_PHRASES_V1.length }, (_, i) => i)

  // Fisher-Yates 셔플
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }

  // 앞에서 count개만 선택
  const selectedIndices = indices.slice(0, count)
  const phrases = selectedIndices.map(i => OHYESS_HUMAN_PHRASES_V1[i])

  return { phrases, seed }
}

/**
 * 전체 문구풀 개수 반환
 */
export function getTotalPhraseCount(): number {
  return OHYESS_HUMAN_PHRASES_V1.length
}
