/**
 * Copy a text string to the clipboard.
 *
 * Tries the modern `navigator.clipboard.writeText` API first, then falls
 * back to the legacy `document.execCommand('copy')` trick for browsers/
 * contexts where the Clipboard API is unavailable (e.g. non-HTTPS, older
 * webviews) or the permission is denied.
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (!text) return false;

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to legacy fallback below
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const success = document.execCommand('copy');
    document.body.removeChild(textarea);

    return success;
  } catch {
    return false;
  }
};
