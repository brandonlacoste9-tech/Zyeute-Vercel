'use client';

import React from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'text-lg font-bold',
  md: 'text-2xl font-bold',
  lg: 'text-3xl font-bold',
  xl: 'text-4xl font-bold',
};

export function Logo({ size = 'md', className = '' }: LogoProps) {
  return (
    <Link href="/" className={`${sizeMap[size]} text-gold-400 hover:text-gold-300 transition-colors ${className}`}>
      Zyeuté ⚜️
    </Link>
  );
}

export default Logo;
