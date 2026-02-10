/**
 * Utility for safely extracting user-friendly error messages from release ownership failures.
 * Handles IC agent errors, unknown thrown values, and prevents raw JSON/code from appearing in UI.
 */

/**
 * Safely extracts a plain-English error message from any thrown value.
 * Never returns raw JSON, [object Object], or code-like strings.
 */
export function extractReleaseErrorMessage(error: unknown): string {
  // Handle null/undefined
  if (error == null) {
    return 'An unknown error occurred while releasing phone ownership';
  }

  // Handle Error objects
  if (error instanceof Error) {
    return mapBackendErrorToUserMessage(error.message);
  }

  // Handle string errors
  if (typeof error === 'string') {
    return mapBackendErrorToUserMessage(error);
  }

  // Handle IC agent-style errors with nested structure
  if (typeof error === 'object') {
    // Try to extract reject message (common IC pattern)
    const errorObj = error as any;
    
    if (errorObj.reject_message && typeof errorObj.reject_message === 'string') {
      return mapBackendErrorToUserMessage(errorObj.reject_message);
    }
    
    if (errorObj.message && typeof errorObj.message === 'string') {
      return mapBackendErrorToUserMessage(errorObj.message);
    }

    // Try to extract from nested error property
    if (errorObj.error) {
      if (typeof errorObj.error === 'string') {
        return mapBackendErrorToUserMessage(errorObj.error);
      }
      if (errorObj.error.message && typeof errorObj.error.message === 'string') {
        return mapBackendErrorToUserMessage(errorObj.error.message);
      }
    }
  }

  // Fallback for any other type
  return 'Failed to release phone ownership. Please try again or contact support.';
}

/**
 * Maps known backend error messages to consistent, user-friendly English text.
 */
function mapBackendErrorToUserMessage(backendMessage: string): string {
  const lowerMessage = backendMessage.toLowerCase();

  // PIN-related errors
  if (lowerMessage.includes('invalid pin')) {
    return 'Invalid PIN. Please enter the correct 4-digit PIN.';
  }
  
  if (lowerMessage.includes('no pin set') || lowerMessage.includes('must set a 4-digit pin')) {
    return 'You must set a 4-digit PIN before you can release a phone. Please set your PIN in Profile settings.';
  }

  // Authorization errors
  if (lowerMessage.includes('unauthorized') || lowerMessage.includes('only the owner')) {
    return 'Only the phone owner can release ownership.';
  }

  // Phone not found errors
  if (lowerMessage.includes('hp not found') || lowerMessage.includes('phone not found') || lowerMessage.includes('not found')) {
    return 'Phone not found. Please check the IMEI and try again.';
  }

  // Already released
  if (lowerMessage.includes('already released') || lowerMessage.includes('no longer registered')) {
    return 'This phone has already been released from your account.';
  }

  // Return the original message if it's already user-friendly (no technical jargon)
  // Check if message contains technical patterns
  const hasTechnicalPatterns = /\{|\}|\[|\]|":|null|undefined|object|function|=>/.test(backendMessage);
  
  if (!hasTechnicalPatterns && backendMessage.length < 200) {
    return backendMessage;
  }

  // Fallback for unrecognized errors
  return 'Failed to release phone ownership. Please try again or contact support.';
}
