import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api/client';

type Apiary = { id: number; name: string };

type Harvest = {
  id: number;
  apiaryId: number;
  date: string;
  honeyType: string;
  netWeightKg: number;
  moisturePct: number;
  status: string;
  notes: string | null;
  apiary?: Apiary;
};

const emptyForm = {
  apiaryId: '',
  date: new Date().toISOString().slice(0, 10),
  honeyType: '槐花蜜',
  netWeightKg: '',
  moisturePct: '17.5',
  status: 'stored',
  notes: '',
};

const statusLabel: Record<string, string> = {
  stored: '仓储',
  bottled: '已装瓶',
};

function fmtDate(v: string) {
  return new Date(v).toLocaleDateString('zh-CN');
}

export default function Harvests() {
  const [list, setList] = useState<Harvest[]>([]);
  const [apiaries, setApiaries] = useState<Apiary[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Harvest | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const [harvests, apiaryList] = await Promise.all([api.getHarvests(), api.getApiaries()]);
    setList(harvests);
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
      date: new Date().toISOString().slice(0, 10),
    });
    setOpen(true);
  }

  function openEdit(item: Harvest) {
    setEditing(item);
    setForm({
      apiaryId: String(item.apiaryId),
      date: item.date.slice(0, 10),
      honeyType: item.honeyType,
      netWeightKg: String(item.netWeightKg),
      moisturePct: String(item.moisturePct),
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
      if (editing) await api.updateHarvest(editing.id, body);
      else await api.createHarvest(body);
      setOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    }
  }

  async function onDelete(id: number) {
    if (!confirm('确定删除该采蜜批次？')) return;
    await api.deleteHarvest(id);
    await load();
  }

  return (
    <>
      <div className="topbar">
        <h1>采蜜批次</h1>
        <button className="btn" onClick={openCreate}>
          新建批次
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>日期</th>
              <th>蜂场</th>
              <th>蜜种</th>
              <th>净重(kg)</th>
              <th>含水量(%)</th>
              <th>状态</th>
              <th>备注</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item) => (
              <tr key={item.id}>
                <td>{fmtDate(item.date)}</td>
                <td>{item.apiary?.name}</td>
                <td>{item.honeyType}</td>
                <td>{item.netWeightKg}</td>
                <td>{item.moisturePct}</td>
                <td>
                  <span className={`badge ${item.status}`}>
                    {statusLabel[item.status] || item.status}
                  </span>
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
                <td colSpan={8} className="muted">
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
            <h2>{editing ? '编辑采蜜批次' : '新建采蜜批次'}</h2>
            <div className="form-grid">
              <label>
                蜂场
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
                日期
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </label>
              <label>
                蜜种
                <select
                  value={form.honeyType}
                  onChange={(e) => setForm({ ...form, honeyType: e.target.value })}
                >
                  <option value="槐花蜜">槐花蜜</option>
                  <option value="枣花蜜">枣花蜜</option>
                  <option value="油菜蜜">油菜蜜</option>
                  <option value="荔枝蜜">荔枝蜜</option>
                  <option value="百花蜜">百花蜜</option>
                </select>
              </label>
              <label>
                净重 (kg)
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  required
                  value={form.netWeightKg}
                  onChange={(e) => setForm({ ...form, netWeightKg: e.target.value })}
                />
              </label>
              <label>
                含水量 (%)
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={100}
                  required
                  value={form.moisturePct}
                  onChange={(e) => setForm({ ...form, moisturePct: e.target.value })}
                />
              </label>
              <label>
                状态
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="stored">仓储</option>
                  <option value="bottled">已装瓶</option>
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
