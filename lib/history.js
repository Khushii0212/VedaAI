// ============================================================
// VedaAI — Assessment History (localStorage)
// Stores up to 10 past assessments for quick re-access.
// ============================================================

const STORAGE_KEY = 'vedaai_history';
const MAX_HISTORY = 10;

/**
 * Load all history entries from localStorage.
 * @returns {Array}
 */
export function loadHistory() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save a completed assessment to history.
 * Stores the full result including page data URLs.
 * Limits to MAX_HISTORY entries (oldest removed first).
 * @param {Object} result - Full assessment result
 */
export function saveToHistory(result) {
  if (typeof window === 'undefined') return;
  try {
    const history = loadHistory();

    const entry = {
      id: result.id,
      savedAt: new Date().toISOString(),
      questionFileName: result.questionPaper.fileName,
      answerFileName: result.answerSheet.fileName,
      questionPageCount: result.questionPaper.pageCount,
      answerPageCount: result.answerSheet.pageCount,
      summary: result.summary,
      // Store the full result for reload
      result,
    };

    // Remove duplicate if same id
    const filtered = history.filter((h) => h.id !== entry.id);

    // Prepend new entry and trim to max
    const updated = [entry, ...filtered].slice(0, MAX_HISTORY);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (storageErr) {
      // If storage quota exceeded, store without page images (metadata only)
      const lite = updated.map((e) => ({
        ...e,
        result: {
          ...e.result,
          questionPaper: { ...e.result.questionPaper, pages: [] },
          answerSheet: { ...e.result.answerSheet, pages: [] },
        },
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lite));
    }
  } catch (err) {
    console.warn('Failed to save assessment to history:', err);
  }
}

/**
 * Delete a specific history entry by id.
 * @param {string} id
 */
export function deleteFromHistory(id) {
  if (typeof window === 'undefined') return;
  try {
    const history = loadHistory();
    const updated = history.filter((h) => h.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to delete history entry:', err);
  }
}

/**
 * Clear all history.
 */
export function clearHistory() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

/**
 * Format a saved date for display.
 * @param {string} isoString
 * @returns {string}
 */
export function formatHistoryDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
