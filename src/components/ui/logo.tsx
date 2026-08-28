'use client';

import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'brand' | 'icon' | 'auto';
  showText?: boolean;
  priority?: boolean;
  rounded?: 'none' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  onDark?: boolean;
}

export function Logo({
  className = '',
  size = 'md',
  variant = 'auto',
  showText = true,
  priority = false,
  rounded = 'xl',
  onDark = false,
}: LogoProps) {
  // Determine whether to show full rectangular brand logo or square icon
  const isBrand = variant === 'brand' || (variant === 'auto' && showText);

  const roundedMap = {
    none: 'rounded-none',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  };

  // Height configurations for rectangular brand logo (aspect ratio preserved)
  const brandHeightMap = {
    sm: onDark ? 'h-6 w-auto' : 'h-7 w-auto',
    md: onDark ? 'h-8 sm:h-9 w-auto' : 'h-9 sm:h-10 w-auto',
    lg: onDark ? 'h-10 sm:h-12 w-auto' : 'h-12 sm:h-14 w-auto',
    xl: onDark ? 'h-14 sm:h-16 w-auto' : 'h-16 sm:h-20 w-auto',
  };

  // Dimensions for square icon logo
  const squareSizeMap = {
    sm: onDark ? 'w-6 h-6' : 'w-7 h-7',
    md: onDark ? 'w-8 h-8' : 'w-10 h-10',
    lg: onDark ? 'w-11 h-11' : 'w-14 h-14',
    xl: onDark ? 'w-16 h-16' : 'w-20 h-20',
  };

  const darkContainerStyle = onDark
    ? {
        sm: 'bg-white px-2.5 py-1 rounded-lg shadow-sm',
        md: 'bg-white px-3 py-1.5 rounded-xl shadow-sm',
        lg: 'bg-white px-3.5 py-2 rounded-xl shadow-sm',
        xl: 'bg-white px-4 py-2.5 rounded-2xl shadow-md',
      }[size]
    : '';

  if (isBrand) {
    return (
      <div className={`inline-flex items-center select-none ${darkContainerStyle} ${className}`}>
        <img
          src="/logo-brand.webp"
          alt="Whey4You - Fuel Your Goals"
          className={`${brandHeightMap[size]} max-w-full object-contain ${onDark ? 'rounded-none' : roundedMap[rounded]} overflow-hidden transition-transform duration-300 group-hover:scale-105`}
          loading={priority ? 'eager' : 'lazy'}
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center select-none ${darkContainerStyle} ${className}`}>
      <img
        src="/logo.webp"
        alt="Whey4You"
        className={`${squareSizeMap[size]} object-contain ${onDark ? 'rounded-none' : roundedMap[rounded]} overflow-hidden transition-transform duration-300 group-hover:scale-105`}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  );
}

