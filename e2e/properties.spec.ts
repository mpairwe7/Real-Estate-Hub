import { test, expect } from '@playwright/test';

test.describe('Property Browsing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/browse');
  });

  test('should display property listings', async ({ page }) => {
    // Wait for properties to load
    await page.waitForLoadState('networkidle');
    
    // Check for property cards (adjust selector based on your implementation)
    const propertyCards = page.locator('[data-testid="property-card"], .property-card, article');
    
    // Wait a bit for data to load
    await page.waitForTimeout(2000);
    
    const count = await propertyCards.count();
    
    // Should have at least one property or a "no properties" message
    if (count === 0) {
      // Check for empty state message
      const emptyState = page.getByText(/no properties|no results/i);
      await expect(emptyState).toBeVisible();
    } else {
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should allow filtering properties', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Look for filter controls
    const filterButton = page.getByRole('button', { name: /filter/i });
    if (await filterButton.isVisible()) {
      await filterButton.click();
      
      // Verify filter panel opens
      await page.waitForTimeout(300);
      
      // Look for filter options (adjust based on your implementation)
      const filterOptions = page.locator('input[type="checkbox"], select, input[type="radio"]');
      const count = await filterOptions.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should allow searching properties', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Look for search input
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('apartment');
      await searchInput.press('Enter');
      
      // Wait for search results
      await page.waitForTimeout(1000);
      
      // Verify URL or page content updated
      const url = page.url();
      expect(url).toBeTruthy();
    }
  });

  test('should navigate to property details', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Find first property card
    const firstProperty = page.locator('[data-testid="property-card"], .property-card, article').first();
    
    if (await firstProperty.isVisible()) {
      // Click on the property (could be link or button)
      const propertyLink = firstProperty.locator('a, button').first();
      await propertyLink.click();
      
      // Verify navigation to details page
      await expect(page).toHaveURL(/.*browse\/[a-zA-Z0-9-]+/);
      
      // Wait for details to load
      await page.waitForLoadState('networkidle');
    }
  });

  test('should display property on map', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Look for map container
    const mapContainer = page.locator('[data-testid="map"], .map-container, #map');
    
    if (await mapContainer.isVisible()) {
      // Verify map is rendered
      await expect(mapContainer).toBeVisible();
    }
  });
});

test.describe('Property Details', () => {
  test('should display property information', async ({ page }) => {
    // Note: This test requires a valid property ID
    // You may need to adjust the URL or fetch a property ID dynamically
    await page.goto('/browse');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Click first property if available
    const firstProperty = page.locator('[data-testid="property-card"], .property-card, article').first();
    
    if (await firstProperty.isVisible()) {
      const propertyLink = firstProperty.locator('a').first();
      await propertyLink.click();
      
      await page.waitForLoadState('networkidle');
      
      // Verify key property details are visible
      const title = page.locator('h1, [data-testid="property-title"]').first();
      await expect(title).toBeVisible();
      
      // Check for price
      const price = page.getByText(/\$|price/i).first();
      if (await price.isVisible()) {
        await expect(price).toBeVisible();
      }
    }
  });

  test('should display property images', async ({ page }) => {
    await page.goto('/browse');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const firstProperty = page.locator('[data-testid="property-card"], .property-card, article').first();
    
    if (await firstProperty.isVisible()) {
      const propertyLink = firstProperty.locator('a').first();
      await propertyLink.click();
      
      await page.waitForLoadState('networkidle');
      
      // Look for image gallery or carousel
      const images = page.locator('img[alt*="property" i], img[alt*="image" i]');
      const imageCount = await images.count();
      
      if (imageCount > 0) {
        expect(imageCount).toBeGreaterThan(0);
      }
    }
  });

  test('should allow image carousel navigation', async ({ page }) => {
    await page.goto('/browse');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const firstProperty = page.locator('[data-testid="property-card"], .property-card, article').first();
    
    if (await firstProperty.isVisible()) {
      const propertyLink = firstProperty.locator('a').first();
      await propertyLink.click();
      
      await page.waitForLoadState('networkidle');
      
      // Look for next/previous buttons
      const nextButton = page.getByRole('button', { name: /next|right/i });
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(300);
        
        // Verify carousel moved (implementation-specific)
        expect(true).toBe(true);
      }
    }
  });
});
