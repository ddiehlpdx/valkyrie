import express from 'express';
import cors from 'cors';
import db from '#models';
import jwt from 'jsonwebtoken';

const app = express();

app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    message: 'API Connected to database successfully.'
  });
});
