import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Limpiando base de datos... ---');
  // El orden es vital para evitar errores de claves foráneas
  await prisma.workoutLogEntry.deleteMany();
  await prisma.workoutLog.deleteMany();
  await prisma.routineExercise.deleteMany();
  await prisma.routine.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.user.deleteMany();

  console.log('--- Generando 50 ejercicios... ---');
  const muscleGroups = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core'];
  const exercises = [];
  for (let i = 0; i < 50; i++) {
    const ex = await prisma.exercise.create({
      data: {
        name: faker.commerce.productName(),
        description: faker.lorem.sentence(),
        muscleGroup: faker.helpers.arrayElement(muscleGroups),
      },
    });
    exercises.push(ex);
  }

  console.log('--- Generando 20 ingredientes únicos... ---');
  const ingredients = [];
  // Usamos un Set para asegurar nombres únicos ya que tu schema tiene @unique en name
  const uniqueIngredientNames = new Set<string>();
  while (uniqueIngredientNames.size < 20) {
    uniqueIngredientNames.add(faker.food.ingredient());
  }

  for (const name of uniqueIngredientNames) {
    const ing = await prisma.ingredient.create({ data: { name } });
    ingredients.push(ing);
  }

  console.log('--- Generando 15 recetas con macros... ---');
  const mealTypes = ['Desayuno', 'Almuerzo', 'Cena', 'Snack'];
  for (let i = 0; i < 15; i++) {
    await prisma.recipe.create({
      data: {
        title: faker.food.dish(),
        instructions: faker.lorem.paragraph(),
        prepTime: faker.number.int({ min: 10, max: 60 }),
        type: faker.helpers.arrayElement(mealTypes),
        calories: faker.number.int({ min: 200, max: 800 }),
        protein: faker.number.float({ min: 10, max: 50, fractionDigits: 1 }),
        carbs: faker.number.float({ min: 20, max: 70, fractionDigits: 1 }),
        fat: faker.number.float({ min: 5, max: 25, fractionDigits: 1 }),
        ingredients: {
          connect: faker.helpers.arrayElements(ingredients, { min: 2, max: 4 }).map(ing => ({ id: ing.id })),
        },
      },
    });
  }

  console.log('--- Creando usuario y 5 rutinas... ---');
  const user = await prisma.user.create({
    data: {
      email: 'demo@fitmentor.com',
      password: '123',
      name: 'Alvaro',
      weight: 75.5,
      goal: 'Ganancia',
    },
  });

  const levels = ['Principiante', 'Intermedio', 'Avanzado'];
  const objectives = ['Adaptacion', 'Fuerza', 'Hipertrofia'];

  for (let i = 0; i < 5; i++) {
    const routine = await prisma.routine.create({
      data: {
        name: `Rutina ${faker.word.adjective()} ${i + 1}`,
        level: faker.helpers.arrayElement(levels),
        objective: faker.helpers.arrayElement(objectives),
      },
    });

    // Añadir 4 ejercicios aleatorios a cada rutina
    const selectedEx = faker.helpers.arrayElements(exercises, 4);
    for (const ex of selectedEx) {
      await prisma.routineExercise.create({
        data: {
          routineId: routine.id,
          exerciseId: ex.id,
          sets: faker.number.int({ min: 2, max: 3 }),
          reps: "6-10",
        },
      });
    }
  }

  console.log('✅ ¡Seed completado con éxito!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });