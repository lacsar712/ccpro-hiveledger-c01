# HiveLedger 养蜂场蜂箱与采蜜批次管理系统

供 Coding Agent 标注用的全栈种子仓库：业务完整，支持 Docker 一键启动。

## 启动方式

```bash
docker compose up --build
```

## 服务地址

| 服务 | 地址 |
|------|------|
| 前端 | http://localhost:3100 |
| 后端 API | http://localhost:8100/api |
| PostgreSQL | localhost:5432 |

## 测试账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | 123456 | 管理员 |
| keeper | 123456 | 养蜂员 |

## 技术栈

- **Frontend**: React 18 + Vite + TypeScript + React Router v6
- **Backend**: Node.js Express + TypeScript + Prisma ORM
- **Database**: PostgreSQL 15
- **Auth**: JWT + bcrypt
- **部署**: Docker Compose（前端 Nginx 反代 `/api`）

## 功能模块

1. **登录认证**：管理员 / 养蜂员角色，JWT 鉴权
2. **蜂场 Apiary**：名称、位置、海拔、备注 — 完整 CRUD
3. **蜂箱 Hive**：所属蜂场、箱号、蜂种、蜂王年份、状态（active / quarantine / empty）— 完整 CRUD
4. **巡检 Inspection**：蜂箱、日期、群势分数 1-5、螨虫计数、蜜脾数、备注 — 完整 CRUD
5. **采蜜批次 Harvest**：蜂场、日期、蜜种、净重 kg、含水量 %、状态（stored / bottled）— 完整 CRUD
6. **仪表盘**：蜂箱总数、本月巡检数、待处理隔离蜂箱数、近 30 日采蜜总量

## 目录结构

```
HiveLedger/
├── docker-compose.yml
├── README.md
├── .gitignore
├── backend/
│   ├── Dockerfile
│   ├── docker-entrypoint.sh
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── index.ts
│       ├── middleware/auth.ts
│       ├── routes/
│       │   ├── auth.ts
│       │   ├── apiaries.ts
│       │   ├── hives.ts
│       │   ├── inspections.ts
│       │   ├── harvests.ts
│       │   └── dashboard.ts
│       └── utils/
│           ├── jwt.ts
│           └── prisma.ts
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── App.tsx
        ├── main.tsx
        ├── index.css
        ├── api/client.ts
        ├── contexts/AuthContext.tsx
        ├── components/Layout.tsx
        └── pages/
            ├── Login.tsx
            ├── Dashboard.tsx
            ├── Apiaries.tsx
            ├── Hives.tsx
            ├── Inspections.tsx
            └── Harvests.tsx
```

## API 前缀

所有接口以 `/api` 开头，例如：

- `POST /api/auth/login`
- `GET/POST /api/apiaries`
- `GET/POST /api/hives`
- `GET/POST /api/inspections`
- `GET/POST /api/harvests`
- `GET /api/dashboard`

## 环境变量（docker-compose 注入）

```
DATABASE_URL=postgresql://postgres:postgres@db:5432/hiveledger
JWT_SECRET=hiveledger_dev_secret
PORT=3001
```

## 说明

- 后端容器启动时执行 `prisma db push` 并运行 seed，写入演示蜂场、蜂箱、巡检与采蜜数据。
- npm 依赖安装使用淘宝镜像 `registry.npmmirror.com`。
- 前端 Nginx 将 `/api/` 反向代理到 `http://backend:3001`。
