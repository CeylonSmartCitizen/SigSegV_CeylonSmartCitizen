import React from 'react';
import { Share2 } from 'lucide-react';
import './ShareServiceInfo.css';

function ShareServiceInfo({ service }) {
  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: service.name,
        text: `Check out this service: ${service.name}`,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Service link copied to clipboard!');
    }
  };

  return (
    <div className="share-service-info">
      <button className="share-btn" onClick={handleShare}>
        <Share2 size={18} /> Share Service Information
      </button>
    </div>
  );
}

export default ShareServiceInfo;
