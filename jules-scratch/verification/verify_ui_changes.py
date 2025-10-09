from playwright.sync_api import sync_playwright, expect
import re

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # 1. Navigate to the login page
            page.goto("http://localhost:5173/auth/login")

            # 2. Log in as a doctor
            page.get_by_label("Operator ID (Email)").fill("doctor1@mhs.com")
            page.get_by_label("Password").fill("mhs2025")
            page.get_by_role("button", name="Authorize Access").click()

            # 3. Wait for the URL to change, indicating a successful login and redirect
            # The app redirects from /auth/login to / and then to /doctor
            page.wait_for_url(re.compile(r"/doctor$"), timeout=10000)

            # 4. Assert that the main dashboard heading is visible
            dashboard_header = page.get_by_role("heading", name="Doctor's Dashboard")
            expect(dashboard_header).to_be_visible()

            # 5. Assert that the "New Patient" link is NOT visible in the main navigation
            # We look for a link with the exact text "New Patient"
            new_patient_link = page.get_by_role("link", name="New Patient", exact=True)
            expect(new_patient_link).not_to_be_visible()

            # 6. Take a screenshot for visual confirmation
            page.screenshot(path="jules-scratch/verification/verification.png")

            print("Verification successful! 'New Patient' link is not visible for doctors.")

        except Exception as e:
            print(f"An error occurred during verification: {e}")
            page.screenshot(path="jules-scratch/verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run_verification()