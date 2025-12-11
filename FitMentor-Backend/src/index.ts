import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/routines', async (req, res) => {
  try {
    const routines = await prisma.routine.findMany({
      include: { exercises: { include: { exercise: true } } },
    });
    res.json(routines);
  } catch (error) { res.status(500).json({ error: 'Error' }); }
});

app.get('/recipes', async (req, res) => {
  const { ingredient } = req.query;
  try {
    const recipes = await prisma.recipe.findMany({
      where: ingredient ? { ingredients: { some: { name: { contains: String(ingredient) } } } } : {},
      include: { ingredients: true },
    });
    res.json(recipes);
  } catch (error) { res.status(500).json({ error: 'Error' }); }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor listo en puerto ${PORT}`);
});
