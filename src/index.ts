import express from "express";
import cors from "cors";
import subjectsRouter from "./routes/subjects";

const app = express();
const port = process.env.PORT || 8000;

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}))

app.use(express.json());
app.use('/api/subjects', subjectsRouter)

app.get('/', (req, res) => {
    res.send('Hello, Welcome to the classroom API!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});