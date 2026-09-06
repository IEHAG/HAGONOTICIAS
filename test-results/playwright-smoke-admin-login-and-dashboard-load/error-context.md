# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: playwright-smoke.spec.js >> admin login and dashboard load
- Location: playwright-smoke.spec.js:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByLabel(/correo|email/i)

```

# Page snapshot

```yaml
- generic [active] [ref=f1e1]:
  - button "" [ref=f1e2] [cursor=pointer]
  - generic [ref=f1e4]:
    - generic [ref=f1e5]:
      - img "HAGO Noticias" [ref=f1e6]
      - heading "Panel Administrativo" [level=3] [ref=f1e7]
      - paragraph [ref=f1e8]: Acceso exclusivo para administradores
    - generic [ref=f1e9]:
      - strong [ref=f1e10]: "Acceso de prueba:"
      - text: adminhag@gmail.com / CAÑOLA2027*
    - generic [ref=f1e11]:
      - generic [ref=f1e12]:
        - textbox " Usuario" [ref=f1e13]:
          - /placeholder: Usuario
        - generic:
          - generic: 
          - text: Usuario
      - generic [ref=f1e14]:
        - textbox " Contraseña" [ref=f1e15]:
          - /placeholder: Contraseña
        - generic:
          - generic: 
          - text: Contraseña
        - button "" [ref=f1e16] [cursor=pointer]
      - button " Iniciar Sesión" [ref=f1e18] [cursor=pointer]:
        - generic [ref=f1e19]: 
        - text: Iniciar Sesión
    - generic [ref=f1e21]:
      - generic [ref=f1e22]: 
      - text: Acceso seguro y protegido
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | 
  3  | test('admin login and dashboard load', async ({ page }) => {
  4  |   await page.goto('http://localhost:8000/index.html');
  5  |   await expect(page).toHaveTitle(/HAGO Noticias/i);
  6  | 
  7  |   await page.goto('http://localhost:8000/admin/login.html');
> 8  |   await page.getByLabel(/correo|email/i).fill('adminhag@gmail.com');
     |                                          ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  9  |   await page.getByLabel(/contraseña|password/i).fill('CAÑOLA2027*');
  10 |   await page.getByRole('button', { name: /iniciar sesión|entrar|login/i }).click();
  11 | 
  12 |   await expect(page).toHaveURL(/\/admin\/dashboard\.html/);
  13 |   await expect(page.locator('h2').first()).toContainText(/panel|administrativo|dashboard/i);
  14 | });
  15 | 
```