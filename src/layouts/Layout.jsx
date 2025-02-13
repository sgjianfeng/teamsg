import { useEffect, useState } from 'react';
import { getDeviceType } from '../utils/deviceDetect';
import MobileLayout from './mobile/MobileLayout';
import DesktopLayout from './desktop/DesktopLayout';
import TabletLayout from './tablet/TabletLayout';

const Layout = ({ children }) => {
  const [deviceType, setDeviceType] = useState('desktop');

  useEffect(() => {
    const handleResize = () => {
      setDeviceType(getDeviceType());
    };

    // Set initial device type
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  switch (deviceType) {
    case 'mobile':
      return <MobileLayout>{children}</MobileLayout>;
    case 'tablet':
      return <TabletLayout>{children}</TabletLayout>;
    default:
      return <DesktopLayout>{children}</DesktopLayout>;
  }
};

export default Layout;
