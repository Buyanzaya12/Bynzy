// import { PrismaClient } from "@/generated/prisma/client/client";
// import { PrismaPg } from "@prisma/adapter-pg";

// const adapter = new PrismaPg({
//   connectionString: process.env.DATABASE_URL!,
// });

// export const prisma = new PrismaClient({
//   adapter,
// });
// src/lib/prisma.ts
import { PrismaClient } from "../generated/client/client";

export const prisma = new PrismaClient({});
