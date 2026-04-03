import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import logo from "./logo2.png";
import loopText from "./LOOP_text.png";
import Home1 from "./Home1.png";
import Home2 from "./Home2.png";
import Home3 from "./Home3.png";
import Home4 from "./Home4.png";

const SLIDES = [
    {
        img: Home1,
        title: "환경은 일상의 일부니까",
        desc: "작은 실천이 쌓여 더 나은 지구를\n만들어 나갈 수 있어요.",
    },
    {
        img: Home2,
        title: "같이 시작해요!",
        desc: "친구들과 함께 환경 활동을 공유하고\n서로 응원해보세요.",
    },
    {
        img: Home3,
        title: "나의 활동이 한 눈에",
        desc: "나의 친환경 활동을 한눈에 확인하고\n꾸준히 이어나가요.",
    },
    {
        img: Home4,
        title: "실천하고\n포인트로 쌓아보세요.",
        desc: "활동을 완료하면 포인트가 쌓이고\n다양한 혜택을 누려보세요.",
    },
    {
        logo: true,
        title: "이제 시작해볼까요?",
        desc: "",
    },
];

export default function Home() {
    const navigate = useNavigate();
    const [current, setCurrent] = useState(0);

    const goNext = () => {
        if (current < SLIDES.length - 1) setCurrent(current + 1);
        else navigate("/main");
    };

    const slide = SLIDES[current];
    const isLast = current === SLIDES.length - 1;

    return (
        <div
            className="screen"
            style={{
                background: isLast
                    ? "linear-gradient(180deg, #f0fff6 50%, #03C75A 200%)"
                    : "#ffffff",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* 상단 헤더 */}
            <div
                style={{
                    padding: "20px 24px 12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                }}
            >
        <span
            style={{
                fontSize: 13,
                fontWeight: 600,
                color: isLast ? "rgba(255,255,255,0.8)" : "var(--gray-400)",
                letterSpacing: 0.2,
            }}
        >
          
        </span>
                {/* 진행 바 */}
                <div style={{ display: "flex", gap: 4 }}>
                    {SLIDES.map((_, i) => (
                        <div
                            key={i}
                            onClick={() => setCurrent(i)}
                            style={{
                                flex: 1,
                                height: 3,
                                borderRadius: 999,
                                background:
                                    i <= current
                                        ? "var(--green-primary)"
                                        : "var(--gray-200)",
                                cursor: "pointer",
                                transition: "background 0.3s ease",
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* 슬라이드 콘텐츠 */}
            <div
                key={current}
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 28px",
                    textAlign: "center",
                    animation: "fadeUp 0.3s ease both",
                    gap: 0,
                }}
            >
                {/* 제목 */}
                <div
                    style={{
                        fontSize: 24,
                        fontWeight: 800,
                        letterSpacing: -0.8,
                        lineHeight: 1.35,
                        marginBottom: 20,
                        whiteSpace: "pre-line",
                        color: "#000000",
                    }}
                >
                    {slide.title}
                </div>

                {slide.desc ? (
                    <div
                        style={{
                            fontSize: 14,
                            color: isLast ? "rgba(255,255,255,0.75)" : "var(--gray-400)",
                            lineHeight: 1.7,
                            whiteSpace: "pre-line",
                            marginBottom: 32,
                        }}
                    >
                        {slide.desc}
                    </div>
                ) : (
                    <div style={{ marginBottom: 32 }} />
                )}

                {/* 이미지 영역 */}
                {slide.logo ? (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        <img
                            src={loopText}
                            alt="LOOP"
                            style={{
                                width: 320,
                                objectFit: "contain",
                                marginBottom: 30,
                            }}
                        />
                        <img
                            src={logo}
                            alt="globe"
                            style={{
                                width: 300,
                                height: 300,
                                objectFit: "contain",
                                marginBottom: 10,
                            }}
                        />
                    </div>
                ) : (
                    <div
                        style={{
                            position: "relative",
                            width: 220,
                            height: 380,
                            borderRadius: 36,
                            background: "#111",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
                            overflow: "hidden",
                            border: "6px solid #222",
                        }}
                    >
                        {/* 노치 */}
                        <div
                            style={{
                                position: "absolute",
                                top: 10,
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: 70,
                                height: 18,
                                background: "#111",
                                borderRadius: 999,
                                zIndex: 10,
                            }}
                        />
                        {/* 화면 이미지 */}
                        <img
                            src={slide.img}
                            alt={slide.title}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                            }}
                        />
                    </div>
                )}
            </div>

            {/* 하단 버튼 */}
            <div
                className="bottom-bar"
                style={
                    isLast ? { background: "transparent", borderTop: "none" } : {}
                }
            >
                <button
                    className="btn btn-primary"
                    onClick={goNext}
                >
                    {isLast ? "시작하기" : "다음"}
                </button>
            </div>
        </div>
    );
}
