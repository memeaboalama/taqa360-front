import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'mark' | 'white' | 'color';
}

const Logo: React.FC<LogoProps> = ({ className = '', variant = 'color' }) => {
  const logoUrl = variant === 'white'
    ? '/assets/logo-white.png'
    : '/assets/logo.png';

  return <img className={className} src={logoUrl} alt="TAQA" />;
};

export default Logo;
