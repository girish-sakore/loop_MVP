export default function StepCard({ number, title, desc, color, translate = false }: {number: string, title: string, desc: string, color: string, translate?: boolean}) {
  const iconName = number === "1" ? "edit_calendar" : number === "2" ? "touch_app" : "auto_graph";
  return (
    <div className={`bg-white rounded-3xl p-8 soft-card-shadow space-y-6 ${translate ? 'md:translate-y-4' : ''}`}>
      <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center text-2xl font-bold`}>
        <span className="material-symbols-outlined text-4xl" data-icon={iconName}>
          {iconName}
        </span>
      </div>
      <h3 className="text-2xl font-bold">{number}. {title}</h3>
      <p className="text-[#454742] leading-relaxed">{desc}</p>
    </div>
  );
}