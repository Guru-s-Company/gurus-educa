/**
 * @file Shared utilities for UI components
 */

/**
 * Simple classnames merger.
 * Handles strings, undefined, null, false, and objects with boolean values.
 * @param {...(string|undefined|null|false|Record<string, boolean>)} classes
 * @returns {string}
 */
export function cn(...classes) {
  const result = [];
  for (const cls of classes) {
    if (!cls) continue;
    if (typeof cls === 'string') {
      result.push(cls);
    } else if (typeof cls === 'object') {
      for (const [key, value] of Object.entries(cls)) {
        if (value) result.push(key);
      }
    }
  }
  return result.join(' ');
}

/**
 * Hook to generate stable IDs for form fields and their associated elements.
 * @param {string} [providedId] - Optional explicit ID from props
 * @returns {{
 *   inputId: string,
 *   errorId: string,
 *   hintId: string,
 *   getAriaDescribedBy: (hasError: boolean, hasHint: boolean) => string | undefined
 * }}
 */
import { useId } from 'react';

export function useFieldIds(providedId) {
  const generatedId = useId();
  const inputId = providedId ?? generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  const getAriaDescribedBy = (hasError, hasHint) => {
    const ids = [];
    if (hasError) ids.push(errorId);
    if (hasHint) ids.push(hintId);
    return ids.length > 0 ? ids.join(' ') : undefined;
  };

  return {
    inputId,
    errorId,
    hintId,
    getAriaDescribedBy,
  };
}