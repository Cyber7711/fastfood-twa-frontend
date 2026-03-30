import { useState, useEffect } from "react";

const messages = [
  "Oshpaz pishirmoqda...",
  "Pishloq eritilmoqda...",
  "Sous tayyorlanmoqda...",
  "Kartoshka qovurilmoqda...",
  "Buyurtma yuklanmoqda...",
  "Dasturchini ovqatlantiryapmiz...",
  "Serverga tuz sepilmoqda...",
];

function Spark({ id }) {
  const x = 30 + Math.random() * 40;
  const y = 20 + Math.random() * 60;
  const dx = (Math.random() - 0.5) * 100;
  const dy = -(30 + Math.random() * 80);
  const delay = Math.random() * 2;
  const duration = 1.5 + Math.random();

  return (
    <div
      key={id}
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: 4,
        height: 4,
        borderRadius: "50%",
        background: "#ff6b00",
        opacity: 0,
        animation: `sparkFly ${duration}s ease-out ${delay}s infinite`,
        "--dx": `${dx}px`,
        "--dy": `${dy}px`,
        zIndex: 1,
      }}
    />
  );
}

export default function FastFoodLoader() {
  const [msgIdx, setMsgIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [stepIdx, setStepIdx] = useState(0);
  const [sparks] = useState(() => Array.from({ length: 15 }, (_, i) => i));

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMsgIdx((prev) => (prev + 1) % messages.length);
        setVisible(true);
      }, 200);
    }, 1800);
    return () => clearInterval(msgTimer);
  }, []);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStepIdx((prev) => (prev + 1) % 5);
    }, 700);
    return () => clearInterval(stepTimer);
  }, []);

  return (
    <div style={styles.wrap}>
      <style>{css}</style>

      {/* Background dots */}
      <div style={styles.bgDots} />

      {/* Neon rings - vmin ishlatamizki hamma ekranda markazda bo'lsin */}
      <div
        style={{
          ...styles.ring,
          width: "60vmin",
          height: "60vmin",
          animationDelay: "0s",
        }}
      />
      <div
        style={{
          ...styles.ring,
          width: "80vmin",
          height: "80vmin",
          animationDelay: "0.5s",
        }}
      />
      <div
        style={{
          ...styles.ring,
          width: "100vmin",
          height: "100vmin",
          animationDelay: "1s",
        }}
      />

      {/* Sparks */}
      <div style={styles.sparksContainer}>
        {sparks.map((id) => (
          <Spark key={id} id={id} />
        ))}
      </div>

      {/* Center content */}
      <div style={styles.center}>
        {/* Brand */}
        <div style={styles.brandName}>🍟 FastBurger</div>

        {/* Burger Stack */}
        <div style={styles.burgerStack}>
          <div style={styles.bunTop}>
            <div
              style={{
                ...styles.sesame,
                top: "25%",
                left: "25%",
                transform: "rotate(-20deg)",
              }}
            />
            <div
              style={{
                ...styles.sesame,
                top: "20%",
                left: "55%",
                transform: "rotate(10deg)",
              }}
            />
            <div
              style={{
                ...styles.sesame,
                top: "30%",
                left: "80%",
                transform: "rotate(-15deg)",
              }}
            />
          </div>
          <div style={styles.lettuce} />
          <div style={styles.cheese} />
          <div style={styles.patty} />
          <div style={styles.tomato} />
          <div style={styles.bunBottom} />
        </div>

        {/* Shadow */}
        <div style={styles.shadow} />

        {/* Status text */}
        <div style={{ ...styles.statusText, opacity: visible ? 1 : 0 }}>
          {messages[msgIdx]}
        </div>

        <div style={styles.subText}>Fast Food SaaS v2.0</div>

        {/* Progress bar */}
        <div style={styles.track}>
          <div style={styles.bar} />
        </div>

        {/* Step dots */}
        <div style={styles.steps}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                ...styles.step,
                background:
                  i < stepIdx
                    ? "#ff9944"
                    : i === stepIdx
                      ? "#ff6b00"
                      : "#ff6b0033",
                boxShadow: i === stepIdx ? "0 0 10px #ff6b00aa" : "none",
                transform: i === stepIdx ? "scale(1.3)" : "scale(1)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#1a0a00",
    zIndex: 9999,
    overflow: "hidden",
    fontFamily: "'Nunito', sans-serif",
  },
  bgDots: {
    position: "absolute",
    inset: 0,
    backgroundImage: "radial-gradient(circle, #ff6b0015 1px, transparent 1px)",
    backgroundSize: "32px 32px",
    animation: "bgPan 20s linear infinite",
  },
  ring: {
    position: "absolute",
    borderRadius: "50%",
    border: "2px solid #ff6b00",
    animation: "ringPulse 3s ease-in-out infinite",
    opacity: 0.1,
  },
  sparksContainer: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  },
  center: {
    position: "relative",
    zIndex: 10,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
  brandName: {
    fontFamily: "'Fredoka One', cursive",
    fontSize: "clamp(28px, 8vw, 42px)",
    color: "#ff6b00",
    letterSpacing: 4,
    textTransform: "uppercase",
    textShadow: "0 0 30px #ff6b0088",
    animation: "nameGlow 2s ease-in-out infinite alternate",
    marginBottom: 10,
  },
  burgerStack: {
    position: "relative",
    width: "clamp(140px, 35vmin, 180px)",
    height: "clamp(140px, 35vmin, 180px)",
    margin: "20px 0",
    animation: "burgerFloat 2.4s ease-in-out infinite",
  },
  bunTop: {
    position: "absolute",
    top: "5%",
    left: "5%",
    right: "5%",
    height: "35%",
    background: "linear-gradient(160deg, #f5a623 0%, #d4700a 100%)",
    borderRadius: "60px 60px 12px 12px",
    boxShadow: "inset 0 -4px 0 #b85e08, 0 4px 12px #00000055",
    overflow: "hidden",
  },
  sesame: {
    position: "absolute",
    width: "6%",
    height: "10%",
    background: "#b85e0866",
    borderRadius: "50%",
  },
  lettuce: {
    position: "absolute",
    top: "38%",
    left: "2%",
    right: "2%",
    height: "12%",
    background: "#4caf50",
    borderRadius: 4,
    clipPath:
      "polygon(0% 50%, 4% 0%, 8% 50%, 12% 0%, 16% 50%, 20% 0%, 24% 50%, 28% 0%, 32% 50%, 36% 0%, 40% 50%, 44% 0%, 48% 50%, 52% 0%, 56% 50%, 60% 0%, 64% 50%, 68% 0%, 72% 50%, 76% 0%, 80% 50%, 84% 0%, 88% 50%, 92% 0%, 96% 50%, 100% 0%, 100% 100%, 0% 100%)",
  },
  cheese: {
    position: "absolute",
    top: "48%",
    left: "4%",
    right: "4%",
    height: "10%",
    background: "#ffc107",
    borderRadius: 2,
    animation: "cheeseSlide 2.4s ease-in-out infinite",
  },
  patty: {
    position: "absolute",
    top: "58%",
    left: "5%",
    right: "5%",
    height: "15%",
    background: "linear-gradient(160deg, #795548 0%, #4e342e 100%)",
    borderRadius: 6,
    boxShadow: "inset 0 -3px 0 #3e2723, 0 3px 8px #00000044",
  },
  tomato: {
    position: "absolute",
    top: "73%",
    left: "7%",
    right: "7%",
    height: "8%",
    background: "#e53935",
    borderRadius: 3,
  },
  bunBottom: {
    position: "absolute",
    bottom: "5%",
    left: "5%",
    right: "5%",
    height: "22%",
    background: "linear-gradient(160deg, #f0961a 0%, #c6610a 100%)",
    borderRadius: "8px 8px 24px 24px",
    boxShadow: "inset 0 3px 0 #f5a62355, 0 4px 12px #00000055",
  },
  shadow: {
    width: "30%",
    height: 12,
    background: "radial-gradient(ellipse, #ff6b0044 0%, transparent 70%)",
    borderRadius: "50%",
    animation: "shadowPulse 2.4s ease-in-out infinite",
  },
  statusText: {
    fontSize: "clamp(12px, 4vw, 15px)",
    fontWeight: 800,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#ff6b00",
    margin: "25px 0 8px",
    transition: "opacity 0.4s",
    textAlign: "center",
  },
  subText: {
    fontSize: 10,
    fontWeight: 400,
    color: "#ff6b0044",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 20,
  },
  track: {
    width: "clamp(160px, 50vw, 240px)",
    height: 4,
    background: "#ffffff08",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
  },
  bar: {
    height: "100%",
    background: "linear-gradient(90deg, #ff6b00, #ffaa00)",
    animation: "barFill 2s cubic-bezier(.4,0,.2,1) infinite",
  },
  steps: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  step: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    transition: "all 0.3s ease",
  },
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@700;800&display=swap');

@keyframes bgPan {
  from { background-position: 0 0; }
  to { background-position: 32px 32px; }
}
@keyframes ringPulse {
  0%, 100% { transform: scale(1); opacity: 0.1; }
  50% { transform: scale(1.1); opacity: 0.25; }
}
@keyframes nameGlow {
  from { text-shadow: 0 0 20px #ff6b0044; }
  to { text-shadow: 0 0 40px #ff6b00cc, 0 0 60px #ff4400aa; }
}
@keyframes burgerFloat {
  0%, 100% { transform: translateY(0px) rotate(-1deg); }
  50% { transform: translateY(-15px) rotate(1deg); }
}
@keyframes cheeseSlide {
  0%, 100% { transform: skewX(0deg); }
  50% { transform: skewX(4deg) translateX(2px); }
}
@keyframes shadowPulse {
  0%, 100% { transform: scaleX(1); opacity: 0.5; }
  50% { transform: scaleX(0.6); opacity: 0.2; }
}
@keyframes barFill {
  0% { width: 0%; margin-left: 0%; }
  50% { width: 70%; margin-left: 0%; }
  100% { width: 0%; margin-left: 100%; }
}
@keyframes sparkFly {
  0% { opacity: 0; transform: translate(0,0) scale(1); }
  20% { opacity: 1; }
  100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(0); }
}
`;
