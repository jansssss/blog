export default function TermsPage() {
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-4xl font-bold mb-8">이용약관</h1>

      <div className="prose prose-gray max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">제1조 (목적)</h2>
          <p className="text-gray-700 leading-relaxed">
            본 약관은 본 블로그(이하 "사이트")가 제공하는 모든 서비스의 이용과 관련하여
            사이트와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">제2조 (정의)</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li><strong>"사이트"</strong>란 본 블로그 웹사이트를 의미합니다.</li>
            <li><strong>"이용자"</strong>란 사이트에 접속하여 본 약관에 따라 서비스를 이용하는 모든 방문자를 의미합니다.</li>
            <li><strong>"콘텐츠"</strong>란 사이트에 게시된 글, 이미지, 영상 등 모든 정보를 의미합니다.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">제3조 (약관의 효력 및 변경)</h2>
          <p className="text-gray-700 leading-relaxed mb-2">
            1. 본 약관은 사이트에 게시함으로써 효력이 발생합니다.
          </p>
          <p className="text-gray-700 leading-relaxed">
            2. 사이트는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 사이트에 공지합니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">제4조 (서비스의 제공)</h2>
          <p className="text-gray-700 leading-relaxed mb-2">
            사이트는 다음과 같은 서비스를 제공합니다:
          </p>
          <ul className="list-disc pl-6 text-gray-700">
            <li>생활정보, 금융, AI 관련 정보 제공</li>
            <li>블로그 콘텐츠 열람 서비스</li>
            <li>기타 사이트가 정하는 서비스</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">제5조 (서비스의 중단)</h2>
          <p className="text-gray-700 leading-relaxed">
            사이트는 다음의 경우 서비스 제공을 일시적으로 중단할 수 있습니다:
          </p>
          <ul className="list-disc pl-6 mt-2 text-gray-700">
            <li>시스템 점검, 유지보수, 교체 등이 필요한 경우</li>
            <li>천재지변, 비상사태 등 불가항력적 사유가 발생한 경우</li>
            <li>기타 기술적 문제로 서비스 제공이 불가능한 경우</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">제6조 (저작권 및 콘텐츠 이용)</h2>
          <p className="text-gray-700 leading-relaxed mb-2">
            1. 사이트에 게시된 모든 콘텐츠의 저작권은 사이트 운영자에게 있습니다.
          </p>
          <p className="text-gray-700 leading-relaxed mb-2">
            2. 이용자는 사이트의 콘텐츠를 무단으로 복제, 배포, 전송, 출판할 수 없습니다.
          </p>
          <p className="text-gray-700 leading-relaxed">
            3. 콘텐츠 이용 시 출처를 명시해야 하며, 상업적 이용은 사전 동의가 필요합니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">제7조 (이용자의 의무)</h2>
          <p className="text-gray-700 leading-relaxed mb-2">
            이용자는 다음 행위를 해서는 안 됩니다:
          </p>
          <ul className="list-disc pl-6 text-gray-700">
            <li>타인의 정보를 도용하거나 허위 정보를 유포하는 행위</li>
            <li>사이트의 운영을 방해하거나 서비스를 부정하게 이용하는 행위</li>
            <li>저작권 등 타인의 권리를 침해하는 행위</li>
            <li>법령 또는 공서양속에 반하는 행위</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">제8조 (면책조항)</h2>
          <p className="text-gray-700 leading-relaxed mb-2">
            1. 사이트는 천재지변, 불가항력적 사유로 서비스를 제공할 수 없는 경우 책임을 지지 않습니다.
          </p>
          <p className="text-gray-700 leading-relaxed mb-2">
            2. 사이트는 이용자가 게시한 정보의 정확성, 신뢰성에 대해 책임을 지지 않습니다.
          </p>
          <p className="text-gray-700 leading-relaxed">
            3. 사이트에 게시된 정보는 참고용이며, 최종 결정은 이용자 본인의 책임입니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">제9조 (광고 게재)</h2>
          <p className="text-gray-700 leading-relaxed">
            사이트는 Google AdSense 등의 광고를 게재할 수 있으며,
            이용자는 광고 게재에 동의한 것으로 간주됩니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">제10조 (분쟁 해결)</h2>
          <p className="text-gray-700 leading-relaxed">
            본 약관과 관련하여 분쟁이 발생한 경우, 대한민국 법률에 따라 해결합니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">제11조 (문의)</h2>
          <p className="text-gray-700 leading-relaxed">
            본 약관에 대한 문의사항은 아래 이메일로 연락 주시기 바랍니다.
          </p>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700">
              <strong>이메일:</strong> goooods@naver.com
            </p>
          </div>
        </section>

        <div className="mt-8 pt-6 border-t">
          <p className="text-gray-700">
            <strong>시행일자:</strong> 2025년 1월 1일
          </p>
        </div>
      </div>
    </div>
  )
}
