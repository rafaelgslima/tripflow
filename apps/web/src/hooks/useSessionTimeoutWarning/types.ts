export interface UseSessionTimeoutWarningParams {
  timeoutDuration: number;
  warningDuration: number;
  onLogout: () => Promise<void>;
}

export interface UseSessionTimeoutWarningReturn {
  showWarning: boolean;
  remainingSeconds: number;
  handleExtendSession: () => void;
  handleLogoutNow: () => Promise<void>;
}
