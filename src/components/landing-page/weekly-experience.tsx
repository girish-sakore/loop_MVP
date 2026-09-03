export default function WeeklyExperience() {
  const tiles = [
    ["Mid-1500s", "Potatoes brought to Europe", "bg-[#c7a3f7]"],
    ["1770s", "French potato fashion", "bg-[#f7d91f]"],
    ["1960", "Mashed Potato dance craze", "bg-[#85cb57]"],
    ["2018", "Raisin potato salad on SNL", "bg-[#f28ab2]"],
  ];

  return (
    <section className="bg-[#85cb57] px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto grid max-w-7xl items-start gap-12 lg:grid-cols-[0.8fr_1fr]">
        <div className="relative">
          <div className="loop-card px-7 py-10 md:px-10">
            <h3 className="font-display text-5xl leading-[0.95] md:text-7xl">
              Fun games crafted by experts, not AI
            </h3>
          </div>
          <div className="absolute -right-4 -top-8 flex h-20 w-20 items-center justify-center rounded-full border-[4px] border-[#0b0b0f] bg-[#4aa8ee]">
            <span className="material-symbols-outlined text-5xl">science</span>
          </div>
        </div>

        <div className="loop-card min-h-[620px] p-6 md:p-10">
          <div className="mb-12 flex items-center justify-between">
            <span className="material-symbols-outlined text-5xl">arrow_back</span>
            <div className="loop-icon flex h-14 w-14 items-center justify-center rounded-full bg-[#ffb75a]">
              <span className="material-symbols-outlined text-4xl">campaign</span>
            </div>
          </div>
          <div className="space-y-3">
            {tiles.map(([date, title, color]) => (
              <div
                key={date}
                className={`${color} grid grid-cols-[120px_1fr_44px] items-center overflow-hidden rounded-xl border-[3px] border-[#0b0b0f] text-[#0b0b0f]`}
              >
                <div className="flex h-28 items-center justify-center border-r-[3px] border-[#0b0b0f] bg-[#f5f0e9]">
                  <span className="material-symbols-outlined text-5xl">image</span>
                </div>
                <div className="px-5">
                  <span className="mb-3 inline-block rounded-md border-[3px] border-[#0b0b0f] bg-[#fffdf7] px-3 py-1 text-xl font-extrabold leading-none">
                    {date}
                  </span>
                  <p className="text-xl font-extrabold leading-tight md:text-2xl">{title}</p>
                </div>
                <span className="material-symbols-outlined mr-3 rounded-full bg-[#fffdf7] text-4xl">
                  check_circle
                </span>
              </div>
            ))}
          </div>
          <div className="mt-16 rotate-[-2deg] overflow-hidden rounded-xl border-[3px] border-[#0b0b0f] bg-[#fffdf7] shadow-[8px_10px_0_rgba(11,11,15,0.16)]">
            <div className="grid grid-cols-[130px_1fr]">
              <div className="flex h-32 items-center justify-center border-r-[3px] border-[#0b0b0f] bg-[#f7d91f]">
                <span className="material-symbols-outlined text-6xl">fastfood</span>
              </div>
              <div className="flex items-center px-6 text-2xl font-extrabold leading-tight">
                McDonald&apos;s adds fries to the menu
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
