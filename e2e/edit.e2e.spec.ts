import { expect, test } from '@playwright/test';

/**
 * TODO: Halaman Edit (Terotentikasi) - /edit/[id]
 *
 * Status: DILEWATI - Tidak dapat diuji karena keterbatasan SSR Server Component
 *
 * Masalah:
 * - Halaman edit menggunakan Next.js Server Component yang mengambil data selama SSR
 * - Pengambilan data SSR terjadi di proses server Node.js, bukan di browser
 * - page.route() Playwright hanya mencegat permintaan browser
 * - MSW/nock hanya bekerja di proses test runner, bukan proses server Next.js
 *
 * Solusi yang Dicoba:
 * 1. page.route() - Hanya menangkap permintaan sisi klien ❌
 * 2. MSW (Mock Service Worker) - Masalah yang sama seperti di atas ❌
 * 3. nock - Hanya bekerja di test runner, bukan server Next.js ❌
 * 4. page.addInitScript() - Hanya berjalan di browser, setelah SSR ❌
 * 5. Variabel lingkungan TEST_MODE dengan endpoint API mock - Memerlukan pengaturan yang kompleks ❌
 *
 * Solusi Potensial (memerlukan modifikasi aplikasi):
 * 1. Ubah halaman edit menjadi Client Component (tidak ideal untuk SEO/performa)
 * 2. Tambahkan SWR/React Query untuk pengambilan data sisi klien setelah hidrasi
 * 3. Buat build tes terpisah dengan injeksi data mock
 * 4. Gunakan database tes nyata dengan data yang sudah di-seed
 * 5. Mock di level Prisma/database
 *
 * File Terkait:
 * - src/app/edit/[id]/page.tsx (Server Component dengan fetch)
 * - src/app/api/persona/[id]/route.ts (endpoint API)
 */
test.describe.skip(
  'Halaman Edit (Terotentikasi) - DILEWATI (Masalah SSR)',
  () => {
    test.describe('Pemuatan Halaman dan Elemen Dasar', () => {
      test('harus menampilkan header dengan elemen yang benar', async ({
        page,
      }) => {
        await page.goto('/edit/123');

        const header = page.getByRole('banner');
        await expect(header).toBeVisible();
      });

      test('harus menampilkan bagian hero', async ({ page }) => {
        await page.goto('/edit/123');

        const heroSection = page.locator('section').first();
        await expect(heroSection).toBeVisible();
      });

      test('harus menampilkan navigasi stepper', async ({ page }) => {
        await page.goto('/edit/123');

        await page.waitForTimeout(500);
        const steps = page.getByRole('tab');
        expect(await steps.count()).toBeGreaterThanOrEqual(4);
      });

      test('harus menampilkan langkah domain secara default', async ({
        page,
      }) => {
        await page.goto('/edit/123');

        await page.waitForTimeout(500);
        const domainCard = page.getByText(/domain/i).first();
        await expect(domainCard).toBeVisible();
      });

      test('harus menampilkan footer', async ({ page }) => {
        await page.goto('/edit/123');

        const footer = page.getByRole('contentinfo');
        await expect(footer).toBeVisible();
      });
    });

    test.describe('Navigasi Stepper', () => {
      test('harus menavigasi melalui semua langkah', async ({ page }) => {
        await page.goto('/edit/123');

        await page.waitForTimeout(500);
        const domainCard = page.getByText(/domain/i).first();
        await expect(domainCard).toBeVisible();

        const nextButton = page.getByRole('button', { name: /next/i });
        await nextButton.click();
        await page.waitForTimeout(300);
        const internalCard = page.getByText(/internal/i).first();
        await expect(internalCard).toBeVisible();

        await nextButton.click();
        await page.waitForTimeout(300);
        const externalCard = page.getByText(/external/i).first();
        await expect(externalCard).toBeVisible();

        await nextButton.click();
        await page.waitForTimeout(300);
        const contentLengthCard = page.getByText(/content length/i).first();
        await expect(contentLengthCard).toBeVisible();

        await nextButton.click();
        await page.waitForTimeout(300);
        const reviewTitle = page.getByText(/review/i).first();
        await expect(reviewTitle).toBeVisible();
      });

      test('harus menavigasi kembali ke langkah sebelumnya', async ({
        page,
      }) => {
        await page.goto('/edit/123');

        await page.waitForTimeout(500);
        const nextButton = page.getByRole('button', { name: /next/i });
        await nextButton.click();
        await page.waitForTimeout(300);

        const backButton = page.getByRole('button', { name: /back/i });
        await backButton.click();
        await page.waitForTimeout(300);

        const domainCard = page.getByText(/domain/i).first();
        await expect(domainCard).toBeVisible();
      });
    });

    test.describe('Pengiriman Formulir', () => {
      test('harus mengirimkan formulir dan mengarahkan ke halaman detail', async ({
        page,
      }) => {
        await page.goto('/edit/123');

        await page.waitForTimeout(500);
        const nextButton = page.getByRole('button', { name: /next/i });
        await nextButton.click();
        await page.waitForTimeout(300);
        await nextButton.click();
        await page.waitForTimeout(300);
        await nextButton.click();
        await page.waitForTimeout(300);
        await nextButton.click();
        await page.waitForTimeout(300);

        const submitButton = page.getByRole('button', {
          name: /edit persona/i,
        });
        await submitButton.click();

        await expect(page).toHaveURL(/.*\/detail\/123/);
      });
    });

    test.describe('Navigasi', () => {
      test('harus menavigasi ke beranda saat mengklik logo', async ({
        page,
      }) => {
        await page.goto('/edit/123');

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
        await page.goto('/edit/123');

        const mobileMenuToggle = page.getByRole('button', {
          name: /toggle navigation menu/i,
        });
        await expect(mobileMenuToggle).toBeVisible();

        await page.waitForTimeout(500);
        const domainCard = page.getByText(/domain/i).first();
        await expect(domainCard).toBeVisible();
      });

      test('harus menampilkan dengan benar pada viewport tablet', async ({
        page,
      }) => {
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto('/edit/123');

        await page.waitForTimeout(500);
        const domainCard = page.getByText(/domain/i).first();
        await expect(domainCard).toBeVisible();
      });

      test('harus menampilkan dengan benar pada viewport desktop', async ({
        page,
      }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto('/edit/123');

        await page.waitForTimeout(500);
        const domainCard = page.getByText(/domain/i).first();
        await expect(domainCard).toBeVisible();
      });
    });

    test.describe('SEO dan Meta', () => {
      test('harus memiliki judul halaman yang benar', async ({ page }) => {
        await page.goto('/edit/123');
        await page.waitForLoadState('networkidle');

        const title = await page.title();
        expect(title.toLowerCase()).toContain('crafter');
      });
    });
  },
);

test.describe('Halaman Edit Tamu', () => {
  // Fungsi pembantu untuk menyiapkan persona di localStorage
  async function setupGuestPersona(page: any) {
    await page.addInitScript(() => {
      const mockPersona = {
        request: {
          domain: { key: 'tech', label: 'Teknologi' },
          internal: [
            {
              name: 'skills',
              title: 'Keahlian',
              description: 'Keahlian pengguna',
            },
          ],
          external: [
            {
              name: 'motivation',
              title: 'Motivasi',
              description: 'Motivasi pengguna',
            },
          ],
          contentLengthRange: [300, 1000],
          llmModel: {
            key: 'gemini-2.5-flash-lite',
            label: 'Gemini 2.5 Flash Lite',
          },
          language: { key: 'en', label: 'English' },
          useRAG: false,
          detail: 'Detail tes',
        },
        response: {
          result: {
            full_name: 'Persona Tamu',
            quote: 'Kutipan tamu',
            mixed: '<p>Konten campuran</p>',
            bullets: '<ul><li>Item 1</li></ul>',
            narative: '<p>Konten narasi</p>',
          },
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem('crafter:personas', JSON.stringify(mockPersona));
    });
  }

  test.beforeEach(async ({ page }) => {
    // Mencegat panggilan API untuk generate tamu
    await page.route('/api/persona/generate/guest', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          result: {
            full_name: 'Persona Tamu yang Diregenerasi',
            quote: 'Kutipan baru',
            mixed: '<p>Konten campuran baru</p>',
            bullets: '<ul><li>Item baru</li></ul>',
            narative: '<p>Narasi baru</p>',
          },
        }),
      });
    });
  });

  test.describe('Pemuatan Halaman dan Elemen Dasar', () => {
    test('harus menampilkan header dengan elemen yang benar', async ({
      page,
    }) => {
      await setupGuestPersona(page);
      await page.goto('/edit/guest');

      const header = page.getByRole('banner');
      await expect(header).toBeVisible();

      const brandLink = page.getByRole('link', { name: /CRAFTER/i });
      await expect(brandLink).toBeVisible();

      const themeToggle = page.getByRole('button', { name: /toggle theme/i });
      await expect(themeToggle).toBeVisible();
    });

    test('harus menampilkan bagian hero', async ({ page }) => {
      await setupGuestPersona(page);
      await page.goto('/edit/guest');

      const heroSection = page.locator('section').first();
      await expect(heroSection).toBeVisible();
    });

    test('harus menampilkan navigasi stepper', async ({ page }) => {
      await setupGuestPersona(page);
      await page.goto('/edit/guest');

      // Tunggu konten dimuat
      await page.waitForTimeout(500);

      // Stepper harus memiliki langkah
      const steps = page.getByRole('tab');
      expect(await steps.count()).toBeGreaterThanOrEqual(4);
    });

    test('harus menampilkan langkah domain dengan data yang sudah terisi', async ({
      page,
    }) => {
      await setupGuestPersona(page);
      await page.goto('/edit/guest');

      // Tunggu konten dimuat
      await page.waitForTimeout(500);

      // Kartu domain harus terlihat (gunakan pencocokan parsial untuk fleksibilitas)
      const domainCard = page.getByText(/domain/i).first();
      await expect(domainCard).toBeVisible();
    });

    test('harus menampilkan footer', async ({ page }) => {
      await setupGuestPersona(page);
      await page.goto('/edit/guest');

      const footer = page.getByRole('contentinfo');
      await expect(footer).toBeVisible();

      const copyright = page.getByText(/Crafter. All rights reserved./i);
      await expect(copyright).toBeVisible();
    });
  });

  test.describe('Navigasi Stepper', () => {
    test('harus menavigasi melalui semua langkah', async ({ page }) => {
      await setupGuestPersona(page);
      await page.goto('/edit/guest');

      // Tunggu konten dimuat
      await page.waitForTimeout(500);

      // Langkah 1: Domain (default)
      const domainCard = page.getByText(/domain/i).first();
      await expect(domainCard).toBeVisible();

      // Klik next untuk pergi ke langkah Internal
      const nextButton = page.getByRole('button', { name: /next/i });
      await nextButton.click();

      // Langkah Lapisan Internal
      await page.waitForTimeout(300);
      const internalCard = page.getByText(/internal/i).first();
      await expect(internalCard).toBeVisible();

      // Klik next untuk pergi ke langkah External
      await nextButton.click();

      // Langkah Lapisan External
      await page.waitForTimeout(300);
      const externalCard = page.getByText(/external/i).first();
      await expect(externalCard).toBeVisible();

      // Klik next untuk pergi ke langkah Tambahan
      await nextButton.click();

      // Langkah Pengaturan Tambahan
      await page.waitForTimeout(300);
      const contentLengthCard = page.getByText(/content length/i).first();
      await expect(contentLengthCard).toBeVisible();

      // Klik next untuk pergi ke langkah Review
      await nextButton.click();

      // Langkah Review
      await page.waitForTimeout(300);
      const reviewTitle = page.getByText(/review/i).first();
      await expect(reviewTitle).toBeVisible();
    });

    test('harus menavigasi kembali ke langkah sebelumnya', async ({ page }) => {
      await setupGuestPersona(page);
      await page.goto('/edit/guest');

      // Tunggu konten dimuat
      await page.waitForTimeout(500);

      // Pergi ke langkah berikutnya
      const nextButton = page.getByRole('button', { name: /next/i });
      await nextButton.click();
      await page.waitForTimeout(300);

      // Kembali ke langkah sebelumnya
      const backButton = page.getByRole('button', { name: /back/i });
      await backButton.click();
      await page.waitForTimeout(300);

      // Harus kembali ke langkah Domain
      const domainCard = page.getByText(/domain/i).first();
      await expect(domainCard).toBeVisible();
    });
  });

  test.describe('Pengiriman Formulir', () => {
    test('harus mengirimkan formulir dan mengarahkan ke halaman detail tamu', async ({
      page,
    }) => {
      await setupGuestPersona(page);
      await page.goto('/edit/guest');

      // Tunggu konten dimuat
      await page.waitForTimeout(500);

      // Navigasi ke langkah review
      const nextButton = page.getByRole('button', { name: /next/i });
      await nextButton.click();
      await page.waitForTimeout(300);
      await nextButton.click();
      await page.waitForTimeout(300);
      await nextButton.click();
      await page.waitForTimeout(300);
      await nextButton.click();
      await page.waitForTimeout(300);

      // Kirim formulir
      const submitButton = page.getByRole('button', {
        name: /edit persona/i,
      });
      await submitButton.click();

      // Harus mengarahkan ke halaman detail tamu
      await expect(page).toHaveURL(/.*\/detail\/guest/);
    });
  });

  test.describe('Status Kosong', () => {
    test('harus menampilkan status kosong ketika tidak ada data localStorage', async ({
      page,
    }) => {
      // Bersihkan localStorage
      await page.addInitScript(() => {
        localStorage.removeItem('crafter:personas');
      });

      await page.goto('/edit/guest');

      // Tunggu konten dimuat
      await page.waitForTimeout(500);

      // Tidak boleh menampilkan tombol submit (Komponen Design mengembalikan null tanpa data)
      const submitButton = page.getByRole('button', {
        name: /edit persona/i,
      });
      await expect(submitButton).not.toBeVisible();
    });
  });

  test.describe('Navigasi', () => {
    test('harus menavigasi ke beranda saat mengklik logo', async ({ page }) => {
      await setupGuestPersona(page);
      await page.goto('/edit/guest');

      const brandLink = page.getByRole('link', { name: /CRAFTER/i }).first();
      await brandLink.click();

      await expect(page).toHaveURL('/');
    });
  });

  test.describe('Desain Responsif', () => {
    test('harus menampilkan dengan benar pada viewport mobile', async ({
      page,
    }) => {
      await setupGuestPersona(page);
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/edit/guest');

      // Tombol toggle menu mobile harus terlihat
      const mobileMenuToggle = page.getByRole('button', {
        name: /toggle navigation menu/i,
      });
      await expect(mobileMenuToggle).toBeVisible();

      // Formulir harus terlihat
      await page.waitForTimeout(500);
      const domainCard = page.getByText(/domain/i).first();
      await expect(domainCard).toBeVisible();
    });

    test('harus menampilkan dengan benar pada viewport tablet', async ({
      page,
    }) => {
      await setupGuestPersona(page);
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/edit/guest');

      await page.waitForTimeout(500);
      const domainCard = page.getByText(/domain/i).first();
      await expect(domainCard).toBeVisible();
    });

    test('harus menampilkan dengan benar pada viewport desktop', async ({
      page,
    }) => {
      await setupGuestPersona(page);
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/edit/guest');

      await page.waitForTimeout(500);
      const domainCard = page.getByText(/domain/i).first();
      await expect(domainCard).toBeVisible();
    });
  });

  test.describe('SEO dan Meta', () => {
    test('harus memiliki judul halaman yang benar', async ({ page }) => {
      await setupGuestPersona(page);
      await page.goto('/edit/guest');
      await page.waitForLoadState('networkidle');

      const title = await page.title();
      expect(title.toLowerCase()).toContain('crafter');
    });
  });
});
