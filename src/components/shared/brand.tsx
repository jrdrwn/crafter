import { SVGProps } from 'react';

const Brand = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={28}
    height={28}
    viewBox="0 0 28 28"
    fill="none"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d="M14 2.333v23.334M22.25 5.75l-16.5 16.5M25.667 14H2.333m19.917 8.25L5.75 5.75"
    />
  </svg>
);
export default Brand;
