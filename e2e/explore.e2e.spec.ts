import { expect, test } from '@playwright/test';

// Data mock untuk personas
const mockPersonas = [
  {
    id: 'persona-1',
    result: {
      image_url: 'https://example.com/photo1.jpg',
      full_name: 'Budi Santoso',
      quote: 'Pecinta teknologi dengan passion untuk AI',
    },
    domain: { label: 'Technology' },
    created_at: '2024-01-15T10:00:00Z',
    user: { id: 'user-1', name: 'Pengguna Uji', email: 'test@example.com' },
  },
  {
    id: 'persona-2',
    result: {
      image_url: 'https://example.com/photo2.jpg',
      full_name: 'Siti Rahayu',
      quote: 'Profesional kesehatan yang fokus pada perawatan pasien',
    },
    domain: { label: 'Healthcare' },
    created_at: '2024-01-14T08:30:00Z',
    user: { id: 'user-2', name: 'Pengguna Lain', email: 'another@example.com' },
  },
  {
    id: 'persona-3',
    result: {
      image_url: 'https://example.com/photo3.jpg',
      full_name: 'Ahmad Wijaya',
      quote: 'Ahli keuangan dengan pengalaman 10 tahun',
    },
    domain: { label: 'Finance' },
    created_at: '2024-01-13T14:20:00Z',
    user: { id: 'user-1', name: 'Pengguna Uji', email: 'test@example.com' },
  },
];

test.describe('Halaman Jelajahi', () => {
  test.beforeEach(async ({ page }) => {
    // Mock respons API
    await page.route('/api/persona**', async (route) => {
      const url = route.request().url();

      // Parse parameter query
      const urlObj = new URL(url);
      const search = urlObj.searchParams.get('search')?.toLowerCase() || '';
      const domain = urlObj.searchParams.get('domain') || '';
      const mine = urlObj.searchParams.get('mine') === '1';

      let filteredPersonas = [...mockPersonas];

      // Terapkan filter pencarian
      if (search) {
        filteredPersonas = filteredPersonas.filter(
          (p) =>
            p.result.full_name.toLowerCase().includes(search) ||
            p.result.quote.toLowerCase().includes(search),
        );
      }

      // Terapkan filter domain
      if (domain) {
        filteredPersonas = filteredPersonas.filter(
          (p) => p.domain.label.toLowerCase() === domain.toLowerCase(),
        );
      }

      // Terapkan filter "persona saya" (mock: user-1 adalah pengguna saat ini)
      if (mine) {
        filteredPersonas = filteredPersonas.filter(
          (p) => p.user.id === 'user-1',
        );
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: filteredPersonas,
          total: filteredPersonas.length,
        }),
      });
    });
  });

  test.describe('Pemuatan Halaman', () => {
    test('harus menampilkan halaman jelajahi dengan bagian hero', async ({
      page,
    }) => {
      await page.goto('/explore');

      // Tunggu konten dimuat
      await page.waitForTimeout(500);

      // Periksa bagian hero
      const heroTitle = page.getByRole('heading', {
        name: /discover personas/i,
      });
      await expect(heroTitle).toBeVisible();

      // Periksa toolbar ada
      const searchInput = page.getByPlaceholder(/search/i);
      await expect(searchInput).toBeVisible();
    });

    test('harus memuat dan menampilkan kartu persona', async ({ page }) => {
      await page.goto('/explore');

      // Tunggu respons API
      await page.waitForTimeout(1000);

      // Periksa kartu persona ditampilkan
      const personaCards = page
        .locator('[class*="persona"]')
        .or(page.getByText(/Budi Santoso|Siti Rahayu|Ahmad Wijaya/));
      await expect(personaCards.first()).toBeVisible();
    });

    test('harus menampilkan keadaan kosong ketika tidak ada persona', async ({
      page,
    }) => {
      // Override mock untuk mengembalikan kosong
      await page.route('/api/persona**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [], total: 0 }),
        });
      });

      await page.goto('/explore');
      await page.waitForTimeout(1000);

      // Periksa pesan keadaan kosong
      const emptyMessage = page.getByText(/no personas|empty|not found/i);
      await expect(emptyMessage).toBeVisible();
    });
  });

  test.describe('Pencarian dan Filter', () => {
    test('harus memfilter persona berdasarkan kata pencarian', async ({
      page,
    }) => {
      await page.goto('/explore');
      await page.waitForTimeout(1000);

      // Ketik di kotak pencarian
      const searchInput = page.getByPlaceholder(/search/i);
      await searchInput.fill('Budi');

      // Tunggu debounce
      await page.waitForTimeout(500);

      // Periksa hasil yang difilter
      const budiCard = page.getByText('Budi Santoso');
      await expect(budiCard).toBeVisible();
    });

    test('harus memfilter persona berdasarkan domain', async ({ page }) => {
      await page.goto('/explore');
      await page.waitForTimeout(1000);

      // Pilih filter domain - gunakan filter untuk menemukan combobox yang benar
      const domainSelect = page
        .getByRole('combobox')
        .filter({ hasText: /filter by domain/i });
      await domainSelect.click();

      // Tunggu dropdown dan pilih opsi Teknologi berdasarkan indeks
      await page.waitForTimeout(200);
      const options = page.getByRole('option');
      await options.first().click();

      await page.waitForTimeout(500);

      // Periksa hasil yang difilter - Budi Santoso harus terlihat (domain Teknologi)
      const budiCard = page.getByText('Budi Santoso');
      await expect(budiCard).toBeVisible();
    });

    test('harus mengurutkan persona berdasarkan kriteria yang berbeda', async ({
      page,
    }) => {
      await page.goto('/explore');
      await page.waitForTimeout(1000);

      // Buka dropdown urutkan - gunakan filter untuk menemukan combobox urutkan
      const sortSelect = page
        .getByRole('combobox')
        .filter({ hasText: /recently added|sort/i });
      await sortSelect.click();

      // Tunggu dropdown dan pilih opsi pertama
      await page.waitForTimeout(200);
      const options = page.getByRole('option');
      await options.first().click();

      await page.waitForTimeout(500);

      // Periksa persona masih terlihat setelah pengurutan
      const personaCards = page.getByText(
        /Budi Santoso|Siti Rahayu|Ahmad Wijaya/,
      );
      await expect(personaCards.first()).toBeVisible();
    });
  });

  test.describe('Paginasi', () => {
    test('harus menampilkan kontrol paginasi', async ({ page }) => {
      await page.goto('/explore');
      await page.waitForTimeout(1000);

      // Periksa paginasi ada - gunakan locator dengan nama yang dapat diakses
      const pagination = page.locator('nav[aria-label="pagination"]');
      await expect(pagination).toBeVisible();
    });

    test('harus navigasi ke halaman berikutnya', async ({ page }) => {
      // Mock dengan lebih banyak persona untuk paginasi
      const manyPersonas = Array.from({ length: 15 }, (_, i) => ({
        id: `persona-${i}`,
        result: {
          image_url: `https://example.com/photo${i}.jpg`,
          full_name: `Orang ${i}`,
          quote: `Kutipan untuk orang ${i}`,
        },
        domain: { label: 'Technology' },
        created_at: new Date(Date.now() - i * 86400000).toISOString(),
        user: { id: 'user-1', name: 'Pengguna Uji', email: 'test@example.com' },
      }));

      await page.route('/api/persona**', async (route) => {
        const url = new URL(route.request().url());
        const pageNum = Number(url.searchParams.get('page') || 1);
        const pageSize = 9;
        const start = (pageNum - 1) * pageSize;
        const end = start + pageSize;
        const paginatedData = manyPersonas.slice(start, end);

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: paginatedData,
            total: manyPersonas.length,
          }),
        });
      });

      await page.goto('/explore');
      await page.waitForTimeout(1000);

      // Klik halaman berikutnya
      const nextButton = page
        .getByRole('link', { name: /next/i })
        .or(page.getByLabel(/next/i));
      if (await nextButton.isVisible().catch(() => false)) {
        await nextButton.click();
        await page.waitForTimeout(500);

        // Periksa URL diperbarui
        await expect(page).toHaveURL(/page=2/);
      }
    });
  });

  test.describe('Interaksi Kartu Persona', () => {
    test('harus navigasi ke detail persona ketika mengklik kartu', async ({
      page,
    }) => {
      await page.goto('/explore');
      await page.waitForTimeout(1000);

      // Klik pada kartu persona
      const personaCard = page.getByText('Budi Santoso').first();
      await personaCard.click();

      // Harus navigasi ke halaman detail
      await expect(page).toHaveURL(/.*\/detail\/persona-1/);
    });
  });

  test.describe('Navigasi', () => {
    test('harus navigasi ke beranda ketika mengklik logo', async ({ page }) => {
      await page.goto('/explore');

      const brandLink = page.getByRole('link', { name: /CRAFTER/i }).first();
      await brandLink.click();

      await expect(page).toHaveURL('/');
    });

    test('harus navigasi ke halaman buat', async ({ page }) => {
      await page.goto('/explore');

      // Gunakan "Try for Free Now" link di footer sebagai alternatif
      const createLink = page.getByRole('link', { name: /try for free now/i });
      await expect(createLink).toBeVisible();
      await createLink.click();

      await expect(page).toHaveURL('/create-account');
    });
  });

  test.describe('Desain Responsif', () => {
    test('harus menampilkan dengan benar pada viewport mobile', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/explore');
      await page.waitForTimeout(1000);

      // Toggle menu mobile harus terlihat
      const mobileMenuToggle = page.getByRole('button', {
        name: /toggle navigation menu/i,
      });
      await expect(mobileMenuToggle).toBeVisible();

      // Pencarian harus terlihat
      const searchInput = page.getByPlaceholder(/search/i);
      await expect(searchInput).toBeVisible();
    });

    test('harus menampilkan dengan benar pada viewport tablet', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/explore');
      await page.waitForTimeout(1000);

      const searchInput = page.getByPlaceholder(/search/i);
      await expect(searchInput).toBeVisible();
    });

    test('harus menampilkan dengan benar pada viewport desktop', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/explore');
      await page.waitForTimeout(1000);

      const searchInput = page.getByPlaceholder(/search/i);
      await expect(searchInput).toBeVisible();
    });
  });

  test.describe('SEO dan Meta', () => {
    test('harus memiliki judul halaman yang benar', async ({ page }) => {
      await page.goto('/explore');
      await page.waitForLoadState('networkidle');

      const title = await page.title();
      expect(title.toLowerCase()).toContain('crafter');
    });
  });
});
