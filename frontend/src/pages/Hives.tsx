import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api/client';

type Apiary = { id: number; name: string };
type Hive = {
  id: number;
  apiaryId: number;
  boxNumber: string;
  beeSpecies: string;
  queenYear: number | null;
  status: string;
  notes: string | null;
  apiary?: Apiary;
};

const emptyForm = {
  apiaryId: '',
  boxNumber: '',
  beeSpecies: '意大利蜂',
  queenYear: '',
  status: 'active',
  notes: '',
};

const statusLabel: Record<string, string> = {
  active: '正常',
  quarantine: '隔离',
  empty: '空箱',
};

export default function Hives() {
  const [list, setList] = useState<Hive[]>([]);
  const [apiaries, setApiaries] = useState<Apiary[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Hive | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const [hives, apiaryList] = await Promise.all([api.getHives(), api.getApiaries()]);
    setList(hives);
    setApiaries(apiaryList);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({
      ...emptyForm,
      apiaryId: apiaries[0]?.id?.toString() || '',
    });
    setOpen(true);
  }

  function openEdit(item: Hive) {
    setEditing(item);
    setForm({
      apiaryId: String(item.apiaryId),
      boxNumber: item.boxNumber,
      beeSpecies: item.beeSpecies,
      queenYear: item.queenYear?.toString() ?? '',
      status: item.status,
      notes: item.notes ?? '',
    });
    setOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const body = { ...form };
      if (editing) await api.updateHive(editing.id, body);
      else await api.createHive(body);
      setOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    }
  }

  async function onDelete(id: number) {
    if (!confirm('确定删除该蜂箱？')) return;
    await api.deleteHive(id);
    await load();
  }

  return (
    <>
      <div className="topbar">
        <h1>蜂箱管理</h1>
        <button className="btn" onClick={openCreate}>
          新建蜂箱
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>箱号</th>
              <th>所属蜂场</th>
              <th>蜂种</th>
              <th>蜂王年份</th>
              <th>状态</th>
              <th>备注</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item) => (
              <tr key={item.id}>
                <td>{item.boxNumber}</td>
                <td>{item.apiary?.name}</td>
                <td>{item.beeSpecies}</td>
                <td>{item.queenYear ?? '—'}</td>
                <td>
                  <span className={`badge ${item.status}`}>{statusLabel[item.status] || item.status}</span>
                </td>
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
                <td colSpan={7} className="muted">
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
            <h2>{editing ? '编辑蜂箱' : '新建蜂箱'}</h2>
            <div className="form-grid">
              <label>
                所属蜂场
                <select
                  required
                  value={form.apiaryId}
                  onChange={(e) => setForm({ ...form, apiaryId: e.target.value })}
                >
                  <option value="">请选择</option>
                  {apiaries.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                箱号
                <input
                  required
                  value={form.boxNumber}
                  onChange={(e) => setForm({ ...form, boxNumber: e.target.value })}
                />
              </label>
              <label>
                蜂种
                <input
                  required
                  value={form.beeSpecies}
                  onChange={(e) => setForm({ ...form, beeSpecies: e.target.value })}
                />
              </label>
              <label>
                蜂王年份
                <input
                  type="number"
                  value={form.queenYear}
                  onChange={(e) => setForm({ ...form, queenYear: e.target.value })}
                />
              </label>
              <label>
                状态
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="active">正常</option>
                  <option value="quarantine">隔离</option>
                  <option value="empty">空箱</option>
                </select>
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
