import React, { useRef, useState } from 'react';
import { User, Camera, Upload } from 'lucide-react';

export interface EmployeeAvatarProps {
  avatarUrl?: string | null;
  fullName: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'squircle' | 'rounded' | 'circle';
  onUpload?: (base64Url: string) => void;
  canUpload?: boolean;
  className?: string;
  showStatusDot?: boolean;
  statusDotColor?: string;
  showUploadBadge?: boolean;
  title?: string;
}

export const EmployeeAvatar: React.FC<EmployeeAvatarProps> = ({
  avatarUrl,
  fullName,
  size = 'md',
  shape = 'squircle',
  onUpload,
  canUpload = false,
  className = '',
  showStatusDot = false,
  statusDotColor = 'bg-zinc-400 dark:bg-zinc-300',
  showUploadBadge = false,
  title,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset image error if avatarUrl changes
  React.useEffect(() => {
    setImageError(false);
  }, [avatarUrl]);

  const sizeClasses = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
    '2xl': 'w-24 h-24 sm:w-26 sm:h-26',
  };

  const iconSizes = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4.5 h-4.5',
    md: 'w-5.5 h-5.5',
    lg: 'w-7 h-7',
    xl: 'w-10 h-10',
    '2xl': 'w-12 h-12',
  };

  const shapeClasses = {
    squircle: 'rounded-2xl',
    rounded: 'rounded-xl',
    circle: 'rounded-full',
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) return;

    // Read and compress or convert to DataURL
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        // Optimize image size if large
        const img = new Image();
        img.onload = () => {
          const maxDim = 400;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
            setImageError(false);
            onUpload(optimizedDataUrl);
            return;
          }
          setImageError(false);
          onUpload(result);
        };
        img.onerror = () => {
          setImageError(false);
          onUpload(result);
        };
        img.src = result;
      }
    };
    reader.readAsDataURL(file);

    // Reset input value so same file can be re-uploaded if desired
    e.target.value = '';
  };

  const triggerUpload = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const hasValidImage = Boolean(avatarUrl) && !imageError;
  const isInteractive = canUpload || Boolean(onUpload);

  return (
    <div
      className={`relative inline-block select-none group/avatar ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={title || fullName}
    >
      {/* Container Frame */}
      <div
        onClick={isInteractive ? triggerUpload : undefined}
        className={`relative ${sizeClasses[size]} ${shapeClasses[shape]} overflow-hidden flex items-center justify-center transition-all duration-300 border border-slate-200/80 dark:border-white/[0.08] bg-slate-100 dark:bg-[#16181d] shadow-xs ${
          isInteractive ? 'cursor-pointer hover:border-slate-400 dark:hover:border-zinc-500' : ''
        }`}
      >
        {hasValidImage ? (
          <img
            src={avatarUrl!}
            alt={fullName}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          /* Pure Grey People Silhouette — Never text initials */
          <div className="w-full h-full flex items-center justify-center bg-slate-150/70 dark:bg-[#181a20]">
            <User
              className={`${iconSizes[size]} text-slate-400 dark:text-zinc-500`}
              strokeWidth={1.6}
            />
          </div>
        )}

        {/* Hover Upload Overlay */}
        {isInteractive && (
          <div
            className={`absolute inset-0 bg-slate-900/65 dark:bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center text-white transition-opacity duration-200 ${
              isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <Camera className="w-4 h-4 text-zinc-100 mb-0.5" />
            {(size === 'xl' || size === '2xl') && (
              <span className="text-[10px] font-semibold text-zinc-200 tracking-tight">
                {hasValidImage ? 'Ganti' : 'Upload'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      {isInteractive && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/jpg,image/gif"
          onChange={handleFileChange}
          className="hidden"
          aria-label={`Upload photo for ${fullName}`}
        />
      )}

      {/* Optional Upload Badge Trigger (Small corner button) */}
      {showUploadBadge && isInteractive && (
        <button
          type="button"
          onClick={triggerUpload}
          className="absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border-2 border-white dark:border-[#16181d] shadow-sm hover:scale-110 transition-transform cursor-pointer"
          title="Upload / Ganti Foto"
        >
          <Upload className="w-2.5 h-2.5" />
        </button>
      )}

      {/* Live Status Indicator Dot */}
      {showStatusDot && !showUploadBadge && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 ${statusDotColor} rounded-full border-2 border-white dark:border-[#16181d] shadow-2xs`}
        />
      )}
    </div>
  );
};
