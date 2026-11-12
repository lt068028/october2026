const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');

const root = path.resolve(__dirname, '..');
const js = fs.readFileSync(path.join(root, 'practice8.2.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'practice8.2.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');

let checks = 0;
function ok(condition, message) {
    assert.ok(condition, message);
    checks += 1;
}
function count(text, pattern) {
    return (text.match(pattern) || []).length;
}

ok(count(js, /const COPY82_HEADERS = \[/g) === 1, 'one stable Copy header definition');
ok(count(js, /Copy my sentences/g) === 1, 'one Copy button label');
ok(count(js, /Copy your drill results to review or share\./g) === 1, 'one Copy helper text');
ok(count(js, /function entriesFor82\(si\)/g) === 1, 'Drill-level transcript collector exists');
ok(count(js, /function mountCopyAreas82\(\)/g) === 1, 'one Copy mounting function');
ok(js.includes('for (let si = 0; si < 4; si += 1)'), 'exactly four Drill areas are mounted');
ok(js.includes("rowsFor(si).forEach"), 'Copy reads the existing Drill row structure');
ok(js.includes('saved.get(keyFor(r))'), 'Copy reads the existing saved recording map');
ok(js.includes("typeof raw !== 'string' || !raw.trim()"), 'blank transcripts are excluded');
ok(js.includes('if (r.pending) return'), 'pending Drill 3 answers are excluded');
ok(js.includes("navigator.clipboard.writeText"), 'Clipboard API is used');
ok(js.includes("status.textContent = 'Copied!'"), 'success feedback exists');
ok(js.includes("Could not copy. Please allow clipboard access."), 'failure feedback exists');
ok(js.includes("role', 'status'") && js.includes("aria-live', 'polite'"), 'status is announced accessibly');
ok(js.includes('Boolean(session || preparing)'), 'recording/preparation disables Copy');
ok(js.includes("group.querySelectorAll(':scope > .p82-copy-area"), 'duplicate areas are removed within each Drill');
ok(js.includes("lastCard.nextElementSibling !== area"), 'area is placed after the final card');
ok(!html.includes('p82-copy-area'), 'HTML does not add static or Example Copy areas');
ok(css.includes('.practice82-page .p82-copy-area'), 'Practice 8.2-specific Copy CSS exists');
ok(css.includes('.practice82-page .p82-copy-button:disabled'), 'disabled-state CSS exists');
ok(!css.includes('.practice82-page .p81-copy-area'), '8.1 Copy selectors are not reused for 8.2');

console.log('PASS Practice 8.2 Copy contract', checks);
