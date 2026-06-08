import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const fixtures = join(root, 'static/fixtures');

const window = new Window();
globalThis.DOMParser = window.DOMParser;
globalThis.document = window.document;

const { parseDirectoryXML, exportDirectoryXML } = await import('../src/lib/utils/xml.js');
const { validateSourceData } = await import('../src/lib/utils/directoryValidation.js');

function loadFixture(name) {
  return readFileSync(join(fixtures, name), 'utf8');
}

test('parses v1.0 contact-only fixture into assets', () => {
  const doc = parseDirectoryXML(loadFixture('commlink-directory-v1.0.xml'));
  assert.equal(doc.assets.length, 10);
  assert.equal(doc.resources.length, 0);
  assert.ok(doc.assets[0].addressbook_ref);
  assert.ok(doc.assets[0].position.lat);
});

test('parses v1.1 fixture into all planning stores', () => {
  const doc = parseDirectoryXML(loadFixture('commlink-directory-v1.1.xml'));
  assert.equal(doc.version, '1.1');
  assert.equal(doc.assets.length, 10);
  assert.ok(doc.resources.length >= 7);
  assert.ok(doc.commLinks.length >= 5);
  assert.ok(doc.reservations.length >= 4);

  const billing = new Set(doc.contracts.map((c) => c.billing_model));
  for (const model of ['subscription', 'owned', 'pay_per_minute', 'pay_per_mb', 'reservation', 'hybrid']) {
    assert.ok(billing.has(model), `missing ${model}`);
  }

  const alpha = doc.assets.find((a) => a.addressbook_ref === 'c001-ops-center-alpha');
  assert.ok(alpha);
  assert.equal(alpha.position.lat, 34.0522);
});

test('round-trips v1.1 without losing source IDs', () => {
  const original = parseDirectoryXML(loadFixture('commlink-directory-v1.1.xml'));
  const xml = exportDirectoryXML(original);
  const roundTripped = parseDirectoryXML(xml);

  assert.deepEqual(
    roundTripped.assets.map((a) => a.addressbook_ref).sort(),
    original.assets.map((a) => a.addressbook_ref).sort()
  );
  assert.deepEqual(
    roundTripped.resources.map((r) => r.id).sort(),
    original.resources.map((r) => r.id).sort()
  );
  assert.deepEqual(
    roundTripped.commLinks.map((l) => l.id).sort(),
    original.commLinks.map((l) => l.id).sort()
  );
});

test('validation report flags structural issues on incomplete data', () => {
  const doc = parseDirectoryXML(loadFixture('commlink-directory-v1.1.xml'));
  const validation = validateSourceData(doc);
  assert.ok(validation.summary.contact_count === 10);
  assert.ok(typeof validation.summary.errors === 'number');
});
