import { useId } from 'react';

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