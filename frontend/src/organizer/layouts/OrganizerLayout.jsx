import { Outlet } from 'react-router-dom';

export default function OrganizerLayout() {
  return (
    <div className="organizer-layout">
      <main>
        <Outlet />
      </main>
    </div>
  );
}
