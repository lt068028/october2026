// Browser-rendered feedback contract for PR #10. Audio/STT are not exercised here.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const pages = [
  ['practice2.2', 'practice2-next.js'],
  ['practice2.3', 'practice2-next.js'],
  ['practice7.1', 'practice7.1.js'],
  ['practice7.3', 'practice7.3.js'],
  ['practice8.1', 'practice8.1.js'],
  ['pronunciation2', 'pronunciation2.js'],
  ['composition1', 'composition1.js']
];
const widths = [375, 600, 1440];
let checks = 0;
const ok = (value, message) => { assert.ok(value, message); checks++; };

function targetSource(name) {
  return fs.readFileSync(path.join(root, name), 'utf8');
}

async function settle(page) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function open(browser, name) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    window.speechSynthesis = { speak() {}, cancel() {}, getVoices() { return []; } };
    window.MediaRecorder = class { start() {} stop() {} };
    navigator.mediaDevices = { getUserMedia: async () => ({ getTracks: () => [] }) };
  });
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.hostname !== 'feedback-contract.test') return route.abort();
    const file = path.join(root, url.pathname);
    if (!fs.existsSync(file)) return route.fulfill({ status: 404, body: '' });
    const type = file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html';
    return route.fulfill({ status: 200, body: fs.readFileSync(file), contentType: type });
  });
  await page.goto(`http://feedback-contract.test/${name}.html`);
  await settle(page);
  ok(errors.length === 0, `${name} has no runtime errors: ${errors.join('; ')}`);
  return page;
}

async function renderContract(page, name, width, theme) {
  await page.setViewportSize({ width, height: 1000 });
  await page.emulateMedia({ colorScheme: theme });
  await page.evaluate(() => {
    document.querySelector('#feedback-contract-fixture')?.remove();
    const host = document.createElement('div');
    host.id = 'feedback-contract-fixture';
    host.innerHTML = '<div class="recording-result"><span class="result-text"></span><div class="correction-box"><span></span></div></div>';
    document.body.append(host);
    const result = host.querySelector('.result-text');
    const correction = host.querySelector('.correction-box');
    const text = correction.firstElementChild;
    window.feedbackContract = { host, result, correction, text };
    FeedbackStatus.appendAccepted(result, 'accepted transcript');
    FeedbackStatus.setMismatch(text);
    correction.style.display = 'block';
  });
  await settle(page);
  const state = await page.evaluate(() => {
    const { result, correction, text } = window.feedbackContract;
    const accepted = result.querySelector('.feedback-status-accepted');
    const retry = text.querySelector('.feedback-retry-label');
    const fire = text.querySelector('.feedback-retry-fire');
    const box = getComputedStyle(correction);
    const inner = getComputedStyle(text);
    return {
      accepted: Boolean(accepted),
      acceptedSvg: accepted?.querySelector('svg')?.outerHTML || '',
      mismatch: Boolean(retry),
      retryText: retry?.textContent || '',
      fire: Boolean(fire),
      box: [box.backgroundColor, box.borderWidth, box.padding],
      inner: [inner.backgroundColor, inner.borderWidth, inner.padding],
      oldText: document.body.innerText.includes('Try once more!'),
      oldEmoji: /[✅❌🔥]/u.test(document.querySelector('#feedback-contract-fixture').innerText),
      scrollWidth: document.documentElement.scrollWidth
    };
  });
  ok(state.accepted, `${name} ${width}/${theme}: accepted badge rendered`);
  ok(state.acceptedSvg.includes('viewBox="0 0 24 24"'), `${name}: accepted SVG rendered`);
  ok(state.mismatch && state.fire, `${name}: mismatch fire rendered`);
  ok(state.retryText === 'Keep going!', `${name}: approved retry text rendered`);
  ok(state.box[0] === 'rgba(0, 0, 0, 0)' && state.box[1] === '0px' && state.box[2] === '0px', `${name}: correction box has no legacy decoration`);
  ok(state.inner[0] === 'rgba(0, 0, 0, 0)' && state.inner[1] === '0px' && state.inner[2] === '0px', `${name}: retry label has no legacy decoration`);
  ok(!state.oldText && !state.oldEmoji, `${name}: fixture has no legacy retry text or emoji`);
  ok(state.scrollWidth <= width, `${name}: no horizontal overflow at ${width}px`);
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || chromium.executablePath(), args: ['--no-sandbox'] });
  try {
    for (const [name, script] of pages) {
      const html = targetSource(`${name}.html`);
      const js = targetSource(script);
      ok(html.includes('feedback-status-icons.js?v=20261112-feedback-status') || html.includes('feedback-status-icons.js?v=20261112-allpages'), `${name}: shared helper loaded`);
      ok((js.includes('FeedbackStatus.appendAccepted') || js.includes('FeedbackStatus.prependAccepted')) && js.includes('FeedbackStatus.setMismatch'), `${name}: accepted/mismatch helper calls present`);
      ok(!js.includes('Try once more!'), `${name}: primary JS has no obsolete retry text`);
      const page = await open(browser, name);
      for (const width of widths) for (const theme of ['light', 'dark']) await renderContract(page, name, width, theme);
      await page.close();
    }
    console.log(`PASS feedback-rendering-contract (${checks} checks)`);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
