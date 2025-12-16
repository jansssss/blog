export default function ContactPage() {
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-4xl font-bold mb-8">문의하기</h1>

      <div className="prose prose-gray max-w-none">
        <section className="mb-10">
          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            블로그 운영, 협업 제안, 광고 문의, 기타 궁금한 사항이 있으시면
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
                블로그 운영 관련 질문
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

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">소셜 미디어</h2>
          <p className="text-gray-700 mb-4">
            GitHub에서 프로젝트를 확인하실 수 있습니다.
          </p>
          <a
            href="https://github.com/jansssss"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            GitHub 방문하기
          </a>
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
