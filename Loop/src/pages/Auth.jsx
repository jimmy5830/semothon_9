import { useNavigate } from "react-router-dom";
import "../App.css";

export default function Auth() {
  const navigate = useNavigate();

  return (
      <div className="screen" style={{ background: "linear-gradient(160deg, #FFF 0%, #ADFFD2 100%)" }}>
        {/* 상태바 */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 20px 0", fontSize: 12, fontWeight: 600 }}>
          <span>9:41</span>
          <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><rect x="0" y="3" width="3" height="9" rx="1" fill="#212529"/><rect x="4.5" y="2" width="3" height="10" rx="1" fill="#212529"/><rect x="9" y="0" width="3" height="12" rx="1" fill="#212529"/><rect x="13.5" y="0" width="2.5" height="12" rx="1" fill="#DEE2E6"/></svg>
          <svg width="16" height="12" viewBox="0 0 24 16" fill="none"><path d="M12 4C15.5 4 18.6 5.5 20.8 8L22.6 6.2C19.9 3.5 16.1 2 12 2C7.9 2 4.1 3.5 1.4 6.2L3.2 8C5.4 5.5 8.5 4 12 4Z" fill="#212529"/><path d="M12 8C14.2 8 16.2 8.9 17.7 10.4L19.5 8.6C17.5 6.6 14.9 5.5 12 5.5C9.1 5.5 6.5 6.6 4.5 8.6L6.3 10.4C7.8 8.9 9.8 8 12 8Z" fill="#212529"/><circle cx="12" cy="14" r="2" fill="#212529"/></svg>
          <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="#212529" strokeOpacity="0.35"/><rect x="2" y="2" width="16" height="8" rx="2" fill="#212529"/><path d="M23 4.5V7.5C23.8 7.2 24.5 6.5 24.5 6C24.5 5.5 23.8 4.8 23 4.5Z" fill="#212529" fillOpacity="0.4"/></svg>
        </span>
        </div>

        {/* 로고 + 타이틀 영역 */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 20 }}>
          <div style={{ fontSize: 14, color: "var(--green-primary)", textAlign: "center", lineHeight: 1.7, marginBottom: 20 }}>
            함께 만드는 긍정적인 루프
          </div>
          <div style={{
            fontSize: 50,
            fontWeight: 1000,
            color: "var(--green-primary)",
            letterSpacing: -5,
            lineHeight: 1,
            fontFamily: "'Righteous', cursive",
            transform: "scaleY(0.8) scaleX(1.2)",
            display: "inline-block",
            WebkitTextStroke: "4px var(--green-primary)",
          }}>
            LOOP
          </div>
          <div style={{ fontSize: 15, color: "var(--green-primary)", textAlign: "center", lineHeight: 1.7, marginTop: 10 }}>
            루프에 오신 것을 환영합니다!
          </div>
        </div>

        {/* 하단 버튼 영역 */}
        <div style={{ padding: "0 24px 48px", display: "flex", flexDirection: "column", gap: 10 }}>
          <button
              className="btn"
              style={{ background: "rgba(255,255,255,0.6)", color: "var(--green-dark)", border: "1.5px solid rgba(3,199,90,0.3)" }}
              onClick={() => navigate("/signup")}
          >
            회원가입하기
          </button>

          <p style={{ textAlign: "center", fontSize: 11, color: "var(--gray-400)", marginTop: 8, lineHeight: 1.7 }}>
            LOOP의{" "}
            <span style={{ color: "var(--green-dark)", fontWeight: 600, cursor: "pointer" }}>이용약관</span>
            {" "}및{" "}
            <span style={{ color: "var(--green-dark)", fontWeight: 600, cursor: "pointer" }}>개인정보처리방침</span>
            에 동의하게 됩니다.
          </p>
        </div>
      </div>
  );
}
