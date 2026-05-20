import prisma from '../prisma';
import DEFAULT_LLM_MODELS from '../src/lib/llm-seed-data';

async function main() {
  for (const m of DEFAULT_LLM_MODELS) {
    await prisma.llm.upsert({
      where: { key: m.key },
      update: {
        label: m.label,
        description: (m as any).description || null,
        category: m.category || null,
      },
      create: {
        key: m.key,
        label: m.label,
        description: (m as any).description || null,
        category: m.category || null,
      },
    });
    console.log('Upserted', m.key);
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
