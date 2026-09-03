export default function HeroSection() {
  const categories = [
    ["pets", "Animals", "bg-[#6ad2dc]"],
    ["restaurant", "Food & Drink", "bg-[#e8697a]"],
    ["public", "Geography", "bg-[#d7e96c]"],
    ["account_balance", "Ancient History", "bg-[#f7d552]"],
    ["translate", "Language", "bg-[#f07f3d]"],
    ["movie", "Movies & TV", "bg-[#f28ab2]"],
    ["auto_awesome", "Mythology", "bg-[#ffb75a]"],
    ["psychiatry", "Nature", "bg-[#d7e96c]"],
    ["planet", "Space", "bg-[#4aa8ee]"],
  ];

  return (
    <section className="relative overflow-hidden bg-[#b996f6] px-5 pb-16 pt-8 md:px-8 md:pb-24">
      <div className="absolute -left-10 top-28 h-32 w-32 rounded-full border-[5px] border-[#0b0b0f] bg-[#d7e96c]" />
      <div className="absolute right-8 top-10 h-6 w-6 rounded-full border-[4px] border-[#0b0b0f] bg-[#f7d91f]" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-14">
        <div className="-mx-8 grid grid-cols-[repeat(3,max-content)] gap-5 overflow-hidden py-5 md:grid-cols-[repeat(5,max-content)] md:justify-center">
          {categories.map(([icon, label, color], index) => (
            <div
              key={`${label}-${index}`}
              className="loop-chip flex h-20 min-w-max items-center gap-4 px-6 text-2xl font-extrabold md:h-24 md:px-8 md:text-4xl"
            >
              <span className={`loop-icon flex h-14 w-14 items-center justify-center rounded-full ${color} md:h-16 md:w-16`}>
                <span className="material-symbols-outlined text-3xl md:text-4xl">
                  {icon}
                </span>
              </span>
              {label}
            </div>
          ))}
        </div>

        <div className="grid items-end gap-12 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-8">
            <h1 className="font-display max-w-4xl text-[4.4rem] leading-[0.9] md:text-[7.2rem] lg:text-[8.4rem]">
              Replace doomscrolling with learning
            </h1>
            <div className="flex flex-wrap items-center gap-4">
              <button className="btn-tactile rounded-full bg-[#f7d91f] px-7 py-4 text-lg font-extrabold md:text-xl">
                Play today&apos;s theme
              </button>
              <button className="loop-chip rounded-full px-7 py-4 text-lg font-extrabold md:text-xl">
                Explore games
              </button>
            </div>
            <div className="flex flex-col gap-4 pt-10">
              <div className="flex gap-2 text-4xl text-[#f7d91f] [text-shadow:2px_2px_0_#0b0b0f]">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
              <p className="max-w-2xl text-3xl leading-tight md:text-4xl">
                &quot;This app makes it fun and engaging to learn about the world.&quot;
              </p>
            </div>
          </div>

          <div className="loop-card relative min-h-[530px] overflow-hidden p-6 md:p-8">
            <div className="absolute -right-8 -top-8 flex h-28 w-28 items-center justify-center rounded-full border-[4px] border-[#0b0b0f] bg-[#85cb57]">
              <span className="material-symbols-outlined text-6xl">account_balance</span>
            </div>
            <div className="mx-auto mb-10 mt-10 max-w-md text-center">
              <p className="text-sm font-extrabold">Today&apos;s Theme</p>
              <h2 className="font-display text-6xl leading-none">Hot Potato</h2>
              <p className="mt-3 text-xl">How the potato shaped the world</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {["nutrition", "crown", "agriculture", "temple_buddhist", "restaurant", "mic"].map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="flex aspect-[3/4] items-center justify-center rounded-xl border-[3px] border-[#0b0b0f] bg-[#f5f0e9] text-5xl shadow-[0_4px_0_rgba(11,11,15,0.18)]"
                >
                  <span className="material-symbols-outlined text-6xl">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-12 flex items-center justify-center gap-4">
              <button className="btn-tactile rounded-full bg-[#fffdf7] px-6 py-3 text-lg font-extrabold">
                Invite friends
              </button>
              <button className="btn-tactile flex h-14 w-14 items-center justify-center rounded-full bg-[#eadfd1]">
                <span className="material-symbols-outlined text-4xl">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
