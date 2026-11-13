// Browser-rendered feedback contract. Recorded results are supplied as fixtures.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const pages = [
  ['practice2.1', 'practice2.1.js'],
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

async function open(browser, name, inline) {
  const page = await browser.newPage();
  page.errors = [];
  page.on('pageerror', error => page.errors.push(error.message));
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
    let body = fs.readFileSync(file);
    if (inline && url.pathname === '/feedback-status-icons.js') {
      body += `
        window.retryRenders = new WeakMap();
        const feedbackStatus = window.FeedbackStatus;
        window.FeedbackStatus = {
          ...feedbackStatus,
          setMismatch(element, options) {
            feedbackStatus.setMismatch(element, options);
            window.retryRenders.set(element, {
              options,
              direct: element.firstElementChild?.matches('svg.p21-retry-fire'),
              label: element.className,
              lang: element.lang,
              text: element.textContent
            });
          }
        };
      `;
    }
    return route.fulfill({ status: 200, body, contentType: type });
  });
  await page.goto(`http://feedback-contract.test/${name}.html`);
  await settle(page);
  ok(page.errors.length === 0, `${name} has no runtime errors: ${page.errors.join('; ')}`);
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
      fire: fire?.outerHTML || '',
      color: retry && getComputedStyle(retry).color,
      visible: retry?.getBoundingClientRect().width > 0,
      box: [box.backgroundColor, box.borderWidth, box.padding],
      inner: [inner.backgroundColor, inner.borderWidth, inner.padding],
      oldText: document.body.innerText.includes('Try once more!'),
      oldEmoji: /[✅❌🔥]/u.test(document.querySelector('#feedback-contract-fixture').innerText),
      scrollWidth: document.documentElement.scrollWidth
    };
  });
  ok(state.accepted, `${name} ${width}/${theme}: accepted badge rendered`);
  ok(state.acceptedSvg.includes('viewBox="0 0 24 24"'), `${name}: accepted SVG rendered`);
  ok(state.mismatch && state.fire.includes('width="20"') && state.fire.includes('height="20"'), `${name}: 20px mismatch SVG rendered`);
  ok(state.visible && state.color === (theme === 'dark' ? 'rgb(228, 173, 105)' : 'rgb(180, 119, 50)'),
    `${name}: standard retry label has the approved ${theme} color`);
  ok(state.retryText === 'Keep going!', `${name}: approved retry text rendered`);
  ok(state.box[0] === 'rgba(0, 0, 0, 0)' && state.box[1] === '0px' && state.box[2] === '0px', `${name}: correction box has no legacy decoration`);
  ok(state.inner[0] === 'rgba(0, 0, 0, 0)' && state.inner[1] === '0px' && state.inner[2] === '0px', `${name}: retry label has no legacy decoration`);
  ok(!state.oldText && !state.oldEmoji, `${name}: fixture has no legacy retry text or emoji`);
  ok(state.scrollWidth <= width, `${name}: no horizontal overflow at ${width}px`);
}

async function renderInlineContract(page, name, width, theme) {
  const key = await page.evaluate(() => {
    const key = Object.keys(practice2State.views)[0];
    practice2State.savedResults[key] = {
      rawTranscript: 'きのう としょかんで ほんを よみました。',
      expectedText: 'あ', modelText: 'あ', isCorrect: false
    };
    renderAll();
    return key;
  });
  await settle(page);
  const state = await page.evaluate(key => {
    const { resultSpan, corrTextSpan, stopBtn } = practice2State.views[key];
    const fire = resultSpan.querySelector('.p21-feedback-transcript-group > svg.p21-retry-fire');
    const label = getComputedStyle(corrTextSpan);
    return {
      render: retryRenders.get(corrTextSpan),
      grouped: Boolean(fire && fire.nextElementSibling?.matches('.p21-recognized-text')),
      dimensions: fire && [fire.getBoundingClientRect().width, fire.getBoundingClientRect().height],
      labelMoved: corrTextSpan.parentElement === resultSpan,
      visible: corrTextSpan.getBoundingClientRect().width > 0,
      decoration: [label.backgroundColor, label.borderWidth, label.padding, label.boxShadow],
      fireColor: fire && getComputedStyle(fire).color,
      labelColor: label.color,
      oldDisplay: /Try once more!|[✅❌🔥]/u.test(resultSpan.innerText),
      measured: stopBtn.closest('.recording-controls').classList.contains('p21-feedback-inline-wrap'),
      scrollWidth: document.documentElement.scrollWidth
    };
  }, key);
  const context = `${name} ${width}/${theme}`;
  ok(state.render?.options?.layout === 'inline' && state.render.options.status === 'mismatch'
    && state.render.direct && state.render.label.split(' ').includes('p21-retry-label')
    && state.render.lang === 'en' && state.render.text === 'Keep going!', `${context}: page uses inline helper DOM`);
  ok(state.grouped && state.labelMoved && state.measured && state.visible, `${context}: helper DOM reaches the Stop-row layout`);
  const retryColor = theme === 'dark' ? 'rgb(228, 173, 105)' : 'rgb(180, 119, 50)';
  ok(state.dimensions?.every(size => size === 20) && state.fireColor === retryColor && state.labelColor === retryColor,
    `${context}: Fire size and approved theme color`);
  ok(JSON.stringify(state.decoration) === JSON.stringify(['rgba(0, 0, 0, 0)', '0px', '0px', 'none'])
    && !state.oldDisplay, `${context}: inline display has no legacy decoration`);
  ok(state.scrollWidth <= width, `${context}: inline result has no horizontal overflow`);

  const transitions = await page.evaluate(key => {
    const view = practice2State.views[key];
    const base = {rawTranscript: 'あ', expectedText: 'あ', modelText: 'あ'};
    const states = [
      {isCorrect: true, judgment: 'accepted'},
      {isCorrect: false, judgment: 'undetermined'},
      {isCorrect: false, unrecognized: true},
      {isCorrect: false, audioOnly: true},
      {}
    ];
    return states.map((saved, index) => {
      if (index) practice2ShowResult(view, {...base, isCorrect: false}, key, 1);
      practice2ShowResult(view, {...base, ...saved}, key, 1);
      return {
        accepted: Boolean(view.resultSpan.querySelector('.feedback-status-accepted')),
        stale: Boolean(view.resultSpan.querySelector('.p21-retry-fire'))
          || view.corrTextSpan.matches('.p21-retry-label, [lang]')
          || view.corrTextSpan.hasChildNodes()
      };
    });
  }, key);
  ok(transitions[0].accepted && transitions.every(({stale}) => !stale),
    `${context}: accepted uses shared badge and non-mismatches clear reused retry DOM`);
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || chromium.executablePath(), args: ['--no-sandbox'] });
  try {
    for (const [name, script] of pages) {
      const html = targetSource(`${name}.html`);
      const js = targetSource(script);
      const inline = /^practice2\.[123]$/.test(name);
      const helperIndex = html.search(/<script src="feedback-status-icons\.js\?v=[^"]+"><\/script>/);
      ok(helperIndex >= 0 && helperIndex < html.indexOf(`<script src="${script}?`), `${name}: versioned shared helper loaded before page script`);
      const acceptedHelper = name === 'practice2.1' ? /FeedbackStatus\.create\(status\)/ : /FeedbackStatus\.(append|prepend)Accepted\(/;
      ok(acceptedHelper.test(js) && /FeedbackStatus\.setMismatch\(/.test(js), `${name}: accepted/mismatch helper calls present`);
      ok(!js.includes('Try once more!'), `${name}: primary JS has no obsolete retry text`);
      const page = await open(browser, name, inline);
      for (const width of widths) for (const theme of ['light', 'dark']) {
        await renderContract(page, name, width, theme);
        if (inline) {
          await page.locator('#feedback-contract-fixture').evaluate(element => element.remove());
          await renderInlineContract(page, name, width, theme);
        }
      }
      ok(page.errors.length === 0, `${name}: rendering has no runtime errors: ${page.errors.join('; ')}`);
      await page.close();
    }
    console.log(`PASS feedback-rendering-contract (${checks} checks)`);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
