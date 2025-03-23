declare module 'react-mathjax' {
  import { ComponentType, ReactNode } from 'react';

  interface MathJaxProps {
    children: ReactNode;
    options?: {
      tex2jax?: {
        inlineMath?: string[][];
        displayMath?: string[][];
      };
      TeX?: {
        extensions?: string[];
      };
    };
  }

  export const MathJax: {
    Provider: ComponentType<MathJaxProps>;
    Node: ComponentType<MathJaxProps>;
  };
} 