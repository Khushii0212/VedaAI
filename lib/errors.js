// ============================================================
// VedaAI — Error Handling Utilities
// ============================================================

export class VedaError extends Error {
  constructor(message, code, details) {
    super(message);
    this.name = 'VedaError';
    this.code = code;
    this.details = details;
  }
}

export const ErrorCodes = {
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  UNSUPPORTED_FILE_TYPE: 'UNSUPPORTED_FILE_TYPE',
  EMPTY_FILE: 'EMPTY_FILE',
  PDF_PARSE_ERROR: 'PDF_PARSE_ERROR',
  AI_API_ERROR: 'AI_API_ERROR',
  AI_INVALID_RESPONSE: 'AI_INVALID_RESPONSE',
  NO_QUESTIONS_DETECTED: 'NO_QUESTIONS_DETECTED',
  NO_ANSWERS_DETECTED: 'NO_ANSWERS_DETECTED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN',
};

export const ErrorMessages = {
  [ErrorCodes.FILE_TOO_LARGE]: 'The file is too large. Please upload a file under 20MB.',
  [ErrorCodes.UNSUPPORTED_FILE_TYPE]: 'This file type is not supported. Please upload a PDF, PNG, or JPG.',
  [ErrorCodes.EMPTY_FILE]: 'The uploaded file appears to be empty or corrupted.',
  [ErrorCodes.PDF_PARSE_ERROR]: 'We couldn\'t read this PDF. It may be corrupted or password-protected.',
  [ErrorCodes.AI_API_ERROR]: 'The AI service is temporarily unavailable. Please try again in a moment.',
  [ErrorCodes.AI_INVALID_RESPONSE]: 'The AI returned an unexpected response. Please try again.',
  [ErrorCodes.NO_QUESTIONS_DETECTED]: 'No questions were detected in the question paper. Please check the file and try again.',
  [ErrorCodes.NO_ANSWERS_DETECTED]: 'No answers were detected in the answer sheet. The handwriting may be unclear.',
  [ErrorCodes.NETWORK_ERROR]: 'A network error occurred. Please check your connection and try again.',
  [ErrorCodes.RATE_LIMIT]: 'Too many requests. Please wait a moment before trying again.',
  [ErrorCodes.TIMEOUT]: 'Processing took too long. Please try again with a smaller file.',
  [ErrorCodes.UNKNOWN]: 'An unexpected error occurred. Please try again.',
};

/**
 * Parse an API error and return a user-friendly message.
 */
export function getErrorMessage(error) {
  if (error instanceof VedaError) {
    return ErrorMessages[error.code] || error.message;
  }

  const msg = error?.message?.toLowerCase() || '';

  if (msg.includes('rate limit') || msg.includes('quota')) return ErrorMessages[ErrorCodes.RATE_LIMIT];
  if (msg.includes('timeout')) return ErrorMessages[ErrorCodes.TIMEOUT];
  if (msg.includes('network') || msg.includes('fetch')) return ErrorMessages[ErrorCodes.NETWORK_ERROR];
  if (msg.includes('api key') || msg.includes('unauthorized')) return 'Invalid API key. Please check your configuration.';

  return ErrorMessages[ErrorCodes.UNKNOWN];
}

/**
 * Validate file type and size.
 * @param {File} file
 * @param {number} maxSizeMB
 */
export function validateFile(file, maxSizeMB = 20) {
  const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
  const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];

  const ext = '.' + file.name.split('.').pop().toLowerCase();

  if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(ext)) {
    throw new VedaError(
      `Unsupported file type: ${file.type}`,
      ErrorCodes.UNSUPPORTED_FILE_TYPE
    );
  }

  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new VedaError(
      `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB`,
      ErrorCodes.FILE_TOO_LARGE
    );
  }

  if (file.size === 0) {
    throw new VedaError('File is empty', ErrorCodes.EMPTY_FILE);
  }
}

/**
 * Sanitize a filename for safe display.
 */
export function sanitizeFilename(name) {
  return name.replace(/[<>:"/\\|?*]/g, '').substring(0, 100);
}
