export function initErrorTracking() {
  if (typeof window === 'undefined') return;

  window.addEventListener('error', (event) => {
    console.error('Global error:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error?.stack || event.error
    });
    
    // In production, this could send to an external monitoring service
    if (import.meta.env.VITE_APP_ENV === 'production') {
      // Future: Send to monitoring service
      // sendErrorToMonitoring(event.error);
    }
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', {
      reason: event.reason,
      promise: event.promise
    });
    
    // In production, this could send to an external monitoring service
    if (import.meta.env.VITE_APP_ENV === 'production') {
      // Future: Send to monitoring service
      // sendErrorToMonitoring(event.reason);
    }
  });
}