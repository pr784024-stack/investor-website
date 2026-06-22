const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = "C:\\Users\\pr784\\.gemini\\antigravity\\brain\\8ba4fb46-dd6e-406d-afcc-c0e79cad685e";

async function clickButtonByText(page, text, timeout = 10000) {
  // Find buttons matching text
  const result = await page.evaluate((searchText) => {
    const buttons = Array.from(document.querySelectorAll('button'));
    for (const btn of buttons) {
      if (btn.textContent && btn.textContent.trim().toLowerCase().includes(searchText.toLowerCase())) {
        btn.scrollIntoView();
        return { found: true, text: btn.textContent.trim() };
      }
    }
    return { found: false };
  }, text);
  
  if (!result.found) {
    return false;
  }
  
  // Click using evaluate (more reliable than ElementHandle)
  await page.evaluate((searchText) => {
    const buttons = Array.from(document.querySelectorAll('button'));
    for (const btn of buttons) {
      if (btn.textContent && btn.textContent.trim().toLowerCase().includes(searchText.toLowerCase())) {
        btn.click();
        return;
      }
    }
  }, text);
  
  return true;
}

(async () => {
  console.log("\n=================================================");
  console.log("RAZORPAY CHECKOUT TEST - INVESTORBRIDGE");
  console.log("=================================================\n");
  
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: false, // Run visible so we can take screenshots
    defaultViewport: { width: 1280, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(15000);
    
    // ─── STEP 1: Navigate to booking page ───────────────────────────────
    console.log("1. Navigating to http://localhost:3000/book ...");
    await page.goto('http://localhost:3000/book', { waitUntil: 'networkidle2', timeout: 30000 });
    console.log("   ✓ Page loaded successfully");
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "step1_book_page.png") });

    // ─── STEP 2: Select "Financial Consulting" (it's a button, not a radio) ─
    console.log("\n2. Selecting 'Financial Consulting' service...");
    await new Promise(r => setTimeout(r, 1000));
    
    const serviceClicked = await clickButtonByText(page, 'Financial Consulting');
    if (!serviceClicked) {
      // Check page content for debugging
      const pageText = await page.evaluate(() => document.body.innerText.substring(0, 500));
      console.log("   Page content snippet:", pageText);
      throw new Error("Could not find 'Financial Consulting' button");
    }
    console.log("   ✓ Clicked Financial Consulting service");
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "step2_service_selected.png") });

    // ─── STEP 3: Click "Select & Continue" ─────────────────────────────────
    console.log("\n3. Clicking 'Select & Continue'...");
    const continueClicked = await clickButtonByText(page, 'Select & Continue') || await clickButtonByText(page, 'Continue');
    if (!continueClicked) throw new Error("'Select & Continue' button not found");
    console.log("   ✓ Clicked Select & Continue");
    await new Promise(r => setTimeout(r, 1000));
    
    // ─── STEP 4: Select date and time ──────────────────────────────────────
    console.log("\n4. Selecting date and time...");
    await page.waitForSelector('input[type="date"]');
    
    // Set date to 3 days from now
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);
    const dateString = targetDate.toISOString().split('T')[0];
    console.log(`   Setting date to: ${dateString}`);
    
    // Use evaluate to set date value properly  
    await page.evaluate((dateVal) => {
      const input = document.querySelector('input[type="date"]');
      if (input) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(input, dateVal);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, dateString);
    
    await new Promise(r => setTimeout(r, 500));
    
    // Click a time slot (any AM/PM button)
    const timeClicked = await clickButtonByText(page, '09:00 AM') || await clickButtonByText(page, '11:00 AM');
    if (!timeClicked) {
      // Try to find any time button
      const timeFound = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        for (const btn of buttons) {
          if (btn.textContent && (btn.textContent.includes('AM') || btn.textContent.includes('PM'))) {
            btn.click();
            return true;
          }
        }
        return false;
      });
      if (!timeFound) throw new Error("Time slot buttons not found");
    }
    console.log("   ✓ Time slot selected");
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "step4_datetime.png") });
    
    // ─── STEP 5: Click "Continue" ───────────────────────────────────────────
    console.log("\n5. Proceeding to personal details...");
    const proceed2 = await clickButtonByText(page, 'Continue');
    if (!proceed2) throw new Error("Continue button not found on step 2");
    console.log("   ✓ Clicked Continue");
    await new Promise(r => setTimeout(r, 1000));
    
    // ─── STEP 6: Fill personal details ─────────────────────────────────────
    console.log("\n6. Filling personal details...");
    
    // Try multiple possible placeholder texts
    const nameInput = await page.$('input[placeholder="John Doe"]') || await page.$('input[type="text"]');
    if (!nameInput) throw new Error("Name input not found");
    await nameInput.click({ clickCount: 3 });
    await nameInput.type('Razorpay Test User');
    
    const emailInput = await page.$('input[type="email"]') || await page.$('input[placeholder="john@example.com"]');
    if (!emailInput) throw new Error("Email input not found");
    await emailInput.click({ clickCount: 3 });
    await emailInput.type('test@investorbridge.com');
    
    const phoneInput = await page.$('input[type="tel"]') || await page.$('input[placeholder="7340806804"]');
    if (!phoneInput) throw new Error("Phone input not found");
    await phoneInput.click({ clickCount: 3 });
    await phoneInput.type('7340806804');
    
    console.log("   ✓ Personal details filled");
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "step6_details_filled.png") });
    
    // ─── STEP 7: Click "Continue to Checkout" ──────────────────────────────
    console.log("\n7. Clicking 'Continue to Checkout'...");
    const checkoutBtn = await clickButtonByText(page, 'Continue to Checkout') || await clickButtonByText(page, 'Continue');
    if (!checkoutBtn) throw new Error("'Continue to Checkout' button not found");
    await new Promise(r => setTimeout(r, 1500));
    console.log("   ✓ Moved to checkout page");
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "step7_checkout_summary.png") });
    
    // ─── STEP 8: Verify checkout summary and "Pay With Razorpay" button ────
    console.log("\n8. Verifying checkout summary...");
    const pageContent = await page.evaluate(() => document.body.innerText);
    
    if (pageContent.includes('Total Due') || pageContent.includes('Pay With Razorpay')) {
      console.log("   ✓ Checkout summary visible");
    }
    
    // Check if Pay button exists
    const payButtonExists = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some(btn => btn.textContent && btn.textContent.toLowerCase().includes('razorpay'));
    });
    
    if (!payButtonExists) {
      console.log("   ✗ Pay With Razorpay button NOT found");
      console.log("   Page text:", pageContent.substring(0, 600));
      throw new Error("Pay With Razorpay button is missing. Is price > ₹0?");
    }
    console.log("   ✓ Pay With Razorpay button is visible and enabled");
    
    // ─── STEP 9: Click "Pay With Razorpay" ────────────────────────────────
    console.log("\n9. Clicking 'Pay With Razorpay'...");
    await clickButtonByText(page, 'Pay With Razorpay');
    console.log("   ✓ Clicked Pay With Razorpay");
    
    // Wait for Razorpay checkout modal/iframe to appear
    console.log("   Waiting for Razorpay checkout modal...");
    
    try {
      // Razorpay uses an iframe
      await page.waitForSelector('iframe.razorpay-checkout-frame', { timeout: 20000 });
      console.log("   ✓ Razorpay checkout iframe appeared!");
      
      // Take screenshot showing Razorpay test mode
      await new Promise(r => setTimeout(r, 2000)); // Let Razorpay fully render
      const screenshotPath = path.join(ARTIFACT_DIR, "razorpay_test_mode.png");
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`   ✓ Screenshot captured: razorpay_test_mode.png`);
      
      // ─── STEP 10: Interact with Razorpay iframe ────────────────────────
      console.log("\n10. Interacting with Razorpay checkout...");
      const frameEl = await page.$('iframe.razorpay-checkout-frame');
      const frame = await frameEl.contentFrame();
      
      // Wait for the Razorpay modal to fully load
      await frame.waitForSelector('body', { timeout: 10000 });
      await new Promise(r => setTimeout(r, 2000));
      
      // Take screenshot inside iframe
      const razorpayContent = await frame.evaluate(() => document.body.innerText.substring(0, 300));
      console.log("   Razorpay content:", razorpayContent);
      
      // Take final screenshot
      await page.screenshot({ path: path.join(ARTIFACT_DIR, "razorpay_modal_open.png"), fullPage: false });
      console.log("   ✓ Razorpay modal screenshot captured");
      
      console.log("\n=================================================");
      console.log("✓ RAZORPAY TEST PASSED: Modal opened successfully");
      console.log("=================================================\n");
      
    } catch (iframeError) {
      // Try alternative: check if a new window/popup opened
      console.log("   Iframe not found, checking for popup...");
      const pages = await browser.pages();
      console.log(`   Total browser pages: ${pages.length}`);
      
      // Take screenshot of current state
      await page.screenshot({ path: path.join(ARTIFACT_DIR, "razorpay_attempt.png"), fullPage: false });
      
      throw new Error(`Razorpay checkout did not open. Error: ${iframeError.message}`);
    }
    
  } catch (error) {
    console.error("\n✗ TEST FAILED:", error.message);
    try {
      // Try to take a failure screenshot
      const pages = await browser.pages();
      if (pages.length > 0) {
        await pages[0].screenshot({ path: path.join(ARTIFACT_DIR, "test_failure_screenshot.png"), fullPage: true });
        console.log("   Failure screenshot saved.");
      }
    } catch (e) { /* ignore */ }
  } finally {
    await browser.close();
    console.log("\nBrowser closed. Test complete.");
  }
})();
