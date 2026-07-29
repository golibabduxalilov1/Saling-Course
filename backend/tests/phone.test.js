const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizePhone, normalizePhoneOrThrow } = require('../src/utils/phone');

test('turli formatdagi bir xil raqam bitta natijaga keltiriladi', () => {
  const expected = '+998901234567';
  const variants = [
    '+998901234567',
    '998901234567',
    '+998 90 123 45 67',
    '+998 (90) 123-45-67',
    '998-90-123-45-67',
    '00998901234567',
    '901234567',
    '90 123 45 67',
    '  +998901234567  ',
  ];

  for (const variant of variants) {
    assert.equal(normalizePhone(variant), expected, `"${variant}" noto'g'ri normallashtirildi`);
  }
});

test('boshqa mamlakat kodlari ham E.164 ko\'rinishida saqlanadi', () => {
  assert.equal(normalizePhone('+1 (555) 010-9999'), '+15550109999');
  assert.equal(normalizePhone('+7 912 345 67 89'), '+79123456789');
});

test('yaroqsiz va bo\'sh qiymatlar uchun null qaytadi', () => {
  const invalid = ['', '   ', null, undefined, 'salom', '+998 90 abc', '12345', '+9989012345671234567', '++998901234567'];

  for (const value of invalid) {
    assert.equal(normalizePhone(value), null, `"${value}" uchun null kutilgan edi`);
  }
});

test('normalizePhoneOrThrow bo\'sh raqamda 400 xato beradi', () => {
  assert.throws(
    () => normalizePhoneOrThrow(''),
    (err) => {
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /majburiy/);
      return true;
    }
  );
});

test('normalizePhoneOrThrow yaroqsiz raqamda 400 xato beradi', () => {
  assert.throws(
    () => normalizePhoneOrThrow('12345'),
    (err) => {
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /noto'g'ri formatda/);
      return true;
    }
  );
});

test('normalizePhoneOrThrow to\'g\'ri raqamni normallashtirib qaytaradi', () => {
  assert.equal(normalizePhoneOrThrow('+998 (90) 123-45-67'), '+998901234567');
});
