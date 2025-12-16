export default function AboutPage() {
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-4xl font-bold mb-8">사이트 소개</h1>

      <div className="prose prose-gray max-w-none">
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">안녕하세요!</h2>
          <p className="text-gray-700 leading-relaxed text-lg">
            모두를 위한 생활정보, 금융, AI 정보를 공유하는 블로그입니다.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">블로그 목표</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 유용한 정보 제공</h3>
              <p className="text-gray-700">
                일상생활에 도움이 되는 실용적인 정보를 쉽고 명확하게 전달합니다.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-2">💰 금융 지식 공유</h3>
              <p className="text-gray-700">
                재테크, 투자, 금융 상품 등 돈과 관련된 유익한 정보를 나눕니다.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">🤖 AI 트렌드 소개</h3>
              <p className="text-gray-700">
                최신 AI 기술과 트렌드, 활용 방법을 소개합니다.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">주요 콘텐츠</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li><strong>생활정보:</strong> 생활 팁, 건강, 여행, 문화 등</li>
            <li><strong>금융:</strong> 재테크, 주식, 부동산, 절세 방법</li>
            <li><strong>AI & 기술:</strong> ChatGPT, 자동화 도구, 최신 기술 동향</li>
            <li><strong>개발:</strong> 웹 개발, 프로그래밍 팁</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">기술 스택</h2>
          <p className="text-gray-700 mb-4">
            본 블로그는 다음과 같은 현대적인 기술로 구축되었습니다:
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="font-semibold text-gray-900">Next.js 14</p>
              <p className="text-sm text-gray-600">React 프레임워크</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="font-semibold text-gray-900">Supabase</p>
              <p className="text-sm text-gray-600">백엔드 & 데이터베이스</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="font-semibold text-gray-900">TypeScript</p>
              <p className="text-sm text-gray-600">타입 안정성</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="font-semibold text-gray-900">Tailwind CSS</p>
              <p className="text-sm text-gray-600">스타일링</p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">운영 방침</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <ul className="space-y-2 text-gray-700">
              <li>✅ 정확하고 검증된 정보 제공</li>
              <li>✅ 정기적인 콘텐츠 업데이트</li>
              <li>✅ 독자 중심의 쉬운 설명</li>
              <li>✅ 개인정보 보호 및 투명한 운영</li>
            </ul>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">문의하기</h2>
          <p className="text-gray-700 mb-4">
            궁금한 점이나 제안 사항이 있으시면 언제든지 연락 주세요!
          </p>
          <div className="p-6 bg-blue-50 rounded-lg">
            <p className="text-gray-700 mb-2">
              <strong>이메일:</strong> goooods@naver.com
            </p>
            <p className="text-gray-700">
              <strong>GitHub:</strong> <a href="https://github.com/jansssss" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">github.com/jansssss</a>
            </p>
          </div>
        </section>

        <div className="mt-12 pt-6 border-t text-center">
          <p className="text-gray-600">
            방문해 주셔서 감사합니다! 😊
          </p>
        </div>
      </div>
    </div>
  )
}
