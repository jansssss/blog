/**
 * BithumbCTA — 빗썸 추천인 코드 CTA
 * sureline PostCTA.js 스타일 기준 (인라인 스타일)
 * 빗썸 브랜드 컬러: #F7A600 (골드 오렌지)
 */

const REFERRAL_CODE = "6KP1Q2TT27";
const REFERRAL_URL = "https://www.bithumb.com/react/referral";

export default function BithumbCTA() {
  return (
    <aside
      style={{
        marginTop: "48px",
        marginBottom: "48px",
        padding: "24px 22px 20px",
        background: "linear-gradient(135deg, #FFF9E6 0%, #FFF3CC 100%)",
        borderRadius: "20px",
        border: "1.5px solid #F7A600",
      }}
    >
      {/* 상단 레이블 */}
      <p
        style={{
          fontFamily: "'Apple SD Gothic Neo', 'Malgun Gothic', 'Segoe UI', sans-serif",
          fontSize: "11px",
          fontWeight: 700,
          color: "#B87800",
          letterSpacing: "0.12em",
          marginBottom: "6px",
        }}
      >
        BITHUMB BENEFIT
      </p>

      {/* 섹션 제목 */}
      <p
        style={{
          fontFamily: "'Apple SD Gothic Neo', 'Malgun Gothic', 'Segoe UI', sans-serif",
          fontSize: "18px",
          fontWeight: 800,
          color: "#1c2741",
          marginBottom: "6px",
          letterSpacing: "-0.02em",
          lineHeight: 1.4,
          wordBreak: "keep-all",
        }}
      >
        빗썸 신규 가입 시 최대 7만원 혜택
      </p>

      {/* 설명 */}
      <p
        style={{
          fontFamily: "'Apple SD Gothic Neo', 'Malgun Gothic', 'Segoe UI', sans-serif",
          fontSize: "13px",
          color: "#5a6a85",
          lineHeight: 1.65,
          wordBreak: "keep-all",
          marginBottom: "18px",
        }}
      >
        추천코드 입력 후 가입하면 <strong>가입 혜택 5만원 + 웰컴미션 완료 시 2만원</strong>, 총 최대 7만원을 받을 수 있습니다.
      </p>

      {/* 코드 + 버튼 */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
        {/* 추천코드 박스 */}
        <div
          style={{
            background: "#ffffff",
            border: "2px solid #F7A600",
            borderRadius: "12px",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flex: 1,
            minWidth: "200px",
          }}
        >
          <span
            style={{
              fontFamily: "'Apple SD Gothic Neo', 'Malgun Gothic', 'Segoe UI', sans-serif",
              fontSize: "11px",
              fontWeight: 700,
              color: "#B87800",
              letterSpacing: "0.05em",
              whiteSpace: "nowrap",
            }}
          >
            추천코드
          </span>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "18px",
              fontWeight: 800,
              color: "#7A5000",
              letterSpacing: "0.2em",
            }}
          >
            {REFERRAL_CODE}
          </span>
        </div>

        {/* 가입 버튼 */}
        <a
          href={REFERRAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            textAlign: "center",
            background: "#F7A600",
            color: "#ffffff",
            fontFamily: "'Apple SD Gothic Neo', 'Malgun Gothic', 'Segoe UI', sans-serif",
            fontSize: "14px",
            fontWeight: 700,
            padding: "13px 24px",
            borderRadius: "10px",
            textDecoration: "none",
            letterSpacing: "0.01em",
            whiteSpace: "nowrap",
          }}
        >
          빗썸 가입하기 →
        </a>
      </div>

      {/* 안내 문구 */}
      <p
        style={{
          fontFamily: "'Apple SD Gothic Neo', 'Malgun Gothic', 'Segoe UI', sans-serif",
          fontSize: "11px",
          color: "#5a6a85",
          margin: "14px 0 0",
          lineHeight: 1.6,
          paddingTop: "14px",
          borderTop: "1px solid rgba(247,166,0,0.2)",
        }}
      >
        ※ 가입 후 7일 이내 원화 계좌 연결 및 추천코드 등록 필요. 이벤트 조건은 변경될 수 있습니다.
      </p>
    </aside>
  );
}
