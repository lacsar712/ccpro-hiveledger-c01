import { Router, Response } from 'express';
import { HarvestStatus } from '@prisma/client';
import prisma from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { apiaryId, status } = req.query;
    const where: { apiaryId?: number; status?: HarvestStatus } = {};
    if (apiaryId) where.apiaryId = Number(apiaryId);
    if (status && Object.values(HarvestStatus).includes(status as HarvestStatus)) {
      where.status = status as HarvestStatus;
    }
    const list = await prisma.harvest.findMany({
      where,
      orderBy: { date: 'desc' },
      include: { apiary: { select: { id: true, name: true } } },
    });
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: '获取采蜜批次失败' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const item = await prisma.harvest.findUnique({
      where: { id },
      include: { apiary: true },
    });
    if (!item) {
      res.status(404).json({ message: '采蜜批次不存在' });
      return;
    }
    res.json(item);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: '获取采蜜批次详情失败' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { apiaryId, date, honeyType, netWeightKg, moisturePct, status, notes } = req.body;
    if (!apiaryId || !date || !honeyType || netWeightKg === undefined || moisturePct === undefined) {
      res.status(400).json({ message: '蜂场、日期、蜜种、净重、含水量为必填项' });
      return;
    }
    const item = await prisma.harvest.create({
      data: {
        apiaryId: Number(apiaryId),
        date: new Date(date),
        honeyType,
        netWeightKg: Number(netWeightKg),
        moisturePct: Number(moisturePct),
        status: (status as HarvestStatus) || HarvestStatus.stored,
        notes: notes || null,
      },
      include: { apiary: { select: { id: true, name: true } } },
    });
    res.status(201).json(item);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: '创建采蜜批次失败' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { apiaryId, date, honeyType, netWeightKg, moisturePct, status, notes } = req.body;
    const item = await prisma.harvest.update({
      where: { id },
      data: {
        apiaryId: Number(apiaryId),
        date: new Date(date),
        honeyType,
        netWeightKg: Number(netWeightKg),
        moisturePct: Number(moisturePct),
        status: status as HarvestStatus,
        notes: notes || null,
      },
      include: { apiary: { select: { id: true, name: true } } },
    });
    res.json(item);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: '更新采蜜批次失败' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.harvest.delete({ where: { id } });
    res.json({ message: '已删除' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: '删除采蜜批次失败' });
  }
});

export default router;
