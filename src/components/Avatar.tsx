import { FC } from 'react';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const Avatar: FC<AvatarProps> = ({ name, size = 'md' }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-blue-500 text-white flex items-center justify-center font-medium`}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar; 