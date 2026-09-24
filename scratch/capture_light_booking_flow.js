const fs = require('fs');
const path = require('path');
let puppeteer;
try {
  puppeteer = require('puppeteer-core');
} catch (e) {
  puppeteer = require(path.join(__dirname, '../apps/web/node_modules/puppeteer-core'));
}

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
    console.log(`[LIGHT THEME] Saved screenshot: ${outPath}`);
  }
}

async function forceLightTheme(page) {
  await page.evaluate(() => {
    localStorage.setItem('aviqora_theme', 'light');
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  });
  await new Promise(r => setTimeout(r, 400));
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();

  console.log('1. Capturing Homepage in Light Theme...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await forceLightTheme(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await saveScreenshot(page, 'demo_01_homepage.png');

  console.log('2. Clicking Search & Capturing Flight Search Results Page in Light Theme...');
  await page.goto('http://localhost:3000/flights?fromCode=IST&toCode=LHR', { waitUntil: 'networkidle2' });
  await forceLightTheme(page);
  await page.evaluate(() => window.scrollTo(0, 200));
  await new Promise(r => setTimeout(r, 1200));
  await saveScreenshot(page, 'demo_02_flight_search_results.png');

  console.log('3. Clicking Select Ticket / Seat Selection Modal in Light Theme...');
  await page.evaluate(() => {
    const selectBtn = Array.from(document.querySelectorAll('button')).find(b => 
      b.innerText.includes('Koltuk') || b.innerText.includes('Bilet Seç') || b.innerText.includes('Seç') || b.innerText.includes('Select')
    );
    if (selectBtn) selectBtn.click();
  });
  await forceLightTheme(page);
  await new Promise(r => setTimeout(r, 1500));
  await saveScreenshot(page, 'demo_03_interactive_seat_selection.png');

  console.log('4. Capturing Passenger Info & Checkout Form Step in Light Theme...');
  await page.evaluate(() => {
    // Select an available seat if seat map open
    const availableSeat = document.querySelector('.seat.available, div[data-seat-code]');
    if (availableSeat) availableSeat.click();
    const continueBtn = Array.from(document.querySelectorAll('button')).find(b => 
      b.innerText.includes('Devam') || b.innerText.includes('Ödeme') || b.innerText.includes('Proceed')
    );
    if (continueBtn) continueBtn.click();
  });
  await forceLightTheme(page);
  await new Promise(r => setTimeout(r, 1500));
  await saveScreenshot(page, 'demo_04_passenger_checkout_form.png');

  console.log('5. Capturing 3D Secure OTP Payment Modal in Light Theme...');
  await page.evaluate(() => {
    const payBtn = Array.from(document.querySelectorAll('button')).find(b => 
      b.innerText.includes('Öde') || b.innerText.includes('Pay') || b.innerText.includes('Tamamla')
    );
    if (payBtn) payBtn.click();
  });
  await forceLightTheme(page);
  await new Promise(r => setTimeout(r, 1500));
  await saveScreenshot(page, 'demo_05_payment_3d_otp.png');

  console.log('6. Capturing Issued Boarding Pass & PNR Ticket in Light Theme...');
  await page.goto('http://localhost:3000/checkin', { waitUntil: 'networkidle2' });
  await forceLightTheme(page);
  await new Promise(r => setTimeout(r, 1200));
  await saveScreenshot(page, 'demo_06_boarding_pass_pnr.png');

  console.log('7. Capturing Live Flight Tracker Modal in Light Theme...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await forceLightTheme(page);
  await page.evaluate(() => {
    const trackerBtn = Array.from(document.querySelectorAll('button')).find(b => 
      b.innerText.includes('Canlı Uçuş') || b.innerText.includes('Flight Tracker') || b.innerText.includes('Status')
    );
    if (trackerBtn) trackerBtn.click();
  });
  await forceLightTheme(page);
  await new Promise(r => setTimeout(r, 1500));
  await saveScreenshot(page, 'demo_07_live_flight_radar.png');

  console.log('8. Capturing Admin Operations Panel in Light Theme...');
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2' });
  await forceLightTheme(page);
  await new Promise(r => setTimeout(r, 1500));
  await saveScreenshot(page, 'demo_08_admin_dashboard.png');

  await browser.close();
  console.log('All 8 LIGHT THEME screenshots captured successfully!');
}

run().catch(err => {
  console.error('Capture script error:', err);
  process.exit(1);
});
