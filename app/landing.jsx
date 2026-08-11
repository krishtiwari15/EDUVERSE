"use client";
import { useEffect, useState } from "react";
import { Calculator, FlaskConical, Code2, Languages } from "lucide-react";

// A third-party CloudFront asset used for this cinematic hero — swap for a
// self-hosted video before shipping, since this URL isn't ours to depend on
// long-term.
const VIDEO_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260808_112712_da9d53df-6d27-4b12-bdf6-aa9dc2622bdf.mp4";

const NAV_LINKS = ["About", "Mentors", "Progress", "Contact"];
const SUBJECTS = [
  { icon: Calculator, label: "Math" },
  { icon: FlaskConical, label: "Science" },
  { icon: Code2, label: "Coding" },
  { icon: Languages, label: "Languages" },
];

// The cinematic, full-bleed-video marketing moment shown to signed-out
// visitors before they reach the login/signup screen. Deliberately its own
// dark-cinematic visual system (not the moonlit-galaxy theme used by the
// rest of the app) — everything here is scoped under .ev-landing so it
// can't leak into the app once this screen unmounts.
export default function Landing({ onGetStarted, onLogin }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    function onResize() { if (window.innerWidth / window.innerHeight > 1.1) setOpen(false); }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className={`ev-landing${open ? " is-open" : ""}`}>
      <style jsx global>{`
        .ev-landing{
          --ink:#fafafa; --muted:#a7a6a6; --nav:#b6b5b5; --strip:#8b8a8a;
          --pill:#ffffff; --pill-ink:#050505;
          --u: calc(100vh / 1058);
          --uw: calc(100vw / 1487);
          --h: clamp(var(--u), calc(var(--u) * .65 + var(--uw) * .35), calc(var(--u) * 1.16));
          --m: 1.34px;
        }
        @supports (height: 100dvh){ .ev-landing{ --u: calc(100dvh / 1058); } }

        html, body { height:100%; overflow:hidden; background:#050505; }

        .ev-landing, .ev-landing *{ box-sizing:border-box; }
        .ev-landing{
          font-family:'Manrope',system-ui,-apple-system,'Segoe UI',sans-serif;
          -webkit-font-smoothing:antialiased;
          -moz-osx-font-smoothing:grayscale;
          text-rendering:geometricPrecision;
          color:#fafafa;
        }
        .ev-landing a{ color:inherit; text-decoration:none; }
        .ev-landing button{ font:inherit; color:inherit; background:none; border:0; cursor:pointer; padding:0; }
        .ev-landing ul{ list-style:none; margin:0; padding:0; }
        .ev-landing svg{ display:block; }
        .ev-landing a:focus-visible, .ev-landing button:focus-visible{ outline:2px solid #fff; outline-offset:3px; border-radius:4px; }

        .ev-landing .stage{ position:relative; width:100vw; height:100vh; height:100dvh; overflow:hidden; background:#050505; }
        .ev-landing .plate{ position:absolute; inset:0; overflow:hidden; }
        .ev-landing .plate-video{
          position:absolute; left:50%; top:calc(1 * var(--u));
          width:calc(1492 * var(--u)); height:calc(1054 * var(--u));
          transform:translateX(calc(-50% - calc(0.5 * var(--u))));
          object-fit:cover; pointer-events:none;
        }
        .ev-landing .plate::after{
          content:""; position:absolute; inset:0; pointer-events:none;
          background:
            linear-gradient(to bottom,
              rgba(5,5,5,0) 78.8%, rgba(5,5,5,.23) 79.6%, rgba(5,5,5,.45) 81.4%,
              rgba(5,5,5,.75) 83.3%, rgba(5,5,5,.84) 85.2%, rgba(5,5,5,.888) 88%,
              rgba(5,5,5,.905) 91%, rgba(5,5,5,.96) 95%, #050505 100%),
            linear-gradient(to right,
              #050505 calc(50% - 746 * var(--u)),
              transparent calc(50% - 676 * var(--u)),
              transparent calc(50% + 676 * var(--u)),
              #050505 calc(50% + 746 * var(--u)));
        }

        .ev-landing .topbar{ position:absolute; inset:0; pointer-events:none; }
        .ev-landing .brand{
          position:absolute; left:calc(75 * var(--u)); top:calc(27 * var(--u));
          width:calc(31.5 * var(--u)); height:calc(48.5 * var(--u));
          pointer-events:auto; opacity:0;
        }
        .ev-landing .brand svg{ width:100%; height:100%; }

        .ev-landing .links{
          position:absolute; left:50%; top:calc(51 * var(--u)); transform:translate(-50%,-50%);
          display:flex; align-items:center; font-size:calc(19 * var(--u)); font-weight:400;
          color:var(--nav); pointer-events:auto; opacity:0; white-space:nowrap;
        }
        .ev-landing .links a{ display:inline-block; transition:color .25s ease; }
        .ev-landing .links a:hover{ color:#fff; }
        .ev-landing .links a:nth-child(2){ margin-left:calc(24.5 * var(--u)); }
        .ev-landing .links a:nth-child(3){ margin-left:calc(23.5 * var(--u)); }
        .ev-landing .links a:nth-child(4){ margin-left:calc(26 * var(--u)); }

        .ev-landing .pill{
          display:inline-flex; align-items:center; justify-content:center;
          border-radius:999px; background:var(--pill); color:var(--pill-ink); font-weight:500;
        }
        .ev-landing .pill span{ display:inline-block; }
        .ev-landing .ghost{ display:inline-flex; align-items:center; color:#fff; font-weight:500; }

        .ev-landing .topbar .pill-nav{
          position:absolute; right:calc(75.4 * var(--u)); top:calc(27 * var(--u));
          width:calc(175 * var(--u)); height:calc(49 * var(--u)); font-size:calc(20.6 * var(--u));
          pointer-events:auto; opacity:0;
        }
        .ev-landing .topbar .pill-nav span{ transform:translateY(calc(1 * var(--u))); }

        .ev-landing .burger{
          position:absolute; right:calc(20 * var(--u)); top:calc(20 * var(--u));
          display:none; width:44px; height:44px; align-items:center; justify-content:center;
          flex-direction:column; gap:5px; border-radius:999px;
          background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.14);
          backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
          pointer-events:auto; z-index:60;
        }
        .ev-landing .burger i{
          display:block; width:18px; height:2px; background:#fff; border-radius:2px;
          transition:transform .3s cubic-bezier(.22,1,.36,1), opacity .3s cubic-bezier(.22,1,.36,1);
        }
        .ev-landing.is-open .burger i:nth-child(1){ transform:translateY(calc(4.3 * var(--m))) rotate(45deg); }
        .ev-landing.is-open .burger i:nth-child(2){ transform:translateY(calc(-4.3 * var(--m))) rotate(-45deg); }

        .ev-landing .menu{
          position:fixed; inset:0; z-index:50; display:flex; align-items:center; justify-content:center;
          background:linear-gradient(180deg, rgba(5,5,5,.97), rgba(5,5,5,.99));
          backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px);
          opacity:0; visibility:hidden; pointer-events:none;
          transition:opacity .42s cubic-bezier(.22,1,.36,1), visibility .42s cubic-bezier(.22,1,.36,1);
        }
        .ev-landing.is-open .menu{ opacity:1; visibility:visible; pointer-events:auto; }
        .ev-landing .menu-inner{ width:100%; max-width:520px; padding:0 32px; text-align:left; }
        .ev-landing .menu-eyebrow{
          font-size:14px; letter-spacing:.14em; text-transform:uppercase; color:var(--muted);
          margin-bottom:24px; opacity:0; transform:translateY(14px);
          transition:opacity .5s cubic-bezier(.22,1,.36,1), transform .5s cubic-bezier(.22,1,.36,1);
          transition-delay:.06s;
        }
        .ev-landing .menu-list li{
          opacity:0; transform:translateY(14px);
          transition:opacity .5s cubic-bezier(.22,1,.36,1), transform .5s cubic-bezier(.22,1,.36,1);
        }
        .ev-landing .menu-list li:nth-child(1){ transition-delay:.10s; }
        .ev-landing .menu-list li:nth-child(2){ transition-delay:.16s; }
        .ev-landing .menu-list li:nth-child(3){ transition-delay:.22s; }
        .ev-landing .menu-list li:nth-child(4){ transition-delay:.28s; }
        .ev-landing .menu-foot{
          display:flex; gap:14px; flex-wrap:wrap; margin-top:32px;
          opacity:0; transform:translateY(14px);
          transition:opacity .5s cubic-bezier(.22,1,.36,1), transform .5s cubic-bezier(.22,1,.36,1);
          transition-delay:.34s;
        }
        .ev-landing.is-open .menu-eyebrow, .ev-landing.is-open .menu-list li, .ev-landing.is-open .menu-foot{
          opacity:1; transform:translateY(0);
        }
        .ev-landing .menu-list a{
          position:relative; display:flex; align-items:center; justify-content:space-between;
          font-size:clamp(25px, 7vw, 32px); font-weight:500; color:var(--ink);
          padding:14px 0; border-bottom:1px solid rgba(255,255,255,.08); cursor:pointer;
        }
        .ev-landing .menu-list a::after{
          content:""; width:9px; height:9px; border-right:2px solid var(--muted); border-bottom:2px solid var(--muted);
          transform:rotate(-45deg); flex-shrink:0;
        }
        .ev-landing .menu-foot .pill{ padding:14px 28px; font-size:16px; }
        .ev-landing .menu-foot .ghost{ font-size:15px; padding:14px 6px; }

        .ev-landing .hero{ position:absolute; inset:0; pointer-events:none; }
        .ev-landing .hero .headline{
          position:absolute; left:calc(75.5 * var(--u)); top:calc(230.5 * var(--u));
          font-size:calc(71.6 * var(--h)); line-height:calc(80.5 * var(--h)); font-weight:400;
          letter-spacing:calc(.3 * var(--h)); color:var(--ink); white-space:nowrap; opacity:0;
        }
        .ev-landing .hero .headline span{ display:block; }
        .ev-landing .hero .sub{
          position:absolute; left:calc(75.5 * var(--u)); top:calc((230.5 * var(--u)) + (189 * var(--h)));
          font-size:calc(20.7 * var(--h)); line-height:calc(23.5 * var(--h)); font-weight:400;
          word-spacing:calc(1.8 * var(--h)); color:var(--muted); opacity:0;
        }
        .ev-landing .hero .sub span{ display:block; white-space:nowrap; }
        .ev-landing .hero .pill-cta{
          position:absolute; left:calc(74.9 * var(--u)); top:calc((230.5 * var(--u)) + (264.5 * var(--h)));
          width:calc(175.6 * var(--h)); height:calc(50 * var(--h)); font-size:calc(20.6 * var(--h));
          pointer-events:auto; opacity:0;
        }
        .ev-landing .hero .pill-cta span{ transform:translateY(calc(1 * var(--h))); }
        .ev-landing .hero .ghost{
          position:absolute; left:calc((74.9 * var(--u)) + (220.6 * var(--h))); top:calc((230.5 * var(--u)) + (279.5 * var(--h)));
          height:calc(50 * var(--h)); font-size:calc(20.6 * var(--h)); letter-spacing:calc(.12 * var(--h));
          pointer-events:auto; opacity:0; cursor:pointer;
        }

        .ev-landing .logos{
          position:absolute; top:0; left:50%; width:calc(741 * var(--u));
          transform:translateX(calc(-50% + 20 * var(--u))); color:var(--strip); opacity:0;
        }
        .ev-landing .lg{ position:absolute; color:var(--strip); display:flex; align-items:center; }
        .ev-landing .lg svg{ position:absolute; left:0; top:0; color:var(--strip); }
        .ev-landing .lg .word{ position:absolute; font-weight:700; color:var(--strip); white-space:nowrap; }

        .ev-landing .lg1{ left:calc(-0.5 * var(--u)); top:calc(994.7 * var(--u)); }
        .ev-landing .lg1 svg{ width:calc(30.5 * var(--u)); height:calc(31 * var(--u)); }
        .ev-landing .lg1 .word{ left:calc(37 * var(--u)); top:calc(5.6 * var(--u)); font-size:calc(18.1 * var(--u)); }

        .ev-landing .lg2{ left:calc(206.5 * var(--u)); top:calc(995.7 * var(--u)); }
        .ev-landing .lg2 svg{ width:calc(24.5 * var(--u)); height:calc(30 * var(--u)); }
        .ev-landing .lg2 .word{ left:calc(31 * var(--u)); top:calc(7.3 * var(--u)); font-size:calc(18.5 * var(--u)); }

        .ev-landing .lg3{ left:calc(416.5 * var(--u)); top:calc(996.7 * var(--u)); }
        .ev-landing .lg3 svg{ width:calc(28.5 * var(--u)); height:calc(28 * var(--u)); }
        .ev-landing .lg3 .word{ left:calc(35 * var(--u)); top:calc(7.3 * var(--u)); font-size:calc(16.15 * var(--u)); }

        .ev-landing .lg4{ left:calc(620.5 * var(--u)); top:calc(998.7 * var(--u)); }
        .ev-landing .lg4 svg{ width:calc(28.5 * var(--u)); height:calc(25.5 * var(--u)); }
        .ev-landing .lg4 .word{ left:calc(37 * var(--u)); top:calc(8.3 * var(--u)); font-size:calc(15.3 * var(--u)); }

        @keyframes evRise{ from{ opacity:0; transform:translateY(calc(14 * var(--u))); } to{ opacity:1; transform:translateY(0); } }
        @keyframes evRiseNav{ from{ opacity:0; transform:translate(-50%, calc(-50% + 14 * var(--u))); } to{ opacity:1; transform:translate(-50%, -50%); } }
        @keyframes evFade{ from{ opacity:0; } to{ opacity:1; } }
        @media (prefers-reduced-motion: no-preference){
          .ev-landing .brand{ animation:evRise .8s cubic-bezier(.22,1,.36,1) both; }
          .ev-landing .links{ animation:evRiseNav .8s cubic-bezier(.22,1,.36,1) both; }
          .ev-landing .topbar .pill-nav{ animation:evRise .8s cubic-bezier(.22,1,.36,1) both; }
          .ev-landing .hero .headline{ animation:evRise .9s cubic-bezier(.22,1,.36,1) both; animation-delay:.06s; }
          .ev-landing .hero .sub{ animation:evRise .9s cubic-bezier(.22,1,.36,1) both; animation-delay:.14s; }
          .ev-landing .hero .pill-cta, .ev-landing .hero .ghost{ animation:evRise .9s cubic-bezier(.22,1,.36,1) both; animation-delay:.22s; }
          .ev-landing .logos{ animation:evFade 1.1s cubic-bezier(.22,1,.36,1) both; animation-delay:.34s; }
        }
        @media (prefers-reduced-motion: reduce){
          .ev-landing .brand, .ev-landing .links, .ev-landing .topbar .pill-nav, .ev-landing .hero .headline,
          .ev-landing .hero .sub, .ev-landing .hero .pill-cta, .ev-landing .hero .ghost, .ev-landing .logos{
            opacity:1; animation:none;
          }
          .ev-landing .burger i, .ev-landing .menu, .ev-landing .menu-eyebrow, .ev-landing .menu-list li, .ev-landing .menu-foot{
            transition-duration:.001s !important;
          }
        }

        @media (max-aspect-ratio: 11/10){
          .ev-landing{ --m: min(calc(100vw / 430), 1.34px); --u: var(--m); }
          .ev-landing .stage{ overflow-y:auto; -webkit-overflow-scrolling:touch; }
          .ev-landing .topbar{
            position:fixed; inset:0 0 auto 0; height:auto; display:flex; align-items:center; justify-content:space-between;
            padding:calc(20px + env(safe-area-inset-top,0px)) calc(20px + env(safe-area-inset-right,0px)) 20px calc(20px + env(safe-area-inset-left,0px));
            z-index:40;
          }
          .ev-landing .brand{ position:static; width:26px; height:40px; }
          .ev-landing .links, .ev-landing .topbar .pill-nav{ display:none; }
          .ev-landing .burger{ position:static; display:flex; }

          .ev-landing .plate-video{ inset:0; left:0; top:0; width:100%; height:100%; transform:none; object-fit:cover; object-position:43% center; }
          .ev-landing .plate::after{
            background:
              linear-gradient(to bottom, rgba(5,5,5,.72) 0%, rgba(5,5,5,.34) 24%, rgba(5,5,5,.34) 56%, rgba(5,5,5,.80) 82%, rgba(5,5,5,.97) 94%, #050505 100%),
              linear-gradient(to right, rgba(5,5,5,.86) 0%, rgba(5,5,5,.66) 42%, rgba(5,5,5,.20) 78%, rgba(5,5,5,.10) 100%);
          }

          .ev-landing .hero{ position:relative; inset:auto; display:flex; flex-direction:column; justify-content:flex-end; min-height:100vh; min-height:100dvh; padding:0 24px calc(200px + env(safe-area-inset-bottom,0px)); }
          .ev-landing .hero .headline{ position:static; font-size:clamp(34px,10vw,48px); line-height:1.1; letter-spacing:-.01em; white-space:normal; margin-bottom:16px; }
          .ev-landing .hero .headline span{ display:inline; }
          .ev-landing .hero .headline span + span::before{ content:" "; }
          .ev-landing .hero .sub{ position:static; font-size:16px; line-height:1.55; word-spacing:normal; margin-bottom:28px; max-width:34ch; }
          .ev-landing .hero .sub span{ display:inline; white-space:normal; }
          .ev-landing .hero .sub span + span::before{ content:" "; }
          .ev-landing .actions{ position:static; display:flex; flex-direction:column; align-items:flex-start; gap:14px; pointer-events:auto; }
          .ev-landing .hero .pill-cta{ position:static; width:auto; height:auto; padding:15px 30px; font-size:16px; }
          .ev-landing .hero .ghost{ position:static; height:auto; font-size:15px; }

          .ev-landing .logos{
            position:relative; top:auto; left:auto; width:100%; transform:none;
            display:grid; grid-template-columns:1fr 1fr; gap:26px 20px;
            padding:0 24px calc(36px + env(safe-area-inset-bottom,0px)); margin-top:8px;
          }
          .ev-landing .lg{ position:relative; display:flex; align-items:center; left:auto !important; top:auto !important; }
          .ev-landing .lg svg{ position:static; width:20px; height:20px; flex-shrink:0; }
          .ev-landing .lg .word{ position:static; margin-left:9px; font-size:14px; left:auto; top:auto; }
        }

        @media (min-width:600px) and (max-aspect-ratio: 11/10){
          .ev-landing{ --m: min(calc(100vw / 860), calc(100vh / 760), 1.25px); }
          .ev-landing .plate-video{ object-position:44% center; }
          .ev-landing .plate::after{
            background:
              linear-gradient(to bottom, rgba(5,5,5,.66) 0%, rgba(5,5,5,.28) 24%, rgba(5,5,5,.30) 56%, rgba(5,5,5,.78) 82%, rgba(5,5,5,.96) 94%, #050505 100%),
              linear-gradient(to right, rgba(5,5,5,.84) 0%, rgba(5,5,5,.60) 42%, rgba(5,5,5,.16) 78%, rgba(5,5,5,.06) 100%);
          }
          .ev-landing .logos{ grid-template-columns:repeat(4,1fr); }
          .ev-landing .hero .headline{ font-size:clamp(44px,7vw,60px); }
        }
      `}</style>

      <div className="stage">
        <div className="plate">
          <video className="plate-video" autoPlay muted loop playsInline preload="auto" aria-hidden="true">
            <source src={VIDEO_URL} type="video/mp4" />
          </video>
        </div>

        <header className="topbar">
          <a className="brand" href="#" aria-label="EduVerse">
            <svg viewBox="0 0 31.5 48.5" aria-hidden="true">
              <defs>
                <linearGradient id="ev-bg1" x1="8" y1="0" x2="34.1" y2="28.9" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#9e9e9e" />
                  <stop offset=".28" stopColor="#a6a6a6" />
                  <stop offset=".34" stopColor="#a3a3a3" />
                  <stop offset=".40" stopColor="#3a3a3a" />
                  <stop offset=".55" stopColor="#414141" />
                  <stop offset=".60" stopColor="#7a7a7a" />
                  <stop offset=".68" stopColor="#8e8e8e" />
                  <stop offset=".80" stopColor="#a9a9a9" />
                  <stop offset=".95" stopColor="#c4c4c4" />
                  <stop offset="1" stopColor="#cccccc" />
                </linearGradient>
              </defs>
              <path d="M21.5 0 L21.5 19.5 L31.5 19.5 L31.5 29 L10 48.5 L10 28.5 L0.5 28.5 L0.5 18.5 Z" fill="url(#ev-bg1)" />
              <rect x="0.5" y="18.5" width="9" height="10" fill="#fdfdfd" />
              <rect x="22" y="19.5" width="9.5" height="9.5" fill="#fdfdfd" />
            </svg>
          </a>

          <nav className="links" aria-label="Primary">
            {NAV_LINKS.map((l) => <a key={l} href="#">{l}</a>)}
          </nav>

          <button type="button" className="pill pill-nav" onClick={onGetStarted}><span>Get Started</span></button>

          <button
            type="button"
            className="burger"
            aria-controls="ev-menu"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <i /><i />
          </button>
        </header>

        <nav className="menu" id="ev-menu" aria-hidden={!open}>
          <div className="menu-inner">
            <p className="menu-eyebrow">Menu</p>
            <ul className="menu-list">
              {NAV_LINKS.map((l) => (
                <li key={l}><a href="#" onClick={() => setOpen(false)}>{l}</a></li>
              ))}
            </ul>
            <div className="menu-foot">
              <button type="button" className="pill" onClick={() => { setOpen(false); onGetStarted(); }}><span>Get Started</span></button>
              <button type="button" className="ghost" onClick={() => { setOpen(false); onLogin(); }}>Log in</button>
            </div>
          </div>
        </nav>

        <main className="hero">
          <h1 className="headline"><span>The Next Layer</span><span>of Learning</span></h1>
          <p className="sub">
            <span>A personal AI mentor that teaches, quizzes, and remembers —</span>
            <span>built to make learning feel like discovery, not homework.</span>
          </p>
          <div className="actions">
            <button type="button" className="pill pill-cta" onClick={onGetStarted}><span>Get Started</span></button>
            <button type="button" className="ghost" onClick={onLogin}>Log in</button>
          </div>
        </main>

        <div className="logos" aria-hidden="true">
          {SUBJECTS.map((s, i) => (
            <div className={`lg lg${i + 1}`} key={s.label}>
              <s.icon strokeWidth={1.75} />
              <span className="word">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
