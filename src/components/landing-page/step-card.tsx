export default function StepCard({ number, title, desc, color, translate = false }: {number: string, title: string, desc: string, color: string, translate?: boolean}) {
  const iconName = number === "1" ? "interests" : number === "2" ? "extension" : "school";
  return (
    <div className={`loop-card p-7 space-y-6 ${translate ? 'lg:translate-y-8' : ''}`}>
      <div className={`loop-icon w-18 h-18 ${color} rounded-full flex items-center justify-center text-2xl font-bold`}>
        <span className="material-symbols-outlined text-4xl" data-icon={iconName}>
          {iconName}
        </span>
      </div>
      <h3 className="text-3xl font-extrabold leading-tight">{number}. {title}</h3>
      <p className="text-lg leading-relaxed text-[#343238]">{desc}</p>
    </div>
  );
}
