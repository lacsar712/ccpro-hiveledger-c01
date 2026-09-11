import { Router, Response } from 'express';
import prisma from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { hiveId } = req.query;
    const where: { hiveId?: number } = {};
    if (hiveId) where.hiveId = Number(hiveId);
    const list = await prisma.inspection.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        hive: {
          select: {
            id: true,
            boxNumber: true,
            apiary: { select: { id: true, name: true } },
          },
        },
      },
    });
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: '获取巡检列表失败' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const item = await prisma.inspection.findUnique({
      where: { id },
      include: {
        hive: {
          include: { apiary: true },
        },
      },
    });
    if (!item) {
      res.status(404).json({ message: '巡检记录不存在' });
      return;
    }
    res.json(item);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: '获取巡检详情失败' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { hiveId, date, colonyScore, miteCount, honeyFrames, notes } = req.body;
    if (!hiveId || !date || colonyScore === undefined) {
      res.status(400).json({ message: '蜂箱、日期、群势分数为必填项' });
      return;
    }
    const score = Number(colonyScore);
    if (score < 1 || score > 5) {
      res.status(400).json({ message: '群势分数须为 1-5' });
      return;
    }
    const item = await prisma.inspection.create({
      data: {
        hiveId: Number(hiveId),
        date: new Date(date),
        colonyScore: score,
        miteCount: Number(miteCount) || 0,
        honeyFrames: Number(honeyFrames) || 0,
        notes: notes || null,
      },
      include: {
        hive: {
          select: {
            id: true,
            boxNumber: true,
            apiary: { select: { id: true, name: true } },
          },
        },
      },
    });
    res.status(201).json(item);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: '创建巡检记录失败' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { hiveId, date, colonyScore, miteCount, honeyFrames, notes } = req.body;
    const score = Number(colonyScore);
    if (score < 1 || score > 5) {
      res.status(400).json({ message: '群势分数须为 1-5' });
      return;
    }
    const item = await prisma.inspection.update({
      where: { id },
      data: {
        hiveId: Number(hiveId),
        date: new Date(date),
        colonyScore: score,
        miteCount: Number(miteCount) || 0,
        honeyFrames: Number(honeyFrames) || 0,
        notes: notes || null,
      },
      include: {
        hive: {
          select: {
            id: true,
            boxNumber: true,
            apiary: { select: { id: true, name: true } },
          },
        },
      },
    });
    res.json(item);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: '更新巡检记录失败' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.inspection.delete({ where: { id } });
    res.json({ message: '已删除' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: '删除巡检记录失败' });
  }
});

export default router;
