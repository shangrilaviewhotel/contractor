import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

const html = fs.readFileSync('product-automation.html', 'utf8');
const rules = fs.readFileSync('firestore.rules', 'utf8');
const firebase = fs.readFileSync('firebase.js', 'utf8');
const launcher = fs.readFileSync('product-automation-launcher.js', 'utf8');

const match = html.match(/<script type="module">([\s\S]*?)<\/script>/i);
assert.ok(match, 'Product automation page must contain its module script');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'akeem-automation-'));
try {
  const modulePath = path.join(temp, 'product-automation.mjs');
  const launcherPath = path.join(temp, 'launcher.js');
  fs.writeFileSync(modulePath, match[1]);
  fs.writeFileSync(launcherPath, launcher);
  for (const file of [modulePath, launcherPath]) {
    const check = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    assert.equal(check.status, 0, `JavaScript syntax check failed for ${path.basename(file)}: ${check.stderr}`);
  }
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}

assert.match(html, /ADMIN_EMAIL='akeem\.fatai15@gmail\.com'/, 'Only the configured Akeem Store owner is allowed');
assert.match(html, /user\.emailVerified/, 'Owner email must be verified');
assert.match(html, /collection\(db,'marketingCampaigns'\)/, 'Campaigns must use the dedicated Firestore collection');
assert.match(html, /recipientOptIn/, 'Direct WhatsApp recipient requires opt-in confirmation');
assert.match(html, /c\.status==='approved'/, 'WhatsApp action must be shown only for approved campaigns');
assert.match(html, /c\.status!=='approved'/, 'Approved campaigns must not be editable');
assert.match(html, /window\.open\(url/, 'WhatsApp share action must be user initiated');
assert.doesNotMatch(html, /graph\.facebook\.com|messages\.send|sendWhatsAppMessage/i, 'No unconfigured direct message sender may be present');
assert.match(firebase, /product-automation-launcher\.js/, 'Existing admin dashboard must load the sidebar link');
assert.match(launcher, /querySelector\('\.sidebar-nav'\)/, 'Sidebar integration must target the existing navigation');
assert.match(rules, /match \/marketingCampaigns\/{campaignId}/, 'Campaign collection must have explicit rules');
assert.match(rules, /data\.recipientOptIn == true/, 'Firestore rules must enforce recipient opt-in');
assert.match(rules, /resource\.data\.status != 'approved'/, 'Approved campaigns must be immutable');
assert.match(rules, /request\.auth\.token\.email == 'akeem\.fatai15@gmail\.com'/, 'Firestore access must be restricted to the store owner');

console.log('Akeem Store product automation static checks passed.');
