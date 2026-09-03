export default function FinalCTA() {
  return (
    <section className="bg-[#4aa8ee] px-5 py-20 md:px-8 md:py-28">
      <div className="loop-card relative mx-auto max-w-5xl overflow-hidden p-8 text-center md:p-16">
        <div className="absolute -left-10 -top-10 flex h-28 w-28 items-center justify-center rounded-full border-[4px] border-[#0b0b0f] bg-[#f28ab2]">
          <span className="material-symbols-outlined text-6xl">local_library</span>
        </div>
        <h2 className="font-display relative z-10 text-5xl leading-tight md:text-7xl">
          Ready to make your next scroll smarter?
        </h2>
        <p className="relative z-10 mx-auto my-8 max-w-2xl text-xl leading-relaxed">
          Jump into a bite-sized theme, play a few rounds, and leave with facts you will actually remember.
        </p>
        <div className="relative z-10">
          <button className="btn-tactile rounded-full bg-[#f7d91f] px-10 py-5 text-xl font-extrabold hover:scale-[1.02]">
            Start today&apos;s game
          </button>
          <p className="mt-6 text-[12px] font-extrabold uppercase">Free daily theme. No prep required.</p>
        </div>
      </div>
    </section>
  );
}
