export default function ContactPage() {
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-4xl font-bold mb-8">문의하기</h1>

      <div className="prose prose-gray max-w-none">
        <section className="mb-10">
          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            사이트 운영, 협업 제안, 광고 문의, 기타 궁금한 사항이 있으시면
            아래 이메일로 연락 주세요.
          </p>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">이메일 주소</p>
                <a
                  href="mailto:goooods@naver.com"
                  className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  goooods@naver.com
                </a>
              </div>
            </div>

            <p className="text-gray-600 text-sm">
              보내주신 메일은 확인 후 빠른 시일 내에 답변드리겠습니다.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-6">문의 가능한 사항</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-5 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-2">💼 협업 제안</h3>
              <p className="text-gray-600 text-sm">
                콘텐츠 협업, 게스트 포스팅 등
              </p>
            </div>
            <div className="p-5 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-2">📢 광고 문의</h3>
              <p className="text-gray-600 text-sm">
                배너 광고, 제휴 마케팅 등
              </p>
            </div>
            <div className="p-5 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-2">🐛 오류 제보</h3>
              <p className="text-gray-600 text-sm">
                사이트 버그, 잘못된 정보 신고
              </p>
            </div>
            <div className="p-5 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-2">💡 콘텐츠 제안</h3>
              <p className="text-gray-600 text-sm">
                다루었으면 하는 주제 제안
              </p>
            </div>
            <div className="p-5 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-2">❓ 일반 문의</h3>
              <p className="text-gray-600 text-sm">
                사이트 운영 관련 질문
              </p>
            </div>
            <div className="p-5 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-2">⚖️ 저작권 문의</h3>
              <p className="text-gray-600 text-sm">
                콘텐츠 사용 허가, 저작권 관련
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">답변 안내</h2>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 rounded">
            <ul className="space-y-2 text-gray-700">
              <li>📧 이메일 확인 후 <strong>1~3일 이내</strong> 답변드립니다.</li>
              <li>⏰ 주말 및 공휴일에는 답변이 지연될 수 있습니다.</li>
              <li>📝 구체적인 문의 내용을 작성해 주시면 더 빠른 답변이 가능합니다.</li>
              <li>🚫 스팸성 메일이나 악의적인 내용은 답변하지 않습니다.</li>
            </ul>
          </div>
        </section>

        <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-center text-gray-600">
            소중한 의견을 기다립니다. 언제든지 편하게 연락 주세요! 😊
          </p>
        </div>
      </div>
    </div>
  )
}
