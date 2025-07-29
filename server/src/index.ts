import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import chatRoute from './routes/chat';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', chatRoute);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
