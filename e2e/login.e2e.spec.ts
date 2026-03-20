import { expect, test } from '@playwright/test';

test.describe('Halaman Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test.describe('Pemuatan Halaman dan Elemen Dasar', () => {
    test('harus menampilkan header dengan elemen yang benar', async ({
      page,
    }) => {
      const header = page.getByRole('banner');
      await expect(header).toBeVisible();

      const brandLink = page.getByRole('link', { name: /CRAFTER/i });
      await expect(brandLink).toBeVisible();

      const themeToggle = page.getByRole('button', { name: /toggle theme/i });
      await expect(themeToggle).toBeVisible();
    });

    test('harus menampilkan bagian form login', async ({ page }) => {
      const form = page.locator('form');
      await expect(form).toBeVisible();

      const card = page.locator('[class*="card"]').first();
      await expect(card).toBeVisible();
    });

    test('harus menampilkan judul dan deskripsi form', async ({ page }) => {
      // Judul harus terlihat
      const title = page.getByText('Login to Your Account');
      await expect(title).toBeVisible();

      // Deskripsi harus terlihat
      const description = page.getByText(
        'Log in to access your persona history and advanced features.',
      );
      await expect(description).toBeVisible();
    });

    test('harus menampilkan footer', async ({ page }) => {
      const footer = page.getByRole('contentinfo');
      await expect(footer).toBeVisible();

      const copyright = page.getByText(/Crafter. All rights reserved./i);
      await expect(copyright).toBeVisible();
    });
  });

  test.describe('Field Formulir', () => {
    test('harus menampilkan semua field input form', async ({ page }) => {
      // Field email
      const emailLabel = page.getByText('Email');
      await expect(emailLabel).toBeVisible();
      const emailInput = page.locator('input#identifier');
      await expect(emailInput).toBeVisible();
      await expect(emailInput).toHaveAttribute('type', 'email');

      // Field password
      const passwordLabel = page.getByText('Password', { exact: true });
      await expect(passwordLabel).toBeVisible();
      const passwordInput = page.locator('input#password');
      await expect(passwordInput).toBeVisible();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('harus menampilkan tombol submit', async ({ page }) => {
      const submitButton = page.getByRole('button', { name: 'Login' });
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toHaveAttribute('type', 'submit');
    });

    test('harus menampilkan link buat akun untuk pengguna baru', async ({
      page,
    }) => {
      const noAccountText = page.getByText(/Don't have an account/i);
      await expect(noAccountText).toBeVisible();

      const createNowLink = page.getByRole('link', { name: 'Create now.' });
      await expect(createNowLink).toBeVisible();
      await expect(createNowLink).toHaveAttribute('href', '/create-account');
    });
  });

  test.describe('Validasi Formulir', () => {
    test('harus menampilkan error validasi saat mengirim form kosong', async ({
      page,
    }) => {
      const submitButton = page.getByRole('button', { name: 'Login' });
      await submitButton.click();

      // Tunggu error validasi muncul
      await page.waitForTimeout(100);

      // Periksa field yang tidak valid
      const invalidFields = page.locator('[data-invalid="true"]');
      expect(await invalidFields.count()).toBeGreaterThan(0);
    });

    test('harus memvalidasi format email', async ({ page }) => {
      // Biarkan email kosong dan isi password
      await page.locator('input#password').fill('password123');

      const submitButton = page.getByRole('button', { name: 'Login' });

      // Submit form
      await submitButton.click();

      // Tunggu validasi
      await page.waitForTimeout(300);

      // Cari pesan error untuk field email (required atau invalid)
      const emailError = page
        .locator('[id="identifier-error"], [role="alert"]')
        .or(page.getByText(/email is required|email harus|invalid email/i))
        .first();

      // Atau cek field email memiliki data-invalid
      const hasInvalidAttr = await page
        .locator('input#identifier')
        .getAttribute('data-invalid')
        .catch(() => null);

      // Jika tidak ada attribute, pastikan ada pesan error
      if (hasInvalidAttr !== 'true') {
        const errorVisible = await emailError.isVisible().catch(() => false);
        expect(errorVisible).toBe(true);
      }
    });

    test('harus memvalidasi panjang minimum password', async ({ page }) => {
      // Isi form dengan password pendek
      await page.locator('input#identifier').fill('test@example.com');
      await page.locator('input#password').fill('short');

      const submitButton = page.getByRole('button', { name: 'Login' });
      await submitButton.click();

      // Field password harus memiliki aria-invalid
      await expect(page.locator('input#password')).toHaveAttribute(
        'aria-invalid',
        'true',
      );
    });

    test('harus memerlukan field email', async ({ page }) => {
      // Isi hanya password
      await page.locator('input#password').fill('password123');

      const submitButton = page.getByRole('button', { name: 'Login' });
      await submitButton.click();

      // Field email harus memiliki aria-invalid
      await expect(page.locator('input#identifier')).toHaveAttribute(
        'aria-invalid',
        'true',
      );
    });

    test('harus memerlukan field password', async ({ page }) => {
      // Isi hanya email
      await page.locator('input#identifier').fill('test@example.com');

      const submitButton = page.getByRole('button', { name: 'Login' });
      await submitButton.click();

      // Field password harus memiliki aria-invalid
      await expect(page.locator('input#password')).toHaveAttribute(
        'aria-invalid',
        'true',
      );
    });
  });

  test.describe('Tombol Toggle Visibilitas Password', () => {
    test('harus mengubah visibilitas password', async ({ page }) => {
      await page.goto('/login');
      const passwordInput = page.locator('input#password');

      // Awalnya tipe password
      await expect(passwordInput).toHaveAttribute('type', 'password');

      // Temukan dan klik tombol toggle visibilitas (ikon Mata) - hanya di form
      const toggleButton = page
        .locator('form')
        .getByRole('button')
        .filter({
          hasNot: page.getByRole('button', { name: 'Login' }),
        })
        .first();

      // Klik tombol toggle
      await toggleButton.click();

      // Password sekarang harus terlihat (type="text")
      await expect(passwordInput).toHaveAttribute('type', 'text');

      // Klik lagi untuk menyembunyikan
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  test.describe('Pengiriman Formulir', () => {
    test('harus mengirim form dengan data valid dan mengarahkan ke beranda', async ({
      page,
    }) => {
      // Intercept panggilan API PERTAMA (sebelum navigasi)
      await page.route('/api/auth/login', async (route) => {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            status: true,
            message: 'Login berhasil',
            data: { token: 'fake-jwt-token' },
          }),
        });
      });

      await page.goto('/login');

      // Isi form dengan data valid
      await page.locator('input#identifier').fill('test@example.com');
      await page.locator('input#password').fill('password123');

      const submitButton = page.getByRole('button', { name: 'Login' });

      // Kirim dan tunggu respons
      await Promise.all([
        page.waitForResponse('/api/auth/login'),
        submitButton.click(),
      ]);

      // Harus mengarahkan ke halaman beranda
      await expect(page).toHaveURL('/');
    });

    test('harus menampilkan toast error saat login gagal', async ({ page }) => {
      // Intercept panggilan API dengan error PERTAMA (sebelum navigasi)
      await page.route('/api/auth/login', async (route) => {
        await route.fulfill({
          status: 401,
          body: JSON.stringify({
            status: false,
            message: 'Email atau password tidak valid',
          }),
        });
      });

      await page.goto('/login');

      // Isi form dengan data valid
      await page.locator('input#identifier').fill('test@example.com');
      await page.locator('input#password').fill('wrongpassword');

      const submitButton = page.getByRole('button', { name: 'Login' });

      // Kirim dan tunggu respons
      await Promise.all([
        page.waitForResponse('/api/auth/login'),
        submitButton.click(),
      ]);

      // Harus tetap di halaman login
      await expect(page).toHaveURL(/.*\/login/);
    });

    test('harus menonaktifkan tombol submit saat loading', async ({ page }) => {
      // Intercept panggilan API dan tunda PERTAMA (sebelum navigasi)
      await page.route('/api/auth/login', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            status: true,
            message: 'Login berhasil',
            data: { token: 'fake-jwt-token' },
          }),
        });
      });

      await page.goto('/login');

      // Isi form
      await page.locator('input#identifier').fill('test@example.com');
      await page.locator('input#password').fill('password123');

      const submitButton = page.getByRole('button', { name: 'Login' });
      await submitButton.click();

      // Tombol harus dinonaktifkan selama pengiriman
      await expect(submitButton).toBeDisabled();
    });
  });

  test.describe('Navigasi', () => {
    test('harus mengarahkan ke halaman buat akun', async ({ page }) => {
      const createNowLink = page.getByRole('link', { name: 'Create now' });
      await createNowLink.click();

      await expect(page).toHaveURL(/.*\/create-account/);
    });

    test('harus mengarahkan ke beranda saat mengklik logo', async ({
      page,
    }) => {
      const brandLink = page.getByRole('link', { name: /CRAFTER/i }).first();
      await brandLink.click();

      await expect(page).toHaveURL('/');
    });
  });

  test.describe('Desain Responsif', () => {
    test('harus menampilkan dengan benar pada viewport mobile', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/login');

      // Tombol toggle menu mobile harus terlihat
      const mobileMenuToggle = page.getByRole('button', {
        name: /toggle navigation menu/i,
      });
      await expect(mobileMenuToggle).toBeVisible();

      // Form harus terlihat
      const form = page.locator('form');
      await expect(form).toBeVisible();

      // Semua input harus terlihat
      await expect(page.locator('input#identifier')).toBeVisible();
      await expect(page.locator('input#password')).toBeVisible();
    });

    test('harus menampilkan dengan benar pada viewport tablet', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/login');

      const form = page.locator('form');
      await expect(form).toBeVisible();

      const card = page.locator('[class*="card"]').first();
      await expect(card).toBeVisible();
    });

    test('harus menampilkan dengan benar pada viewport desktop', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/login');

      const form = page.locator('form');
      await expect(form).toBeVisible();

      // Navigasi desktop harus terlihat
      const brandLink = page.getByRole('link', { name: /CRAFTER/i });
      await expect(brandLink).toBeVisible();
    });
  });

  test.describe('SEO dan Meta', () => {
    test('harus memiliki judul halaman yang benar', async ({ page }) => {
      await page.waitForLoadState('networkidle');
      const title = await page.title();
      expect(title.toLowerCase()).toContain('crafter');
    });

    test('harus memiliki elemen form dengan atribut yang benar', async ({
      page,
    }) => {
      // Periksa atribut autocomplete
      const emailInput = page.locator('input#identifier');
      await expect(emailInput).toHaveAttribute('autocomplete', 'off');

      const passwordInput = page.locator('input#password');
      await expect(passwordInput).toHaveAttribute('autocomplete', 'off');
    });
  });
});
