export const isMobile = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = ['iphone', 'ipod', 'android', 'mobile', 'phone'];
  return mobileKeywords.some(keyword => userAgent.includes(keyword));
};

export const isTablet = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const tabletKeywords = ['ipad', 'tablet'];
  const isTabletSize = window.innerWidth >= 768 && window.innerWidth <= 1024;
  return tabletKeywords.some(keyword => userAgent.includes(keyword)) || isTabletSize;
};

export const getDeviceType = () => {
  if (isMobile()) return 'mobile';
  if (isTablet()) return 'tablet';
  return 'desktop';
};
