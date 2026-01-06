import { Link } from "react-router-dom";

function ScrollText() {
  const items = Array(6).fill("Change The World Together");

  return (
    <div className="relative overflow-hidden w-full">
      <div className="whitespace-nowrap flex gap-10 animate-scroll relative z-10">
        {items.map((text, index) => (
          <p
            key={index}
            className="text-orange-400 tracking-[4px] uppercase text-sm flex items-center gap-2"
          >
            <span className="text-base">❤</span>
            {text}
          </p>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 backdrop-blur-sm bg-black/5" />
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-screen bg-[#0D1117] text-white overflow-hidden font-sans pt-20 sm:pt-24 md:pt-28 pb-10">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F15] via-[#0D1117]/90 to-[#0D1117]" />
      <div className="absolute -top-12 -left-10 w-72 h-72 sm:w-80 sm:h-80 md:w-[400px] md:h-[400px] bg-orange-600/20 rounded-full blur-[100px] sm:blur-[120px] md:blur-[140px]" />
      <div className="absolute bottom-0 right-0 w-72 h-72 sm:w-96 sm:h-96 md:w-[450px] md:h-[450px] bg-blue-800/10 rounded-full blur-[140px] sm:blur-[160px] md:blur-[180px]" />

      {/* Content Grid */}
      <div className="relative grid grid-cols-1 lg:grid-cols-2 items-center px-4 sm:px-10 md:px-20 py-10 gap-10 sm:gap-12 md:gap-16">
        {/* Left Content */}
        <div className="space-y-4 sm:space-y-6 md:space-y-7 z-10">
          <ScrollText />

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold leading-snug sm:leading-tight md:leading-[1.15] drop-shadow-md">
            For The People & <br />
            Cause You Care About
          </h1>

          <p className="text-gray-300 text-sm sm:text-base md:text-[16px] leading-relaxed max-w-full sm:max-w-lg md:max-w-xl">
            It is a long established fact that a reader will be distracted by
            readable content of a page when looking at its layout. The point
            lorem established fact of meaningful contribution.
          </p>

          {/* CTA + Donors */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 pt-4">
            <Link
              to="/donations"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-full tracking-wide text-sm sm:text-[16px] shadow-xl shadow-orange-500/20 transition-all hover:scale-105 flex items-center gap-2"
            >
              Make Donation
            </Link>

          </div>
        </div>

        {/* Right Image */}
        <div className="relative w-full flex justify-center z-10 mt-6 lg:mt-0">
          <div className="absolute right-0 top-0 w-[160%] h-full bg-[#0D1117] -z-10 opacity-60" />
          <img
            src="/gallery2.jpg"
            className="w-full h-54 rounded-xl sm:h-80 md:h-[500px] lg:h-[500px] object-cover shadow-2xl shadow-black/40"
            alt="NGO"
          />
        </div>
      </div>
    </section>
  );
}
