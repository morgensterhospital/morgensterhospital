from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # 1. Navigate to the login page
    page.goto("http://localhost:5174/auth/login")

    # Wait for the heading to be visible to ensure the page has loaded
    expect(page.locator("h1:has-text('Morgenster HMS')")).to_be_visible(timeout=10000)

    # Wait for animations to finish
    page.wait_for_timeout(1000)
    page.screenshot(path="jules-scratch/verification/login_page.png")

    # 2. Fill in the login form
    page.get_by_label("Role").select_option("Admin")
    page.get_by_label("Email Address").fill("admin@mhs.com")
    page.get_by_label("Password").fill("mhs2025")

    # 3. Click the login button and wait for navigation
    page.get_by_role("button", name="Log In").click()

    # 4. Wait for the dashboard to load and take a screenshot
    # The URL should redirect to /admin for the Admin user
    expect(page).to_have_url("http://localhost:5174/admin", timeout=10000)
    # Also wait for a specific element on the dashboard to be visible
    expect(page.locator("h2:has-text('Quick Actions')")).to_be_visible()

    # Wait for animations to finish
    page.wait_for_timeout(1000)
    page.screenshot(path="jules-scratch/verification/admin_dashboard.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
