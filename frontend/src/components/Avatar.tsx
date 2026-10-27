import { useState } from 'react';

//Iniziali come avatar
function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

type AvatarProps = {
  name: string;
  imageUrl?: string;
  size?: 'md' | 'lg';
};

//L'avatar
//  la foto se c'è e si carica, altrimenti le iniziali
export function Avatar({ name, imageUrl, size = 'md' }: AvatarProps) {
    
  //L'indirizzo che non si è caricato: si ricorda per non riprovare a ogni render
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = imageUrl !== undefined && imageUrl !== failedUrl;

  return (
    <div className={size === 'lg' ? 'avatar avatar-lg' : 'avatar'} aria-hidden="true">
      {showImage ? (
        <img src={imageUrl} alt="" referrerPolicy="no-referrer" onError={() => setFailedUrl(imageUrl ?? null)} />
      ) : (
        initials(name) || '–'
      )}
    </div>
  );
}