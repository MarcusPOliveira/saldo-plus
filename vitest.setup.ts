import { beforeEach, vi } from 'vitest'

// Mock de redirecionamento e navegação do Next.js
vi.mock('next/navigation', () => {
  return {
    redirect: vi.fn((url: string) => {
      throw new Error(`NEXT_REDIRECT: ${url}`)
    }),
    useRouter: vi.fn(() => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
    })),
    usePathname: vi.fn(() => '/'),
    useSearchParams: vi.fn(() => new URLSearchParams()),
  }
})

// Mock de cache do Next.js
vi.mock('next/cache', () => {
  return {
    revalidatePath: vi.fn(),
    revalidateTag: vi.fn(),
  }
})

// Mock de headers do Next.js
vi.mock('next/headers', () => {
  return {
    headers: vi.fn().mockResolvedValue(new Headers()),
    cookies: vi.fn().mockResolvedValue({
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
    }),
  }
})

beforeEach(() => {
  vi.clearAllMocks()
})
