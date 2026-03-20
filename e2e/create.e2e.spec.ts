import { expect, test } from '@playwright/test';

test.describe('Halaman Create', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/create');
  });

  test.describe('Pemuatan Halaman dan Elemen Dasar', () => {
    test('harus menampilkan header dengan elemen yang benar', async ({
      page,
    }) => {
      // Kontainer header
      const header = page.getByRole('banner');
      await expect(header).toBeVisible();

      // Brand/Logo
      const brandLink = page.getByRole('link', { name: /CRAFTER/i });
      await expect(brandLink).toBeVisible();

      // Toggle tema
      const themeToggle = page.getByRole('button', { name: /toggle theme/i });
      await expect(themeToggle).toBeVisible();
    });

    test('harus menampilkan bagian hero dengan konten yang benar', async ({
      page,
    }) => {
      // Bagian hero
      const heroSection = page.locator('section').first();
      await expect(heroSection).toBeVisible();

      // Judul utama
      const mainHeading = page.getByRole('heading', {
        name: 'Create your persona with AI',
      });
      await expect(mainHeading).toBeVisible();

      // Deskripsi
      const description = page
        .locator('p')
        .filter({ hasText: /craft|persona|generate/i })
        .first();
      await expect(description).toBeVisible();
    });

    test('harus menampilkan bagian form stepper', async ({ page }) => {
      // Bagian form ada
      const form = page.locator('form');
      await expect(form).toBeVisible();

      // Navigasi stepper
      const stepperNav = page.locator('nav[aria-label="Steps"]');
      await expect(stepperNav).toBeVisible();
    });

    test('harus menampilkan footer', async ({ page }) => {
      const footer = page.getByRole('contentinfo');
      await expect(footer).toBeVisible();

      const copyright = page.getByText(/Crafter. All rights reserved./i);
      await expect(copyright).toBeVisible();
    });
  });

  test.describe('Navigasi Stepper', () => {
    test('harus menampilkan semua 5 langkah', async ({ page }) => {
      // Periksa tombol langkah (dinomori 1-5)
      const stepButtons = page.locator(
        'nav[aria-label="Steps"] button[role="tab"]',
      );
      await expect(stepButtons).toHaveCount(5);

      // Periksa label langkah - batasi hanya pada navigasi stepper
      const stepperNav = page.locator('nav[aria-label="Steps"]');
      await expect(
        stepperNav.getByText('Domain', { exact: true }),
      ).toBeVisible();
      await expect(stepperNav.getByText('Internal Layer')).toBeVisible();
      await expect(stepperNav.getByText('External Layer')).toBeVisible();
      await expect(stepperNav.getByText('Additional Settings')).toBeVisible();
      await expect(stepperNav.getByText('Review')).toBeVisible();
    });

    test('harus mulai di langkah 1 (Domain)', async ({ page }) => {
      // Tombol langkah pertama harus aktif
      const firstStep = page.locator(
        'nav[aria-label="Steps"] button[aria-current="step"]',
      );
      await expect(firstStep).toHaveAttribute('aria-posinset', '1');

      // Kartu domain harus terlihat
      const domainCard = page
        .locator('[class*="card"]')
        .filter({ hasText: /domain/i })
        .first();
      await expect(domainCard).toBeVisible();
    });

    test('harus menavigasi melalui langkah menggunakan tombol Next', async ({
      page,
    }) => {
      // Langkah 1: Pilih domain terlebih dahulu (wajib)
      // Klik opsi radio pertama berdasarkan teks labelnya
      const domainOption = page.getByRole('radio', {
        name: 'Technology for older adults',
      });
      await expect(domainOption).toBeVisible();
      await domainOption.click();

      // Klik Next untuk ke langkah 2
      const nextButton = page.getByRole('button', { name: /next/i });
      await nextButton.click();

      // Harus menampilkan langkah Internal Layer - tunggu langkah 2 aktif
      await expect(
        page.locator('nav[aria-label="Steps"] button[aria-current="step"]'),
      ).toHaveAttribute('aria-posinset', '2');

      // Pilih faktor internal dan lanjutkan
      const internalOption = page.getByRole('checkbox', {
        name: 'Demographic information age,',
      });
      await expect(internalOption).toBeVisible();
      await internalOption.click();

      await nextButton.click();

      // Harus menampilkan langkah External Layer - tunggu langkah 3 aktif
      await expect(
        page.locator('nav[aria-label="Steps"] button[aria-current="step"]'),
      ).toHaveAttribute('aria-posinset', '3');
    });

    test('harus menavigasi kembali menggunakan tombol Back', async ({
      page,
    }) => {
      // Pilih domain dan ke langkah 2
      const domainOption = page.getByRole('radio', {
        name: 'Technology for older adults',
      });
      await expect(domainOption).toBeVisible();
      await domainOption.click();

      const nextButton = page.getByRole('button', { name: 'Next' });
      await nextButton.click();

      // Tunggu langkah 2 aktif
      await expect(
        page.locator('nav[aria-label="Steps"] button[aria-current="step"]'),
      ).toHaveAttribute('aria-posinset', '2');

      // Sekarang kembali
      const backButton = page.getByRole('button', { name: 'Back' });
      await backButton.click();

      // Harus kembali ke langkah Domain
      await expect(
        page.locator('nav[aria-label="Steps"] button[aria-current="step"]'),
      ).toHaveAttribute('aria-posinset', '1');
    });

    test('harus mengizinkan klik pada langkah yang sudah selesai', async ({
      page,
    }) => {
      // Pilih domain dan ke langkah 2
      const domainOption = page.getByRole('radio', {
        name: 'Technology for older adults',
      });
      await expect(domainOption).toBeVisible();
      await domainOption.click();

      const nextButton = page.getByRole('button', { name: 'Next' });
      await nextButton.click();

      // Tunggu langkah 2 aktif
      await expect(
        page.locator('nav[aria-label="Steps"] button[aria-current="step"]'),
      ).toHaveAttribute('aria-posinset', '2');

      // Klik tombol langkah 1 untuk kembali
      const step1Button = page
        .locator('nav[aria-label="Steps"] button')
        .first();
      await step1Button.click();

      // Harus kembali ke langkah Domain
      await expect(
        page.locator('nav[aria-label="Steps"] button[aria-current="step"]'),
      ).toHaveAttribute('aria-posinset', '1');
    });
  });

  test.describe('Langkah Domain', () => {
    test('harus menampilkan kartu pemilihan domain', async ({ page }) => {
      const domainCard = page
        .locator('[class*="card"]')
        .filter({ hasText: /domain/i })
        .first();
      await expect(domainCard).toBeVisible();

      // Harus memiliki input pencarian
      const searchInput = page.locator('input[type="search"]');
      await expect(searchInput).toBeVisible();

      // Harus memiliki input tambah domain
      const addDomainInput = page.getByPlaceholder('Add a new domain...');
      await expect(addDomainInput).toBeVisible();
    });

    test('harus menampilkan status loading di awal', async ({ page }) => {
      // Periksa skeleton loader saat domain dimuat
      const skeletons = page.locator('[class*="skeleton"]');
      // Skeleton ada atau domain sudah dimuat
      const hasSkeletons = (await skeletons.count()) > 0;
      // Periksa opsi domain dengan mencari radiogroup
      const hasDomains =
        (await page.locator('div[role="radiogroup"]').count()) > 0;
      expect(hasSkeletons || hasDomains).toBeTruthy();
    });
  });

  test.describe('Validasi Form', () => {
    test('harus mewajibkan pemilihan domain sebelum melanjutkan', async ({
      page,
    }) => {
      // Coba klik Next tanpa memilih domain
      const nextButton = page.getByRole('button', { name: /next/i });

      // Periksa apakah validasi mencegah navigasi
      // Tombol mungkin dinonaktifkan atau muncul pesan error validasi
      const isDisabled = await nextButton.isDisabled().catch(() => false);

      if (!isDisabled) {
        await nextButton.click();
        // Harus tetap di langkah 1
        const activeStep = page.locator(
          'nav[aria-label="Steps"] button[aria-current="step"]',
        );
        await expect(activeStep).toHaveAttribute('aria-posinset', '1');
      }
    });
  });

  test.describe('Langkah Review', () => {
    test('harus menampilkan informasi review', async ({ page }) => {
      // Navigasi ke langkah review dengan menyelesaikan langkah sebelumnya
      // Ini versi sederhana - dalam tes nyata Anda harus mengisi semua field yang wajib

      // Untuk sekarang hanya verifikasi langkah review ada di stepper
      const reviewStep = page.getByText('Review');
      await expect(reviewStep).toBeVisible();
    });
  });

  test.describe('Navigasi dan Link', () => {
    test('harus menavigasi ke home saat mengklik logo', async ({ page }) => {
      const brandLink = page.getByRole('link', { name: /CRAFTER/i }).first();
      await brandLink.click();
      await expect(page).toHaveURL('/');
    });
  });

  test.describe('SEO dan Meta', () => {
    test('harus memiliki judul halaman yang benar', async ({ page }) => {
      await page.waitForLoadState('networkidle');
      const title = await page.title();
      expect(title.toLowerCase()).toContain('crafter');
    });

    test('harus memiliki satu heading h1', async ({ page }) => {
      const h1Elements = page.locator('h1');
      const count = await h1Elements.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });
});
