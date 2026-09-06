const { test, expect } = require('@playwright/test');

test('admin login and dashboard load', async ({ page }) => {
  await page.goto('http://localhost:8000/index.html');
  await expect(page).toHaveTitle(/HAGO Noticias/i);

  await page.goto('http://localhost:8000/admin/login.html');
  await page.getByLabel(/correo|email/i).fill('adminhag@gmail.com');
  await page.getByLabel(/contraseña|password/i).fill('CAÑOLA2027*');
  await page.getByRole('button', { name: /iniciar sesión|entrar|login/i }).click();

  await expect(page).toHaveURL(/\/admin\/dashboard\.html/);
  await expect(page.locator('h2').first()).toContainText(/panel|administrativo|dashboard/i);
});
