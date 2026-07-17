import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { loginSchema } from '@hisab-kitab/shared';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Example route using shared DB and schema
app.post('/api/test', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    res.json({ message: 'Valid input', data });
  } catch (error) {
    res.status(400).json({ error });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
