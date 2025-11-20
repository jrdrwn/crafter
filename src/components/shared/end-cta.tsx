'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { SVGProps } from 'react';

import { Button } from '../ui/button';

const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={1920}
    height={435}
    fill="none"
    {...props}
  >
    <g filter="url(#a)">
      <path d="M0 0h1920v435H0z" className="fill-primary" />
    </g>
    <defs>
      <filter
        id="a"
        x={0}
        y={0}
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feTurbulence
          baseFrequency="2 2"
          numOctaves={3}
          result="noise"
          seed={9431}
          stitchTiles="stitch"
          type="fractalNoise"
        />
        <feColorMatrix in="noise" result="alphaNoise" type="luminanceToAlpha" />
        <feComponentTransfer in="alphaNoise" result="coloredNoise1">
          <feFuncA
            tableValues="1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0"
            type="discrete"
          />
        </feComponentTransfer>
        <feComposite
          in="coloredNoise1"
          in2="shape"
          operator="in"
          result="noise1Clipped"
        />
        <feFlood floodColor="rgba(255, 255, 255, 0.25)" result="color1Flood" />
        <feComposite
          in="color1Flood"
          in2="noise1Clipped"
          operator="in"
          result="color1"
        />
        <feMerge result="effect1_noise_54_129">
          <feMergeNode in="shape" />
          <feMergeNode in="color1" />
        </feMerge>
      </filter>
    </defs>
  </svg>
);
export { SvgComponent as ReactComponent };

export default function EndCTA() {
  return (
    <section className="relative flex h-full flex-col items-center justify-center px-2">
      <SvgComponent className="absolute inset-0 -z-10 h-full w-full object-cover" />
      <div className="relative container mx-auto flex flex-col items-center justify-center px-4 py-12 md:py-16 lg:py-20">
        <h1 className="z-10 mb-3 text-center text-xl font-medium text-primary-foreground sm:text-2xl md:mb-4 lg:text-3xl xl:text-4xl">
          Ready to Get Started?
        </h1>
        <p className="z-10 mb-4 max-w-xl text-center text-sm text-primary-foreground sm:text-base md:mb-6 md:text-lg">
          Join thousands of professionals already using CRAFTER 2.0 to create
          high-quality personas.
        </p>
        <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row md:gap-4">
          <Link href="/create-account" className="z-10 w-full sm:w-auto">
            <Button
              size={'lg'}
              variant={'secondary'}
              className="w-full sm:w-auto"
            >
              Try for Free Now
            </Button>
          </Link>
          <Link href="#" className="z-10 w-full sm:w-auto">
            <Button
              size={'lg'}
              variant={'secondary'}
              className="w-full sm:w-auto"
            >
              Learn More
              <ChevronRight />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
