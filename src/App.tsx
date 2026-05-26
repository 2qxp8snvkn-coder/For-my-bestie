import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence, stagger, useAnimate } from "framer-motion";
import { Blocks, Gamepad2, Crown } from "lucide-react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import SpinPage from "@/pages/SpinPage";

/* ─── Types ─── */
interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  vx: number;
  vy: number;
  life: number;
}

interface ClickEmoji {
  id: number;
  x: number;
  y: number;
  symbol: string;
}

/* ─── Constants ─── */
const CONFETTI_COLORS = [
  "#FF2D78", "#A855F7", "#FFD700", "#3B82F6",
  "#10B981", "#F97316", "#EC4899", "#8B5CF6",
];

const MARQUEE_WORDS = [
  "BESTIE 💕", "PRINCESS 👑", "GAMER GIRL 🎮", "CAT MOM 🐱",
  "ICE CREAM LOVER 🍦", "MONSTER ENERGY ⚡", "ROBLOX PRO 🟥", "MINECRAFT LEGEND 🧱",
  "BESTIE 💕", "PRINCESS 👑", "GAMER GIRL 🎮", "CAT MOM 🐱",
  "ICE CREAM LOVER 🍦", "MONSTER ENERGY ⚡", "ROBLOX PRO 🟥", "MINECRAFT LEGEND 🧱",
];

const CLICK_SYMBOLS = ["💕", "✨", "⭐", "🌸", "💖", "🌟", "💝", "🎀"];

/* ─── Confetti Canvas ─── */
function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = Array.from({ length: 120 }).map((_, i) => ({
      id: i,
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 200,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 6 + Math.random() * 10,
      vx: (Math.random() - 0.5) * 5,
      vy: 2 + Math.random() * 4,
      life: 1,
    }));

    let frame = 0;
    let animId: number;
    const MAX_FRAMES = 200;

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach((p) => {
        if (p.y > canvas.height + 20) return;
        alive = true;
        p.x += p.vx;
        p.vy += 0.08;
        p.y += p.vy;
        p.vx *= 0.99;
        p.life = Math.max(0, 1 - frame / MAX_FRAMES);
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        if (p.id % 3 === 0) {
          ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        } else if (p.id % 3 === 1) {
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 4, p.size, p.size / 2);
        } else {
          const s = p.size / 2;
          ctx.moveTo(p.x, p.y - s);
          ctx.lineTo(p.x + s * 0.5, p.y + s * 0.5);
          ctx.lineTo(p.x - s * 0.5, p.y + s * 0.5);
        }
        ctx.fill();
      });
      frame++;
      if (frame < MAX_FRAMES && alive) {
        animId = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[998]"
    />
  );
}

/* ─── Sparkle Cursor Trail ─── */
function CursorTrail() {
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number; symbol: string }[]>([]);

  useEffect(() => {
    let lastTime = 0;
    function onMove(e: MouseEvent) {
      const now = Date.now();
      if (now - lastTime < 60) return;
      lastTime = now;
      const id = now + Math.random();
      const symbols = ["✦", "✧", "★", "✨", "⋆", "·"];
      setSparks((s) => [
        ...s.slice(-15),
        { id, x: e.clientX, y: e.clientY, symbol: symbols[Math.floor(Math.random() * symbols.length)] },
      ]);
      setTimeout(() => setSparks((s) => s.filter((sp) => sp.id !== id)), 700);
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[997]">
      <AnimatePresence>
        {sparks.map((sp) => (
          <motion.span
            key={sp.id}
            className="absolute font-display select-none"
            style={{
              left: sp.x,
              top: sp.y,
              color: CONFETTI_COLORS[Math.floor(sp.id) % CONFETTI_COLORS.length],
              fontSize: 14 + Math.random() * 14,
            }}
            initial={{ opacity: 1, scale: 1, x: -6, y: -6 }}
            animate={{ opacity: 0, scale: 0.2, y: -30 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          >
            {sp.symbol}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ─── Marquee ─── */
function Marquee({ reverse = false, bg = "bg-primary", text = "text-white" }: { reverse?: boolean; bg?: string; text?: string }) {
  return (
    <div className={`${bg} ${text} py-3 overflow-hidden border-y-4 border-foreground my-8 select-none`}>
      <div
        className={`flex gap-8 whitespace-nowrap font-display text-2xl ${reverse ? "marquee-reverse" : "marquee"}`}
        style={{ width: "max-content" }}
      >
        {MARQUEE_WORDS.map((w, i) => (
          <span key={i} className="inline-flex items-center gap-4">
            {w}
            <span className="text-white/40">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Bounce-In Letters ─── */
function BounceLetters({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`inline-flex flex-wrap justify-center ${className}`} aria-label={text}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 60, rotate: -20 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.7, duration: 0.8, delay: 0.3 + i * 0.07 }}
          className="inline-block"
          style={{ whiteSpace: char === " " ? "pre" : undefined }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}

/* ─── Floating Star Field ─── */
function StarField() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 22 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute font-display"
          style={{
            left: `${(i * 17 + 5) % 100}%`,
            top: `${(i * 23 + 10) % 100}%`,
            color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            opacity: 0.18,
            fontSize: 16 + (i % 5) * 6,
          }}
          animate={{
            opacity: [0.12, 0.35, 0.12],
            scale: [1, 1.4, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 4 + (i % 5), repeat: Infinity, delay: i * 0.25 }}
        >
          {i % 4 === 0 ? "★" : i % 4 === 1 ? "✦" : i % 4 === 2 ? "♡" : "✿"}
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Float Bubble ─── */
function FloatBubble({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={`absolute pointer-events-none select-none ${className}`}
      animate={{ y: [0, -20, 0], rotate: [-6, 6, -6] }}
      transition={{ duration: 3.5 + delay * 0.5, repeat: Infinity, ease: "easeInOut", delay }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Tape ─── */
function Tape({ className }: { className?: string }) {
  return <div className={`tape w-20 ${className ?? ""}`} style={{ borderRadius: 3 }} />;
}

/* ─── Animated Stat ─── */
function AnimStat({ value, label, emoji }: { value: number; label: string; emoji: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const step = Math.ceil(value / 40);
          const interval = setInterval(() => {
            start += step;
            if (start >= value) { setCount(value); clearInterval(interval); }
            else setCount(start);
          }, 35);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <motion.div
      ref={ref}
      whileHover={{ scale: 1.08, rotate: -2 }}
      className="card-solid bg-white p-8 flex flex-col items-center text-center"
      data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}
    >
      <div className="text-5xl mb-3">{emoji}</div>
      <div
        className="text-6xl font-display leading-none mb-2"
        style={{ color: "hsl(var(--primary))", WebkitTextStroke: "2px hsl(var(--foreground))", paintOrder: "stroke fill" }}
      >
        {count.toLocaleString()}+
      </div>
      <div className="font-bold text-lg text-foreground/70 uppercase tracking-wide">{label}</div>
    </motion.div>
  );
}

/* ─── Running Cat ─── */
function RunningCat() {
  const [run, setRun] = useState<{ dir: "ltr" | "rtl"; top: number } | null>(null);
  const [meow, setMeow] = useState(false);

  useEffect(() => {
    function launch() {
      const dir = Math.random() > 0.5 ? "ltr" : "rtl";
      const top = 15 + Math.random() * 65;
      setRun({ dir, top });
      setMeow(false);
      setTimeout(() => setMeow(true), 600);
      setTimeout(() => { setRun(null); setMeow(false); }, 3200);
    }
    const first = setTimeout(launch, 5000);
    const interval = setInterval(launch, 10000 + Math.random() * 8000);
    return () => { clearTimeout(first); clearInterval(interval); };
  }, []);

  return (
    <AnimatePresence>
      {run && (
        <motion.div
          key={`cat-${run.top}`}
          className="fixed pointer-events-none z-[996]"
          style={{ top: `${run.top}vh` }}
          initial={{ x: run.dir === "ltr" ? "-80px" : "110vw" }}
          animate={{ x: run.dir === "ltr" ? "110vw" : "-80px" }}
          transition={{ duration: 2.8, ease: "linear" }}
        >
          <div className="relative flex items-center gap-1">
            <motion.div
              className="text-5xl select-none"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.35, repeat: Infinity }}
              style={{ scaleX: run.dir === "rtl" ? -1 : 1 }}
            >
              🐱
            </motion.div>
            <AnimatePresence>
              {meow && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.4, y: 0 }}
                  animate={{ opacity: 1, scale: 1, y: -8 }}
                  exit={{ opacity: 0 }}
                  className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white border-2 border-foreground rounded-xl px-3 py-1 font-display text-base whitespace-nowrap shadow-md"
                  style={{ boxShadow: "3px 3px 0 hsl(var(--foreground))" }}
                >
                  meow! 🐾
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Party Mode Canvas (fired on demand) ─── */
function PartyBurst({ trigger }: { trigger: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const particles = Array.from({ length: 200 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 6 + Math.random() * 14;
      return {
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 7 + Math.random() * 9,
        id: i,
      };
    });

    let frame = 0;
    let animId: number;
    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.35; p.vx *= 0.98;
        ctx.globalAlpha = Math.max(0, 1 - frame / 90);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        if (p.id % 2 === 0) ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        else ctx.fillRect(p.x, p.y, p.size, p.size / 2);
        ctx.fill();
      });
      frame++;
      if (frame < 100) animId = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [trigger]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[990]" />;
}

/* ─── Home Page ─── */
function Home() {
  const [, setLocation] = useLocation();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -100]);

  const [clickEmojis, setClickEmojis] = useState<ClickEmoji[]>([]);
  const [partyTrigger, setPartyTrigger] = useState(0);
  const [partyFlash, setPartyFlash] = useState(false);
  const [partyLabel, setPartyLabel] = useState(false);

  function spawnEmoji(e: React.MouseEvent) {
    const id = Date.now() + Math.random();
    const symbol = CLICK_SYMBOLS[Math.floor(Math.random() * CLICK_SYMBOLS.length)];
    setClickEmojis((c) => [...c, { id, x: e.clientX, y: e.clientY, symbol }]);
    setTimeout(() => setClickEmojis((c) => c.filter((ec) => ec.id !== id)), 1100);
  }

  function triggerParty(e: React.MouseEvent) {
    e.stopPropagation();
    setPartyTrigger((n) => n + 1);
    setPartyFlash(true);
    setPartyLabel(true);
    setTimeout(() => setPartyFlash(false), 600);
    setTimeout(() => setPartyLabel(false), 2500);
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden" onClick={spawnEmoji}>
      <ConfettiCanvas />
      <CursorTrail />
      <StarField />
      <RunningCat />
      <PartyBurst trigger={partyTrigger} />

      {/* Party flash overlay */}
      <AnimatePresence>
        {partyFlash && (
          <motion.div
            key="flash"
            className="fixed inset-0 z-[995] pointer-events-none"
            initial={{ opacity: 0.7 }}
            animate={{ opacity: [0.7, 0.4, 0.7, 0.2, 0] }}
            transition={{ duration: 0.55 }}
            style={{ background: "linear-gradient(135deg, #FF2D78, #A855F7, #FFD700, #3B82F6, #10B981)" }}
          />
        )}
      </AnimatePresence>

      {/* Party label popup */}
      <AnimatePresence>
        {partyLabel && (
          <motion.div
            key="party-label"
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[994] pointer-events-none"
            initial={{ scale: 0.3, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: [-10, 5, -3, 0] }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.6, duration: 0.5 }}
          >
            <div
              className="bg-white font-display text-5xl md:text-7xl px-10 py-6 rounded-3xl border-4 border-foreground text-center"
              style={{ boxShadow: "8px 8px 0 hsl(var(--foreground))" }}
            >
              🎉 PARTY MODE! 🎉
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Secret party button — fixed bottom right */}
      <motion.button
        onClick={triggerParty}
        animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        whileHover={{ scale: 1.25 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-[993] text-4xl bg-white rounded-full w-16 h-16 flex items-center justify-center border-3 border-foreground shadow-lg cursor-pointer"
        style={{ border: "3px solid hsl(var(--foreground))", boxShadow: "4px 4px 0 hsl(var(--foreground))" }}
        title="press me 👀"
        data-testid="party-button"
      >
        🎉
      </motion.button>

      {/* Click burst emojis */}
      <AnimatePresence>
        {clickEmojis.map((ec) => (
          <motion.div
            key={ec.id}
            className="fixed pointer-events-none z-[999] text-3xl"
            style={{ left: ec.x - 16, top: ec.y - 16 }}
            initial={{ opacity: 1, scale: 0.4, y: 0 }}
            animate={{ opacity: 0, scale: 1.8, y: -80 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: "easeOut" }}
          >
            {ec.symbol}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 py-20">
        {/* Blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-primary/25 blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-secondary/25 blur-3xl translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] rounded-full bg-accent/15 blur-3xl -translate-x-1/2 -translate-y-1/2" />

        {/* Floating stickers */}
        <FloatBubble delay={0} className="top-[10%] left-[5%]">
          <div className="bg-pink-400 rounded-full p-3 border-3 border-foreground shadow-lg text-4xl" style={{ border: "3px solid hsl(var(--foreground))" }}>🐱</div>
        </FloatBubble>
        <FloatBubble delay={0.8} className="top-[7%] right-[7%]">
          <div className="bg-purple-400 rounded-full p-3 border-3 border-foreground shadow-lg text-4xl" style={{ border: "3px solid hsl(var(--foreground))" }}>🎮</div>
        </FloatBubble>
        <FloatBubble delay={0.4} className="bottom-[14%] left-[4%]">
          <div className="bg-yellow-400 rounded-full p-3 border-3 border-foreground shadow-lg text-4xl" style={{ border: "3px solid hsl(var(--foreground))" }}>🍦</div>
        </FloatBubble>
        <FloatBubble delay={1.2} className="bottom-[16%] right-[5%]">
          <div className="bg-green-400 rounded-full p-3 border-3 border-foreground shadow-lg text-4xl" style={{ border: "3px solid hsl(var(--foreground))" }}>⚡</div>
        </FloatBubble>
        <FloatBubble delay={1.8} className="top-[38%] right-[2%]">
          <div className="bg-blue-400 rounded-full p-3 border-3 border-foreground shadow-lg text-4xl" style={{ border: "3px solid hsl(var(--foreground))" }}>🧱</div>
        </FloatBubble>
        <FloatBubble delay={1.4} className="top-[30%] left-[2%]">
          <div className="bg-red-400 rounded-full p-3 border-3 border-foreground shadow-lg text-4xl" style={{ border: "3px solid hsl(var(--foreground))" }}>🎀</div>
        </FloatBubble>

        {/* Hero card */}
        <motion.div style={{ y: heroY }} className="relative z-10 w-full max-w-2xl">
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -12 }}
            animate={{ scale: 1, opacity: 1, rotate: -2 }}
            transition={{ type: "spring", bounce: 0.5, duration: 1.3 }}
            whileHover={{ rotate: 0, scale: 1.02 }}
            className="card-solid bg-white p-10 md:p-14 text-center relative"
            data-testid="hero-card"
          >
            <Tape className="-top-3 left-10 -rotate-6" />
            <Tape className="-top-3 right-12 rotate-4" />
            <Tape className="-bottom-3 left-1/2 -translate-x-1/2 rotate-2" />

            {/* Wobbly crown badge */}
            <motion.div
              animate={{ rotate: [0, 18, -12, 6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
              className="absolute -top-8 -right-8 bg-accent text-foreground rounded-full w-16 h-16 flex items-center justify-center shadow-md z-30"
              style={{ border: "3px solid hsl(var(--foreground))" }}
            >
              <Crown size={28} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground mb-3"
            >
              🌟 a very official tribute to 🌟
            </motion.div>

            <h1
              className="font-display leading-none mb-4"
              style={{
                fontSize: "clamp(3.5rem, 12vw, 7rem)",
                color: "hsl(var(--primary))",
                WebkitTextStroke: "3px hsl(var(--foreground))",
                paintOrder: "stroke fill",
              }}
              data-testid="hero-title"
            >
              <BounceLetters text="MY BESTIE" />
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="text-xl md:text-2xl font-bold text-foreground/80 mt-4"
            >
              The cutest, smartest, most chaotic person I know 💕
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Scroll prompt — bouncing arrow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="relative z-10 mt-12 flex flex-col items-center gap-1"
        >
          <span className="text-muted-foreground font-bold text-sm uppercase tracking-widest">scroll to see more</span>
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            className="text-primary text-3xl"
          >
            ↓
          </motion.div>
        </motion.div>
      </section>

      {/* ─── MARQUEE 1 ─── */}
      <Marquee bg="bg-primary" text="text-white" />

      {/* ─── HER FAVOURITE THINGS ─── */}
      <section className="relative z-10 py-24 px-4 max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="text-5xl md:text-7xl font-display text-center mb-16"
          style={{ color: "hsl(var(--secondary))", WebkitTextStroke: "2px hsl(var(--foreground))", paintOrder: "stroke fill" }}
          data-testid="section-favourites"
        >
          ✨ Her Favourite Things ✨
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            { emoji: "🐱", title: "Cats", desc: "Show her a kitten and she turns into a completely different person. 10/10 unhinged cat energy.", bg: "bg-pink-200", rotate: "-rotate-3", delay: 0 },
            { emoji: "🍦", title: "Ice Cream", desc: "It's raining? Ice cream. It's cold? Ice cream. It's 3am? Especially ice cream.", bg: "bg-sky-200", rotate: "rotate-2", delay: 0.12 },
            { emoji: "⚡", title: "Monster Energy", desc: "Her life force. Powered entirely by caffeine and absolute vibes.", bg: "bg-green-200", rotate: "-rotate-1", delay: 0.24 },
          ].map((item) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, scale: 0.6, rotate: -15 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ type: "spring", bounce: 0.55, delay: item.delay }}
              whileHover={{ y: -14, scale: 1.05, rotate: 0, transition: { duration: 0.18 } }}
              className={`card-solid ${item.bg} p-8 flex flex-col items-center text-center ${item.rotate}`}
              data-testid={`card-fav-${item.title.toLowerCase()}`}
            >
              <Tape className="-top-3 left-1/2 -translate-x-1/2 rotate-1" />
              <motion.div
                animate={{ rotate: [0, -8, 8, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: item.delay }}
                className="text-7xl mb-5"
                style={{ fontSize: 72, lineHeight: 1 }}
              >
                {item.emoji}
              </motion.div>
              <h3 className="text-3xl font-display mb-3">{item.title}</h3>
              <p className="text-base font-semibold leading-relaxed text-foreground/80">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── MARQUEE 2 (reverse) ─── */}
      <Marquee reverse bg="bg-secondary" text="text-white" />

      {/* ─── BESTIE STATS ─── */}
      <section className="relative z-10 py-20 px-4 max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="text-5xl md:text-6xl font-display text-center mb-14"
          style={{ color: "hsl(var(--accent))", WebkitTextStroke: "2px hsl(var(--foreground))", paintOrder: "stroke fill" }}
          data-testid="section-stats"
        >
          🏆 Bestie Stats 🏆
        </motion.h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <AnimStat value={100} label="Vibes Only" emoji="✨" />
          <AnimStat value={9999} label="Games Together" emoji="🎮" />
          <AnimStat value={247} label="Ice Creams Eaten" emoji="🍦" />
          <AnimStat value={1} label="Bestie Like Her" emoji="💖" />
        </div>
      </section>

      {/* ─── GAMER GIRL MODE ─── */}
      <section className="relative z-10 py-20 px-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", bounce: 0.35 }}
          className="card-solid relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, hsl(280 90% 65%), hsl(336 100% 55%))" }}
          data-testid="section-gaming"
        >
          <Tape className="-top-3 left-16 -rotate-3" />
          <Tape className="-top-3 right-20 rotate-5" />

          {/* Animated background icons */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {["🎮","🧱","⭐","🎮","🧱","💫","🎮","🧱"].map((icon, i) => (
              <motion.div
                key={i}
                className="absolute text-white/10 text-6xl"
                style={{ left: `${(i * 14) % 100}%`, top: `${(i * 23 + 10) % 90}%` }}
                animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "linear" }}
              >
                {icon}
              </motion.div>
            ))}
          </div>

          <div className="relative z-10 p-10 md:p-14 flex flex-col md:flex-row items-center gap-10 text-white">
            <div className="flex-1">
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block bg-white/20 backdrop-blur-sm border-2 border-white/40 rounded-full px-5 py-1.5 text-sm font-bold uppercase tracking-widest mb-5"
              >
                🎮 gamer mode: ON
              </motion.div>
              <h2 className="text-5xl md:text-6xl font-display leading-tight mb-5 drop-shadow-md">
                We Game Together!
              </h2>
              <p className="text-lg md:text-xl font-semibold mb-8 text-white/90 leading-relaxed">
                Whether we're building dirt mansions in Minecraft, surviving total chaos in Roblox,
                or doing absolutely nothing productive — it's always the best time.
              </p>
              <div className="flex flex-wrap gap-4">
                {[
                  { icon: <Blocks size={24} className="text-green-500" />, label: "Minecraft", rotate: "-rotate-3" },
                  { icon: <Gamepad2 size={24} className="text-red-500" />, label: "Roblox", rotate: "rotate-3" },
                ].map((b) => (
                  <motion.div
                    key={b.label}
                    whileHover={{ scale: 1.12, rotate: 0 }}
                    whileTap={{ scale: 0.95 }}
                    className={`bg-white text-foreground font-bold px-6 py-3 rounded-2xl flex items-center gap-3 text-lg ${b.rotate}`}
                    style={{ border: "3px solid hsl(var(--foreground))", boxShadow: "4px 4px 0 hsl(var(--foreground))" }}
                    data-testid={`badge-${b.label.toLowerCase()}`}
                  >
                    {b.icon}
                    {b.label}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Triple-ring spinning badge */}
            <div className="flex-shrink-0 relative w-52 h-52 md:w-60 md:h-60">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-4 border-dashed border-white/50" />
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-3 rounded-full border-4 border-dotted border-yellow-300/60" />
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute inset-6 rounded-full border-2 border-white/30" />
              <div className="absolute inset-10 bg-white rounded-full flex items-center justify-center shadow-lg"
                style={{ border: "3px solid hsl(var(--foreground))" }}>
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-center"
                >
                  <div className="text-4xl">🎮</div>
                  <div className="font-display text-foreground text-sm mt-0.5">bestie</div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── MARQUEE 3 ─── */}
      <Marquee bg="bg-accent" text="text-foreground" />

      {/* ─── WHY SHE'S THE BEST ─── */}
      <section className="relative z-10 py-20 px-4 max-w-3xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, scale: 0.7 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="text-5xl md:text-6xl font-display text-center mb-14"
          style={{ color: "hsl(var(--primary))", WebkitTextStroke: "2px hsl(var(--foreground))", paintOrder: "stroke fill" }}
          data-testid="section-reasons"
        >
          Why She's Actually The Best 🥺
        </motion.h2>

        <div className="space-y-6">
          {[
            { text: "She never judges my questionable taste in music", emoji: "🎵", bg: "bg-pink-200", x: -60 },
            { text: "Always down for late night game sessions no matter what", emoji: "🌙", bg: "bg-purple-200", x: 60 },
            { text: "Sends me the funniest things exactly when I need cheering up", emoji: "😂", bg: "bg-yellow-200", x: -60 },
            { text: "Will honestly tell me if something looks bad (love the honesty)", emoji: "💅", bg: "bg-sky-200", x: 60 },
            { text: "Makes literally everything 100x more fun just by being there", emoji: "✨", bg: "bg-green-200", x: -60 },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: item.x }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ type: "spring", bounce: 0.4, delay: i * 0.07 }}
              whileHover={{ x: item.x > 0 ? 8 : -8, scale: 1.02 }}
              className={`card-solid ${item.bg} flex items-center gap-5 px-7 py-6 ${i % 2 === 0 ? "rotate-1" : "-rotate-1"}`}
              data-testid={`reason-${i}`}
            >
              <motion.span
                animate={{ rotate: [0, -15, 15, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                className="text-4xl flex-shrink-0"
              >
                {item.emoji}
              </motion.span>
              <p className="text-xl md:text-2xl font-display leading-snug">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── CLOSING NOTE ─── */}
      <section className="relative z-10 py-32 px-4 max-w-xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -8 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 2 }}
          viewport={{ once: true }}
          transition={{ type: "spring", bounce: 0.55 }}
          className="card-solid bg-yellow-100 p-12 md:p-16"
          style={{ transform: "rotate(2deg)" }}
          data-testid="closing-note"
        >
          <Tape className="-top-3 left-1/2 -translate-x-1/2 rotate-1 w-24" />
          <Tape className="-bottom-3 right-10 -rotate-3" />

          <motion.div
            animate={{ scale: [1, 1.25, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-6"
          >
            💖
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-display mb-5 text-foreground">
            Love you forever!
          </h2>
          <p className="text-lg font-bold text-foreground/80 leading-relaxed">
            Thanks for being my favorite person to do absolutely nothing with.
            Here's to a million more memories, more games, more ice cream,
            and more cats. 🥂
          </p>
          <div className="mt-8 text-sm font-bold uppercase tracking-widest text-muted-foreground">
            — your bestie made this for you 🌸
          </div>

          {/* Confetti dots at bottom */}
          <div className="flex justify-center gap-2 mt-6">
            {CONFETTI_COLORS.slice(0, 6).map((c, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1 + i * 0.15, repeat: Infinity, delay: i * 0.1 }}
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </motion.div>
      </section>

      {/* Small footer hint */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center pb-16 text-muted-foreground text-sm font-bold"
      >
        ✦ click anywhere on the page for surprises ✦
      </motion.div>

      {/* Spin the Wheel button — fixed bottom left */}
      <motion.button
        onClick={(e) => { e.stopPropagation(); setLocation("/spin"); }}
        animate={{ scale: [1, 1.08, 1], rotate: [0, 4, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 left-6 z-[993] bg-white rounded-full w-16 h-16 flex items-center justify-center text-3xl cursor-pointer"
        style={{ border: "3px solid hsl(var(--foreground))", boxShadow: "4px 4px 0 hsl(var(--foreground))" }}
        title="Spin the Wheel!"
        data-testid="spin-wheel-button"
      >
        🎡
      </motion.button>
    </div>
  );
}

/* ─── Root App with routing ─── */
export default function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") ?? ""}>
      <Switch>
        <Route path="/spin" component={SpinPage} />
        <Route component={Home} />
      </Switch>
    </WouterRouter>
  );
}
