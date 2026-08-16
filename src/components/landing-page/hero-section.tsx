export default function HeroSection() {
  return (
    <section className="px-6 py-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
      <div className="flex-1 space-y-8 text-center md:text-left">
        <div className="inline-flex items-center px-4 py-2 bg-[#cde5ff] rounded-full text-[#104a70] text-xs font-bold uppercase tracking-widest">
          🎉 NEW: WEEKLY STREAK CHALLENGES
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
          Build habits that <span className="text-[#3a6757]">actually stick</span>.
        </h1>
        <p className="text-lg text-[#454742] max-w-lg">
          Loop turns boring routines into a delightful journey of growth. Experience the most tactile and rewarding habit tracker ever made.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
          <button className="btn-tactile px-8 py-4 bg-[#3A6757] text-white rounded-xl text-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02]">
            Start This Week&apos;s Challenge
            <span>→</span>
          </button>
          <button className="px-8 py-4 bg-[#f1edec] text-[#1c1b1b] rounded-xl text-xl font-bold hover:bg-[#e5e2e1] transition-colors">
            Watch Demo
          </button>
        </div>
      </div>

      <div className="flex-1 w-full relative">
        <div className="aspect-square bg-[url('/images/thepaintedsquare_1.jpg')] bg-cover bg-center rounded-[48px] overflow-hidden soft-card-shadow relative">
          <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl soft-card-shadow flex items-center gap-4 border border-white/50">
              <div className="w-12 h-12 bg-[#3A6757] rounded-full flex items-center justify-center text-white">
                🔥
              </div>
              <div>
                <div className="text-xs font-bold text-[#3a6757] uppercase tracking-widest">7 DAY STREAK</div>
                <div className="text-xl font-bold text-[#1c1b1b]">Keep it up, Alex!</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}