import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const app = express();

// --- CONFIGURACIÓN ---
const PORT = 3000;

app.use(cors());
app.use(express.json());

// --- RUTAS DE USUARIO ---

// Registro de usuario
app.post('/register', async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  
  if (!email || !password) return res.status(400).json({ error: "Email y contraseña obligatorios" });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: { 
        email, 
        password: hashedPassword, 
        name,
        age: 0, 
        weight: 0, 
        height: 0, 
        goal: 'Mantenimiento' 
      },
    });
    
    res.status(201).json({ message: "Usuario creado con éxito", userId: user.id });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(400).json({ error: "El email ya existe o hay un problema con los datos." });
  }
});

// Login simplificado (Sin generación de Token)
app.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Ya no generamos JWT, solo devolvemos los datos del usuario
    res.json({ 
      message: "Login correcto",
      user: { id: user.id, email: user.email, name: user.name } 
    });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// --- RUTAS DE DATOS (AHORA PÚBLICAS) ---

// Obtener todas las rutinas (Se eliminó authenticateToken)
app.get('/routines', async (req: Request, res: Response) => {
  try {
    const routines = await prisma.routine.findMany({
      include: { 
        exercises: { 
          include: { exercise: true } 
        } 
      },
    });
    res.json(routines);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener rutinas" });
  }
});

// Obtener recetas (Se eliminó authenticateToken)
app.get('/recipes', async (req: Request, res: Response) => {
  const { ingredient } = req.query;
  
  try {
    const recipes = await prisma.recipe.findMany({
      where: ingredient ? {
        ingredients: { some: { name: { contains: String(ingredient) } } }
      } : {},
      include: { ingredients: true },
    });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener recetas" });
  }
});

// --- INICIO DEL SERVIDOR ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor de FitMentor (Sin Tokens) listo en: http://localhost:${PORT}`);
});