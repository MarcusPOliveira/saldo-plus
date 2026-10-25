import { expect, test } from '@playwright/test'

test.describe('Autenticação e Proteção de Rotas', () => {
  const protectedRoutes = [
    '/dashboard',
    '/transactions',
    '/settings',
    '/wizard',
  ]

  for (const route of protectedRoutes) {
    test(`deve redirecionar usuário não autenticado de ${route} para /sign-in`, async ({
      page,
    }) => {
      await page.goto(route)

      await expect(page).toHaveURL(/\/sign-in/)
      await expect(page.getByText('Entrar no Saldo+')).toBeVisible()
    })
  }

  test('deve renderizar a tela de login social com Google corretamente', async ({
    page,
  }) => {
    await page.goto('/sign-in')

    await expect(page.getByText('Entrar no Saldo+')).toBeVisible()
    await expect(
      page.getByText('Acesse sua conta com segurança usando sua conta Google.')
    ).toBeVisible()

    const googleButton = page.getByRole('button', {
      name: /Continuar com Google/i,
    })
    await expect(googleButton).toBeVisible()
    await expect(googleButton).toBeEnabled()
  })

  test('deve disparar a requisição de login social ao clicar no botão do Google', async ({
    page,
  }) => {
    await page.goto('/sign-in')

    let socialAuthRequested = false

    await page.route('**/api/auth/**', async (route) => {
      const request = route.request()
      if (
        request.url().includes('sign-in/social') ||
        request.url().includes('social')
      ) {
        socialAuthRequested = true
        // Simula resposta com URL de redirecionamento ou sucesso
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            url: 'https://accounts.google.com/o/oauth2/v2/auth',
            redirect: false,
          }),
        })
      } else {
        await route.continue()
      }
    })

    const googleButton = page.getByRole('button', {
      name: /Continuar com Google/i,
    })
    await googleButton.click()

    await expect.poll(() => socialAuthRequested).toBe(true)
  })
})
