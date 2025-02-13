import Navbar from '../../components/desktop/Navbar';
import './DesktopLayout.css';

const DesktopLayout = ({ children }) => {
  return (
    <div className="desktop-layout">
      <Navbar />
      <main className="desktop-main">
        {children}
      </main>
      <footer className="desktop-footer">
        <p>© 2025 Vision Singapore. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default DesktopLayout;
