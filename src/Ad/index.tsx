import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './index.css';

interface AdPopupProps {
  intervalMinutes?: number;
}

const AdPopup = ({ intervalMinutes = 2 }: AdPopupProps) => {
  const [showAd, setShowAd] = useState(false);
  const [adImage, setAdImage] = useState('');
  const location = useLocation();

  const isLoginPage = location.pathname === '/';

  const adImages = [
    '/ads/bic.jpeg',
    '/ads/chokis.jpeg',
    '/ads/king.webp',
    '/ads/oreo.jpeg',
    '/ads/redbull.jpeg',
  ];

  useEffect(() => {
    if (isLoginPage) return;

    const showRandomAd = () => {
      const randomIndex = Math.floor(Math.random() * adImages.length);
      setAdImage(adImages[randomIndex]);
      setShowAd(true);
    };

    const timer = setTimeout(showRandomAd, intervalMinutes * 60 * 1000);
    const interval = setInterval(showRandomAd, intervalMinutes * 60 * 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [intervalMinutes, isLoginPage]);

  const closeAd = () => {
    setShowAd(false);
  };

  if (!showAd || isLoginPage) return null;

  return (
    <div className="ad-overlay" onClick={closeAd}>
      <div className="ad-popup" onClick={(e) => e.stopPropagation()}>
        <button className="ad-close" onClick={closeAd}>
          ✕
        </button>
        <img src={adImage} alt="Advertisement" className="ad-image" />
        <p className="ad-close-hint">Haz clic fuera del anuncio para cerrar</p>
      </div>
    </div>
  );
};

export default AdPopup;