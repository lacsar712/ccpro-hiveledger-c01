import { PrismaClient, Role, HiveStatus, HarvestStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash('123456', 10);
  const keeperHash = await bcrypt.hash('123456', 10);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminHash,
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { username: 'keeper' },
    update: {},
    create: {
      username: 'keeper',
      passwordHash: keeperHash,
      role: Role.KEEPER,
    },
  });

  const existingApiaries = await prisma.apiary.count();
  if (existingApiaries > 0) {
    console.log('Seed data already exists, skipping demo records.');
    return;
  }

  const apiary1 = await prisma.apiary.create({
    data: {
      name: '南山槐花场',
      location: '浙江省杭州市余杭区南山村',
      altitude: 320,
      notes: '主要蜜源为洋槐，春季采蜜高峰',
    },
  });

  const apiary2 = await prisma.apiary.create({
    data: {
      name: '西岭枣花场',
      location: '山东省临沂市平邑县西岭',
      altitude: 180,
      notes: '枣花蜜主产区，夏季干燥需补水',
    },
  });

  const hives = await Promise.all([
    prisma.hive.create({
      data: {
        apiaryId: apiary1.id,
        boxNumber: 'A-01',
        beeSpecies: '中华蜜蜂',
        queenYear: 2024,
        status: HiveStatus.active,
      },
    }),
    prisma.hive.create({
      data: {
        apiaryId: apiary1.id,
        boxNumber: 'A-02',
        beeSpecies: '意大利蜂',
        queenYear: 2025,
        status: HiveStatus.active,
      },
    }),
    prisma.hive.create({
      data: {
        apiaryId: apiary1.id,
        boxNumber: 'A-03',
        beeSpecies: '意大利蜂',
        queenYear: 2023,
        status: HiveStatus.quarantine,
        notes: '发现螨虫偏高，隔离观察中',
      },
    }),
    prisma.hive.create({
      data: {
        apiaryId: apiary2.id,
        boxNumber: 'B-01',
        beeSpecies: '中华蜜蜂',
        queenYear: 2024,
        status: HiveStatus.active,
      },
    }),
    prisma.hive.create({
      data: {
        apiaryId: apiary2.id,
        boxNumber: 'B-02',
        beeSpecies: '卡尼鄂拉蜂',
        queenYear: 2025,
        status: HiveStatus.empty,
        notes: '待分群',
      },
    }),
  ]);

  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

  await prisma.inspection.createMany({
    data: [
      {
        hiveId: hives[0].id,
        date: daysAgo(3),
        colonyScore: 4,
        miteCount: 2,
        honeyFrames: 6,
        notes: '群势良好，蜜脾充足',
      },
      {
        hiveId: hives[1].id,
        date: daysAgo(5),
        colonyScore: 5,
        miteCount: 0,
        honeyFrames: 8,
        notes: '蜂王产卵旺盛',
      },
      {
        hiveId: hives[2].id,
        date: daysAgo(2),
        colonyScore: 2,
        miteCount: 18,
        honeyFrames: 3,
        notes: '螨虫超标，已隔离',
      },
      {
        hiveId: hives[3].id,
        date: daysAgo(7),
        colonyScore: 4,
        miteCount: 1,
        honeyFrames: 5,
        notes: '枣花期前巡检',
      },
    ],
  });

  await prisma.harvest.createMany({
    data: [
      {
        apiaryId: apiary1.id,
        date: daysAgo(10),
        honeyType: '槐花蜜',
        netWeightKg: 86.5,
        moisturePct: 17.2,
        status: HarvestStatus.bottled,
        notes: '头茬槐花蜜',
      },
      {
        apiaryId: apiary1.id,
        date: daysAgo(4),
        honeyType: '槐花蜜',
        netWeightKg: 42.0,
        moisturePct: 18.1,
        status: HarvestStatus.stored,
      },
      {
        apiaryId: apiary2.id,
        date: daysAgo(15),
        honeyType: '枣花蜜',
        netWeightKg: 120.3,
        moisturePct: 16.8,
        status: HarvestStatus.bottled,
        notes: '品质优良',
      },
      {
        apiaryId: apiary2.id,
        date: daysAgo(1),
        honeyType: '枣花蜜',
        netWeightKg: 55.0,
        moisturePct: 17.5,
        status: HarvestStatus.stored,
      },
    ],
  });

  console.log('Seed completed: admin/keeper users + demo apiaries/hives/inspections/harvests');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
