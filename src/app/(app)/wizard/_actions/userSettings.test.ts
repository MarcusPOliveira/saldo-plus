import { redirect } from 'next/navigation'
import { describe, expect, it } from 'vitest'

import { mockCurrentUser, mockUnauthenticatedUser } from '@/tests/mocks/auth'
import { prismaMock } from '@/tests/mocks/prisma'

import { UpdateUserCurrency } from './userSettings'

describe('UserSettings Server Action', () => {
  it('deve redirecionar para /sign-in se o usuário não estiver autenticado', async () => {
    mockUnauthenticatedUser()

    await expect(UpdateUserCurrency('BRL')).rejects.toThrow(
      'NEXT_REDIRECT: /sign-in'
    )
    expect(redirect).toHaveBeenCalledWith('/sign-in')
  })

  it('deve lançar erro se a moeda for inválida', async () => {
    mockCurrentUser()

    await expect(UpdateUserCurrency('MOEDA_INVALIDA')).rejects.toThrow()
  })

  it('deve atualizar a moeda com sucesso quando válida e usuário autenticado', async () => {
    mockCurrentUser({ id: 'user-123' })

    const mockUpdatedSettings = {
      userId: 'user-123',
      currency: 'USD',
    }

    prismaMock.userSettings.update.mockResolvedValue(mockUpdatedSettings)

    const result = await UpdateUserCurrency('USD')

    expect(prismaMock.userSettings.update).toHaveBeenCalledWith({
      where: {
        userId: 'user-123',
      },
      data: {
        currency: 'USD',
      },
    })
    expect(result).toEqual(mockUpdatedSettings)
  })
})
