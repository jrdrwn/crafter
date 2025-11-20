export function HeroSidesDecorator() {
  return (
    <div className="absolute inset-x-4 inset-y-0 border-x border-dashed border-primary md:inset-x-8 lg:inset-x-12">
      <span
        className="absolute -top-4 -left-4 size-8 overflow-hidden rounded-full border border-dashed border-primary md:-top-7 md:-left-7 md:size-14 lg:-top-10 lg:-left-10 lg:size-20"
        style={{
          clipPath: 'inset(50% 0 0 0)',
        }}
      ></span>
      <span
        className="absolute -top-4 -right-4 size-8 overflow-hidden rounded-full border border-dashed border-primary md:-top-7 md:-right-7 md:size-14 lg:-top-10 lg:-right-10 lg:size-20"
        style={{
          clipPath: 'inset(50% 0 0 0)',
        }}
      ></span>
      <span className="absolute right-0 bottom-0 size-12 overflow-hidden rounded-full border border-dashed border-primary md:size-20"></span>
      <span className="absolute bottom-0 left-0 size-12 overflow-hidden rounded-full border border-dashed border-primary md:size-20"></span>
    </div>
  );
}
