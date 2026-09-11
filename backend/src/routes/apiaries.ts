import { Router, Response } from 'express';
import prisma from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', async (_req: AuthRequest, res: Response) => {
  try {
    const list = await prisma.apiary.findMany({
      orderBy: { id: 'asc' },
      include: { _count: { select: { hives: true, harvests: true } } },
    });
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: '获取蜂场列表失败' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const item = await prisma.apiary.findUnique({
      where: { id },
      include: { hives: true, harvests: true },
    });
    if (!item) {
      res.status(404).json({ message: '蜂场不存在' });
      return;
    }
    res.json(item);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: '获取蜂场详情失败' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, location, altitude, notes } = req.body;
    if (!name || !location) {
      res.status(400).json({ message: '名称和位置为必填项' });
      return;
    }
    const item = await prisma.apiary.create({
      data: {
        name,
        location,
        altitude: altitude !== undefined && altitude !== '' ? Number(altitude) : null,
        notes: notes || null,
      },
    });
    res.status(201).json(item);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: '创建蜂场失败' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, location, altitude, notes } = req.body;
    const item = await prisma.apiary.update({
      where: { id },
      data: {
        name,
        location,
        altitude: altitude !== undefined && altitude !== '' ? Number(altitude) : null,
        notes: notes || null,
      },
    });
    res.json(item);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: '更新蜂场失败' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.apiary.delete({ where: { id } });
    res.json({ message: '已删除' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: '删除蜂场失败' });
  }
});

export default router;
