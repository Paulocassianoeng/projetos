import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 12)
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@agenda.com' },
    update: {},
    create: {
      email: 'demo@agenda.com',
      name: 'Usuário Demo',
      password: hashedPassword,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
    }
  })

  // Create user settings
  await prisma.userSettings.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      emailNotifications: true,
      pushNotifications: true,
      reminders: true,
      workingHoursStart: '09:00',
      workingHoursEnd: '18:00',
      timezone: 'America/Sao_Paulo',
      theme: 'light',
      language: 'pt-BR'
    }
  })

  // Create demo appointments
  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  await prisma.appointment.createMany({
    data: [
      {
        title: 'Reunião de Planejamento',
        description: 'Planejamento do projeto Q1 2024',
        startTime: new Date(tomorrow.setHours(9, 0, 0, 0)),
        endTime: new Date(tomorrow.setHours(10, 0, 0, 0)),
        location: 'Sala de Reuniões A',
        type: 'MEETING',
        priority: 'HIGH',
        status: 'SCHEDULED',
        userId: demoUser.id
      },
      {
        title: 'Revisar documentação',
        description: 'Revisar e atualizar documentação do produto',
        startTime: new Date(tomorrow.setHours(14, 0, 0, 0)),
        endTime: new Date(tomorrow.setHours(16, 0, 0, 0)),
        type: 'TASK',
        priority: 'MEDIUM',
        status: 'SCHEDULED',
        userId: demoUser.id
      },
      {
        title: 'Call com cliente',
        description: 'Apresentação da proposta para novo cliente',
        startTime: new Date(nextWeek.setHours(11, 0, 0, 0)),
        endTime: new Date(nextWeek.setHours(12, 0, 0, 0)),
        location: 'Online - Zoom',
        type: 'MEETING',
        priority: 'HIGH',
        status: 'SCHEDULED',
        userId: demoUser.id,
        aiSuggested: true
      },
      {
        title: 'Lembrete: Aniversário',
        description: 'Aniversário da Maria - comprar presente',
        startTime: new Date(nextWeek.setHours(12, 0, 0, 0)),
        endTime: new Date(nextWeek.setHours(12, 30, 0, 0)),
        type: 'REMINDER',
        priority: 'LOW',
        status: 'SCHEDULED',
        userId: demoUser.id
      }
    ]
  })

  console.log('✅ Seed completed successfully')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
