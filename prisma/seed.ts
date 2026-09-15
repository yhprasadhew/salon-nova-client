import { PrismaClient, Prisma } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const userData: Prisma.UserCreateInput[] = [
  {
    email:"admin@nova.lk",
    firstName: "Admin",
    lastName: "Admin",
    password: "$2a$12$pZinME5.4TKdBL6ENcS1qurO.3BGkC6/IX.jsE5N4JK2J52tUTww2",
    role: "ADMIN",
    privilages:[],
    
  }
    

  
  
];

export async function main() {
  for (const u of userData) {
    await prisma.user.create({ data: u });
  }
}

main();