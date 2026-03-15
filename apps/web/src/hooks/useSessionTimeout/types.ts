export interface UseSessionTimeoutOptions {
  /** Timeout duration in seconds (default: 20 minutes) */
  timeoutDuration?: number;
  /** Warning duration before timeout in seconds (default: 2 minutes) */
  warningDuration?: number;
  /** Callback when session is about to expire */
  onWarning?: () => void;
  /** Callback when session expires */
  onTimeout?: () => void;
  /** Redirect path on timeout (default: "/login") */
  redirectPath?: string;
}

export interface UseSessionTimeoutReturn {
  resetTimer: () => void;
  lastActivity: number;
}
