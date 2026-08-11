import express from 'express';
import dotenv from 'dotenv'

dotenv.config();

const port = process.env.PORT || 5000;

const app = express();
app.use(express.json());

app.get("/", (req, res) => { 
    res.json({message:"This main route"})
})

app.listen(port, () => { 
    console.log(`server is running ${port}`)
})