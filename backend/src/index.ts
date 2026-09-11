import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import apiaryRoutes from './routes/apiaries';
import hiveRoutes from './routes/hives';
import inspectionRoutes from './routes/inspections';
import harvestRoutes from './routes/harvests';
import dashboardRoutes from './routes/dashboard';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'hiveledger' });
});

app.use('/api/auth', authRoutes);
app.use('/api/apiaries', apiaryRoutes);
app.use('/api/hives', hiveRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/harvests', harvestRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`HiveLedger backend listening on port ${PORT}`);
});
