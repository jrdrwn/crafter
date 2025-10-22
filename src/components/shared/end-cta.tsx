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
      <path fill="#3A81F6" d="M0 0h1920v435H0z" />
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
      <div className="relative container mx-auto flex flex-col items-center justify-center px-4 py-20">
        <h1 className="z-10 mb-4 text-center text-xl font-medium text-primary-foreground lg:text-2xl xl:text-4xl">
          Ready to Get Started?
        </h1>
        <p className="z-10 mb-6 max-w-xl text-center text-sm text-primary-foreground md:text-lg">
          Join thousands of professionals already using CRAFTER 2.0 to create
          high-quality personas.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/create-account" className="z-10">
            <Button size={'lg'} variant={'secondary'}>
              Try for Free Now
            </Button>
          </Link>
          <Link href="#" className="z-10">
            <Button size={'lg'} variant={'secondary'}>
              Learn More
              <ChevronRight />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
