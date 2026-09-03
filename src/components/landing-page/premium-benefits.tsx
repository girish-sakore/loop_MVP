export default function PremiumBenefits() {
  const benefits = [
    {
      title: "Daily themes",
      desc: "A fresh subject every day, from potatoes to planets.",
      icon: "verified",
    },
    {
      title: "Fast games",
      desc: "Short rounds that fit between scrolls, breaks, and commutes.",
      icon: "sports_esports",
    },
    {
      title: "Expert-made",
      desc: "Questions and facts written with care, taste, and context.",
      icon: "school",
    },
    {
      title: "Friend loops",
      desc: "Invite people into themes and compare what everyone learned.",
      icon: "diversity_3",
    },
  ];

  return (
    <section className="bg-[#c7a3f7] px-5 py-20 md:px-8 md:py-28">
      <h2 className="font-display mx-auto mb-16 max-w-4xl text-center text-5xl leading-tight md:text-7xl">
        Built for curiosity, not chores
      </h2>
      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className="loop-card p-7 transition-transform hover:-translate-y-1"
          >
            <span
              className="loop-icon mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#fffdf7] text-4xl"
              data-icon={benefit.icon}
            >
              {benefit.icon}
            </span>
            <h5 className="mb-2 text-3xl font-extrabold">{benefit.title}</h5>
            <p className="text-lg leading-relaxed text-[#343238]">{benefit.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
