import { ExternalLink, Gift } from 'lucide-react'

const REFERRAL_CODE = '6KP1Q2TT27'
const REFERRAL_URL = 'https://www.bithumb.com/react/referral'

export default function BithumbCTA() {
  return (
    <section className="mb-10">
      <div
        className="rounded-xl p-6 border"
        style={{
          background: 'linear-gradient(135deg, #FFF9E6 0%, #FFF3CC 100%)',
          borderColor: '#F7A600',
        }}
      >
        {/* 헤더 */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#F7A600' }}
          >
            <Gift className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: '#7A5000' }}>
              빗썸 신규 가입 혜택
            </p>
            <p className="text-xs" style={{ color: '#A06800' }}>
              추천코드 입력 시 최대 7만원
            </p>
          </div>
        </div>

        {/* 혜택 설명 */}
        <p className="text-sm mb-4" style={{ color: '#5C3D00' }}>
          빗썸 신규 회원 가입 후 추천코드를 입력하면{' '}
          <strong>가입 혜택 5만원 + 웰컴미션 완료 시 2만원</strong>, 총 최대 7만원 혜택을 받을 수 있습니다.
        </p>

        {/* 추천코드 + 버튼 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* 코드 박스 */}
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border flex-1"
            style={{ backgroundColor: '#FFFBF0', borderColor: '#F7A600' }}
          >
            <span className="text-xs font-medium" style={{ color: '#A06800' }}>
              추천코드
            </span>
            <span
              className="text-base font-bold tracking-widest"
              style={{ color: '#7A5000' }}
            >
              {REFERRAL_CODE}
            </span>
          </div>

          {/* 가입 버튼 */}
          <a
            href={REFERRAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90 shrink-0"
            style={{ backgroundColor: '#F7A600' }}
          >
            빗썸 가입하기
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <p className="text-xs mt-3" style={{ color: '#A06800' }}>
          * 가입 후 7일 이내 원화 계좌 연결 및 추천코드 등록 필요. 이벤트 조건은 변경될 수 있습니다.
        </p>
      </div>
    </section>
  )
}
