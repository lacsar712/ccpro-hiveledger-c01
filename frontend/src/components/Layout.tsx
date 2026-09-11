import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const links = [
  { to: '/', label: '仪表盘', end: true },
  { to: '/apiaries', label: '蜂场管理' },
  { to: '/hives', label: '蜂箱管理' },
  { to: '/inspections', label: '巡检记录' },
  { to: '/harvests', label: '采蜜批次' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          HiveLedger
          <small>养蜂场蜂箱与采蜜批次</small>
        </div>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            {l.label}
          </NavLink>
        ))}
        <div style={{ marginTop: 'auto', paddingTop: 24 }} className="muted" />
        <div style={{ fontSize: '0.85rem', opacity: 0.85 }}>
          {user.username}（{user.role === 'ADMIN' ? '管理员' : '养蜂员'}）
        </div>
        <button
          className="btn secondary"
          style={{ marginTop: 8 }}
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          退出登录
        </button>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
