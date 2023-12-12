import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("Connected to database");
  } catch (e) {
    console.error(e);
    setTimeout(() => connectDB(), 5000);
  } finally {
    await prisma.$disconnect();
  }
};

export default connectDB;
