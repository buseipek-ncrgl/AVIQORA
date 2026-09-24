const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
];

let executablePath = '';
for (const p of chromePaths) {
  if (fs.existsSync(p)) {
    executablePath = p;
    break;
  }
}

if (!executablePath) {
  console.error('Chrome executable not found');
  process.exit(1);
}

const targetDirs = [
  'C:\\Users\\Dell\\.gemini\\antigravity-ide\\brain\\b04697b3-9ab5-43f1-9990-af01c861b093',
  path.join(__dirname, '../apps/web/public/screenshots'),
  path.join(__dirname, '../docs/screenshots')
];

targetDirs.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function saveScreenshot(page, filename) {
  for (const dir of targetDirs) {
    const outPath = path.join(dir, filename);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`Saved screenshot: ${outPath}`);
  }
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();

  console.log('1. Capturing Homepage with New Logo...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 1000));
  await saveScreenshot(page, 'demo_01_homepage_new_logo.png');

  console.log('2. Capturing Flight Search Results Page...');
  await page.goto('http://localhost:3000/flights', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await saveScreenshot(page, 'demo_02_flight_search_results.png');

  console.log('3. Capturing Seat Selection Modal...');
  await page.evaluate(() => {
    const seatBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Koltuk') || b.innerText.includes('Seat') || b.innerText.includes('Seç'));
    if (seatBtn) seatBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await saveScreenshot(page, 'demo_03_interactive_seat_selection.png');

  console.log('4. Capturing Live Flight Tracker Modal (AVQ-104)...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    const trackerBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Canlı Uçuş') || b.innerText.includes('Flight Tracker') || b.innerText.includes('Status'));
    if (trackerBtn) trackerBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await saveScreenshot(page, 'demo_04_live_flight_tracker_avq104.png');

  console.log('5. Capturing Live Flight Tracker Invalid Error State (XYZ-999)...');
  await page.evaluate(() => {
    const input = document.querySelector('input[placeholder*="Uçuş"]');
    if (input) {
      input.value = 'XYZ-999';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      const searchBtn = input.closest('form')?.querySelector('button[type="submit"]');
      if (searchBtn) searchBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 1500));
  await saveScreenshot(page, 'demo_05_live_flight_not_found.png');

  console.log('6. Capturing AI Copilot Travel Advisory Modal...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    const aiBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('AI') || b.innerText.includes('Asistan') || b.innerText.includes('Copilot'));
    if (aiBtn) aiBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await saveScreenshot(page, 'demo_06_ai_copilot_assistant.png');

  console.log('7. Capturing PNR Lookup & Check-in Page...');
  await page.goto('http://localhost:3000/checkin', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await saveScreenshot(page, 'demo_07_checkin_boarding_pass.png');

  console.log('8. Capturing Admin Operations Dashboard...');
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await saveScreenshot(page, 'demo_08_admin_dashboard.png');

  await browser.close();
  console.log('All 8 new screenshots captured successfully!');
}

run().catch(err => {
  console.error('Capture script error:', err);
  process.exit(1);
});
