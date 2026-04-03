import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const TOTAL_STEPS = 4;

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const goNext = async () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      try {
        const formData = new URLSearchParams();
        formData.append("email", email);
        formData.append("phone", phone);
        formData.append("password", password);
        formData.append("name", "새 사용자");

        const res = await fetch("http://127.0.0.1:8000/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        });

        if (!res.ok) {
          const err = await res.json();
          alert(err.detail || "회원가입에 실패했습니다.");
          return;
        }

        const data = await res.json();
        navigate("/profile", {
          state: { email, phone, user_id: data.user_id },
        });

      } catch (err) {
        console.error("에러:", err);
        alert("서버에 연결할 수 없습니다.");
      }
    }
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
    else navigate("/");
  };

  const canNext = () => {
    if (step === 1) return phone.trim().length >= 9;
    if (step === 2) return email.includes("@");
    if (step === 3) return password.length >= 6;
    return true;
  };

  return (
    <div className="screen">
      {/* 상태바 */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 20px 0", fontSize: 12, fontWeight: 600 }}>
        <span>9:41</span>
      </div>

      {/* 뒤로가기 */}
      <div style={{ padding: "8px 24px 0" }}>
        <button className="back-btn" style={{ padding: 0 }} onClick={goBack}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="#495057" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="screen-body" style={{ paddingTop: 32 }}>
        {/* STEP 1: 전화번호 */}
        {step === 1 && (
          <div className="profile-step">
            <div className="step-header">
              <div className="step-title">전화번호를 입력하세요.</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{
                padding: "15px 16px",
                border: "1.5px solid var(--gray-200)",
                borderRadius: "var(--radius-md)",
                background: "var(--gray-50)",
                fontSize: 15,
                color: "var(--gray-500)",
                whiteSpace: "nowrap",
              }}>
                +82
              </div>
              <input
                className="input-field"
                style={{ flex: 1, marginBottom: 0 }}
                placeholder="010-1234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* STEP 2: 이메일 */}
        {step === 2 && (
          <div className="profile-step">
            <div className="step-header">
              <div className="step-title">이메일 주소를 입력하세요.</div>
            </div>
            <input
              className="input-field"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              inputMode="email"
              autoFocus
            />
          </div>
        )}

        {/* STEP 3: 비밀번호 */}
        {step === 3 && (
          <div className="profile-step">
            <div className="step-header">
              <div className="step-title">비밀번호를 설정하세요.</div>
              <div className="step-sub">6자리 이상 입력해 주세요</div>
            </div>
            <input
              className="input-field"
              placeholder="비밀번호 입력"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>
        )}

        {/* STEP 4: 계정 연결 안내 */}
        {step === 4 && (
          <div className="profile-step">
            <div className="step-header">
              <div className="step-title">계정을 연결하면 로그인이{"\n"}더욱 빨라져요</div>
              <div className="step-sub" style={{ marginTop: 12 }}>
                전화번호 또는 이메일에 한 번 등록할 경우,<br />연결된 계정으로 로그인이 가능해요.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="bottom-bar">
        <button className="btn btn-primary" onClick={goNext} disabled={!canNext()}>
          {step < TOTAL_STEPS ? "다음" : "시작하기"}
        </button>
      </div>
    </div>
  );
}
