import { Router, Response } from 'express';
import { HiveStatus } from '@prisma/client';
import prisma from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', async (_req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const recentStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [hiveTotal, monthInspections, quarantineHives, recentHarvests] = await Promise.all([
      prisma.hive.count(),
      prisma.inspection.count({
        where: { date: { gte: monthStart } },
      }),
      prisma.hive.count({
        where: { status: HiveStatus.quarantine },
      }),
      prisma.harvest.aggregate({
        where: { date: { gte: recentStart } },
        _sum: { netWeightKg: true },
      }),
    ]);

    res.json({
      hiveTotal,
      monthInspections,
      quarantineHives,
      recentHarvestKg: recentHarvests._sum.netWeightKg || 0,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: '获取仪表盘数据失败' });
  }
});

export default router;
