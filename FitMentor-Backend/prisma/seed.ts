import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.workoutLogEntry.deleteMany().catch(() => {});
  await prisma.workoutLog.deleteMany().catch(() => {});
  await prisma.routineExercise.deleteMany().catch(() => {});
  await prisma.exercise.deleteMany().catch(() => {});
  await prisma.routine.deleteMany().catch(() => {});
  await prisma.recipe.deleteMany().catch(() => {});
  await prisma.ingredient.deleteMany().catch(() => {});
  await prisma.user.deleteMany().catch(() => {});

  const user = await prisma.user.create({
    data: { email: 'demo@fitmentor.com', password: '123', name: 'Alvaro', goal: 'Ganancia', weight: 75.5 },
  });

  const sentadilla = await prisma.exercise.create({ data: { name: 'Sentadilla', muscleGroup: 'Piernas' } });
  const extCuad = await prisma.exercise.create({ data: { name: 'Extension de Cuadriceps', muscleGroup: 'Piernas' } });
  const press = await prisma.exercise.create({ data: { name: 'Press Banca', muscleGroup: 'Pecho' } });

  await prisma.routine.create({
    data: {
      name: 'Full Body - Nivel 1',
      level: 'Principiante',
      objective: 'Adaptacion',
      exercises: {
        create: [
          { exerciseId: sentadilla.id, sets: 3, reps: '10-12' },
          { exerciseId: press.id, sets: 3, reps: '8-10' },
          { exerciseId: extCuad.id, sets: 4, reps: '12-15' },
        ],
      },
    },
  });

  const pollo = await prisma.ingredient.create({ data: { name: 'Pollo' } });
  const arroz = await prisma.ingredient.create({ data: { name: 'Arroz' } });

  await prisma.recipe.create({
    data: {
      title: 'Pollo al Curry Fit',
      instructions: 'Cocinar pollo y anadir curry.',
      prepTime: 20, type: 'Cena', calories: 450, protein: 35.5, carbs: 40.0, fat: 12.0,
      ingredients: { connect: [{ id: pollo.id }, { id: arroz.id }] },
    },
  });
  console.log('Seed completado.');
}
main().catch(e => console.error(e)).finally(async () => await prisma.$disconnect());
