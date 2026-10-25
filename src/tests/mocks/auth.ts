import { vi } from 'vitest'

import * as authModule from '@/lib/auth'

export type CurrentUser = NonNullable<
  Awaited<ReturnType<typeof authModule.getCurrentUser>>
>

export const defaultMockUser: CurrentUser = {
  id: 'user-test-id-123',
  name: 'Test User',
  email: 'test@example.com',
  emailVerified: true,
  image: 'https://example.com/avatar.png',
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-01T00:00:00Z'),
}

export function mockCurrentUser(customUser?: Partial<CurrentUser>) {
  const user: CurrentUser = customUser
    ? { ...defaultMockUser, ...customUser }
    : defaultMockUser
  return vi.spyOn(authModule, 'getCurrentUser').mockResolvedValue(user)
}

export function mockUnauthenticatedUser() {
  return vi.spyOn(authModule, 'getCurrentUser').mockResolvedValue(null)
}
