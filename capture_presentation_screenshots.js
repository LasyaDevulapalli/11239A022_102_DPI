import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const screenshotDir = path.resolve('./presentation_screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function captureAllScreenshots() {
  console.log('Launching Puppeteer Chrome to capture presentation screenshots...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();

  async function logout() {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  }

  async function loginAs(email, password) {
    await logout();
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    await page.type('input[type="email"]', email);
    await page.type('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 1200));
  }

  async function clickSidebar(text) {
    const buttons = await page.$$('aside button');
    for (const b of buttons) {
      const label = await page.evaluate(el => el.textContent, b);
      if (label.includes(text)) {
        await b.click();
        await new Promise(r => setTimeout(r, 800));
        break;
      }
    }
  }

  async function clickButtonWithText(text) {
    const buttons = await page.$$('button');
    for (const b of buttons) {
      const val = await page.evaluate(el => el.textContent, b);
      if (val.includes(text)) {
        await b.click();
        await new Promise(r => setTimeout(r, 800));
        return true;
      }
    }
    return false;
  }

  // 1. LOGIN PAGE SCREENSHOT
  console.log('Capturing 1. Login Page...');
  await logout();
  await page.screenshot({ path: path.join(screenshotDir, 'screenshot_01_login.png') });

  // 2. FACULTY DASHBOARD & UPLOAD
  console.log('Capturing 2. Faculty Dashboard & Upload...');
  await loginAs('faculty@demo.com', 'faculty123');
  await page.screenshot({ path: path.join(screenshotDir, 'screenshot_02_faculty_dashboard.png') });

  await clickSidebar('Upload Evidence');
  await page.screenshot({ path: path.join(screenshotDir, 'screenshot_03_faculty_upload.png') });

  // 3. HOD WORKFLOW
  console.log('Capturing 3. HOD Approval Workflow...');
  await loginAs('hod@demo.com', 'hod123');
  await clickSidebar('Approval Workflow');
  await page.screenshot({ path: path.join(screenshotDir, 'screenshot_04_hod_workflow.png') });

  // 4. PRINCIPAL APPROVAL & DIGITAL SIGNATURE
  console.log('Capturing 4. Principal Approval & Digital Signature...');
  await loginAs('principal@demo.com', 'principal123');
  await clickSidebar('Approval Workflow');
  await page.screenshot({ path: path.join(screenshotDir, 'screenshot_05_principal_signature.png') });

  // 5. COORDINATOR REPOSITORY, ACCREDITATION STATUS, AUDIT, QR
  console.log('Capturing 5. Coordinator Repository & Accreditation Status...');
  await loginAs('coordinator@demo.com', 'coordinator123');

  await clickSidebar('Evidence Repository');
  await page.screenshot({ path: path.join(screenshotDir, 'screenshot_06_repository.png') });

  await clickSidebar('Accreditation Status');
  await page.screenshot({ path: path.join(screenshotDir, 'screenshot_07_coordinator_status.png') });

  await clickSidebar('Audit Trail');
  await clickButtonWithText('Verify Audit Integrity');
  await page.screenshot({ path: path.join(screenshotDir, 'screenshot_08_audit_verified.png') });

  // Simulate Tamper
  await clickButtonWithText('Simulate Tamper Test');
  await page.screenshot({ path: path.join(screenshotDir, 'screenshot_09_audit_tampered.png') });
  await clickButtonWithText('Restore Original Log');

  await clickSidebar('QR Document Verification');
  await page.screenshot({ path: path.join(screenshotDir, 'screenshot_10_qr_verified.png') });

  await browser.close();
  console.log('ALL 10 SCREENSHOTS CAPTURED SUCCESSFULLY IN ./presentation_screenshots/');
}

captureAllScreenshots().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
