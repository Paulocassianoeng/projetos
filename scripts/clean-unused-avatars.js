// Script para remover avatares não utilizados
// Execute com: node scripts/clean-unused-avatars.js

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const AVATAR_DIR = path.join(__dirname, '../server/uploads/avatars');

async function main() {
  // Busca todos os avatares em uso no banco
  const users = await prisma.user.findMany({ select: { avatar: true } });
  const usedAvatars = new Set(users.map(u => u.avatar && path.basename(u.avatar)).filter(Boolean));

  // Lista todos os arquivos na pasta de avatares
  const files = fs.readdirSync(AVATAR_DIR);
  let removed = 0;
  for (const file of files) {
    if (!usedAvatars.has(file)) {
      fs.unlinkSync(path.join(AVATAR_DIR, file));
      removed++;
      console.log('Removido:', file);
    }
  }
  console.log(`Limpeza concluída. ${removed} arquivos removidos.`);
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
