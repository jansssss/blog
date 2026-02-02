import { getCurrentSite } from '@/lib/site'
import Link from 'next/link'
import { Calculator, TrendingUp, Shield, Sparkles, CheckCircle, ExternalLink, Mail } from 'lucide-react'

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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container relative py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">누구나 쉽게 이해하는 금융 정보</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              복잡한 금융, <br className="md:hidden" />
              <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                쉽고 정확하게
              </span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed max-w-2xl mx-auto">
              오예스는 대출, 금리, 재테크 정보를 누구나 이해할 수 있도록 제공하는 금융 정보 플랫폼입니다.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/calculator"
                className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-full hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
              >
                계산기 사용하기
              </Link>
              <Link
                href="/guide"
                className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-full hover:bg-white/20 transition-all"
              >
                가이드 보기
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">4+</div>
              <div className="text-sm text-gray-600">금융 계산기</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">100%</div>
              <div className="text-sm text-gray-600">무료 제공</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">24/7</div>
              <div className="text-sm text-gray-600">언제든 이용</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">0원</div>
              <div className="text-sm text-gray-600">회원가입 불필요</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              왜 오예스를 선택해야 할까요?
            </h2>
            <p className="text-lg text-gray-600">
              정확하고 실용적인 금융 정보를 제공합니다
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-xl transition-all">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Calculator className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">실시간 계산</h3>
              <p className="text-gray-600 leading-relaxed">
                대출 이자, 상환액, 중도상환수수료 등을 실시간으로 정확하게 계산합니다. 복잡한 공식도 쉽게 이해할 수 있습니다.
              </p>
            </div>

            <div className="group p-8 bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-xl transition-all">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">비교 분석</h3>
              <p className="text-gray-600 leading-relaxed">
                원리금균등 vs 원금균등, 고정금리 vs 변동금리 등 다양한 금융 상품을 쉽게 비교하고 분석할 수 있습니다.
              </p>
            </div>

            <div className="group p-8 bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-xl transition-all">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">정확한 정보</h3>
              <p className="text-gray-600 leading-relaxed">
                금융감독원, 한국은행 등 공식 자료를 기반으로 정확한 정보만을 제공합니다. 허위 정보는 절대 없습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="container max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              우리의 약속
            </h2>
            <p className="text-lg text-gray-600">
              사용자를 최우선으로 생각합니다
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">정확성</h3>
                <p className="text-gray-700">금융 정보는 공식 자료와 검증된 계산 공식만을 사용합니다</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">투명성</h3>
                <p className="text-gray-700">계산 결과는 참고용이며, 실제 조건은 금융기관마다 다를 수 있음을 명확히 안내합니다</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">독립성</h3>
                <p className="text-gray-700">특정 금융 상품을 판매하거나 중개하지 않으며, 객관적인 정보만을 제공합니다</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
              <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">지속 개선</h3>
                <p className="text-gray-700">금리 변동, 정책 변경 시 콘텐츠를 신속하게 업데이트합니다</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="container max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            지금 바로 시작하세요
          </h2>
          <p className="text-lg text-indigo-100 mb-10">
            무료로 제공되는 금융 계산기와 가이드를 활용해보세요
          </p>
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <Link
              href="/calculator/loan-interest"
              className="group p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">대출 이자 계산기</span>
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-sm text-indigo-100 text-left">예상 이자를 정확하게 계산</p>
            </Link>
            <Link
              href="/calculator/repayment-compare"
              className="group p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">상환 방식 비교</span>
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-sm text-indigo-100 text-left">원리금 vs 원금균등 비교</p>
            </Link>
            <Link
              href="/compare/fixed-vs-variable"
              className="group p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">금리 유형 선택</span>
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-sm text-indigo-100 text-left">고정 vs 변동금리 가이드</p>
            </Link>
            <Link
              href="/policy"
              className="group p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">정책 지원 찾기</span>
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-sm text-indigo-100 text-left">정부 지원 대출 안내</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Operator Introduction Section */}
      <section className="py-20 bg-white">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              운영자 소개
            </h2>
            <p className="text-lg text-gray-600">
              신뢰할 수 있는 금융 정보를 제공하기 위해 노력합니다
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📌 오예스 운영 목적</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                오예스는 금융 정보의 접근성을 높이고, 대출·금리·재테크 등 복잡한 금융 개념을
                누구나 쉽게 이해할 수 있도록 돕기 위해 만들어졌습니다.
                특정 금융 상품을 판매하거나 중개하지 않으며, 오직 정확하고 유용한 정보 제공에만 집중합니다.
              </p>
              <p className="text-gray-700 leading-relaxed">
                금융감독원, 한국은행, 주택금융공사 등 공식 기관의 자료를 기반으로 콘텐츠를 작성하며,
                금리 변동이나 제도 변경 시 신속하게 업데이트하여 항상 최신 정보를 제공하고자 합니다.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">👨‍💼 운영자 배경</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                오예스는 금융 서비스 분야에서 실무 경험을 쌓은 운영자가 직접 관리합니다.
                대출 상담, 금융 상품 분석, 재무 설계 등 다양한 금융 업무 경험을 바탕으로
                실생활에서 실제로 필요한 정보만을 엄선하여 제공합니다.
              </p>
              <p className="text-gray-700 leading-relaxed">
                사용자가 복잡한 금융 용어에 막히지 않고 자신에게 맞는 금융 의사결정을 내릴 수 있도록
                명확하고 이해하기 쉬운 설명을 제공하는 것을 최우선 목표로 삼고 있습니다.
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">✅ 정보 검증 및 업데이트 정책</h3>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-600 mt-2 flex-shrink-0"></div>
                  <p className="leading-relaxed">
                    <strong className="text-gray-900">공식 출처 우선:</strong> 금융감독원, 한국은행, 각 금융기관의 공시자료를 우선적으로 참고하며,
                    출처가 불분명한 정보는 게시하지 않습니다.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-600 mt-2 flex-shrink-0"></div>
                  <p className="leading-relaxed">
                    <strong className="text-gray-900">정기 업데이트:</strong> 금리 변동, 정책 변경, 제도 개편 등 중요한 변화가 있을 때
                    관련 콘텐츠를 신속하게 검토하고 업데이트합니다.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-600 mt-2 flex-shrink-0"></div>
                  <p className="leading-relaxed">
                    <strong className="text-gray-900">계산 공식 투명 공개:</strong> 모든 계산기는 사용된 공식과 가정을 명확히 설명하며,
                    결과는 참고용임을 명시합니다.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-600 mt-2 flex-shrink-0"></div>
                  <p className="leading-relaxed">
                    <strong className="text-gray-900">오류 제보 환영:</strong> 잘못된 정보나 개선이 필요한 부분을 발견하시면
                    언제든지 연락 주시기 바랍니다. 신속하게 확인하고 수정하겠습니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 운영 원칙</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">독립적 운영</h4>
                    <p className="text-gray-600">특정 금융사와 제휴하지 않습니다</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">객관적 정보</h4>
                    <p className="text-gray-600">사실 기반의 중립적 콘텐츠</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">사용자 우선</h4>
                    <p className="text-gray-600">실제 도움이 되는 정보 제공</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">지속적 개선</h4>
                    <p className="text-gray-600">피드백 반영 및 콘텐츠 보강</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-50">
        <div className="container max-w-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            문의하기
          </h2>
          <p className="text-gray-600 mb-6">
            궁금한 점이나 오류 제보, 제안 사항이 있으시면 언제든지 연락 주세요
          </p>
          <a
            href="mailto:goooods@naver.com"
            className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors"
          >
            <Mail className="w-5 h-5" />
            goooods@naver.com
          </a>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 bg-amber-50 border-t border-amber-100">
        <div className="container max-w-4xl">
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-amber-900 mb-2">면책 고지</h3>
            <p className="text-sm text-amber-800 leading-relaxed">
              본 사이트에서 제공하는 정보와 계산 결과는 참고용이며, 실제 금융 상품의 조건은
              개인의 신용도, 소득, 담보 등에 따라 상이할 수 있습니다.
              정확한 정보는 반드시 해당 금융기관에 직접 문의하시기 바랍니다.
              본 사이트는 금융 상품 판매 또는 중개를 하지 않습니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

// 슈어라인 (보험 정보) - 동일한 스타일로 업데이트
function SurelineAbout() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container relative py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">스마트한 보험 관리의 시작</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              복잡한 보험, <br className="md:hidden" />
              <span className="bg-gradient-to-r from-yellow-300 to-green-300 bg-clip-text text-transparent">
                간편하게 점검
              </span>
            </h1>
            <p className="text-lg md:text-xl text-emerald-100 mb-8 leading-relaxed max-w-2xl mx-auto">
              슈어라인은 보험 점검과 절약을 돕는 보험 정보 플랫폼입니다.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/tools/auto-discount-check"
                className="px-8 py-3 bg-white text-emerald-600 font-semibold rounded-full hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl"
              >
                보험 점검 시작
              </Link>
              <Link
                href="/guide"
                className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-full hover:bg-white/20 transition-all"
              >
                가이드 보기
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">3+</div>
              <div className="text-sm text-gray-600">보험 점검 도구</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">100%</div>
              <div className="text-sm text-gray-600">무료 제공</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">24/7</div>
              <div className="text-sm text-gray-600">언제든 점검</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">0원</div>
              <div className="text-sm text-gray-600">회원가입 불필요</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              왜 슈어라인을 선택해야 할까요?
            </h2>
            <p className="text-lg text-gray-600">
              스마트한 보험 관리를 돕습니다
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 bg-white rounded-2xl border border-gray-200 hover:border-emerald-300 hover:shadow-xl transition-all">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">간편한 점검</h3>
              <p className="text-gray-600 leading-relaxed">
                자동차보험 할인, 실손보험 중복, 보험 리모델링 등을 몇 번의 클릭으로 쉽게 점검할 수 있습니다.
              </p>
            </div>

            <div className="group p-8 bg-white rounded-2xl border border-gray-200 hover:border-emerald-300 hover:shadow-xl transition-all">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">객관적 분석</h3>
              <p className="text-gray-600 leading-relaxed">
                특정 보험사를 추천하지 않으며, 소비자 관점에서 객관적인 점검 결과만을 제공합니다.
              </p>
            </div>

            <div className="group p-8 bg-white rounded-2xl border border-gray-200 hover:border-emerald-300 hover:shadow-xl transition-all">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">쉬운 가이드</h3>
              <p className="text-gray-600 leading-relaxed">
                어려운 보험 용어와 상품을 쉽게 설명하여 현명한 보험 선택을 도와드립니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white">
        <div className="container max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            지금 바로 점검하세요
          </h2>
          <p className="text-lg text-emerald-100 mb-10">
            무료로 제공되는 보험 점검 도구를 활용해보세요
          </p>
          <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <Link
              href="/tools/auto-discount-check"
              className="group p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">자동차보험 할인</span>
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-sm text-emerald-100 text-left">할인 항목 점검</p>
            </Link>
            <Link
              href="/tools/health-overlap-check"
              className="group p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">실손보험 중복</span>
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-sm text-emerald-100 text-left">중복 보장 확인</p>
            </Link>
            <Link
              href="/tools/insurance-remodel"
              className="group p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">보험 리모델링</span>
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-sm text-emerald-100 text-left">최적화 진단</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Operator Introduction Section */}
      <section className="py-20 bg-white">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              운영자 소개
            </h2>
            <p className="text-lg text-gray-600">
              신뢰할 수 있는 보험 정보를 제공하기 위해 노력합니다
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📌 슈어라인 운영 목적</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                슈어라인은 복잡한 보험 정보를 쉽게 이해하고, 자신에게 맞는 보험 선택과 관리를 도와드리기 위해 만들어졌습니다.
                특정 보험사나 상품을 추천하지 않으며, 소비자 관점에서 객관적인 정보만을 제공합니다.
              </p>
              <p className="text-gray-700 leading-relaxed">
                자동차보험 할인 항목, 실손보험 중복 보장, 보험 리모델링 등
                실생활에서 꼭 필요한 정보를 간편하게 점검할 수 있도록 도구를 제공합니다.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">👨‍💼 운영자 배경</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                슈어라인은 보험 및 금융 분야에서 실무 경험을 쌓은 운영자가 직접 관리합니다.
                보험 상품 분석, 소비자 상담 등의 경험을 바탕으로
                실제로 도움이 되는 정보만을 선별하여 제공합니다.
              </p>
              <p className="text-gray-700 leading-relaxed">
                어려운 보험 용어와 복잡한 약관 때문에 올바른 선택을 하기 어려운 분들께
                명확하고 실용적인 가이드를 제공하는 것을 목표로 합니다.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">✅ 정보 검증 및 업데이트 정책</h3>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-600 mt-2 flex-shrink-0"></div>
                  <p className="leading-relaxed">
                    <strong className="text-gray-900">공신력 있는 출처:</strong> 금융감독원, 보험개발원, 각 보험사의 공식 자료를 우선적으로 참고하며,
                    검증되지 않은 정보는 게시하지 않습니다.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-600 mt-2 flex-shrink-0"></div>
                  <p className="leading-relaxed">
                    <strong className="text-gray-900">정기 업데이트:</strong> 보험 상품 변경, 제도 개편 등이 있을 때
                    관련 콘텐츠를 검토하고 업데이트합니다.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-600 mt-2 flex-shrink-0"></div>
                  <p className="leading-relaxed">
                    <strong className="text-gray-900">점검 기준 명시:</strong> 모든 점검 도구는 사용된 기준과 전제를 명확히 설명하며,
                    결과는 참고용임을 명시합니다.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-600 mt-2 flex-shrink-0"></div>
                  <p className="leading-relaxed">
                    <strong className="text-gray-900">피드백 반영:</strong> 잘못된 정보나 개선이 필요한 부분을 발견하시면
                    언제든지 연락 주시기 바랍니다. 빠르게 확인하고 수정하겠습니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 운영 원칙</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">독립적 운영</h4>
                    <p className="text-gray-600">특정 보험사와 제휴하지 않습니다</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">객관적 정보</h4>
                    <p className="text-gray-600">소비자 관점의 중립적 콘텐츠</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">사용자 우선</h4>
                    <p className="text-gray-600">실제 도움이 되는 정보 제공</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">지속적 개선</h4>
                    <p className="text-gray-600">피드백 반영 및 콘텐츠 보강</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-50">
        <div className="container max-w-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            문의하기
          </h2>
          <p className="text-gray-600 mb-6">
            궁금한 점이나 오류 제보, 제안 사항이 있으시면 언제든지 연락 주세요
          </p>
          <a
            href="mailto:goooods@naver.com"
            className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white font-semibold rounded-full hover:bg-emerald-700 transition-colors"
          >
            <Mail className="w-5 h-5" />
            goooods@naver.com
          </a>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 bg-amber-50 border-t border-amber-100">
        <div className="container max-w-4xl">
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-amber-900 mb-2">면책 고지</h3>
            <p className="text-sm text-amber-800 leading-relaxed">
              본 사이트에서 제공하는 정보와 점검 결과는 일반적인 기준에 따른 참고용입니다.
              실제 보험 보장 내용과 조건은 개인의 가입 약관에 따라 다르므로,
              정확한 정보는 해당 보험사 또는 보험 설계사에게 직접 확인하시기 바랍니다.
              본 사이트는 보험 상품 판매 또는 중개를 하지 않습니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
