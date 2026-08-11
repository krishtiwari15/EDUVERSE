"use client";

// Third-party CloudFront asset shared with the landing page's hero video —
// swap for a self-hosted video before shipping to production.
const VIDEO_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260808_112712_da9d53df-6d27-4b12-bdf6-aa9dc2622bdf.mp4";

// The cinematic backdrop shared by the onboarding flow (login, preferences)
// — same video as the landing page, darkened further so form content on
// top stays legible without needing an opaque card underneath.
export default function AuthPlate() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#050505]" aria-hidden="true">
      <video
        autoPlay muted loop playsInline preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: "62% center" }}
      >
        <source src={VIDEO_URL} type="video/mp4" />
      </video>
      <div className="absolute inset-0" style={{
        background:
          "linear-gradient(180deg, rgba(5,5,5,.5) 0%, rgba(5,5,5,.72) 45%, rgba(5,5,5,.94) 100%)," +
          "linear-gradient(90deg, rgba(5,5,5,.92) 0%, rgba(5,5,5,.4) 48%, rgba(5,5,5,.8) 100%)",
      }} />
    </div>
  );
}
