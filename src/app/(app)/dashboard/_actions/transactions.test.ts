import { redirect } from 'next/navigation'
import { describe, expect, it } from 'vitest'

import { mockCurrentUser, mockUnauthenticatedUser } from '@/tests/mocks/auth'
import { prismaMock } from '@/tests/mocks/prisma'

import { CreateTransaction, EditTransaction } from './transactions'

describe('Transactions Server Actions', () => {
  describe('CreateTransaction', () => {
    it('deve redirecionar para /sign-in se o usuário não estiver autenticado', async () => {
      mockUnauthenticatedUser()

      await expect(
        CreateTransaction({
          amount: 150.0,
          category: 'Alimentação',
          date: new Date('2025-05-15T12:00:00Z'),
          description: 'Almoço',
          type: 'expense',
        })
      ).rejects.toThrow('NEXT_REDIRECT: /sign-in')

      expect(redirect).toHaveBeenCalledWith('/sign-in')
    })

    it('deve lançar erro se o schema for inválido', async () => {
      mockCurrentUser()

      await expect(
        CreateTransaction({
          amount: -50, // amount deve ser positivo
          category: 'Alimentação',
          date: new Date(),
          type: 'expense',
        })
      ).rejects.toThrow()
    })

    it('deve lançar erro se a categoria não existir para o usuário', async () => {
      mockCurrentUser({ id: 'user-123' })
      prismaMock.category.findFirst.mockResolvedValue(null)

      await expect(
        CreateTransaction({
          amount: 100,
          category: 'Inexistente',
          date: new Date(),
          type: 'income',
        })
      ).rejects.toThrow('Categoria não encontrada')
    })

    it('deve criar a transação e atualizar agregações com sucesso', async () => {
      mockCurrentUser({ id: 'user-123' })

      prismaMock.category.findFirst.mockResolvedValue({
        name: 'Salário',
        icon: '💵',
        type: 'income',
        userId: 'user-123',
        createdAt: new Date(),
      })

      prismaMock.$transaction.mockImplementation(async () => [])

      const testDate = new Date('2025-05-15T10:00:00Z')

      await CreateTransaction({
        amount: 2500.5,
        category: 'Salário',
        date: testDate,
        description: 'Salário mensal',
        type: 'income',
      })

      expect(prismaMock.category.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          name: 'Salário',
        },
      })

      expect(prismaMock.$transaction).toHaveBeenCalled()
    })
  })

  describe('EditTransaction', () => {
    it('deve lançar erro se a transação antiga não for encontrada', async () => {
      mockCurrentUser({ id: 'user-123' })

      prismaMock.category.findFirst.mockResolvedValue({
        name: 'Transporte',
        icon: '🚗',
        type: 'expense',
        userId: 'user-123',
        createdAt: new Date(),
      })

      prismaMock.transaction.findUnique.mockResolvedValue(null)

      await expect(
        EditTransaction({
          id: 'tx-not-found',
          amount: 50,
          category: 'Transporte',
          date: new Date(),
          type: 'expense',
        })
      ).rejects.toThrow('Transação não encontrada')
    })

    it('deve atualizar a transação com sucesso', async () => {
      mockCurrentUser({ id: 'user-123' })

      const oldDate = new Date('2025-05-10T10:00:00Z')
      const newDate = new Date('2025-05-12T10:00:00Z')

      prismaMock.category.findFirst.mockResolvedValue({
        name: 'Transporte',
        icon: '🚗',
        type: 'expense',
        userId: 'user-123',
        createdAt: new Date(),
      })

      prismaMock.transaction.findUnique.mockResolvedValue({
        id: 'tx-123',
        amount: 30,
        category: 'Transporte',
        categoryIcon: '🚗',
        date: oldDate,
        description: 'Gasolina',
        type: 'expense',
        userId: 'user-123',
        bankId: null,
        paymentMethod: null,
        createdAt: oldDate,
        updatedAt: oldDate,
      })

      prismaMock.$transaction.mockImplementation(async () => [])

      await EditTransaction({
        id: 'tx-123',
        amount: 50,
        category: 'Transporte',
        date: newDate,
        description: 'Gasolina e pedágio',
        type: 'expense',
      })

      expect(prismaMock.$transaction).toHaveBeenCalled()
    })
  })
})
