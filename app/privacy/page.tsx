export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-4xl font-bold mb-8">개인정보처리방침</h1>

      <div className="prose prose-gray max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. 수집하는 개인정보 항목</h2>
          <p className="text-gray-700 leading-relaxed">
            본 블로그는 다음과 같은 정보를 자동으로 수집합니다:
          </p>
          <ul className="list-disc pl-6 mt-2 text-gray-700">
            <li>IP 주소</li>
            <li>쿠키</li>
            <li>접속 기록 (방문 일시, 사용 기록 등)</li>
          </ul>
          <p className="text-gray-700 mt-2">
            ※ 실명, 주민등록번호, 전화번호 등 민감한 개인정보는 수집하지 않습니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. 개인정보의 수집 및 이용 목적</h2>
          <ul className="list-disc pl-6 text-gray-700">
            <li>웹사이트 방문 통계 분석</li>
            <li>사용자 맞춤형 콘텐츠 제공</li>
            <li>광고 게재 및 분석</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. 개인정보의 보유 및 이용 기간</h2>
          <p className="text-gray-700 leading-relaxed">
            수집된 정보는 수집 목적이 달성될 때까지 보유하며, 목적 달성 후에는 지체 없이 파기합니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. 개인정보의 제3자 제공</h2>
          <p className="text-gray-700 leading-relaxed">
            본 블로그는 다음의 서비스를 이용하여 정보를 처리합니다:
          </p>
          <ul className="list-disc pl-6 mt-2 text-gray-700">
            <li><strong>Google Analytics:</strong> 웹사이트 트래픽 분석</li>
            <li><strong>Google AdSense:</strong> 광고 게재 및 수익 창출</li>
          </ul>
          <p className="text-gray-700 mt-2">
            각 서비스의 개인정보 처리 방침은 해당 제공업체의 정책을 따릅니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. 쿠키(Cookie)의 운용 및 거부</h2>
          <p className="text-gray-700 leading-relaxed mb-2">
            본 블로그는 사용자 경험 개선을 위해 쿠키를 사용합니다.
          </p>
          <p className="text-gray-700 leading-relaxed">
            <strong>쿠키 거부 방법:</strong>
          </p>
          <ul className="list-disc pl-6 mt-2 text-gray-700">
            <li>Chrome: 설정 &gt; 개인정보 및 보안 &gt; 쿠키 및 기타 사이트 데이터</li>
            <li>Edge: 설정 &gt; 쿠키 및 사이트 권한</li>
            <li>Safari: 환경설정 &gt; 개인정보 &gt; 쿠키 및 웹사이트 데이터</li>
          </ul>
          <p className="text-gray-700 mt-2 text-sm">
            ※ 쿠키 저장을 거부할 경우 일부 서비스 이용에 제한이 있을 수 있습니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. 개인정보 보호책임자 및 문의처</h2>
          <p className="text-gray-700 leading-relaxed">
            개인정보 처리에 관한 문의사항은 아래 연락처로 문의해 주시기 바랍니다.
          </p>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700">
              <strong>이메일:</strong> goooods@naver.com
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. 개인정보처리방침 변경</h2>
          <p className="text-gray-700 leading-relaxed">
            본 개인정보처리방침은 법령 및 정책 변경에 따라 수정될 수 있으며,
            변경 시 웹사이트를 통해 공지합니다.
          </p>
          <p className="text-gray-700 mt-4">
            <strong>시행일자:</strong> 2025년 1월 1일
          </p>
        </section>
      </div>
    </div>
  )
}
