import React from 'react';

interface BrandLogoProps {
  className?: string;
  alt?: string;
}

// Place your logo file at: public/assets/logo.png
// We reference it by URL so the app doesn't break if the file isn't imported at build time.
const LOGO_URL = '/assets/logo.png';

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
