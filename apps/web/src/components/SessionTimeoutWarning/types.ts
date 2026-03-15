export interface SessionTimeoutWarningProps {
  remainingSeconds: number;
  onExtendSession: () => void | Promise<void>;
  onLogout: () => void | Promise<void>;
}
