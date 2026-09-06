import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faGamepad,
  faGraduationCap,
  faPeopleGroup,
} from "@fortawesome/free-solid-svg-icons";

export default function PremiumBenefits() {
  const benefits = [
    {
      title: "Daily themes",
      desc: "A fresh subject every day, from potatoes to planets.",
      icon: faCircleCheck,
      color: "bg-[#D8F05A]",
    },
    {
      title: "Fast games",
      desc: "Short rounds that fit between scrolls, breaks, and commutes.",
      icon: faGamepad,
      color: "bg-[#FFD84D]",
    },
    {
      title: "Expert-made",
      desc: "Questions and facts written with care, taste, and context.",
      icon: faGraduationCap,
      color: "bg-[#50A9E8]",
    },
    {
      title: "Friend loops",
      desc: "Invite people into themes and compare what everyone learned.",
      icon: faPeopleGroup,
      color: "bg-[#D8F05A]",
    },
  ];

  return (
    <section className="bg-[#B28AEF] px-5 py-20 md:px-8 md:py-28">
      <h2 className="font-display mx-auto mb-16 max-w-4xl text-center text-5xl leading-[0.95] md:text-7xl">
        Built for curiosity, not chores
      </h2>

      <div className="mx-auto grid max-w-7xl gap-7 md:grid-cols-2">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className="
              rounded-[2rem]
              border-[3px]
              border-black
              bg-[#FFFDF7]
              p-7
              shadow-[8px_8px_0px_#000]
              transition-all
              duration-200
              hover:-translate-y-1
              hover:shadow-[10px_10px_0px_#000]
            "
          >
            {/* Icon circle */}
            <div
              className={`
                mb-6
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-full
                border-[3px]
                border-black
                ${benefit.color}
                shadow-[3px_3px_0px_#000]
              `}
            >
              {/* Inner icon with fixed dimensions */}
              <FontAwesomeIcon
                icon={benefit.icon}
                className="h-8 w-8"
              />
            </div>

            <h5 className="mb-3 text-3xl font-extrabold">
              {benefit.title}
            </h5>

            <p className="text-lg leading-relaxed text-[#343238]">
              {benefit.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}