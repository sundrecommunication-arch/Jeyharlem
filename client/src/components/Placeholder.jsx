import React from 'react';
import { Image as ImageIcon, Video as VideoIcon } from 'lucide-react';

export function ImagePlaceholder({ label, ratio, className = '', src }) {
  return (
    <div className={`ph-media ph-image ${className}`} style={ratio ? { aspectRatio: ratio } : undefined}>
      {src ? (
        <img className="bg" src={src} alt={label || ''} />
      ) : (
        <>
          <ImageIcon />
          <span>{label || 'Image placeholder'}</span>
        </>
      )}
    </div>
  );
}

export function VideoPlaceholder({ label, ratio, className = '', src }) {
  return (
    <div className={`ph-media ph-video ${className}`} style={ratio ? { aspectRatio: ratio } : undefined}>
      {src ? (
        <video className="bg" src={src} controls playsInline preload="metadata" />
      ) : (
        <>
          <VideoIcon />
          <span>{label || 'Video placeholder'}</span>
        </>
      )}
    </div>
  );
}

// Renders a product's real photo when one has been added in the admin panel, and falls back to the
// dashed placeholder otherwise — used everywhere a product thumbnail or main image appears.
export function ProductImage({ product, className = '', label }) {
  if (product?.image) return <img src={product.image} alt={product.name} className={className} />;
  return <ImagePlaceholder className={className} label={label || `${product?.name || 'Product'} — photo`} />;
}
