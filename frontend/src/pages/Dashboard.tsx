import { useEffect, useState } from 'react';
import { api } from '../api/client';

type Stats = {
  hiveTotal: number;
  monthInspections: number;
  quarantineHives: number;
  recentHarvestKg: number;
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .dashboard()
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <div className="topbar">
        <h1>仪表盘</h1>
      </div>
      {error && <div className="error">{error}</div>}
      <div className="stats">
        <div className="stat">
          <div className="label">蜂箱总数</div>
          <div className="value">{stats?.hiveTotal ?? '—'}</div>
        </div>
        <div className="stat">
          <div className="label">本月巡检数</div>
          <div className="value">{stats?.monthInspections ?? '—'}</div>
        </div>
        <div className="stat">
          <div className="label">待处理隔离蜂箱</div>
          <div className="value">{stats?.quarantineHives ?? '—'}</div>
        </div>
        <div className="stat">
          <div className="label">近 30 日采蜜总量 (kg)</div>
          <div className="value">
            {stats ? Number(stats.recentHarvestKg).toFixed(1) : '—'}
          </div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>说明</h3>
        <p className="muted">
          本系统覆盖蜂场、蜂箱、巡检与采蜜批次全流程管理。请从左侧导航进入各模块进行增删改查。
        </p>
      </div>
    </>
  );
}
