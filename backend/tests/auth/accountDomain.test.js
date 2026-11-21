import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getEmailDomain } from '../../src/utils/accountDomain.js';

test('getEmailDomain lowercases the domain', () => {
  assert.equal(getEmailDomain('Juan.DC@Student.MCU.edu.ph'), 'student.mcu.edu.ph');
  assert.equal(getEmailDomain('ict@mcu.edu.ph'), 'mcu.edu.ph');
});

test('getEmailDomain rejects values without a domain', () => {
  assert.equal(getEmailDomain('no-at-sign'), null);
  assert.equal(getEmailDomain('@mcu.edu.ph'), null);
  assert.equal(getEmailDomain(undefined), null);
});
