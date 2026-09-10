import StepCard from './step-card';

export default function ThreeStepJourney() {
  return (
    <section className="bg-[#4aa8ee] px-5 py-20 md:px-8 md:py-28">
      <div className="max-w-7xl mx-auto">
        <div className="mx-auto mb-16 max-w-4xl loop-card px-6 py-10 text-center md:px-12">
          <h2 className="font-display text-5xl leading-tight md:text-7xl">
            Learn something new every day
          </h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <StepCard 
            number="1" 
            title="Pick a theme" 
            desc="Start with a topic like food, nature, language, geography, or ancient history."
            color="bg-[#f7d91f]"
          />
          <StepCard 
            number="2" 
            title="Play the lesson" 
            desc="Sort timelines, match clues, spot images, and make tiny discoveries as you go."
            color="bg-[#f28ab2]"
            translate
          />
          <StepCard 
            number="3" 
            title="Remember it" 
            desc="Each round teaches the answer in context, so the fact sticks after the game ends."
            color="bg-[#85cb57]"
          />
        </div>
      </div>
    </section>
  );
}
