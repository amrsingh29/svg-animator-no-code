import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const animations = await prisma.savedSVG.findMany({
        where: { title: "My spining cat" },
        select: { id: true, title: true, createdAt: true }
    });
    console.log(JSON.stringify(animations, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
