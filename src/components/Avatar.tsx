import { FC, useEffect, useState } from 'react';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const Avatar: FC<AvatarProps> = ({ name, size = 'md' }) => {
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  useEffect(() => {
    // Generate a consistent seed based on the name
    const seed = name.toLowerCase().replace(/\s+/g, '');
    // Use DiceBear's avataaars style for a modern look
    const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4`;
    setAvatarUrl(url);
  }, [name]);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden`}>
      {avatarUrl ? (
        <img 
          src={avatarUrl} 
          alt={name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className={`${sizeClasses[size]} rounded-full bg-blue-500 text-white flex items-center justify-center font-medium`}>
          {name.split(' ').map(word => word[0]).join('').toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default Avatar; 