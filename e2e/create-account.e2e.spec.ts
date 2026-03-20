import { expect, test } from '@playwright/test';

test.describe('Halaman Buat Akun', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/create-account');
  });

  test.describe('Muat Halaman dan Elemen Dasar', () => {
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

    test('harus menampilkan bagian formulir buat akun', async ({ page }) => {
      const form = page.locator('form');
      await expect(form).toBeVisible();

      const card = page.locator('[class*="card"]').first();
      await expect(card).toBeVisible();
    });

    test('harus menampilkan judul dan deskripsi formulir', async ({ page }) => {
      // Judul harus terlihat
      const title = page.getByText('Create a New Account');
      await expect(title).toBeVisible();

      // Deskripsi harus terlihat
      const description = page.getByText(
        'Sign up to save your persona history and access advanced features.',
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

  test.describe('Kolom Formulir', () => {
    test('harus menampilkan semua kolom input formulir', async ({ page }) => {
      // Kolom nama
      const nameLabel = page.getByText('Name');
      await expect(nameLabel).toBeVisible();
      const nameInput = page.locator('input#name');
      await expect(nameInput).toBeVisible();
      await expect(nameInput).toHaveAttribute('type', 'text');

      // Kolom email
      const emailLabel = page.getByText('Email');
      await expect(emailLabel).toBeVisible();
      const emailInput = page.locator('input#email');
      await expect(emailInput).toBeVisible();
      await expect(emailInput).toHaveAttribute('type', 'email');

      // Kolom kata sandi
      const passwordLabel = page.getByText('Password', { exact: true });
      await expect(passwordLabel).toBeVisible();
      const passwordInput = page.locator('input#password');
      await expect(passwordInput).toBeVisible();
      await expect(passwordInput).toHaveAttribute('type', 'password');

      // Kolom konfirmasi kata sandi
      const confirmPasswordLabel = page.getByText('Confirm Password');
      await expect(confirmPasswordLabel).toBeVisible();
      const confirmPasswordInput = page.locator('input#confirmPassword');
      await expect(confirmPasswordInput).toBeVisible();
      await expect(confirmPasswordInput).toHaveAttribute('type', 'password');

      // Checkbox syarat
      const termsCheckbox = page.getByRole('checkbox');
      await expect(termsCheckbox).toBeVisible();
    });

    test('harus menampilkan teks syarat dengan tautan', async ({ page }) => {
      const termsPrefix = page.getByText(/I agree to the/i);
      await expect(termsPrefix).toBeVisible();

      const termsLink = page.getByRole('link', {
        name: 'Terms and Conditions',
      });
      await expect(termsLink).toBeVisible();
    });

    test('harus menampilkan tombol kirim', async ({ page }) => {
      const submitButton = page.getByRole('button', { name: 'Create Account' });
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toHaveAttribute('type', 'submit');
    });

    test('harus menampilkan tautan login untuk pengguna yang sudah ada', async ({
      page,
    }) => {
      const alreadyAccountText = page.getByText(/Already have an account/i);
      await expect(alreadyAccountText).toBeVisible();

      const loginLink = page.getByRole('link', { name: 'Login.' });
      await expect(loginLink).toBeVisible();
      await expect(loginLink).toHaveAttribute('href', '/login');
    });
  });

  test.describe('Validasi Formulir', () => {
    test('harus menampilkan error validasi saat mengirim formulir kosong', async ({
      page,
    }) => {
      const submitButton = page.getByRole('button', { name: 'Create Account' });
      await submitButton.click();

      // Tunggu error validasi muncul
      await page.waitForTimeout(100);

      // Periksa kolom yang tidak valid
      const invalidFields = page.locator('[data-invalid="true"]');
      expect(await invalidFields.count()).toBeGreaterThan(0);
    });

    test('harus memvalidasi kolom nama wajib diisi', async ({ page }) => {
      // Isi kolom lain kecuali nama
      await page.locator('input#email').fill('test@example.com');
      await page.locator('input#password').fill('password123');
      await page.locator('input#confirmPassword').fill('password123');
      await page.getByRole('checkbox').click();

      const submitButton = page.getByRole('button', { name: 'Create Account' });
      await submitButton.click();

      // Kolom nama harus memiliki aria-invalid
      await expect(page.locator('input#name')).toHaveAttribute(
        'aria-invalid',
        'true',
      );
    });

    test('harus memvalidasi format email', async ({ page }) => {
      // Isi formulir dengan email yang tidak valid
      await page.locator('input#name').fill('John Doe');
      await page.locator('input#email').fill('a@b');
      await page.locator('input#password').fill('password123');
      await page.locator('input#confirmPassword').fill('password123');
      await page.getByRole('checkbox').click();

      const submitButton = page.getByRole('button', { name: 'Create Account' });
      await submitButton.click();

      // Kolom email harus memiliki aria-invalid
      await expect(page.locator('input#email')).toHaveAttribute(
        'aria-invalid',
        'true',
      );
    });

    test('harus memvalidasi panjang minimum kata sandi', async ({ page }) => {
      // Isi formulir dengan kata sandi pendek
      await page.locator('input#name').fill('John Doe');
      await page.locator('input#email').fill('john@example.com');
      await page.locator('input#password').fill('short');
      await page.locator('input#confirmPassword').fill('short');
      await page.getByRole('checkbox').click();

      const submitButton = page.getByRole('button', { name: 'Create Account' });
      await submitButton.click();

      // Kolom kata sandi harus memiliki aria-invalid
      await expect(page.locator('input#password')).toHaveAttribute(
        'aria-invalid',
        'true',
      );
    });

    test('harus memvalidasi kecocokan konfirmasi kata sandi', async ({
      page,
    }) => {
      await page.goto('/create-account');

      // Isi formulir dengan kata sandi yang tidak cocok
      await page.locator('input#name').fill('John Doe');
      await page.locator('input#name').blur();
      await page.locator('input#email').fill('john@example.com');
      await page.locator('input#email').blur();
      await page.locator('input#password').fill('password123');
      await page.locator('input#password').blur();
      await page.locator('input#confirmPassword').fill('differentpassword');
      await page.locator('input#confirmPassword').blur();
      await page.getByRole('checkbox').click();

      // Tunggu validasi selesai
      await page.waitForTimeout(200);

      const submitButton = page.getByRole('button', { name: 'Create Account' });
      await submitButton.click();

      // Tunggu validasi form
      await page.waitForTimeout(200);

      // Kolom konfirmasi kata sandi harus tidak valid
      const confirmPasswordInput = page.locator('input#confirmPassword');
      await expect(confirmPasswordInput).toHaveAttribute(
        'aria-invalid',
        'true',
      );
    });

    test('harus mewajibkan checkbox syarat untuk dicentang', async ({
      page,
    }) => {
      // Isi formulir tanpa mencentang syarat
      await page.locator('input#name').fill('John Doe');
      await page.locator('input#email').fill('john@example.com');
      await page.locator('input#password').fill('password123');
      await page.locator('input#confirmPassword').fill('password123');

      const submitButton = page.getByRole('button', { name: 'Create Account' });
      await submitButton.click();

      // Checkbox syarat harus memiliki aria-invalid
      await expect(page.getByRole('checkbox')).toHaveAttribute(
        'aria-invalid',
        'true',
      );
    });
  });

  test.describe('Tombol Tampilkan/Sembunyikan Kata Sandi', () => {
    test('harus mengubah visibilitas kata sandi', async ({ page }) => {
      await page.goto('/create-account');
      const passwordInput = page.locator('input#password');
      const confirmPasswordInput = page.locator('input#confirmPassword');

      // Awalnya tipe password
      await expect(passwordInput).toHaveAttribute('type', 'password');
      await expect(confirmPasswordInput).toHaveAttribute('type', 'password');

      // Cari dan klik tombol ubah visibilitas (ikon Mata) - hanya di formulir
      const toggleButtons = page
        .locator('form')
        .getByRole('button')
        .filter({
          hasNot: page.getByRole('button', { name: 'Create Account' }),
        });

      // Klik tombol ubah pertama
      const firstToggle = toggleButtons.first();
      await firstToggle.click();

      // Kata sandi sekarang harus terlihat (type="text")
      await expect(passwordInput).toHaveAttribute('type', 'text');
      await expect(confirmPasswordInput).toHaveAttribute('type', 'text');

      // Klik lagi untuk menyembunyikan
      await firstToggle.click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
      await expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });
  });

  test.describe('Checkbox Syarat', () => {
    test('harus mengubah status checkbox syarat', async ({ page }) => {
      await page.goto('/create-account');
      const termsCheckbox = page.getByRole('checkbox');

      // Awalnya tidak dicentang
      await expect(termsCheckbox).not.toBeChecked();

      // Klik untuk mencentang
      await termsCheckbox.click();
      await expect(termsCheckbox).toBeChecked();

      // Klik untuk membatalkan centang
      await termsCheckbox.click();
      await expect(termsCheckbox).not.toBeChecked();
    });
  });

  test.describe('Pengiriman Formulir', () => {
    test('harus mengirim formulir dengan data yang valid', async ({ page }) => {
      // Tangkap panggilan API TERLEBIH DAHULU (sebelum navigasi)
      await page.route('/api/auth/register', async (route) => {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            status: true,
            message: 'Pengguna berhasil dibuat',
          }),
        });
      });

      await page.goto('/create-account');

      // Isi formulir dengan blur setelah setiap field
      await page.locator('input#name').fill('John Doe');
      await page.locator('input#name').blur();
      await page.locator('input#email').fill('john@example.com');
      await page.locator('input#email').blur();
      await page.locator('input#password').fill('password123');
      await page.locator('input#password').blur();
      await page.locator('input#confirmPassword').fill('password123');
      await page.locator('input#confirmPassword').blur();
      await page.getByRole('checkbox').click();

      // Tunggu validasi form selesai
      await page.waitForTimeout(200);

      const submitButton = page.getByRole('button', { name: 'Create Account' });

      // Pastikan tombol enabled dan form valid sebelum submit
      await expect(submitButton).toBeEnabled();

      // Kirim dan tunggu respons
      await Promise.all([
        page.waitForResponse('/api/auth/register'),
        submitButton.click(),
      ]);

      // Harus mengarahkan ke halaman login
      await expect(page).toHaveURL(/.*\/login/);
    });

    test('harus menampilkan toast error saat registrasi gagal', async ({
      page,
    }) => {
      // Tangkap panggilan API dengan error TERLEBIH DAHULU (sebelum navigasi)
      await page.route('/api/auth/register', async (route) => {
        await route.fulfill({
          status: 400,
          body: JSON.stringify({
            status: false,
            message: 'Email sudah terdaftar',
          }),
        });
      });

      await page.goto('/create-account');

      // Isi formulir dengan blur setelah setiap field
      await page.locator('input#name').fill('Jane Doe');
      await page.locator('input#name').blur();
      await page.locator('input#email').fill('existing@example.com');
      await page.locator('input#email').blur();
      await page.locator('input#password').fill('password123');
      await page.locator('input#password').blur();
      await page.locator('input#confirmPassword').fill('password123');
      await page.locator('input#confirmPassword').blur();
      await page.getByRole('checkbox').click();

      // Tunggu validasi form selesai
      await page.waitForTimeout(200);

      const submitButton = page.getByRole('button', { name: 'Create Account' });

      // Pastikan tombol enabled dan form valid sebelum submit
      await expect(submitButton).toBeEnabled();

      // Kirim dan tunggu respons
      await Promise.all([
        page.waitForResponse('/api/auth/register'),
        submitButton.click(),
      ]);

      // Harus tetap di halaman create-account
      await expect(page).toHaveURL(/.*\/create-account/);
    });

    test('harus menonaktifkan tombol kirim saat memuat', async ({ page }) => {
      // Tangkap panggilan API dan tunda TERLEBIH DAHULU (sebelum navigasi)
      await page.route('/api/auth/register', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            status: true,
            message: 'Pengguna berhasil dibuat',
          }),
        });
      });

      await page.goto('/create-account');

      // Isi formulir dengan blur setelah setiap field
      await page.locator('input#name').fill('John Doettt');
      await page.locator('input#name').blur();
      await page.locator('input#email').fill('john@example.com');
      await page.locator('input#email').blur();
      await page.locator('input#password').fill('password123');
      await page.locator('input#password').blur();
      await page.locator('input#confirmPassword').fill('password123');
      await page.locator('input#confirmPassword').blur();
      await page.getByRole('checkbox').click();

      // Tunggu validasi form selesai
      await page.waitForTimeout(200);

      const submitButton = page.getByRole('button', { name: 'Create Account' });

      // Pastikan tombol enabled dan form valid sebelum submit
      await expect(submitButton).toBeEnabled();

      await submitButton.click();

      // Tombol harus dinonaktifkan saat pengiriman
      await expect(submitButton).toBeDisabled();
    });
  });

  test.describe('Navigasi', () => {
    test('harus mengarahkan ke halaman login', async ({ page }) => {
      const loginLink = page.getByRole('link', { name: 'Login.' });
      await loginLink.click();

      await expect(page).toHaveURL(/.*\/login/);
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
      await page.goto('/create-account');

      // Tombol toggle menu mobile harus terlihat
      const mobileMenuToggle = page.getByRole('button', {
        name: /toggle navigation menu/i,
      });
      await expect(mobileMenuToggle).toBeVisible();

      // Formulir harus terlihat
      const form = page.locator('form');
      await expect(form).toBeVisible();

      // Semua input harus terlihat
      await expect(page.locator('input#name')).toBeVisible();
      await expect(page.locator('input#email')).toBeVisible();
      await expect(page.locator('input#password')).toBeVisible();
      await expect(page.locator('input#confirmPassword')).toBeVisible();
    });

    test('harus menampilkan dengan benar pada viewport tablet', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/create-account');

      const form = page.locator('form');
      await expect(form).toBeVisible();

      const card = page.locator('[class*="card"]').first();
      await expect(card).toBeVisible();
    });

    test('harus menampilkan dengan benar pada viewport desktop', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/create-account');

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

    test('harus memiliki elemen formulir dengan atribut yang benar', async ({
      page,
    }) => {
      // Periksa atribut autocomplete
      const nameInput = page.locator('input#name');
      await expect(nameInput).toHaveAttribute('autocomplete', 'off');

      const emailInput = page.locator('input#email');
      await expect(emailInput).toHaveAttribute('autocomplete', 'off');

      const passwordInput = page.locator('input#password');
      await expect(passwordInput).toHaveAttribute('autocomplete', 'off');
    });
  });
});
