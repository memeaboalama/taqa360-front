import React from 'react';
import { APP_BRAND } from '../../core/config/brand';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'mark' | 'white' | 'color';
}

const Logo: React.FC<LogoProps> = ({ className = '', variant = 'color' }) => {
  const logoUrl = APP_BRAND === 'huloolcom'
    ? '/assets/logo-huloolcom.png'
    : variant === 'white'
      ? '/assets/logo-white.png'
      : '/assets/logo.png';

  return <img className={className} src={logoUrl} alt={APP_BRAND === 'huloolcom' ? 'Huloolcom' : 'TAQA'} />;
};

export default Logo;
