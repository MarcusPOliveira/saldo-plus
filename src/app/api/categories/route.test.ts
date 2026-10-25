import { redirect } from 'next/navigation'
import { describe, expect, it } from 'vitest'

import { mockCurrentUser, mockUnauthenticatedUser } from '@/tests/mocks/auth'
import { prismaMock } from '@/tests/mocks/prisma'

import { GET } from './route'

describe('API: /api/categories', () => {
  it('deve redirecionar para /sign-in se não autenticado', async () => {
    mockUnauthenticatedUser()

    const request = new Request('http://localhost:3000/api/categories')

    await expect(GET(request)).rejects.toThrow('NEXT_REDIRECT: /sign-in')
    expect(redirect).toHaveBeenCalledWith('/sign-in')
  })

  it('deve retornar status 400 se o query param type for inválido', async () => {
    mockCurrentUser()

    const request = new Request(
      'http://localhost:3000/api/categories?type=invalido'
    )
    const response = await GET(request)

    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.issues).toBeDefined()
  })

  it('deve retornar todas as categorias quando type não for informado', async () => {
    mockCurrentUser({ id: 'user-123' })

    const mockCategories = [
      {
        name: 'Alimentação',
        icon: '🍔',
        type: 'expense',
        userId: 'user-123',
        createdAt: new Date(),
      },
      {
        name: 'Salário',
        icon: '💰',
        type: 'income',
        userId: 'user-123',
        createdAt: new Date(),
      },
    ]

    prismaMock.category.findMany.mockResolvedValue(mockCategories)

    const request = new Request('http://localhost:3000/api/categories')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(prismaMock.category.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-123',
      },
      orderBy: {
        name: 'asc',
      },
    })

    const json = await response.json()
    expect(json).toEqual(JSON.parse(JSON.stringify(mockCategories)))
  })

  it('deve filtrar categorias por type quando fornecido', async () => {
    mockCurrentUser({ id: 'user-123' })

    const mockExpenseCategories = [
      {
        name: 'Alimentação',
        icon: '🍔',
        type: 'expense',
        userId: 'user-123',
        createdAt: new Date(),
      },
    ]

    prismaMock.category.findMany.mockResolvedValue(mockExpenseCategories)

    const request = new Request(
      'http://localhost:3000/api/categories?type=expense'
    )
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(prismaMock.category.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-123',
        type: 'expense',
      },
      orderBy: {
        name: 'asc',
      },
    })
  })
})
