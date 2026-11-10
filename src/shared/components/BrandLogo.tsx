import React from 'react';
import { APP_BRAND } from '../../core/config/brand';

interface BrandLogoProps {
  className?: string;
  alt?: string;
}

const LOGO_URL = APP_BRAND === 'huloolcom'
  ? '/assets/logo-huloolcom.png'
  : '/assets/logo.png';

const BrandLogo: React.FC<BrandLogoProps> = ({ className = 'h-8 w-auto', alt = 'شعار المنصة' }) => {
  return (
    <img
      src={LOGO_URL}
      alt={alt}
      className={className}
      decoding="async"
      loading="eager"
    />
  );
};

export default BrandLogo;
