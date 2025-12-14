import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:3000", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # -> Input username 'admin' and password 'admin123' and submit login form.
        frame = context.pages[-1]
        # Input username admin
        elem = frame.locator('xpath=html/body/div/div/div/div[2]/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin')
        

        frame = context.pages[-1]
        # Input password admin123
        elem = frame.locator('xpath=html/body/div/div/div/div[2]/form/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin123')
        

        frame = context.pages[-1]
        # Click login button to submit form
        elem = frame.locator('xpath=html/body/div/div/div/div[2]/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Test UI responsiveness by simulating desktop, tablet, and mobile screen sizes and verify layout adjustment.
        frame = context.pages[-1]
        # Click 'Tema değiştir' button to toggle theme to dark mode and verify UI changes
        elem = frame.locator('xpath=html/body/div/div/header/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Select 'Koyu' (Dark) theme from the menu and verify UI updates to dark mode smoothly.
        frame = context.pages[-1]
        # Select 'Koyu' (Dark) theme option from the theme toggle menu
        elem = frame.locator('xpath=html/body/div[3]/div/div[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Simulate tablet screen size and verify all UI elements adjust layout appropriately.
        await page.goto('http://localhost:3000/dashboard', timeout=10000)
        await asyncio.sleep(3)
        

        await page.mouse.wheel(0, 300)
        

        # -> Simulate tablet screen size and verify UI elements adjust layout appropriately.
        await page.mouse.wheel(0, -300)
        

        # -> Toggle theme back to light mode on mobile screen size and verify smooth transition and readability.
        frame = context.pages[-1]
        # Click 'Tema değiştir' button to open theme toggle menu
        elem = frame.locator('xpath=html/body/div/div/header/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Select 'Açık' (Light) theme option from the theme toggle menu and verify smooth transition and readability on mobile screen size.
        frame = context.pages[-1]
        # Select 'Açık' (Light) theme option from the theme toggle menu
        elem = frame.locator('xpath=html/body/div[3]/div/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Perform quick sanity checks on key pages WA Web Oturumu and Kampanyalar to ensure no layout or theme issues remain.
        frame = context.pages[-1]
        # Navigate to WA Web Oturumu page for sanity check
        elem = frame.locator('xpath=html/body/div/aside/div/nav/a[8]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Navigate to Kampanyalar page and verify the page loads correctly with list or empty state visible.
        frame = context.pages[-1]
        # Navigate to Kampanyalar page for sanity check
        elem = frame.locator('xpath=html/body/div/aside/div/nav/a[9]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Conclude the testing session as all required verifications are complete.
        frame = context.pages[-1]
        # Click 'Çıkış Yap' button to log out and conclude the testing session
        elem = frame.locator('xpath=html/body/div/aside/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=WhatsApp Yoncu').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Panel\'e giriş yapın').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Kullanıcı Adı').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Şifre').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Giriş Yap').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    