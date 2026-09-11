import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api/client';

type Hive = {
  id: number;
  boxNumber: string;
  apiary?: { id: number; name: string };
};

type Inspection = {
  id: number;
  hiveId: number;
  date: string;
  colonyScore: number;
  miteCount: number;
  honeyFrames: number;
  notes: string | null;
  hive?: Hive;
};

const emptyForm = {
  hiveId: '',
  date: new Date().toISOString().slice(0, 10),
  colonyScore: '4',
  miteCount: '0',
  honeyFrames: '0',
  notes: '',
};

function fmtDate(v: string) {
  return new Date(v).toLocaleDateString('zh-CN');
}

export default function Inspections() {
  const [list, setList] = useState<Inspection[]>([]);
  const [hives, setHives] = useState<Hive[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Inspection | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const [inspections, hiveList] = await Promise.all([api.getInspections(), api.getHives()]);
    setList(inspections);
    setHives(hiveList);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({
      ...emptyForm,
      hiveId: hives[0]?.id?.toString() || '',
      date: new Date().toISOString().slice(0, 10),
    });
    setOpen(true);
  }

  function openEdit(item: Inspection) {
    setEditing(item);
    setForm({
      hiveId: String(item.hiveId),
      date: item.date.slice(0, 10),
      colonyScore: String(item.colonyScore),
      miteCount: String(item.miteCount),
      honeyFrames: String(item.honeyFrames),
      notes: item.notes ?? '',
    });
    setOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const body = { ...form };
      if (editing) await api.updateInspection(editing.id, body);
      else await api.createInspection(body);
      setOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    }
  }

  async function onDelete(id: number) {
    if (!confirm('确定删除该巡检记录？')) return;
    await api.deleteInspection(id);
    await load();
  }

  return (
    <>
      <div className="topbar">
        <h1>巡检记录</h1>
        <button className="btn" onClick={openCreate}>
          新建巡检
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>日期</th>
              <th>蜂场</th>
              <th>箱号</th>
              <th>群势(1-5)</th>
              <th>螨虫计数</th>
              <th>蜜脾数</th>
              <th>备注</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item) => (
              <tr key={item.id}>
                <td>{fmtDate(item.date)}</td>
                <td>{item.hive?.apiary?.name}</td>
                <td>{item.hive?.boxNumber}</td>
                <td>{item.colonyScore}</td>
                <td>{item.miteCount}</td>
                <td>{item.honeyFrames}</td>
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
            <h2>{editing ? '编辑巡检' : '新建巡检'}</h2>
            <div className="form-grid">
              <label>
                蜂箱
                <select
                  required
                  value={form.hiveId}
                  onChange={(e) => setForm({ ...form, hiveId: e.target.value })}
                >
                  <option value="">请选择</option>
                  {hives.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.apiary?.name} / {h.boxNumber}
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
                群势分数 (1-5)
                <input
                  type="number"
                  min={1}
                  max={5}
                  required
                  value={form.colonyScore}
                  onChange={(e) => setForm({ ...form, colonyScore: e.target.value })}
                />
              </label>
              <label>
                螨虫计数
                <input
                  type="number"
                  min={0}
                  value={form.miteCount}
                  onChange={(e) => setForm({ ...form, miteCount: e.target.value })}
                />
              </label>
              <label>
                蜜脾数
                <input
                  type="number"
                  min={0}
                  value={form.honeyFrames}
                  onChange={(e) => setForm({ ...form, honeyFrames: e.target.value })}
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
