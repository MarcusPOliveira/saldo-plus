import { expect, test } from '@playwright/test'

test.describe('Landing Page', () => {
  test('deve carregar a página inicial com os elementos principais', async ({
    page,
  }) => {
    await page.goto('/')

    // Verifica a presença do título principal da Hero Section
    await expect(
      page.getByRole('heading', {
        name: /Controle suas finanças com facilidade e precisão/i,
      })
    ).toBeVisible()

    // Verifica botões de ação
    await expect(
      page.getByRole('button', { name: /Comece Agora/i })
    ).toBeVisible()
    await expect(page.getByRole('link', { name: 'Entrar' })).toBeVisible()
  })

  test('deve navegar para a página de login ao clicar em Entrar', async ({
    page,
  }) => {
    await page.goto('/')

    await page.getByRole('link', { name: 'Entrar' }).click()

    await expect(page).toHaveURL(/\/sign-in/)
    await expect(page.getByText('Entrar no Saldo+')).toBeVisible()
  })
})
