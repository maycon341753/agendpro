import React from "react";
import Image from "next/image";
import { User } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * Avatar - Imagem de perfil com fallback
 * @param {Object} props
 * @param {string} [props.src] - URL da imagem
 * @param {string} [props.alt=''] - Texto alternativo
 * @param {string} [props.name] - Nome para extrair iniciais (fallback)
 * @param {'sm'|'md'|'lg'|'xl'} [props.size='md'] - Tamanho
 * @param {string} [props.className] - Classes adicionais
 */
function Avatar({
  src,
  alt = "",
  name,
  size = "md",
  className,
  ...props
}) {
  const [imageError, setImageError] = React.useState(false);

  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-base",
    xl: "h-20 w-20 text-lg",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-7 w-7",
    xl: "h-10 w-10",
  };

  const showImage = src && !imageError;

  function getInitials(n) {
    if (!n) return null;
    const parts = n.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }

  const initials = getInitials(name);

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-full bg-slate-200 text-slate-600 font-medium ring-2 ring-white",
        sizes[size],
        className
      )}
      {...props}
    >
      {showImage ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          onError={() => setImageError(true)}
        />
      ) : initials ? (
        <span className="leading-none">{initials}</span>
      ) : (
        <User className={cn(iconSizes[size])} />
      )}
    </div>
  );
}

export default Avatar;
