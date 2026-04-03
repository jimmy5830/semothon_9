import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../App.css";
import "./Profile.css";

const TOTAL_STEPS = 5;

const INTERESTS = [
  "플로깅", "분리수거", "전기절감", "텀블러",
  "대중교통", "물 절약", "재활용", "일회용품 줄이기",
  "식물 키우기", "직접 쓰기"
];

const EMOJIS = [
  "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯",
  "🦁","🐮","🐷","🐸","🐵","🐔","🐧","🐦","🦆","🦅",
  "🦉","🦇","🐺","🐴","🦄","🐝","🦋","🐢","🐍","🦎",
  "🐙","🦑","🦀","🐡","🐟","🐬","🐳","😀","😎","🔥",
];

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation(); // ✅ 복구
  const { email, user_id } = location.state || {}; // ✅ Signup에서 넘어오는 state

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [birth, setBirth] = useState({ y: "", m: "", d: "" });
  const [gender, setGender] = useState("");
  const [interests, setInterests] = useState([]);
  const [emoji, setEmoji] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customText, setCustomText] = useState("");

  const goNext = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
    else handleSubmit();
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
    else navigate("/signup");
  };

  const toggleInterest = (item) => {
    if (item === "직접 쓰기") {
      setShowCustomInput((prev) => !prev);
      return;
    }
    if (interests.includes(item)) {
      setInterests(interests.filter((i) => i !== item));
    } else {
      if (interests.length >= 5) return;
      setInterests([...interests, item]);
    }
  };

  const addCustomInterest = () => {
    const trimmed = customText.trim();
    if (!trimmed || interests.includes(trimmed) || interests.length >= 5) return;
    setInterests([...interests, trimmed]);
    setCustomText("");
    setShowCustomInput(false);
  };
  const handleSubmit = async () => {
    try {
      const birthStr = `${birth.y}-${birth.m.padStart(2, "0")}-${birth.d.padStart(2, "0")}`;
      const res = await fetch(`http://127.0.0.1:8000/users/me?user_id=${user_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          profile_image: emoji,
          birth: birthStr,
          gender,
          interests,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.detail || "프로필 저장에 실패했습니다.");
        return;
      }

      navigate("/home");

    } catch (err) {
      console.error("에러:", err);
      alert("서버에 연결할 수 없습니다.");
    }
  };
  const canNext = () => {
    if (step === 1) return name.trim().length > 0;
    if (step === 2) return birth.y.length === 4 && birth.m.length > 0 && birth.d.length > 0;
    if (step === 3) return gender !== "";
    if (step === 4) return emoji !== "";
    if (step === 5) return interests.length > 0;
    return true;
  };

  return (
      <div className="screen">
        <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 20px 0", fontSize: 12, fontWeight: 600 }}>
          <span>9:41</span>
        </div>

        <button className="back-btn" onClick={goBack}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="#495057" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="progress-bar-wrap">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div key={i} className={`progress-segment ${i < step ? "done" : ""}`} />
          ))}
        </div>

        <div className="screen-body" style={{ paddingTop: 28 }}>

          {/* STEP 1: 이름 */}
          {step === 1 && (
              <div className="profile-step">
                <div className="step-header">
                  <div className="step-title">이름이 무엇인가요?</div>
                </div>
                <input
                    className="input-field"
                    placeholder="이름을 입력해 주세요"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                />
              </div>
          )}

          {/* STEP 2: 생년월일 */}
          {step === 2 && (
              <div className="profile-step">
                <div className="step-header">
                  <div className="step-title">생년월일을 알려주세요</div>
                  <div className="step-sub">서비스 맞춤 설정에 사용돼요</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                      className="input-field"
                      style={{ flex: 2, marginBottom: 0, textAlign: "center" }}
                      placeholder="YYYY"
                      value={birth.y}
                      onChange={(e) => setBirth({ ...birth, y: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                      maxLength={4}
                      inputMode="numeric"
                  />
                  <input
                      className="input-field"
                      style={{ flex: 1, marginBottom: 0, textAlign: "center" }}
                      placeholder="MM"
                      value={birth.m}
                      onChange={(e) => setBirth({ ...birth, m: e.target.value.replace(/\D/g, "").slice(0, 2) })}
                      maxLength={2}
                      inputMode="numeric"
                  />
                  <input
                      className="input-field"
                      style={{ flex: 1, marginBottom: 0, textAlign: "center" }}
                      placeholder="DD"
                      value={birth.d}
                      onChange={(e) => setBirth({ ...birth, d: e.target.value.replace(/\D/g, "").slice(0, 2) })}
                      maxLength={2}
                      inputMode="numeric"
                  />
                </div>
                <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 8 }}>
                  예시: 2000 / 01 / 01
                </div>
                <div style={{
                  background: "#F0FFF7", border: "1px solid #ADFFD2",
                  borderRadius: "var(--radius-md)", padding: "12px 14px",
                  marginTop: 20, display: "flex", gap: 8, alignItems: "flex-start",
                }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                    <path d="M8 1.5L2 4V8C2 11.3 4.6 14.4 8 15C11.4 14.4 14 11.3 14 8V4L8 1.5Z" stroke="#03C75A" strokeWidth="1.3" strokeLinejoin="round"/>
                    <path d="M5.5 8L7 9.5L10.5 6" stroke="#03C75A" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ fontSize: 12, color: "var(--green-dark)", lineHeight: 1.5 }}>
                생년월일은 안전하게 보호되며 외부에 공개되지 않아요
              </span>
                </div>
              </div>
          )}

          {/* STEP 3: 성별 */}
          {step === 3 && (
              <div className="profile-step">
                <div className="step-header">
                  <div className="step-title">성별은 무엇인가요?</div>
                  <div className="step-sub">선택하지 않아도 괜찮아요</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { value: "남자", label: "남자" },
                    { value: "여자", label: "여자" },
                    { value: "기타", label: "선택 안 함" },
                  ].map(({ value, label }) => (
                      <button
                          key={value}
                          className={`gender-option ${gender === value ? "active" : ""}`}
                          onClick={() => setGender(value)}
                      >
                        <span>{label}</span>
                        {gender === value && (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <circle cx="10" cy="10" r="9" fill="#03C75A"/>
                              <path d="M6 10L8.5 12.5L14 7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        )}
                      </button>
                  ))}
                </div>
              </div>
          )}

          {/* STEP 4: 캐릭터 선택 */}
          {step === 4 && (
              <div className="profile-step">
                <div className="step-header">
                  <div className="step-title">캐릭터를 선택해주세요</div>
                  <div className="step-sub">나를 표현할 캐릭터를 골라봐요</div>
                </div>
                <div className="emoji-grid">
                  {EMOJIS.map((e) => (
                      <button
                          key={e}
                          className={`emoji-item ${emoji === e ? "active" : ""}`}
                          onClick={() => setEmoji(e)}
                      >
                        {e}
                      </button>
                  ))}
                </div>
              </div>
          )}

          {/* STEP 5: 관심 활동 */}
          {step === 5 && (
              <div className="profile-step">
                <div className="step-header">
                  <div className="step-title">어떤 활동에 관심 있나요?</div>
                  <div className="step-sub">최대 5개까지 선택할 수 있어요</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <span style={{ fontSize: 13, color: "var(--gray-400)" }}>관심 활동 선택</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: interests.length > 0 ? "var(--green-dark)" : "var(--gray-400)" }}>
                {interests.length} / 5
              </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {INTERESTS.map((item) => (
                      <button
                          key={item}
                          className={`chip ${item === "직접 쓰기" && showCustomInput ? "active" : interests.includes(item) ? "active" : ""}`}
                          onClick={() => toggleInterest(item)}
                      >
                        {item}
                      </button>
                  ))}
                  {/* 직접 추가한 커스텀 항목 */}
                  {interests
                      .filter((i) => !INTERESTS.includes(i))
                      .map((item) => (
                          <button
                              key={item}
                              className="chip active"
                              onClick={() => setInterests(interests.filter((i) => i !== item))}
                          >
                            {item} ✕
                          </button>
                      ))}
                </div>

                {/* 직접 쓰기 입력창 */}
                {showCustomInput && (
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <input
                          className="input-field"
                          style={{ flex: 1, marginBottom: 0 }}
                          placeholder="직접 입력 (최대 15자)"
                          value={customText}
                          onChange={(e) => setCustomText(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addCustomInterest()}
                          autoFocus
                          maxLength={15}
                      />
                      <button
                          className="btn btn-primary"
                          style={{ padding: "0 18px", fontSize: 14, borderRadius: "var(--radius-md)", width: "auto" }}
                          onClick={addCustomInterest}
                          disabled={!customText.trim() || interests.length >= 5}
                      >
                        추가
                      </button>
                    </div>
                )}

                {interests.length === 5 && (
                    <div style={{ marginTop: 16, padding: "10px 14px", background: "#F0FFF7", border: "1px solid #ADFFD2", borderRadius: "var(--radius-md)", fontSize: 13, color: "var(--green-dark)" }}>
                      최대 5개를 선택했어요 🎉
                    </div>
                )}
              </div>
          )}

        </div>

        <div className="bottom-bar">
          <button className="btn btn-primary" onClick={goNext} disabled={!canNext()}>
            {step === TOTAL_STEPS ? "완료" : "다음"}
          </button>
        </div>
      </div>
  );
}