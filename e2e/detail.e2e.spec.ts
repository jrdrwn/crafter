import { expect, test } from '@playwright/test';

test.describe('Halaman Detail (Terautentikasi)', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept API call for persona detail
    await page.route('/api/persona/123', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          status: true,
          data: {
            id: 123,
            result: {
              full_name: 'John Doe',
              quote: 'Test quote',
              mixed: '<p>Mixed content</p>',
              bullets: '<ul><li>Item 1</li></ul>',
              narative: '<p>Narrative content</p>',
              image_url: 'https://example.com/image.jpg',
            },
            user: {
              id: 1,
              name: 'Test User',
              email: 'test@example.com',
            },
            visibility: 'private',
            created_at: '2025-01-01T00:00:00Z',
            updated_at: '2025-01-02T00:00:00Z',
            domain: { key: 'tech', label: 'Technology' },
          },
        }),
      });
    });
  });

  test.describe('Pemuatan Halaman dan Elemen Dasar', () => {
    test('should display header with correct elements', async ({ page }) => {
      await page.goto('/detail/123');

      const header = page.getByRole('banner');
      await expect(header).toBeVisible();

      const brandLink = page.getByRole('link', { name: /CRAFTER/i });
      await expect(brandLink).toBeVisible();

      const themeToggle = page.getByRole('button', { name: /toggle theme/i });
      await expect(themeToggle).toBeVisible();
    });

    test('should display back to history button', async ({ page }) => {
      await page.goto('/detail/123');

      const backButton = page.getByRole('button', { name: /back to history/i });
      await expect(backButton).toBeVisible();
    });

    test('should display top action buttons', async ({ page }) => {
      await page.goto('/detail/123');

      // Wait for content to load
      await page.waitForTimeout(500);

      // Online status button
      const onlineButton = page.getByRole('button', { name: /online/i });
      await expect(onlineButton).toBeVisible();
    });

    test('should display persona content', async ({ page }) => {
      await page.goto('/detail/123');

      // Wait for content to load
      await page.waitForTimeout(500);

      // Persona name should be visible
      const personaName = page.getByText('John Doe', { exact: true });
      await expect(personaName).toBeVisible();
    });

    test('should display author card', async ({ page }) => {
      await page.goto('/detail/123');

      // Wait for content to load
      await page.waitForTimeout(500);

      const authorCard = page.getByText('Author', { exact: true });
      await expect(authorCard).toBeVisible();

      const authorName = page.getByText('Test User', { exact: true });
      await expect(authorName).toBeVisible();

      const authorEmail = page.getByText('test@example.com', { exact: true });
      await expect(authorEmail).toBeVisible();
    });

    test('should display quick info card', async ({ page }) => {
      await page.goto('/detail/123');

      // Wait for content to load
      await page.waitForTimeout(500);

      const quickInfoCard = page.getByText('Quick Info', { exact: true });
      await expect(quickInfoCard).toBeVisible();

      const createdLabel = page.getByText('Created');
      await expect(createdLabel).toBeVisible();

      const updatedLabel = page.getByText('Updated');
      await expect(updatedLabel).toBeVisible();
    });

    test('should display download persona card', async ({ page }) => {
      await page.goto('/detail/123');

      // Wait for content to load
      await page.waitForTimeout(500);

      const downloadCard = page.getByText('Download Persona', { exact: true });
      await expect(downloadCard).toBeVisible();

      const downloadPdf = page.getByText('Download as PDF');
      await expect(downloadPdf).toBeVisible();

      const downloadJson = page.getByText('Download as JSON');
      await expect(downloadJson).toBeVisible();
    });

    test('should display footer', async ({ page }) => {
      await page.goto('/detail/123');

      const footer = page.getByRole('contentinfo');
      await expect(footer).toBeVisible();

      const copyright = page.getByText(/Crafter. All rights reserved./i);
      await expect(copyright).toBeVisible();
    });
  });

  test.describe('Navigasi', () => {
    test('should navigate to history page when clicking back button', async ({
      page,
    }) => {
      await page.goto('/detail/123');

      // Wait for content to load
      await page.waitForTimeout(500);

      const backButton = page.getByRole('link', { name: /back to history/i });
      await backButton.click();

      await expect(page).toHaveURL(/.*\/history/);
    });

    test('should navigate to home when clicking logo', async ({ page }) => {
      await page.goto('/detail/123');

      const brandLink = page.getByRole('link', { name: /CRAFTER/i }).first();
      await brandLink.click();

      await expect(page).toHaveURL('/');
    });
  });

  test.describe('Desain Responsif', () => {
    test('should display correctly on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/detail/123');

      // Mobile menu toggle should be visible
      const mobileMenuToggle = page.getByRole('button', {
        name: /toggle navigation menu/i,
      });
      await expect(mobileMenuToggle).toBeVisible();

      // Content should be visible
      await page.waitForTimeout(500);
      const personaName = page.getByText('John Doe');
      await expect(personaName).toBeVisible();
    });

    test('should display correctly on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/detail/123');

      await page.waitForTimeout(500);
      const personaName = page.getByText('John Doe');
      await expect(personaName).toBeVisible();
    });

    test('should display correctly on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/detail/123');

      await page.waitForTimeout(500);
      const personaName = page.getByText('John Doe');
      await expect(personaName).toBeVisible();

      // Desktop navigation should be visible
      const brandLink = page.getByRole('link', { name: /CRAFTER/i });
      await expect(brandLink).toBeVisible();
    });
  });

  test.describe('SEO dan Meta', () => {
    test('should have correct page title', async ({ page }) => {
      await page.goto('/detail/123');
      await page.waitForLoadState('networkidle');

      const title = await page.title();
      expect(title.toLowerCase()).toContain('crafter');
    });
  });
});

test.describe('Halaman Detail Tamu', () => {
  // Helper function to setup persona in localStorage
  async function setupGuestPersona(page: any) {
    await page.addInitScript(() => {
      const mockPersona = {
        response: {
          result: {
            full_name: 'Guest Persona',
            quote: 'Guest quote for testing',
            mixed: '<p>This is mixed content for guest persona</p>',
            bullets: '<ul><li>Bullet point 1</li><li>Bullet point 2</li></ul>',
            narative: '<p>This is narrative content for guest persona</p>',
          },
          taxonomy: {
            domain: {
              label: 'Technology',
            },
          },
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem('crafter:personas', JSON.stringify(mockPersona));
    });
  }

  test.describe('Page Load and Basic Elements', () => {
    test('should display header with correct elements', async ({ page }) => {
      await setupGuestPersona(page);
      await page.goto('/detail/guest');

      const header = page.getByRole('banner');
      await expect(header).toBeVisible();

      const brandLink = page.getByRole('link', { name: /CRAFTER/i });
      await expect(brandLink).toBeVisible();
    });

    test('should display back to history button for guest', async ({
      page,
    }) => {
      await setupGuestPersona(page);
      await page.goto('/detail/guest');

      const backButton = page.getByRole('button', { name: /back to history/i });
      await expect(backButton).toBeVisible();
    });

    test('should display top action buttons for guest', async ({ page }) => {
      await setupGuestPersona(page);
      await page.goto('/detail/guest');

      // Wait for content to load from localStorage
      await page.waitForTimeout(500);

      // Online status button
      const onlineButton = page.getByRole('button', { name: /online/i });
      await expect(onlineButton).toBeVisible();

      // Edit button
      const editButton = page.getByRole('button', { name: /edit result/i });
      await expect(editButton).toBeVisible();

      // Regenerate button
      const regenerateButton = page.getByRole('button', {
        name: /regenerate/i,
      });
      await expect(regenerateButton).toBeVisible();

      // Delete button
      const deleteButton = page.getByRole('button', { name: /delete/i });
      await expect(deleteButton).toBeVisible();
    });

    test('should display persona content from localStorage', async ({
      page,
    }) => {
      await setupGuestPersona(page);
      await page.goto('/detail/guest');

      // Wait for content to load from localStorage
      await page.waitForTimeout(500);

      // Persona name should be visible (use exact match to avoid conflict with content)
      const personaName = page.getByText('Guest Persona', { exact: true });
      await expect(personaName).toBeVisible();

      // Quote should be visible
      const quote = page.getByText('Guest quote for testing');
      await expect(quote).toBeVisible();

      // Domain badge should be visible
      const domainBadge = page.getByText('Technology');
      await expect(domainBadge).toBeVisible();
    });

    test('should display quick info card for guest', async ({ page }) => {
      await setupGuestPersona(page);
      await page.goto('/detail/guest');

      // Wait for content to load
      await page.waitForTimeout(500);

      const quickInfoCard = page.getByText('Quick Info');
      await expect(quickInfoCard).toBeVisible();

      const createdLabel = page.getByText('Created');
      await expect(createdLabel).toBeVisible();

      const updatedLabel = page.getByText('Updated');
      await expect(updatedLabel).toBeVisible();
    });

    test('should display share persona card with login prompt', async ({
      page,
    }) => {
      await setupGuestPersona(page);
      await page.goto('/detail/guest');

      // Wait for content to load
      await page.waitForTimeout(500);

      const shareCard = page.getByText('Share Persona', { exact: true });
      await expect(shareCard).toBeVisible();

      // Should show login prompt overlay (use first() as there are 2 cards with same prompt)
      const loginPrompt = page.getByText(/you need to log in/i).first();
      await expect(loginPrompt).toBeVisible();
    });

    test('should display download persona card with login prompt', async ({
      page,
    }) => {
      await setupGuestPersona(page);
      await page.goto('/detail/guest');

      // Wait for content to load
      await page.waitForTimeout(500);

      // Download Persona card should be visible
      const downloadCard = page.getByText('Download Persona', { exact: true });
      await expect(downloadCard).toBeVisible();

      // Download options should be visible
      const downloadPdf = page.getByText('Download as PDF');
      await expect(downloadPdf).toBeVisible();

      const downloadJson = page.getByText('Download as JSON');
      await expect(downloadJson).toBeVisible();
    });

    test('should display skeleton when no localStorage data', async ({
      page,
    }) => {
      // Clear localStorage - no setup
      await page.addInitScript(() => {
        localStorage.removeItem('crafter:personas');
      });

      await page.goto('/detail/guest');

      // Should show skeleton loading state (using data-slot attribute)
      const skeleton = page.locator('[data-slot="skeleton"]').first();
      await expect(skeleton).toBeVisible();
    });

    test('should display footer', async ({ page }) => {
      await setupGuestPersona(page);
      await page.goto('/detail/guest');

      const footer = page.getByRole('contentinfo');
      await expect(footer).toBeVisible();
    });
  });

  test.describe('Pemilihan Gaya Persona', () => {
    test('should switch between mixed, bullets, and narrative styles', async ({
      page,
    }) => {
      await setupGuestPersona(page);
      await page.goto('/detail/guest');

      // Wait for content to load
      await page.waitForTimeout(500);

      // Mixed style button should be visible and active by default
      const mixedButton = page.getByRole('button', { name: /mixed/i });
      await expect(mixedButton).toBeVisible();

      // Bullets style button
      const bulletsButton = page.getByRole('button', { name: /bullets/i });
      await expect(bulletsButton).toBeVisible();

      // Narrative style button
      const narrativeButton = page.getByRole('button', { name: /narrative/i });
      await expect(narrativeButton).toBeVisible();

      // Click bullets button
      await bulletsButton.click();

      // Click narrative button
      await narrativeButton.click();

      // Click back to mixed
      await mixedButton.click();
    });
  });

  test.describe('Mode Edit', () => {
    test('should enter edit mode when clicking edit button', async ({
      page,
    }) => {
      await setupGuestPersona(page);
      await page.goto('/detail/guest');

      // Wait for content to load
      await page.waitForTimeout(500);

      const editButton = page.getByRole('button', { name: /edit result/i });
      await editButton.click();

      // Should navigate to edit mode
      await expect(page).toHaveURL(/.*free_edit=true/);

      // Save and View mode buttons should appear
      const saveButton = page.getByRole('button', { name: /save/i });
      await expect(saveButton).toBeVisible();

      const viewModeButton = page.getByRole('button', { name: /view mode/i });
      await expect(viewModeButton).toBeVisible();
    });

    test('should exit edit mode when clicking view mode button', async ({
      page,
    }) => {
      await setupGuestPersona(page);
      await page.goto('/detail/guest?free_edit=true');

      // Wait for content to load
      await page.waitForTimeout(500);

      const viewModeButton = page.getByRole('button', { name: /view mode/i });
      await viewModeButton.click();

      // Should navigate back to view mode
      await expect(page).toHaveURL(/.*detail\/guest/);
    });
  });

  test.describe('Dialog Hapus', () => {
    test('should open delete confirmation dialog', async ({ page }) => {
      await setupGuestPersona(page);
      await page.goto('/detail/guest');

      // Wait for content to load
      await page.waitForTimeout(500);

      const deleteButton = page.getByRole('button', { name: /delete/i });
      await deleteButton.click();

      // Dialog should appear
      const dialog = page.getByRole('alertdialog');
      await expect(dialog).toBeVisible();

      const confirmTitle = page.getByText(/are you absolutely sure/i);
      await expect(confirmTitle).toBeVisible();
    });

    test('should cancel delete and close dialog', async ({ page }) => {
      await setupGuestPersona(page);
      await page.goto('/detail/guest');

      // Wait for content to load
      await page.waitForTimeout(500);

      const deleteButton = page.getByRole('button', { name: /delete/i });
      await deleteButton.click();

      const cancelButton = page.getByRole('button', { name: /cancel/i });
      await cancelButton.click();

      // Dialog should close
      const dialog = page.getByRole('alertdialog');
      await expect(dialog).not.toBeVisible();
    });

    test('should confirm delete and redirect to create page', async ({
      page,
    }) => {
      await setupGuestPersona(page);
      await page.goto('/detail/guest');

      // Wait for content to load
      await page.waitForTimeout(500);

      const deleteButton = page.getByRole('button', { name: /delete/i });
      await deleteButton.click();

      const continueButton = page.getByRole('button', { name: /continue/i });
      await continueButton.click();

      // Should redirect to create page
      await expect(page).toHaveURL(/.*\/create/);
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to guest history page when clicking back button', async ({
      page,
    }) => {
      await setupGuestPersona(page);
      await page.goto('/detail/guest');

      // Wait for content to load
      await page.waitForTimeout(500);

      const backButton = page.getByRole('link', { name: /back to history/i });
      await backButton.click();

      await expect(page).toHaveURL(/.*\/history\/guest/);
    });

    test('should navigate to guest edit page when clicking regenerate', async ({
      page,
    }) => {
      await setupGuestPersona(page);
      await page.goto('/detail/guest');

      // Wait for content to load
      await page.waitForTimeout(500);

      const regenerateLink = page.getByRole('link', { name: /regenerate/i });
      await regenerateLink.click();

      await expect(page).toHaveURL(/.*\/edit\/guest/);
    });

    test('should navigate to home when clicking logo', async ({ page }) => {
      await setupGuestPersona(page);
      await page.goto('/detail/guest');

      const brandLink = page.getByRole('link', { name: /CRAFTER/i }).first();
      await brandLink.click();

      await expect(page).toHaveURL('/');
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile viewport', async ({ page }) => {
      await setupGuestPersona(page);
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/detail/guest');

      // Mobile menu toggle should be visible
      const mobileMenuToggle = page.getByRole('button', {
        name: /toggle navigation menu/i,
      });
      await expect(mobileMenuToggle).toBeVisible();

      // Content should be visible
      await page.waitForTimeout(500);
      const personaName = page.getByText('Guest Persona', { exact: true });
      await expect(personaName).toBeVisible();
    });

    test('should display correctly on tablet viewport', async ({ page }) => {
      await setupGuestPersona(page);
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/detail/guest');

      await page.waitForTimeout(500);
      const personaName = page.getByText('Guest Persona', { exact: true });
      await expect(personaName).toBeVisible();
    });

    test('should display correctly on desktop viewport', async ({ page }) => {
      await setupGuestPersona(page);
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/detail/guest');

      await page.waitForTimeout(500);
      const personaName = page.getByText('Guest Persona', { exact: true });
      await expect(personaName).toBeVisible();
    });
  });

  test.describe('SEO and Meta', () => {
    test('should have correct page title', async ({ page }) => {
      await setupGuestPersona(page);
      await page.goto('/detail/guest');
      await page.waitForLoadState('networkidle');

      const title = await page.title();
      expect(title.toLowerCase()).toContain('crafter');
    });
  });
});
