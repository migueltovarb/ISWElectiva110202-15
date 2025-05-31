import { describe, it, expect } from 'vitest';
import {
  cn,
  formatDate,
  formatDateTime,
  truncateText,
  generateRandomString,
  isValidEmail,
} from './utils';

describe('utils.ts', () => {
  it('cn should combine class names and remove duplicates', () => {
    const result = cn('p-2', 'bg-white', 'p-2', null, undefined);
    expect(result).toBe('bg-white p-2'); // tailwind-merge reordena
  });

  describe('formatDate', () => {
    it('formats a valid UTC date string', () => {
      const result = formatDate('2023-10-05T00:00:00Z');
      expect(result).toMatch(/\d{2}\/\d{2}\/2023/);
    });

    it('returns empty string for empty input', () => {
      expect(formatDate('')).toBe('');
    });

    it('formats a Date object', () => {
      const date = new Date(Date.UTC(2023, 9, 5)); // Octubre = 9 (cero-based)
      const result = formatDate(date);
      expect(result).toMatch(/\d{2}\/\d{2}\/2023/);
    });
  });

  describe('formatDateTime', () => {
    it('formats a valid UTC datetime string', () => {
      const result = formatDateTime('2023-10-05T15:30:00Z');
      expect(result).toMatch(/\d{2}\/\d{2}\/2023/);
    });

    it('returns empty string for empty input', () => {
      expect(formatDateTime('')).toBe('');
    });

    it('formats a Date object', () => {
      const date = new Date(Date.UTC(2023, 9, 5, 15, 45));
      const result = formatDateTime(date);
      expect(result).toMatch(/\d{2}\/\d{2}\/2023/);
    });
  });

  describe('truncateText', () => {
    it('returns full text if shorter than maxLength', () => {
      expect(truncateText('hello', 10)).toBe('hello');
    });

    it('truncates long text correctly', () => {
      expect(truncateText('This is a long sentence.', 10)).toBe('This is a ...');
    });

    it('returns empty string for empty input', () => {
      expect(truncateText('', 5)).toBe('');
    });
  });

  describe('generateRandomString', () => {
    it('generates a string of default length 10', () => {
      const str = generateRandomString();
      expect(str).toHaveLength(10);
    });

    it('generates a string of specified length', () => {
      const str = generateRandomString(25);
      expect(str).toHaveLength(25);
    });

    it('contains only valid characters', () => {
      const str = generateRandomString(100);
      expect(str).toMatch(/^[A-Za-z0-9]+$/);
    });
  });

  describe('isValidEmail', () => {
    it('returns true for valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+label@domain.co')).toBe(true);
    });

    it('returns false for invalid emails', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('name@.com')).toBe(false);
    });
  });
});
