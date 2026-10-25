import { redirect } from 'next/navigation'
import { describe, expect, it } from 'vitest'

import { mockCurrentUser, mockUnauthenticatedUser } from '@/tests/mocks/auth'
import { prismaMock } from '@/tests/mocks/prisma'

import { CreateCategory, DeleteCategory } from './categories'

describe('Categories Server Actions', () => {
  describe('CreateCategory', () => {
    it('deve redirecionar para /sign-in se o usuário não estiver autenticado', async () => {
      mockUnauthenticatedUser()

      await expect(
        CreateCategory({
          name: 'Salário',
          icon: '💰',
          type: 'income',
        })
      ).rejects.toThrow('NEXT_REDIRECT: /sign-in')

      expect(redirect).toHaveBeenCalledWith('/sign-in')
    })

    it('deve lançar erro se o schema for inválido', async () => {
      mockCurrentUser()

      await expect(
        CreateCategory({
          name: '', // nome vazio é inválido (min(1))
          icon: '💰',
          type: 'income',
        })
      ).rejects.toThrow('Bad request')
    })

    it('deve criar uma nova categoria com sucesso para o usuário autenticado', async () => {
      mockCurrentUser({ id: 'user-123' })

      const mockCreatedCategory = {
        name: 'Alimentação',
        icon: '🍔',
        type: 'expense',
        userId: 'user-123',
        createdAt: new Date(),
      }

      prismaMock.category.create.mockResolvedValue(mockCreatedCategory)

      const result = await CreateCategory({
        name: 'Alimentação',
        icon: '🍔',
        type: 'expense',
      })

      expect(prismaMock.category.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          name: 'Alimentação',
          icon: '🍔',
          type: 'expense',
        },
      })
      expect(result).toEqual(mockCreatedCategory)
    })
  })

  describe('DeleteCategory', () => {
    it('deve redirecionar para /sign-in se não autenticado', async () => {
      mockUnauthenticatedUser()

      await expect(
        DeleteCategory({
          name: 'Alimentação',
          type: 'expense',
        })
      ).rejects.toThrow('NEXT_REDIRECT: /sign-in')

      expect(redirect).toHaveBeenCalledWith('/sign-in')
    })

    it('deve lançar erro se o schema for inválido', async () => {
      mockCurrentUser()

      await expect(
        DeleteCategory({
          name: '',
          type: 'expense',
        })
      ).rejects.toThrow('Bad request')
    })

    it('deve deletar a categoria com sucesso do usuário autenticado', async () => {
      mockCurrentUser({ id: 'user-123' })

      const mockDeletedCategory = {
        name: 'Alimentação',
        icon: '🍔',
        type: 'expense',
        userId: 'user-123',
        createdAt: new Date(),
      }

      prismaMock.category.delete.mockResolvedValue(mockDeletedCategory)

      const result = await DeleteCategory({
        name: 'Alimentação',
        type: 'expense',
      })

      expect(prismaMock.category.delete).toHaveBeenCalledWith({
        where: {
          name_userId_type: {
            userId: 'user-123',
            name: 'Alimentação',
            type: 'expense',
          },
        },
      })
      expect(result).toEqual(mockDeletedCategory)
    })
  })
})
