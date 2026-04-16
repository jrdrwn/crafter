import { expect, test } from '@playwright/test';

async function mockCreatePersonaAPIs(page: import('@playwright/test').Page) {
  await page.route('/api/persona/helper/domain', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: true,
        data: [
          {
            key: 'healthcare-innovation',
            label: 'Healthcare Innovation',
          },
        ],
      }),
    });
  });

  await page.route(
    '/api/persona/helper/attribute?layer=internal',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: true,
          data: [
            {
              id: 1,
              name: 'empathy',
              title: 'Empathy',
              description: 'Ability to understand user feelings and lived context.',
              layer: 'internal',
            },
          ],
        }),
      });
    },
  );

  await page.route(
    '/api/persona/helper/attribute?layer=external',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: true,
          data: [
            {
              id: 2,
              name: 'motivation',
              title: 'Motivation',
              description: 'Main drivers behind user behavior and decision making.',
              layer: 'external',
            },
            {
              id: 3,
              name: 'goals',
              title: 'Goals',
              description: 'Objectives the user wants to achieve.',
              layer: 'external',
            },
            {
              id: 4,
              name: 'pain-points',
              title: 'Pain Points',
              description: 'Problems and frustrations user faces.',
              layer: 'external',
            },
            {
              id: 5,
              name: 'interaction-tech',
              title: 'Interaction with technology',
              description: 'How user adapts to digital tools.',
              layer: 'external',
            },
          ],
        }),
      });
    },
  );

  await page.route('/api/persona/helper/llm', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: true,
        data: [
          {
            id: 1,
            key: 'gemini-2.5-flash-lite',
            label: 'Gemini 2.5 Flash Lite',
            category: 'fast',
            description: 'Fast and cost-efficient model',
          },
        ],
      }),
    });
  });

  await page.route('/api/persona/helper/language', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: true,
        data: [
          { id: 1, key: 'en', label: 'English' },
          { id: 2, key: 'id', label: 'Indonesian' },
        ],
      }),
    });
  });

  await page.route(/\/api\/rag\/contributions\/check.*/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ available: false }),
    });
  });

  await page.route('/api/persona/generate/guest', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        result: {
          full_name: 'Alicia Hart',
          quote: 'Technology that feels human.',
          mixed:
            '<p>A mixed narrative about an empathetic healthcare product strategist.</p>',
          bullets:
            '<ul><li>Builds trust quickly</li><li>Strong cross-team collaboration</li></ul>',
          narative:
            '<p>Alicia works across design, engineering, and care operations to improve patient journeys.</p>',
        },
        taxonomy: {
          domain: {
            key: 'healthcare-innovation',
            label: 'Healthcare Innovation',
          },
        },
      }),
    });
  });
}

async function goToStep2(page: import('@playwright/test').Page) {
  await page.getByRole('radio', { name: /Healthcare Innovation/i }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(
    page.locator('nav[aria-label="Steps"] button[aria-current="step"]'),
  ).toHaveAttribute('aria-posinset', '2');
}

async function goToStep3(page: import('@playwright/test').Page) {
  await goToStep2(page);
  await page.getByRole('checkbox', { name: /Empathy/i }).check();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(
    page.locator('nav[aria-label="Steps"] button[aria-current="step"]'),
  ).toHaveAttribute('aria-posinset', '3');
}

async function goToStep4(page: import('@playwright/test').Page) {
  await goToStep3(page);
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(
    page.locator('nav[aria-label="Steps"] button[aria-current="step"]'),
  ).toHaveAttribute('aria-posinset', '4');
}

async function goToStep5(page: import('@playwright/test').Page) {
  await goToStep4(page);
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(
    page.locator('nav[aria-label="Steps"] button[aria-current="step"]'),
  ).toHaveAttribute('aria-posinset', '5');
}

test.describe('Create Persona sampai Detail', () => {
  test.beforeEach(async ({ page }) => {
    await mockCreatePersonaAPIs(page);
    await page.goto('/create');
  });

  test('Membuka halaman Create Persona', async ({ page }) => {
    await expect(page).toHaveURL('/create');
    await expect(page.locator('nav[aria-label="Steps"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
  });

  test('Domain: memilih domain persona', async ({ page }) => {
    await goToStep2(page);
  });

  test('Internal Layer: memilih faktor internal', async ({
    page,
  }) => {
    await goToStep3(page);
  });

  test('External Layer: verifikasi faktor eksternal', async ({ page }) => {
    await goToStep4(page);
  });

  test('Additional Settings: mengatur konfigurasi tambahan', async ({
    page,
  }) => {
    await goToStep5(page);
  });

  test('Menekan tombol "Submit" pada langkah 5 (Review)', async ({
    page,
  }) => {
    await goToStep5(page);

    await Promise.all([
      page.waitForResponse((response) => {
        return (
          response.url().includes('/api/persona/generate/guest') &&
          response.request().method() === 'POST' &&
          response.status() === 200
        );
      }),
      page.locator('button[type="submit"]').click(),
    ]);

    await expect(page).toHaveURL('/detail/guest');
  });

  test('Menampilkan data persona pada halaman Detail', async ({ page }) => {
    await goToStep5(page);

    await Promise.all([
      page.waitForResponse((response) => {
        return (
          response.url().includes('/api/persona/generate/guest') &&
          response.request().method() === 'POST' &&
          response.status() === 200
        );
      }),
      page.locator('button[type="submit"]').click(),
    ]);

    await expect(page).toHaveURL('/detail/guest');
    await expect(page.getByText('Alicia Hart')).toBeVisible();
    await expect(page.getByText('Technology that feels human.')).toBeVisible();
    await expect(page.getByText('Healthcare Innovation')).toBeVisible();
    await expect(
      page.getByText(
        'A mixed narrative about an empathetic healthcare product strategist.',
      ),
    ).toBeVisible();
  });

});
