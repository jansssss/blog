import { getCurrentSite } from '@/lib/site'
import Link from 'next/link'

export default async function AboutPage() {
  const site = await getCurrentSite()
  const domain = site?.domain

  // 사이트별 콘텐츠 분기
  if (domain === 'sureline.kr') {
    return <SurelineAbout />
  }

  // 기본: ohyess.kr
  return <OhyessAbout />
}

// 오예스 (대출/금융 정보)
function OhyessAbout() {
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-4xl font-bold mb-8">오예스 소개</h1>

      <div className="prose prose-gray max-w-none">
        {/* 운영자 소개 */}
        <section className="mb-10">
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">안녕하세요, 오예스입니다</h2>
            <p className="text-gray-700 leading-relaxed text-lg mb-4">
              오예스는 <strong>대출, 금융, 재테크</strong> 정보를 쉽고 정확하게 전달하는 금융 정보 플랫폼입니다.
            </p>
            <p className="text-gray-600 leading-relaxed">
              복잡한 금융 용어와 계산을 누구나 이해할 수 있도록 정리하고,
              실생활에 바로 활용할 수 있는 계산기와 가이드를 제공합니다.
            </p>
          </div>
        </section>

        {/* 운영 목적 */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">운영 목적</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">정확한 금융 정보 제공</h3>
              <p className="text-gray-700">
                대출 이자, 상환 방식, 중도상환수수료 등 금융 관련 정보를 정확하게 계산하고 설명합니다.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <h3 className="text-lg font-semibold text-green-900 mb-2">실용적인 계산 도구</h3>
              <p className="text-gray-700">
                대출 이자 계산기, 상환방식 비교, 대출한도 계산 등 실생활에 필요한 금융 계산기를 무료로 제공합니다.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">쉬운 금융 가이드</h3>
              <p className="text-gray-700">
                어려운 금융 개념을 쉽게 풀어서 설명하고, 현명한 금융 결정을 돕는 가이드를 제공합니다.
              </p>
            </div>
          </div>
        </section>

        {/* 주요 서비스 */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">주요 서비스</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/calculator/loan-interest" className="block p-4 border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors">
              <p className="font-semibold text-gray-900">대출 이자 계산기</p>
              <p className="text-sm text-gray-600">원금, 금리, 기간으로 이자 계산</p>
            </Link>
            <Link href="/calculator/repayment-compare" className="block p-4 border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors">
              <p className="font-semibold text-gray-900">상환방식 비교</p>
              <p className="text-sm text-gray-600">원리금균등 vs 원금균등 비교</p>
            </Link>
            <Link href="/calculator/prepayment-fee" className="block p-4 border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors">
              <p className="font-semibold text-gray-900">중도상환수수료 계산</p>
              <p className="text-sm text-gray-600">조기 상환 시 수수료 계산</p>
            </Link>
            <Link href="/calculator/loan-limit" className="block p-4 border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors">
              <p className="font-semibold text-gray-900">대출한도 계산기</p>
              <p className="text-sm text-gray-600">소득 기준 대출 가능 금액 추정</p>
            </Link>
          </div>
        </section>

        {/* 운영 방침 */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">운영 방침</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>정확성:</strong> 금융 정보는 공식 자료와 계산 공식을 기반으로 제공합니다</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>투명성:</strong> 계산 결과는 참고용이며, 실제 조건은 금융기관마다 다를 수 있음을 명시합니다</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>독립성:</strong> 특정 금융 상품을 판매하거나 중개하지 않습니다</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>정기 업데이트:</strong> 금리 변동, 정책 변경 시 콘텐츠를 업데이트합니다</span>
              </li>
            </ul>
          </div>
        </section>

        {/* 면책 고지 */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">면책 고지</h2>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800 text-sm leading-relaxed">
              본 사이트에서 제공하는 정보와 계산 결과는 참고용이며, 실제 금융 상품의 조건은
              개인의 신용도, 소득, 담보 등에 따라 상이할 수 있습니다.
              정확한 정보는 반드시 해당 금융기관에 직접 문의하시기 바랍니다.
              본 사이트는 금융 상품 판매 또는 중개를 하지 않습니다.
            </p>
          </div>
        </section>

        {/* 문의하기 */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">문의하기</h2>
          <p className="text-gray-700 mb-4">
            궁금한 점이나 오류 제보, 제안 사항이 있으시면 언제든지 연락 주세요.
          </p>
          <div className="p-6 bg-blue-50 rounded-lg">
            <p className="text-gray-700">
              <strong>이메일:</strong>{' '}
              <a href="mailto:goooods@naver.com" className="text-blue-600 hover:underline">
                goooods@naver.com
              </a>
            </p>
          </div>
        </section>

        <div className="mt-12 pt-6 border-t text-center">
          <p className="text-gray-600">
            오예스를 방문해 주셔서 감사합니다.
          </p>
        </div>
      </div>
    </div>
  )
}

// 슈어라인 (보험 정보)
function SurelineAbout() {
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-4xl font-bold mb-8">슈어라인 소개</h1>

      <div className="prose prose-gray max-w-none">
        {/* 운영자 소개 */}
        <section className="mb-10">
          <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">안녕하세요, 슈어라인입니다</h2>
            <p className="text-gray-700 leading-relaxed text-lg mb-4">
              슈어라인은 <strong>보험 정보 점검과 절약</strong>을 돕는 보험 정보 플랫폼입니다.
            </p>
            <p className="text-gray-600 leading-relaxed">
              복잡한 보험 상품을 쉽게 이해하고, 불필요한 중복 보장을 점검하며,
              적용 가능한 할인을 놓치지 않도록 돕는 점검 도구와 가이드를 제공합니다.
            </p>
          </div>
        </section>

        {/* 운영 목적 */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">운영 목적</h2>
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-lg border-l-4 border-emerald-500">
              <h3 className="text-lg font-semibold text-emerald-900 mb-2">보험 점검 도구 제공</h3>
              <p className="text-gray-700">
                자동차보험 할인 진단, 실손/건강보험 중복 점검, 보험 리모델링 체크 등
                스스로 보험을 점검할 수 있는 도구를 무료로 제공합니다.
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">쉬운 보험 가이드</h3>
              <p className="text-gray-700">
                어려운 보험 용어와 상품 구조를 쉽게 설명하고,
                현명한 보험 선택을 위한 가이드를 제공합니다.
              </p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
              <h3 className="text-lg font-semibold text-amber-900 mb-2">객관적인 정보 제공</h3>
              <p className="text-gray-700">
                특정 보험사나 상품을 추천하지 않고,
                소비자 관점에서 객관적인 정보만을 제공합니다.
              </p>
            </div>
          </div>
        </section>

        {/* 주요 서비스 */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">주요 서비스</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/tools/auto-discount-check" className="block p-4 border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors">
              <p className="font-semibold text-gray-900">자동차보험 할인 진단</p>
              <p className="text-sm text-gray-600">적용 가능한 할인 항목 점검</p>
            </Link>
            <Link href="/tools/health-overlap-check" className="block p-4 border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors">
              <p className="font-semibold text-gray-900">실손/건강 중복 점검</p>
              <p className="text-sm text-gray-600">중복 보장 분석</p>
            </Link>
            <Link href="/tools/insurance-remodel" className="block p-4 border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors">
              <p className="font-semibold text-gray-900">보험 리모델링 체크</p>
              <p className="text-sm text-gray-600">보장 최적화 필요성 진단</p>
            </Link>
            <Link href="/guide" className="block p-4 border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors">
              <p className="font-semibold text-gray-900">보험 가이드</p>
              <p className="text-sm text-gray-600">보험 관련 상세 가이드</p>
            </Link>
          </div>
        </section>

        {/* 운영 방침 */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">운영 방침</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>객관성:</strong> 특정 보험사나 상품을 추천하거나 판매하지 않습니다</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>정확성:</strong> 보험 관련 정보는 약관과 공식 자료를 기반으로 제공합니다</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>투명성:</strong> 점검 결과는 참고용이며, 실제 보장은 개인 약관에 따라 다름을 명시합니다</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>소비자 중심:</strong> 보험 가입자의 이익을 최우선으로 고려합니다</span>
              </li>
            </ul>
          </div>
        </section>

        {/* 면책 고지 */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">면책 고지</h2>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800 text-sm leading-relaxed">
              본 사이트에서 제공하는 정보와 점검 결과는 일반적인 기준에 따른 참고용입니다.
              실제 보험 보장 내용과 조건은 개인의 가입 약관에 따라 다르므로,
              정확한 정보는 해당 보험사 또는 보험 설계사에게 직접 확인하시기 바랍니다.
              본 사이트는 보험 상품 판매 또는 중개를 하지 않습니다.
            </p>
          </div>
        </section>

        {/* 문의하기 */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">문의하기</h2>
          <p className="text-gray-700 mb-4">
            궁금한 점이나 오류 제보, 제안 사항이 있으시면 언제든지 연락 주세요.
          </p>
          <div className="p-6 bg-emerald-50 rounded-lg">
            <p className="text-gray-700">
              <strong>이메일:</strong>{' '}
              <a href="mailto:goooods@naver.com" className="text-emerald-600 hover:underline">
                goooods@naver.com
              </a>
            </p>
          </div>
        </section>

        <div className="mt-12 pt-6 border-t text-center">
          <p className="text-gray-600">
            슈어라인을 방문해 주셔서 감사합니다.
          </p>
        </div>
      </div>
    </div>
  )
}
