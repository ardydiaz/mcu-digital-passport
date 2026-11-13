import { Outlet } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';

export default function PublicLayout() {
  return (
    <div className="public-layout">
      <PublicHeader />
      <PublicNavbar />
      <main>
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
