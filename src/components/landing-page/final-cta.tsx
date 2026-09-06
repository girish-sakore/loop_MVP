import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen } from "@fortawesome/free-solid-svg-icons";

export default function FinalCTA() {
  return (
    <section className="bg-[#4aa8ee] px-5 py-20 md:px-8 md:py-28">
      <div
        className="
          loop-card
          relative
          mx-auto
          max-w-5xl
          overflow-hidden
          rounded-[2rem]
          border-[3px]
          border-black
          bg-[#FFFDF7]
          px-6
          py-16
          text-center
          shadow-[10px_10px_0px_#000]
          md:px-16
          md:py-20
        "
      >
        {/* Decorative icon */}
        <div
          className="
            absolute
            -left-2
            -top-2
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-full
            border-[3px]
            border-black
            bg-[#F28AB2]
            shadow-[2px_2px_0px_#000]
            md:-left-3
            md:-top-3
            md:h-24
            md:w-24
            md:shadow-[3px_3px_0px_#000]
            "
        >
          <FontAwesomeIcon
            icon={faBookOpen}
            className="h-5 w-5 md:h-8 md:w-8"
          />
        </div>

        {/* Heading */}
        <h2 className="font-display relative z-10 mx-auto max-w-4xl text-4xl leading-[1] md:text-7xl">
          Ready to make your next scroll smarter?
        </h2>

        {/* Description */}
        <p className="relative z-10 mx-auto my-8 max-w-2xl text-lg leading-relaxed md:text-xl">
          Jump into a bite-sized theme, play a few rounds, and leave with
          facts you will actually remember.
        </p>

        {/* CTA */}
        <div className="relative z-10">
          <button
            className="
              btn-tactile
              rounded-full
              border-[3px]
              border-black
              bg-[#F7D91F]
              px-8
              py-4
              text-lg
              font-extrabold
              shadow-[0_7px_0px_#000]
              transition-transform
              hover:translate-y-[-2px]
              md:px-10
              md:py-5
              md:text-xl
            "
          >
            Start today&apos;s game
          </button>

          <p className="mt-6 text-[11px] font-extrabold uppercase md:text-[12px]">
            Free daily theme. No prep required.
          </p>
        </div>
      </div>
    </section>
  );
}