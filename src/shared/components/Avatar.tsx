import React from 'react';

type AvatarProps = {
  src?: string;
  name?: string;
  size?: number;
  className?: string;
  alt?: string;
};

const COLORS = [
  '#1F2937', '#111827', '#F97316', '#F59E0B', '#84CC16', '#10B981', '#06B6D4', '#3B82F6', '#6366F1', '#A78BFA',
  '#EC4899', '#F43F5E', '#E11D48', '#7C3AED', '#0EA5E9', '#06B6D4', '#34D399', '#FBBF24', '#FB7185', '#F43F5E',
  '#0EA5E9', '#60A5FA', '#38BDF8', '#34D399', '#86EFAC', '#A3E635'
];

function pickColorForInitials(initials: string) {
  if (!initials) return COLORS[0];
  const char = initials[0].toUpperCase();
  const code = char.charCodeAt(0);
  return COLORS[code % COLORS.length];
}

const Avatar: React.FC<AvatarProps> = ({ src, name = '', size = 40, className = '', alt }) => {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('');

  if (src) {
    return <img src={src} alt={alt || name} className={`${className} rounded-full`} style={{ width: size, height: size, objectFit: 'cover' }} />;
  }

  const bg = pickColorForInitials(initials || name.slice(0, 2));

  return (
    <div className={`${className} rounded-full flex items-center justify-center font-semibold text-white`} style={{ width: size, height: size, backgroundColor: bg }}> 
      <span style={{ fontSize: Math.max(12, Math.floor(size / 2.8)) }}>{initials || name.slice(0, 2).toUpperCase()}</span>
    </div>
  );
};

export default Avatar;
