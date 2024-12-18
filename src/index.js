import express from 'express';
import cors from 'cors'
import userRoutes from "./routes/userRoutes.js"
// import {query} from './config/db.js';

const app = express();
const port= 3000;

app.use(cors());
app.use(express.json());

app.use('/api', userRoutes);

app.get('/', (req, res) => {
    res.send(`<h1> Hello backend </h1>`)
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});

