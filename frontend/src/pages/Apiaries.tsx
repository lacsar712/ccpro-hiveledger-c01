import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api/client';

type Apiary = {
  id: number;
  name: string;
  location: string;
  altitude: number | null;
  notes: string | null;
  _count?: { hives: number; harvests: number };
};

const emptyForm = { name: '', location: '', altitude: '', notes: '' };

export default function Apiaries() {
  const [list, setList] = useState<Apiary[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Apiary | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const data = await api.getApiaries();
    setList(data);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(item: Apiary) {
    setEditing(item);
    setForm({
      name: item.name,
      location: item.location,
      altitude: item.altitude?.toString() ?? '',
      notes: item.notes ?? '',
    });
    setOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const body = {
        name: form.name,
        location: form.location,
        altitude: form.altitude,
        notes: form.notes,
      };
      if (editing) await api.updateApiary(editing.id, body);
      else await api.createApiary(body);
      setOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    }
  }

  async function onDelete(id: number) {
    if (!confirm('确定删除该蜂场及其关联蜂箱/采蜜记录？')) return;
    await api.deleteApiary(id);
    await load();
  }

  return (
    <>
      <div className="topbar">
        <h1>蜂场管理</h1>
        <button className="btn" onClick={openCreate}>
          新建蜂场
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>名称</th>
              <th>位置</th>
              <th>海拔(m)</th>
              <th>蜂箱数</th>
              <th>备注</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.location}</td>
                <td>{item.altitude ?? '—'}</td>
                <td>{item._count?.hives ?? 0}</td>
                <td>{item.notes || '—'}</td>
                <td>
                  <button className="btn secondary" onClick={() => openEdit(item)}>
                    编辑
                  </button>
                  <button className="btn danger" onClick={() => onDelete(item.id)}>
                    删除
                  </button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={6} className="muted">
                  暂无数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="modal-backdrop">
          <form className="modal" onSubmit={onSubmit}>
            <h2>{editing ? '编辑蜂场' : '新建蜂场'}</h2>
            <div className="form-grid">
              <label>
                名称
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>
              <label>
                位置
                <input
                  required
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </label>
              <label>
                海拔 (米)
                <input
                  type="number"
                  value={form.altitude}
                  onChange={(e) => setForm({ ...form, altitude: e.target.value })}
                />
              </label>
              <label style={{ gridColumn: '1 / -1' }}>
                备注
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn secondary" onClick={() => setOpen(false)}>
                取消
              </button>
              <button type="submit" className="btn">
                保存
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
