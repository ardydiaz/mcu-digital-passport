import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import AdminFooter from './AdminFooter';

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-layout-main">
        <AdminNavbar />
        <main>
          <Outlet />
        </main>
        <AdminFooter />
      </div>
    </div>
  );
}
