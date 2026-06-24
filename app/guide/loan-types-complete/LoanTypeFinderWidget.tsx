'use client'
import { useState } from 'react'

type Purpose = 'buy' | 'jeonse' | 'cash' | 'business' | 'refinance'
type Income = 'low' | 'mid' | 'high'
interface Rec { title: string; desc: string; rate: string; note: string }

function getRecs(purpose: Purpose, income: Income): Rec[] {
  if (purpose === 'buy') {
    if (income === 'low') return [
      { title: '디딤돌대출', desc: '무주택 서민 주택 구입 정책대출', rate: '연 2.65~3.95%', note: '연소득 6천만원 이하 — 가장 낮은 금리, 최우선 검토' },
      { title: '보금자리론', desc: '장기 고정금리 주담대 (HF)', rate: '연 3%대', note: '소득 7천만원 이하, 디딤돌 한도 초과 시 활용' },
      { title: '시중은행 주담대', desc: 'LTV·DSR 한도 내 변동/고정 선택', rate: '연 3.5~5.5%', note: '정책대출 소진 후 보완 또는 한도 추가 확보' },
    ]
    if (income === 'mid') return [
      { title: '보금자리론', desc: '장기 고정금리 주담대', rate: '연 3%대', note: '소득 7천만원 이하 해당 시 우선 검토' },
      { title: '시중은행 주담대', desc: 'LTV·DSR 한도 내 신용·소득 반영', rate: '연 3.5~5.5%', note: '주거래 은행 급여이체·적금으로 우대금리 최대화' },
    ]
    return [
      { title: '시중은행 주담대', desc: '우량 신용 기준 최저금리 적용', rate: '연 3.2~4.5%', note: '급여이체·자동이체로 0.5%p 이상 우대 가능' },
      { title: '인터넷은행 주담대', desc: '비대면 빠른 심사, 경쟁 금리', rate: '연 3.2~4.8%', note: '시중은행과 반드시 병행 비교 — 최저 확보' },
    ]
  }
  if (purpose === 'jeonse') {
    if (income === 'low') return [
      { title: '버팀목 전세대출', desc: '무주택 정책 전세대출 (주택도시기금)', rate: '연 1.8~2.9%', note: '연소득 5천만원 이하 — 시중은행 대비 금리 절반 이하' },
      { title: 'HF 전세대출', desc: '주택금융공사 보증, 소득 유연', rate: '연 3.2~4.5%', note: '버팀목 소득 초과 시 차선책' },
    ]
    if (income === 'mid') return [
      { title: '버팀목 / HF 전세', desc: '정책 우선 검토 후 시중은행 보완', rate: '연 1.8~4.5%', note: '버팀목 조건 해당 여부 먼저 확인 필수' },
      { title: '시중은행 전세대출', desc: 'SGI 보증, 소득 제한 없음', rate: '연 3.5~5.5%', note: '정책 미해당 시 대안, 신용점수로 금리 협상' },
    ]
    return [
      { title: '시중은행 전세대출', desc: 'SGI 보증 활용, 한도 유연', rate: '연 3.5~5.5%', note: '신용 우수자 우대 금리, 주거래 은행 집중' },
    ]
  }
  if (purpose === 'cash') {
    if (income === 'low') return [
      { title: '햇살론 · 사잇돌', desc: '저신용·저소득 정책 서민 대출', rate: '연 7~11%', note: '보증재단 보증 심사 통과 시 저금리 — 1순위' },
      { title: '신용대출 (인터넷은행)', desc: '카카오·케이뱅크·토스 자체 모형', rate: '연 5~12%', note: '시중은행 거절 시 대안, 조건 비교 필수' },
    ]
    if (income === 'mid') return [
      { title: '신용대출', desc: '주거래 은행 급여이체 우대금리 적용', rate: '연 5~9%', note: '3곳 이상 금리 비교 후 최저 선택' },
      { title: '마이너스통장', desc: '한도 내 유동성 확보, 실사용액만 이자', rate: '연 5~10%', note: '단기 자금·비상금 용도로 유연하게 활용' },
    ]
    return [
      { title: '신용대출', desc: '우량 신용 기준 최저금리', rate: '연 4~7%', note: '주거래 집중으로 우대 극대화, 한도 내 최소 차입' },
    ]
  }
  if (purpose === 'business') return [
    { title: '소진공 보증부 대출', desc: '소상공인진흥공단 보증서 발급 후 은행 대출', rate: '연 3~6%', note: '보증서가 있으면 금리가 크게 낮아짐 — 1순위' },
    { title: '사업자 운전자금 대출', desc: '매출·세금신고 소득 기준 은행 심사', rate: '연 4~10%', note: '종합소득세 성실 신고가 한도를 결정함' },
    { title: '매출채권 담보대출', desc: '세금계산서·외상매출금 담보 단기 자금', rate: '연 4~8%', note: '매출 실적 있는 업체에 유리, 빠른 실행' },
  ]
  // refinance
  if (income === 'low') return [
    { title: '대환대출 (저금리 전환)', desc: '고금리 → 저금리 갈아타기', rate: '연 4~8%', note: '중도상환수수료 먼저 계산 — 손익분기 확인 필수' },
  ]
  return [
    { title: '대환대출', desc: '금리 차이 0.5%p 이상이면 검토', rate: '연 3.5~7%', note: '수수료 + 부대비용 vs 절감액 비교 후 결정' },
    { title: '금리 인하 요구권', desc: '현재 금융사에 금리 인하 요청', rate: '0.1~0.5%p 인하', note: '대환 전 먼저 시도 — 비용 없이 금리 낮추기 가능' },
  ]
}

const PURPOSES: { id: Purpose; label: string; emoji: string }[] = [
  { id: 'buy',       label: '주택 구입',   emoji: '🏠' },
  { id: 'jeonse',   label: '전세 보증금', emoji: '🔑' },
  { id: 'cash',     label: '급전·생활비', emoji: '💰' },
  { id: 'business', label: '사업 자금',   emoji: '🏢' },
  { id: 'refinance',label: '고금리 대환', emoji: '🔄' },
]
const INCOMES: { id: Income; label: string }[] = [
  { id: 'low',  label: '5천만원 이하' },
  { id: 'mid',  label: '5천만~1억' },
  { id: 'high', label: '1억 이상' },
]

export default function LoanTypeFinderWidget() {
  const [purpose, setPurpose] = useState<Purpose | null>(null)
  const [income, setIncome] = useState<Income | null>(null)

  const recs = purpose && (purpose === 'business' || income)
    ? getRecs(purpose, income ?? 'mid')
    : null

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-5 sm:p-6 mb-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-sm font-bold">⚡</div>
        <div>
          <p className="text-sm font-bold text-gray-900">내 상황에 맞는 대출 찾기</p>
          <p className="text-xs text-gray-400">목적 + 소득 선택 → 최적 경로 즉시 추천</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-700 mb-2">대출 목적</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PURPOSES.map(p => (
            <button key={p.id} onClick={() => setPurpose(p.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-left ${purpose === p.id ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-indigo-200'}`}>
              <span>{p.emoji}</span><span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {purpose && purpose !== 'business' && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-700 mb-2">연소득</p>
          <div className="flex gap-2">
            {INCOMES.map(i => (
              <button key={i.id} onClick={() => setIncome(i.id)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${income === i.id ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-indigo-200'}`}>
                {i.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {recs ? (
        <div className="space-y-2">
          {recs.map((r, i) => (
            <div key={i} className={`rounded-xl p-4 ${i === 0 ? 'border border-indigo-200 bg-indigo-50' : 'bg-white border border-gray-100 shadow-sm'}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className={`text-sm font-bold ${i === 0 ? 'text-indigo-800' : 'text-gray-900'}`}>
                    {i === 0 ? '🥇 ' : i === 1 ? '🥈 ' : '🥉 '}{r.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
                </div>
                <span className={`text-xs font-semibold shrink-0 ${i === 0 ? 'text-indigo-600' : 'text-gray-500'}`}>{r.rate}</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1.5 border-t border-gray-100 pt-1.5">💡 {r.note}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-xs text-gray-500 text-center">
          위 항목을 선택하면 맞춤 대출 경로가 표시됩니다
        </div>
      )}
    </div>
  )
}
