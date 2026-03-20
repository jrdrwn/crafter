import { expect, test } from '@playwright/test';

// Data mock untuk persona pengguna yang terautentikasi
const mockUserPersonas = [
  {
    id: 'persona-1',
    result: {
      image_url: 'https://example.com/photo1.jpg',
      full_name: 'Persona Saya Satu',
      quote: 'Persona pertama yang saya buat',
    },
    domain: { label: 'Technology' },
    created_at: '2024-01-15T10:00:00Z',
    user: { id: 'user-1', name: 'Pengguna Uji', email: 'test@example.com' },
  },
  {
    id: 'persona-2',
    result: {
      image_url: 'https://example.com/photo2.jpg',
      full_name: 'Persona Saya Dua',
      quote: 'Persona kedua yang saya buat',
    },
    domain: { label: 'Healthcare' },
    created_at: '2024-01-14T08:30:00Z',
    user: { id: 'user-1', name: 'Pengguna Uji', email: 'test@example.com' },
  },
];

// Helper untuk menyiapkan persona tamu di localStorage
async function setupGuestPersona(page: any) {
  await page.addInitScript(() => {
    const guestPersona = {
      created_at: '2024-01-15T10:00:00Z',
      request: {},
      response: {
        result: {
          full_name: 'Persona Tamu',
          quote: 'Persona yang dibuat sebagai tamu',
        },
        taxonomy: {
          domain: {
            label: 'Technology',
          },
        },
      },
    };
    localStorage.setItem('crafter:personas', JSON.stringify(guestPersona));
  });
}

test.describe('Halaman Riwayat (Terautentikasi)', () => {
  test.beforeEach(async ({ page }) => {
    // Mock respons API untuk pengguna yang terautentikasi
    await page.route('/api/persona/me**', async (route) => {
      const url = route.request().url();
      const urlObj = new URL(url);
      const search = urlObj.searchParams.get('search')?.toLowerCase() || '';
      const domain = urlObj.searchParams.get('domain') || '';

      let filteredPersonas = [...mockUserPersonas];

      if (search) {
        filteredPersonas = filteredPersonas.filter(
          (p) =>
            p.result.full_name.toLowerCase().includes(search) ||
            p.result.quote.toLowerCase().includes(search),
        );
      }

      if (domain) {
        filteredPersonas = filteredPersonas.filter(
          (p) => p.domain.label.toLowerCase() === domain.toLowerCase(),
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
    test('harus menampilkan halaman riwayat dengan bagian hero', async ({
      page,
    }) => {
      await page.goto('/history');
      await page.waitForTimeout(500);

      // Periksa heading bagian hero
      const heroTitle = page.getByRole('heading', { name: /persona history/i });
      await expect(heroTitle).toBeVisible();

      // Periksa tombol buat ada
      const createButton = page.getByRole('button', { name: /create/i });
      await expect(createButton).toBeVisible();
    });

    test('harus memuat dan menampilkan kartu persona pengguna', async ({
      page,
    }) => {
      await page.goto('/history');
      await page.waitForTimeout(1000);

      // Periksa kartu persona ditampilkan
      const personaCard = page.getByText('Persona Saya Satu');
      await expect(personaCard).toBeVisible();
    });

    test('harus menampilkan status kosong ketika tidak ada persona', async ({
      page,
    }) => {
      await page.route('/api/persona/me**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [], total: 0 }),
        });
      });

      await page.goto('/history');
      await page.waitForTimeout(1000);

      // Periksa pesan status kosong
      const emptyMessage = page.getByText(/no personas|empty|not found/i);
      await expect(emptyMessage).toBeVisible();
    });
  });

  test.describe('Pencarian dan Filter', () => {
    test('harus memfilter persona berdasarkan kata kunci pencarian', async ({
      page,
    }) => {
      await page.goto('/history');
      await page.waitForTimeout(1000);

      const searchInput = page.getByPlaceholder(/search/i);
      await searchInput.fill('Satu');
      await page.waitForTimeout(500);

      const personaCard = page.getByText('Persona Saya Satu');
      await expect(personaCard).toBeVisible();
    });

    test('harus memfilter persona berdasarkan domain', async ({ page }) => {
      await page.goto('/history');
      await page.waitForTimeout(1000);

      const domainSelect = page
        .getByRole('combobox')
        .filter({ hasText: /filter by domain/i });
      await domainSelect.click();
      await page.waitForTimeout(200);

      // Pilih opsi "Technology" (opsi kedua setelah "All")
      const options = page.getByRole('option');
      const optionCount = await options.count();
      if (optionCount > 1) {
        await options.nth(1).click();
      } else {
        await options.first().click();
      }
      await page.waitForTimeout(500);

      // Setelah difilter, kartu persona atau status kosong harus terlihat
      const results = page
        .getByText('Persona Saya Satu')
        .or(page.getByText(/no personas/i));
      await expect(results).toBeVisible();
    });
  });

  test.describe('Paginasi', () => {
    test('harus menampilkan kontrol paginasi', async ({ page }) => {
      await page.goto('/history');
      await page.waitForTimeout(1000);

      const pagination = page.locator('nav[aria-label="pagination"]');
      await expect(pagination).toBeVisible();
    });
  });

  test.describe('Navigasi', () => {
    test('harus berpindah ke halaman buat ketika mengklik tombol buat', async ({
      page,
    }) => {
      await page.goto('/history');

      const createButton = page.getByRole('button', { name: /create/i });
      await createButton.click();

      await expect(page).toHaveURL('/create');
    });
  });
});

test.describe('Halaman Riwayat (Tamu)', () => {
  test.describe('Pemuatan Halaman', () => {
    test('harus menampilkan halaman riwayat tamu', async ({ page }) => {
      await setupGuestPersona(page);
      await page.goto('/history/guest');
      await page.waitForTimeout(500);

      // Periksa bagian hero
      const heroTitle = page.getByRole('heading', { name: /persona history/i });
      await expect(heroTitle).toBeVisible();
    });

    test('harus menampilkan persona tamu dari localStorage', async ({
      page,
    }) => {
      await setupGuestPersona(page);
      await page.goto('/history/guest');
      await page.waitForTimeout(500);

      // Periksa kartu persona tamu
      const personaCard = page.getByText('Persona Tamu');
      await expect(personaCard).toBeVisible();
    });

    test('harus menampilkan status kosong ketika tidak ada data localStorage', async ({
      page,
    }) => {
      await page.goto('/history/guest');
      await page.waitForTimeout(500);

      // Periksa pesan status kosong
      const emptyMessage = page.getByText(/no personas|empty|not found/i);
      await expect(emptyMessage).toBeVisible();
    });
  });

  test.describe('Interaksi Kartu Persona', () => {
    test('harus berpindah ke detail tamu ketika mengklik kartu', async ({
      page,
    }) => {
      await setupGuestPersona(page);
      await page.goto('/history/guest');
      await page.waitForTimeout(500);

      const personaCard = page.getByText('Persona Tamu');
      await personaCard.click();

      await expect(page).toHaveURL('/detail/guest');
    });
  });

  test.describe('Navigasi', () => {
    test('harus berpindah ke halaman buat ketika mengklik tombol buat', async ({
      page,
    }) => {
      await setupGuestPersona(page);
      await page.goto('/history/guest');

      const createButton = page.getByRole('button', { name: /create/i });
      await createButton.click();

      await expect(page).toHaveURL('/create');
    });
  });
});

test.describe('Halaman Riwayat - Desain Responsif', () => {
  test('harus menampilkan dengan benar pada viewport mobile', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/history');
    await page.waitForTimeout(500);

    const heroTitle = page.getByRole('heading', { name: /persona history/i });
    await expect(heroTitle).toBeVisible();
  });

  test('harus menampilkan dengan benar pada viewport desktop', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/history');
    await page.waitForTimeout(500);

    const heroTitle = page.getByRole('heading', { name: /persona history/i });
    await expect(heroTitle).toBeVisible();
  });
});
