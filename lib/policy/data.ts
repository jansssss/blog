/**
 * 검증된 정책 지원제도 데이터셋
 *
 * ⚠ 이 파일에 제도를 추가할 때의 규칙
 *   1. 반드시 **운영기관 공식 페이지**에서 조건을 확인하고 `source` 에 그 URL 을 적는다.
 *      블로그·위키·언론 기사는 출처로 쓰지 않는다.
 *   2. 확인한 날짜를 `asOf` 에 적는다. 기억이나 추정으로 채우지 않는다.
 *   3. 확인하지 못했으면 `status: 'unverified'` 로 두어 판정에서 제외한다.
 *      틀린 판정은 안내가 없는 것보다 해롭다.
 *
 * 아래 제도들은 2026-07-21 에 각 기관 공식 페이지에서 전수 확인했다.
 * 확인 과정에서 기존 페이지 데이터의 금리·한도가 전부 낡아 있었고,
 * 버팀목전세자금은 소득요건(6천→5천만원)과 순자산요건(3.61→3.45억)까지 틀려 있었다.
 */

import type { Policy } from './types'

const HUF = {
  name: '주택도시기금',
  url: 'https://nhuf.molit.go.kr',
}

export const POLICIES: Policy[] = [
  // ─── 전세자금 ─────────────────────────────────────────────────────────────
  {
    id: 'huf-jeonse-general',
    name: '버팀목전세자금',
    provider: '주택도시기금',
    category: 'jeonse',
    summary: '무주택 서민을 위한 저금리 전세자금 대출',
    status: 'active',
    criteria: {
      maxAnnualIncome: 50_000_000,
      incomeByMarital: {
        // 신혼가구는 7.5천만원까지 완화된다
        newlywed: 75_000_000,
      },
      maxNetAssets: 345_000_000,
      requiresHomeless: true,
    },
    manualChecks: [
      '민법상 성년인 세대주여야 합니다 (세대원 전원 무주택)',
      '주택도시기금 대출을 중복으로 이용 중이면 제한될 수 있습니다',
      '다자녀·2자녀 가구는 소득요건이 6천만원까지 완화됩니다',
    ],
    volatile: {
      rate: '연 2.5~3.5% (변동)',
      limitByRegion: {
        capital: '일반 1.2억원 / 신혼·다자녀 2.5억원',
        metro: '일반 8천만원 / 신혼·다자녀 1.6억원',
        other: '일반 8천만원 / 신혼·다자녀 1.6억원',
      },
      benefit: '대상주택 보증금 수도권 3억원 이하(신혼·다자녀 4억원)',
    },
    howToApply: '주택도시기금 홈페이지 또는 기금수탁은행(우리·국민·농협·신한·하나) 방문',
    asOf: '2026-07-21',
    source: { name: '주택도시기금 버팀목전세자금', url: 'https://nhuf.molit.go.kr/FP/FP05/FP0502/FP05020101.jsp' },
  },
  {
    id: 'huf-jeonse-youth',
    name: '청년전용 버팀목전세자금',
    provider: '주택도시기금',
    category: 'jeonse',
    summary: '만 19~34세 청년을 위한 우대 전세자금 대출',
    status: 'active',
    criteria: {
      age: { min: 19, max: 34 },
      maxAnnualIncome: 50_000_000,
      maxNetAssets: 345_000_000,
      requiresHomeless: true,
    },
    manualChecks: [
      '세대주 또는 예비 세대주여야 합니다 (세대원 전원 무주택)',
      '다자녀·2자녀·신혼가구는 소득요건이 6천~7.5천만원까지 완화됩니다',
    ],
    volatile: {
      rate: '연 2.2~3.3% (변동)',
      limit: '최대 1.5억원 (만 25세 미만 단독세대주 1.2억원), 임차보증금의 80% 이내',
      benefit: '대출기간 2년 (최장 10년)',
    },
    howToApply: '주택도시기금 홈페이지 또는 기금수탁은행 방문',
    asOf: '2026-07-21',
    source: { name: '주택도시기금 청년전용 버팀목전세자금', url: 'https://nhuf.molit.go.kr/FP/FP05/FP0502/FP05020301.jsp' },
  },
  {
    id: 'huf-jeonse-newlywed',
    name: '신혼부부전용 전세자금',
    provider: '주택도시기금',
    category: 'jeonse',
    summary: '혼인 7년 이내 신혼부부 우대 전세자금 대출',
    status: 'active',
    criteria: {
      maritalStatus: ['newlywed'],
      maxAnnualIncome: 75_000_000,
      maxNetAssets: 345_000_000,
      requiresHomeless: true,
    },
    manualChecks: [
      '혼인기간 7년 이내이거나 3개월 이내 결혼 예정이어야 합니다',
      '민법상 성년인 세대주여야 합니다 (세대원 전원 무주택)',
    ],
    volatile: {
      rate: '연 1.9~3.3% (변동)',
      limitByRegion: {
        capital: '최대 2.5억원',
        metro: '최대 1.6억원',
        other: '최대 1.6억원',
      },
      benefit: '임차보증금의 80% 이내',
    },
    howToApply: '주택도시기금 홈페이지 또는 기금수탁은행 방문',
    asOf: '2026-07-21',
    source: { name: '주택도시기금 신혼부부전용 전세자금', url: 'https://nhuf.molit.go.kr/FP/FP05/FP0502/FP05020401.jsp' },
  },
  {
    id: 'huf-jeonse-victim',
    name: '전세피해 임차인 버팀목전세자금',
    provider: '주택도시기금',
    category: 'jeonse',
    summary: '전세사기 피해 임차인을 위한 저금리 대출',
    status: 'active',
    criteria: {
      maxAnnualIncome: 130_000_000,
      maxNetAssets: 511_000_000,
      requiresHomeless: true,
    },
    manualChecks: [
      '전세피해주택 보증금이 5억원 이하여야 합니다',
      '보증금의 30% 이상 피해를 입은 사실이 확인되어야 합니다',
      '전세피해 확인서 등 증빙이 필요합니다',
    ],
    volatile: {
      rate: '연 1.2~2.7%',
      limit: '최대 2.4억원',
    },
    howToApply: '주택도시기금 홈페이지 또는 기금수탁은행 방문',
    asOf: '2026-07-21',
    source: { name: '주택도시기금 전세피해 임차인 버팀목전세자금', url: 'https://nhuf.molit.go.kr/FP/FP05/FP0502/FP05021201.jsp' },
  },

  // ─── 월세·주거비 ──────────────────────────────────────────────────────────
  {
    id: 'huf-monthly-loan',
    name: '주거안정월세대출',
    provider: '주택도시기금',
    category: 'monthly',
    summary: '월세 부담을 덜기 위한 저금리 월세 대출',
    status: 'active',
    criteria: {
      maxAnnualIncome: 50_000_000,
      maxNetAssets: 345_000_000,
      requiresHomeless: true,
    },
    manualChecks: [
      '대상주택 보증금 1억원 이하 및 월세 60만원 이하여야 합니다',
      '전용면적 85㎡ 이하 (수도권 외 읍·면지역 100㎡ 이하)',
      '우대형(취업준비생·근로장려금 수급자·주거급여 수급자 등)은 연소득 4천만원 이하 기준이 적용될 수 있습니다',
    ],
    volatile: {
      rate: '우대형 연 1.3% / 일반형 연 1.8%',
      limit: '최대 1,440만원 (매월 최대 60만원)',
      benefit: '대출기간 2년 (최장 10년)',
    },
    howToApply: '주택도시기금 홈페이지 또는 기금수탁은행 방문',
    asOf: '2026-07-21',
    source: { name: '주택도시기금 주거안정월세대출', url: 'https://nhuf.molit.go.kr/FP/FP05/FP0502/FP05020201.jsp' },
  },
  {
    id: 'huf-monthly-youth',
    name: '청년전용 보증부월세대출',
    provider: '주택도시기금',
    category: 'monthly',
    summary: '청년 대상 보증금·월세 동시 지원 대출',
    status: 'active',
    criteria: {
      age: { min: 19, max: 34 },
      maxAnnualIncome: 50_000_000,
      maxNetAssets: 345_000_000,
      requiresHomeless: true,
    },
    manualChecks: [
      '단독세대주(예비세대주 포함)여야 합니다',
      '대상주택 보증금 6,500만원 이하 및 월세 70만원 이하',
      '전용면적 60㎡ 이하',
    ],
    volatile: {
      rate: '보증금 연 1.3% / 월세금 연 0%(20만원 한도)~1.0%',
      limit: '보증금 최대 4,500만원 + 월세금 최대 1,200만원 (월 50만원 이내)',
    },
    howToApply: '주택도시기금 홈페이지 또는 기금수탁은행 방문',
    asOf: '2026-07-21',
    source: { name: '주택도시기금 청년전용 보증부월세대출', url: 'https://nhuf.molit.go.kr/FP/FP05/FP0502/FP05020701.jsp' },
  },
  {
    id: 'youth-monthly-rent-support',
    name: '청년월세 특별지원',
    provider: '국토교통부·복지로',
    category: 'monthly',
    summary: '부모와 따로 사는 무주택 청년에게 월세를 현금 지원',
    status: 'active',
    criteria: {
      age: { min: 19, max: 34 },
      // 청년가구 기준 중위소득 60% 이하
      maxMedianIncomeRatio: 60,
      maxNetAssets: 122_000_000,
      requiresHomeless: true,
    },
    manualChecks: [
      '부모와 별도 거주해야 합니다 (주민등록 분리)',
      '원가구(부모 포함) 소득이 기준 중위소득 100% 이하여야 합니다',
      '생애 1회만 지원되며, 이미 받은 경우 재신청할 수 없습니다',
      '지역별 선정 인원이 정해져 있어 자격을 갖춰도 탈락할 수 있습니다',
    ],
    volatile: {
      benefit: '월 최대 20만원 × 최장 24개월 (생애 1회)',
    },
    applicationPeriods: [{ start: '2026-03-30', end: '2026-05-29', label: '2026년 신규 모집' }],
    howToApply: '복지로 온라인 신청 또는 거주지 주민센터 방문',
    asOf: '2026-07-21',
    source: {
      name: '복지로 청년월세 지원사업',
      url: 'https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00004661',
    },
  },
  {
    id: 'housing-benefit',
    name: '주거급여',
    provider: '국토교통부·보건복지부',
    category: 'monthly',
    summary: '저소득 가구의 임차료 또는 주택 수선비 지원',
    status: 'active',
    criteria: {
      // 2026년 주거급여 선정기준: 기준 중위소득 48% 이하
      maxMedianIncomeRatio: 48,
    },
    manualChecks: [
      '소득인정액은 소득에 재산을 환산해 더한 값으로, 단순 연소득과 다릅니다',
      '자가 가구는 임차급여 대신 수선유지급여가 지급됩니다',
      '부양의무자 기준은 폐지되었으나 그 외 조사 항목이 있습니다',
    ],
    volatile: {
      benefit: '지역·가구원수별 기준임대료 내에서 임차료 지원 (2026년 기준임대료 인상)',
    },
    howToApply: '거주지 주민센터 또는 복지로 온라인 신청 (상시)',
    asOf: '2026-07-21',
    source: { name: '마이홈포털 주거급여 선정기준', url: 'https://www.myhome.go.kr/hws/portal/cont/selectHousingBenefitView.do' },
  },

  // ─── 주택구입 ─────────────────────────────────────────────────────────────
  {
    id: 'huf-purchase-didimdol',
    name: '내집마련 디딤돌대출',
    provider: '주택도시기금',
    category: 'purchase',
    summary: '무주택 서민의 주택 구입 자금 대출',
    status: 'active',
    criteria: {
      maxAnnualIncome: 60_000_000,
      incomeByMarital: {
        newlywed: 85_000_000,
      },
      maxNetAssets: 511_000_000,
      requiresHomeless: true,
    },
    manualChecks: [
      '대상주택 전용면적 85㎡ 이하 (읍·면지역 100㎡ 이하)',
      '주택 평가액 5억원 이하 (신혼·2자녀 이상 6억원)',
      '만 30세 미만 미혼세대주는 직계존비속 부양 요건이 추가됩니다',
      '생애최초·2자녀 이상은 소득요건이 7천만원까지 완화됩니다',
    ],
    volatile: {
      rate: '연 2.85~4.15%',
      limit: '일반 2억원 / 생애최초 2.4억원 / 신혼·2자녀 이상 3.2억원 (LTV 70%, DTI 60% 이내)',
    },
    howToApply: '주택도시기금 홈페이지 또는 기금수탁은행 방문',
    asOf: '2026-07-21',
    source: { name: '주택도시기금 내집마련 디딤돌대출', url: 'https://nhuf.molit.go.kr/FP/FP05/FP0503/FP05030101.jsp' },
  },
  {
    id: 'huf-purchase-newlywed',
    name: '신혼부부전용 주택구입자금',
    provider: '주택도시기금',
    category: 'purchase',
    summary: '혼인 7년 이내 신혼부부의 주택 구입 지원',
    status: 'active',
    criteria: {
      maritalStatus: ['newlywed'],
      maxAnnualIncome: 85_000_000,
      maxNetAssets: 511_000_000,
      requiresHomeless: true,
    },
    manualChecks: [
      '혼인기간 7년 이내이거나 3개월 이내 결혼 예정이어야 합니다',
      '세대주가 만 30세 이상이어야 합니다 (미성년 형제자매 부양 시 예외)',
      '대상주택 전용면적 85㎡ 이하, 평가액 6억원 이하',
    ],
    volatile: {
      rate: '연 2.55~3.85%',
      limit: '최대 3.2억원 (LTV 80%, 수도권·규제지역 70%)',
    },
    howToApply: '주택도시기금 홈페이지 또는 기금수탁은행 방문',
    asOf: '2026-07-21',
    source: { name: '주택도시기금 신혼부부전용 구입자금', url: 'https://nhuf.molit.go.kr/FP/FP05/FP0503/FP05030601.jsp' },
  },

  // ─── 자산형성 ─────────────────────────────────────────────────────────────
  {
    id: 'youth-future-savings',
    name: '청년미래적금',
    provider: '금융위원회·서민금융진흥원',
    category: 'asset',
    summary: '청년 자산형성을 돕는 정부기여금 매칭 적금 (청년도약계좌 후속)',
    status: 'active',
    criteria: {
      age: { min: 19, max: 34 },
      maxAnnualIncome: 75_000_000,
      maxMedianIncomeRatio: 180,
    },
    manualChecks: [
      '개인소득은 총급여 7,500만원 이하 또는 종합소득금액 6,300만원 이하 기준입니다',
      '병역 이행 기간은 최대 6년까지 나이 계산에서 제외됩니다',
      '직전연도 소득 확인이 가능해야 신청할 수 있습니다',
    ],
    volatile: {
      benefit: '월 최대 50만원 납입, 3년 만기. 정부기여금 일반형 6% / 우대형 12% 매칭',
    },
    applicationPeriods: [{ start: '2026-06-22', end: '2026-07-03', label: '2026년 1차' }],
    howToApply: '취급은행 앱에서 신청 (기업·농협·신한·우리·하나·국민·카카오뱅크 등)',
    asOf: '2026-07-21',
    source: { name: '금융위원회 청년미래적금 출시 보도자료', url: 'https://www.fsc.go.kr/no010101/87158' },
  },
  {
    id: 'youth-leap-account',
    name: '청년도약계좌',
    provider: '서민금융진흥원',
    category: 'asset',
    summary: '5년 만기 청년 자산형성 계좌 — 신규 가입 종료',
    status: 'closed',
    supersededBy: 'youth-future-savings',
    closedReason: '2025년 12월 신규 가입이 종료되었습니다. 기존 가입자는 만기까지 혜택이 유지됩니다.',
    criteria: {
      age: { min: 19, max: 34 },
      maxAnnualIncome: 75_000_000,
      maxMedianIncomeRatio: 250,
    },
    manualChecks: ['신규 가입은 불가하며, 후속 상품인 청년미래적금을 확인하세요'],
    volatile: {
      benefit: '월 최대 70만원 납입, 5년 만기 (기존 가입자 해당)',
    },
    howToApply: '신규 가입 불가',
    asOf: '2026-07-21',
    source: { name: '서민금융진흥원 청년도약계좌', url: 'https://www.kinfa.or.kr/financialProduct/youthLeapAccount.do' },
  },
  {
    id: 'youth-hope-savings',
    name: '청년희망적금',
    provider: '서민금융진흥원',
    category: 'asset',
    summary: '2022년 한시 운영된 청년 적금 — 종료',
    status: 'closed',
    supersededBy: 'youth-future-savings',
    closedReason:
      '2022년 한시 상품으로 이미 만기가 종료되었습니다. 이후 청년도약계좌를 거쳐 현재는 청년미래적금이 운영됩니다.',
    criteria: {},
    manualChecks: ['신규 가입 불가 — 청년미래적금을 확인하세요'],
    volatile: {},
    howToApply: '신규 가입 불가',
    asOf: '2026-07-21',
    source: { name: '서민금융진흥원 자산형성 상품', url: 'https://www.kinfa.or.kr/financialProduct/youthLeapAccount.do' },
  },
]

/** 판정 대상이 되는 제도 (종료·미검증 제외) */
export const ACTIVE_POLICIES = POLICIES.filter((p) => p.status === 'active')

/** 종료되었으나 사용자가 검색할 수 있어 안내가 필요한 제도 */
export const CLOSED_POLICIES = POLICIES.filter((p) => p.status === 'closed')

export function findPolicy(id: string): Policy | undefined {
  return POLICIES.find((p) => p.id === id)
}
