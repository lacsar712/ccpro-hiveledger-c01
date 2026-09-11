import { Router, Response } from 'express';
import { HiveStatus } from '@prisma/client';
import prisma from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { apiaryId, status } = req.query;
    const where: { apiaryId?: number; status?: HiveStatus } = {};
    if (apiaryId) where.apiaryId = Number(apiaryId);
    if (status && Object.values(HiveStatus).includes(status as HiveStatus)) {
      where.status = status as HiveStatus;
    }
    const list = await prisma.hive.findMany({
      where,
      orderBy: { id: 'asc' },
      include: { apiary: { select: { id: true, name: true } } },
    });
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: '获取蜂箱列表失败' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const item = await prisma.hive.findUnique({
      where: { id },
      include: { apiary: true, inspections: { orderBy: { date: 'desc' } } },
    });
    if (!item) {
      res.status(404).json({ message: '蜂箱不存在' });
      return;
    }
    res.json(item);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: '获取蜂箱详情失败' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { apiaryId, boxNumber, beeSpecies, queenYear, status, notes } = req.body;
    if (!apiaryId || !boxNumber || !beeSpecies) {
      res.status(400).json({ message: '蜂场、箱号、蜂种为必填项' });
      return;
    }
    const item = await prisma.hive.create({
      data: {
        apiaryId: Number(apiaryId),
        boxNumber,
        beeSpecies,
        queenYear: queenYear !== undefined && queenYear !== '' ? Number(queenYear) : null,
        status: (status as HiveStatus) || HiveStatus.active,
        notes: notes || null,
      },
      include: { apiary: { select: { id: true, name: true } } },
    });
    res.status(201).json(item);
  } catch (e: unknown) {
    console.error(e);
    const msg = e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2002'
      ? '该蜂场下箱号已存在'
      : '创建蜂箱失败';
    res.status(500).json({ message: msg });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { apiaryId, boxNumber, beeSpecies, queenYear, status, notes } = req.body;
    const item = await prisma.hive.update({
      where: { id },
      data: {
        apiaryId: Number(apiaryId),
        boxNumber,
        beeSpecies,
        queenYear: queenYear !== undefined && queenYear !== '' ? Number(queenYear) : null,
        status: status as HiveStatus,
        notes: notes || null,
      },
      include: { apiary: { select: { id: true, name: true } } },
    });
    res.json(item);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: '更新蜂箱失败' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.hive.delete({ where: { id } });
    res.json({ message: '已删除' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: '删除蜂箱失败' });
  }
});

export default router;
