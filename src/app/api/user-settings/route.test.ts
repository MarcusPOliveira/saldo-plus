import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { describe, expect, it } from 'vitest'

import { mockCurrentUser, mockUnauthenticatedUser } from '@/tests/mocks/auth'
import { prismaMock } from '@/tests/mocks/prisma'

import { GET } from './route'

describe('API: /api/user-settings', () => {
  it('deve redirecionar para /sign-in se não autenticado', async () => {
    mockUnauthenticatedUser()

    const request = new Request('http://localhost:3000/api/user-settings')

    await expect(GET(request)).rejects.toThrow('NEXT_REDIRECT: /sign-in')
    expect(redirect).toHaveBeenCalledWith('/sign-in')
  })

  it('deve retornar as configurações existentes se o usuário já possuir', async () => {
    mockCurrentUser({ id: 'user-123' })

    const existingSettings = {
      userId: 'user-123',
      currency: 'USD',
    }

    prismaMock.userSettings.findUnique.mockResolvedValue(existingSettings)

    const request = new Request('http://localhost:3000/api/user-settings')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(prismaMock.userSettings.findUnique).toHaveBeenCalledWith({
      where: { userId: 'user-123' },
    })
    expect(prismaMock.userSettings.create).not.toHaveBeenCalled()
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard')

    const json = await response.json()
    expect(json).toEqual(existingSettings)
  })

  it('deve criar e retornar as configurações com moeda padrão BRL caso o usuário não possua', async () => {
    mockCurrentUser({ id: 'user-123' })

    prismaMock.userSettings.findUnique.mockResolvedValue(null)

    const defaultSettings = {
      userId: 'user-123',
      currency: 'BRL',
    }

    prismaMock.userSettings.create.mockResolvedValue(defaultSettings)

    const request = new Request('http://localhost:3000/api/user-settings')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(prismaMock.userSettings.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-123',
        currency: 'BRL',
      },
    })

    const json = await response.json()
    expect(json).toEqual(defaultSettings)
  })
})
