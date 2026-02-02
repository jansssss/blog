import { getCurrentSite } from '@/lib/site'
import Link from 'next/link'
import { Shield, FileCheck, RefreshCw, Link2, AlertCircle, CheckCircle, Mail } from 'lucide-react'

export default async function EditorialPolicyPage() {
  const site = await getCurrentSite()
  const siteName = site?.name || 'ohyess'
  const isOhyess = siteName?.toLowerCase() !== 'sureline'

  const primaryColor = isOhyess ? 'indigo' : 'emerald'
  const siteType = isOhyess ? '금융 정보' : '보험 정보'

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${isOhyess ? 'from-blue-600 via-indigo-600 to-purple-700' : 'from-emerald-600 via-teal-600 to-cyan-700'} text-white py-20`}>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container relative max-w-4xl">
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6`}>
              <FileCheck className="w-4 h-4" />
              <span className="text-sm font-medium">신뢰할 수 있는 정보 제공</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              편집 정책
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              {siteName}의 콘텐츠 제작 원칙과 정보 검증 프로세스를 투명하게 공개합니다
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container max-w-4xl">
          {/* 기본 원칙 */}
          <div className="mb-12">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-${primaryColor}-100 text-${primaryColor}-700 mb-4`}>
              <Shield className="w-4 h-4" />
              <span className="text-sm font-semibold">기본 원칙</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              우리의 편집 철학
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                {siteName}는 {siteType} 플랫폼으로서, 사용자가 정확하고 신뢰할 수 있는 정보를 바탕으로
                합리적인 의사결정을 내릴 수 있도록 돕는 것을 최우선 목표로 합니다.
              </p>
              <p className="text-gray-700 leading-relaxed">
                모든 콘텐츠는 공식 자료와 검증된 데이터를 기반으로 작성되며,
                특정 {isOhyess ? '금융 상품' : '보험 상품'}을 판매하거나 중개하지 않는 독립적인 입장에서 제공됩니다.
              </p>
            </div>
          </div>

          {/* 1. 정보 검증 방법 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-6">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${isOhyess ? 'from-blue-500 to-indigo-600' : 'from-emerald-500 to-teal-600'} flex items-center justify-center flex-shrink-0`}>
                <FileCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">정보 검증 방법</h3>
                <p className="text-gray-600">신뢰할 수 있는 출처만을 사용합니다</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className={`w-5 h-5 ${isOhyess ? 'text-indigo-600' : 'text-emerald-600'} mt-1 flex-shrink-0`} />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">공식 기관 자료 우선</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {isOhyess
                      ? '금융감독원, 한국은행, 금융위원회, 주택금융공사 등 정부 및 공공기관의 공식 발표 자료를 최우선으로 참고합니다.'
                      : '금융감독원, 보험개발원, 금융위원회 등 정부 및 공공기관의 공식 발표 자료를 최우선으로 참고합니다.'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className={`w-5 h-5 ${isOhyess ? 'text-indigo-600' : 'text-emerald-600'} mt-1 flex-shrink-0`} />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{isOhyess ? '금융기관' : '보험사'} 공시 정보 확인</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    각 {isOhyess ? '금융기관' : '보험사'}이 공식 홈페이지 및 금융상품 한눈에를 통해 공시한 정보를 교차 검증합니다.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className={`w-5 h-5 ${isOhyess ? 'text-indigo-600' : 'text-emerald-600'} mt-1 flex-shrink-0`} />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">법령 및 규정 참조</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {isOhyess
                      ? '은행법, 여신전문금융업법, 대부업법 등 관련 법령과 금융위원회 규정을 참조합니다.'
                      : '보험업법, 약관 심사 규정 등 관련 법령과 금융위원회 규정을 참조합니다.'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className={`w-5 h-5 ${isOhyess ? 'text-indigo-600' : 'text-emerald-600'} mt-1 flex-shrink-0`} />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">검증되지 않은 정보 배제</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    출처가 불분명하거나 검증할 수 없는 정보는 게시하지 않으며,
                    추정이나 예측이 포함된 경우 반드시 명시합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. 업데이트 주기 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-6">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${isOhyess ? 'from-purple-500 to-pink-600' : 'from-blue-500 to-indigo-600'} flex items-center justify-center flex-shrink-0`}>
                <RefreshCw className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">콘텐츠 업데이트 정책</h3>
                <p className="text-gray-600">최신 정보를 유지하기 위해 노력합니다</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className={`bg-${primaryColor}-50 rounded-lg p-4 border border-${primaryColor}-100`}>
                <h4 className={`font-semibold text-${primaryColor}-900 mb-2`}>정기 검토</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className={`text-${primaryColor}-600 mt-1`}>•</span>
                    <span>주요 콘텐츠는 최소 분기 1회 이상 검토하여 최신성을 확인합니다.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className={`text-${primaryColor}-600 mt-1`}>•</span>
                    <span>계산기 도구는 공식 및 알고리즘의 정확성을 주기적으로 검증합니다.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                <h4 className="font-semibold text-amber-900 mb-2">긴급 업데이트</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>{isOhyess ? '금리 변동' : '보험 상품 변경'}, 법령 개정, 제도 변경 시 즉시 관련 콘텐츠를 검토하고 업데이트합니다.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>오류 제보가 접수되면 24시간 내 확인하고, 필요시 즉시 수정합니다.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">업데이트 기록</h4>
                <p className="text-sm text-gray-700">
                  중요한 콘텐츠 변경 사항은 페이지 하단에 '최종 업데이트 일자'를 표시하여
                  사용자가 정보의 최신성을 확인할 수 있도록 합니다.
                </p>
              </div>
            </div>
          </div>

          {/* 3. 출처 표기 정책 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-6">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${isOhyess ? 'from-emerald-500 to-teal-600' : 'from-purple-500 to-pink-600'} flex items-center justify-center flex-shrink-0`}>
                <Link2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">출처 표기 원칙</h3>
                <p className="text-gray-600">정보의 출처를 명확히 밝힙니다</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg bg-${primaryColor}-100 flex items-center justify-center flex-shrink-0 mt-1`}>
                  <span className={`text-${primaryColor}-700 font-bold`}>1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">공식 기관 링크 제공</h4>
                  <p className="leading-relaxed">
                    주요 정보는 원본 자료를 확인할 수 있도록 금융감독원{isOhyess ? ', 한국은행' : ', 보험개발원'} 등
                    공식 기관 페이지 링크를 함께 제공합니다.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg bg-${primaryColor}-100 flex items-center justify-center flex-shrink-0 mt-1`}>
                  <span className={`text-${primaryColor}-700 font-bold`}>2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">계산 공식 명시</h4>
                  <p className="leading-relaxed">
                    모든 계산기 도구는 사용된 공식과 가정 조건을 명확히 설명합니다.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg bg-${primaryColor}-100 flex items-center justify-center flex-shrink-0 mt-1`}>
                  <span className={`text-${primaryColor}-700 font-bold`}>3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">제3자 콘텐츠 표시</h4>
                  <p className="leading-relaxed">
                    외부 자료를 인용하는 경우 출처를 명확히 표기하며, 저작권을 존중합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 4. 면책 고지 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">면책 고지</h3>
                <p className="text-gray-600">정보 사용 시 유의사항</p>
              </div>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg">
              <h4 className="font-bold text-amber-900 mb-3">중요한 안내</h4>
              <div className="space-y-3 text-sm text-amber-900">
                <p className="leading-relaxed">
                  본 사이트에서 제공하는 모든 정보와 계산 결과는 <strong>참고용</strong>입니다.
                  실제 {isOhyess ? '금융 상품의 조건' : '보험 상품의 보장 내용과 조건'}은
                  개인의 {isOhyess ? '신용도, 소득, 담보' : '연령, 건강 상태, 가입 약관'} 등에 따라 상이할 수 있습니다.
                </p>
                <p className="leading-relaxed">
                  정확한 정보는 반드시 해당 {isOhyess ? '금융기관' : '보험사'} 또는 전문가에게 직접 확인하시기 바랍니다.
                </p>
                <p className="leading-relaxed">
                  본 사이트는 {isOhyess ? '금융 상품' : '보험 상품'} 판매 또는 중개를 하지 않으며,
                  사용자의 의사결정에 대한 법적 책임을 지지 않습니다.
                </p>
              </div>
            </div>
          </div>

          {/* 5. 콘텐츠 제작 과정 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-6">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${isOhyess ? 'from-blue-500 to-indigo-600' : 'from-emerald-500 to-teal-600'} flex items-center justify-center flex-shrink-0`}>
                <FileCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">콘텐츠 제작 프로세스</h3>
                <p className="text-gray-600">체계적인 검증 절차를 거칩니다</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-full bg-${primaryColor}-100 flex items-center justify-center flex-shrink-0`}>
                  <span className={`text-${primaryColor}-700 font-bold`}>1</span>
                </div>
                <div className="flex-1 pt-2">
                  <h4 className="font-semibold text-gray-900 mb-1">주제 선정 및 조사</h4>
                  <p className="text-sm text-gray-600">
                    사용자에게 실제로 필요한 주제를 선정하고, 공식 자료를 수집합니다.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-full bg-${primaryColor}-100 flex items-center justify-center flex-shrink-0`}>
                  <span className={`text-${primaryColor}-700 font-bold`}>2</span>
                </div>
                <div className="flex-1 pt-2">
                  <h4 className="font-semibold text-gray-900 mb-1">정보 검증</h4>
                  <p className="text-sm text-gray-600">
                    여러 공식 출처를 교차 확인하여 정확성을 검증합니다.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-full bg-${primaryColor}-100 flex items-center justify-center flex-shrink-0`}>
                  <span className={`text-${primaryColor}-700 font-bold`}>3</span>
                </div>
                <div className="flex-1 pt-2">
                  <h4 className="font-semibold text-gray-900 mb-1">콘텐츠 작성</h4>
                  <p className="text-sm text-gray-600">
                    전문 용어를 쉽게 풀어 설명하고, 실생활 사례를 포함하여 작성합니다.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-full bg-${primaryColor}-100 flex items-center justify-center flex-shrink-0`}>
                  <span className={`text-${primaryColor}-700 font-bold`}>4</span>
                </div>
                <div className="flex-1 pt-2">
                  <h4 className="font-semibold text-gray-900 mb-1">최종 검토 및 게시</h4>
                  <p className="text-sm text-gray-600">
                    계산 도구의 경우 여러 케이스로 테스트하여 정확성을 확인한 후 게시합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact for Corrections */}
          <div className={`bg-gradient-to-br ${isOhyess ? 'from-blue-50 to-indigo-50' : 'from-emerald-50 to-teal-50'} rounded-2xl p-8 border ${isOhyess ? 'border-blue-100' : 'border-emerald-100'}`}>
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl bg-${primaryColor}-600 flex items-center justify-center flex-shrink-0`}>
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">오류 제보 및 개선 제안</h3>
                <p className="text-gray-700 mb-4">
                  잘못된 정보를 발견하셨거나 개선이 필요한 부분이 있다면 언제든지 연락 주시기 바랍니다.
                  빠르게 확인하고 수정하겠습니다.
                </p>
                <a
                  href="mailto:goooods@naver.com"
                  className={`inline-flex items-center gap-2 px-6 py-3 bg-${primaryColor}-600 text-white font-semibold rounded-lg hover:bg-${primaryColor}-700 transition-colors`}
                >
                  <Mail className="w-5 h-5" />
                  goooods@naver.com
                </a>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>이 편집 정책은 2026년 2월 2일에 최종 업데이트되었습니다.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
