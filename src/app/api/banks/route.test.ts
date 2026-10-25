import { Prisma } from '@prisma/client'
import { redirect } from 'next/navigation'
import { describe, expect, it } from 'vitest'

import { mockCurrentUser, mockUnauthenticatedUser } from '@/tests/mocks/auth'
import { prismaMock } from '@/tests/mocks/prisma'

import { DELETE, GET, POST } from './route'

describe('API: /api/banks', () => {
  describe('GET', () => {
    it('deve redirecionar para /sign-in se não autenticado', async () => {
      mockUnauthenticatedUser()

      const request = new Request('http://localhost:3000/api/banks')
      await expect(GET(request)).rejects.toThrow('NEXT_REDIRECT: /sign-in')
      expect(redirect).toHaveBeenCalledWith('/sign-in')
    })

    it('deve listar bancos ordenados por nome', async () => {
      mockCurrentUser({ id: 'user-123' })

      const mockBanks = [
        {
          id: 'b1',
          name: 'Banco Inter',
          userId: 'user-123',
          cardLimit: null,
          hasCard: false,
          invoiceDueDate: null,
          createdAt: new Date(),
        },
        {
          id: 'b2',
          name: 'Nubank',
          userId: 'user-123',
          cardLimit: 5000,
          hasCard: true,
          invoiceDueDate: 10,
          createdAt: new Date(),
        },
      ]

      prismaMock.bank.findMany.mockResolvedValue(mockBanks)

      const request = new Request('http://localhost:3000/api/banks')
      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(prismaMock.bank.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { name: 'asc' },
      })
      const json = await response.json()
      expect(json).toEqual(JSON.parse(JSON.stringify(mockBanks)))
    })
  })

  describe('POST', () => {
    it('deve retornar 400 se o corpo da requisição for inválido', async () => {
      mockCurrentUser()

      const request = new Request('http://localhost:3000/api/banks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('deve cadastrar um novo banco com sucesso', async () => {
      mockCurrentUser({ id: 'user-123' })

      const newBank = {
        id: 'b-new',
        name: 'Nubank',
        userId: 'user-123',
        cardLimit: 3000,
        hasCard: true,
        invoiceDueDate: 15,
        createdAt: new Date(),
      }

      prismaMock.bank.create.mockResolvedValue(newBank)

      const request = new Request('http://localhost:3000/api/banks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Nubank',
          cardLimit: 3000,
          hasCard: true,
          invoiceDueDate: 15,
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(200)
      const json = await response.json()
      expect(json).toEqual(JSON.parse(JSON.stringify(newBank)))
    })

    it('deve retornar 409 quando o banco já existir (P2002)', async () => {
      mockCurrentUser({ id: 'user-123' })

      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '6.4.1',
        }
      )

      prismaMock.bank.create.mockRejectedValue(prismaError)

      const request = new Request('http://localhost:3000/api/banks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Nubank',
          hasCard: false,
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(409)
      const json = await response.json()
      expect(json.message).toBe('Já existe um banco com este nome')
    })
  })

  describe('DELETE', () => {
    it('deve retornar 404 se o banco não for encontrado', async () => {
      mockCurrentUser({ id: 'user-123' })

      prismaMock.bank.findUnique.mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/banks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Banco Fantasma' }),
      })

      const response = await DELETE(request)
      expect(response.status).toBe(404)
      const json = await response.json()
      expect(json.message).toBe('Banco não encontrado')
    })

    it('deve remover o banco e desvincular transações', async () => {
      mockCurrentUser({ id: 'user-123' })

      const existingBank = {
        id: 'bank-1',
        name: 'Nubank',
        userId: 'user-123',
        cardLimit: null,
        hasCard: false,
        invoiceDueDate: null,
        createdAt: new Date(),
      }

      prismaMock.bank.findUnique.mockResolvedValue(existingBank)
      prismaMock.$transaction.mockImplementation(async () => [])

      const request = new Request('http://localhost:3000/api/banks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Nubank' }),
      })

      const response = await DELETE(request)
      expect(response.status).toBe(200)
      expect(prismaMock.$transaction).toHaveBeenCalled()
    })
  })
})
