import { renderHook, act, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useSessionTimeoutWarning } from "./index";
import * as useSessionTimeoutModule from "@/hooks/useSessionTimeout";

vi.mock("@/hooks/useSessionTimeout");

describe("useSessionTimeoutWarning", () => {
  let mockResetTimer: ReturnType<typeof vi.fn>;
  let mockOnLogout: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockResetTimer = vi.fn();
    mockOnLogout = vi.fn().mockResolvedValue(undefined);

    vi.mocked(useSessionTimeoutModule.useSessionTimeout).mockReturnValue({
      resetTimer: mockResetTimer,
    } as any);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("should initialize with warning hidden", () => {
    const { result } = renderHook(() =>
      useSessionTimeoutWarning({
        timeoutDuration: 1200,
        warningDuration: 120,
        onLogout: mockOnLogout,
      }),
    );

    expect(result.current.showWarning).toBe(false);
    expect(result.current.remainingSeconds).toBe(120);
  });

  it("should show warning when onWarning callback is triggered", () => {
    let capturedOnWarning: (() => void) | null = null;

    vi.mocked(useSessionTimeoutModule.useSessionTimeout).mockImplementation(
      ({ onWarning }) => {
        capturedOnWarning = onWarning;
        return { resetTimer: mockResetTimer };
      },
    );

    const { result } = renderHook(() =>
      useSessionTimeoutWarning({
        timeoutDuration: 1200,
        warningDuration: 120,
        onLogout: mockOnLogout,
      }),
    );

    act(() => {
      capturedOnWarning?.();
    });

    expect(result.current.showWarning).toBe(true);
    expect(result.current.remainingSeconds).toBe(120);
  });

  it("should countdown remaining seconds when warning is shown", () => {
    let capturedOnWarning: (() => void) | null = null;

    vi.mocked(useSessionTimeoutModule.useSessionTimeout).mockImplementation(
      ({ onWarning }) => {
        capturedOnWarning = onWarning;
        return { resetTimer: mockResetTimer };
      },
    );

    const { result } = renderHook(() =>
      useSessionTimeoutWarning({
        timeoutDuration: 1200,
        warningDuration: 120,
        onLogout: mockOnLogout,
      }),
    );

    act(() => {
      capturedOnWarning?.();
    });

    expect(result.current.remainingSeconds).toBe(120);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.remainingSeconds).toBe(119);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.remainingSeconds).toBe(117);
  });

  it("should extend session and hide warning when handleExtendSession is called", () => {
    let capturedOnWarning: (() => void) | null = null;

    vi.mocked(useSessionTimeoutModule.useSessionTimeout).mockImplementation(
      ({ onWarning }) => {
        capturedOnWarning = onWarning;
        return { resetTimer: mockResetTimer };
      },
    );

    const { result } = renderHook(() =>
      useSessionTimeoutWarning({
        timeoutDuration: 1200,
        warningDuration: 120,
        onLogout: mockOnLogout,
      }),
    );

    act(() => {
      capturedOnWarning?.();
    });

    expect(result.current.showWarning).toBe(true);

    act(() => {
      result.current.handleExtendSession();
    });

    expect(result.current.showWarning).toBe(false);
    expect(mockResetTimer).toHaveBeenCalledTimes(1);
  });

  it("should call onLogout and hide warning when handleLogoutNow is called", async () => {
    let capturedOnWarning: (() => void) | null = null;

    vi.mocked(useSessionTimeoutModule.useSessionTimeout).mockImplementation(
      ({ onWarning }) => {
        capturedOnWarning = onWarning;
        return { resetTimer: mockResetTimer };
      },
    );

    const { result } = renderHook(() =>
      useSessionTimeoutWarning({
        timeoutDuration: 1200,
        warningDuration: 120,
        onLogout: mockOnLogout,
      }),
    );

    act(() => {
      capturedOnWarning?.();
    });

    expect(result.current.showWarning).toBe(true);

    await act(async () => {
      await result.current.handleLogoutNow();
    });

    expect(result.current.showWarning).toBe(false);
    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });

  it("should hide warning when onTimeout callback is triggered", () => {
    let capturedOnWarning: (() => void) | null = null;
    let capturedOnTimeout: (() => void) | null = null;

    vi.mocked(useSessionTimeoutModule.useSessionTimeout).mockImplementation(
      ({ onWarning, onTimeout }) => {
        capturedOnWarning = onWarning;
        capturedOnTimeout = onTimeout;
        return { resetTimer: mockResetTimer };
      },
    );

    const { result } = renderHook(() =>
      useSessionTimeoutWarning({
        timeoutDuration: 1200,
        warningDuration: 120,
        onLogout: mockOnLogout,
      }),
    );

    act(() => {
      capturedOnWarning?.();
    });

    expect(result.current.showWarning).toBe(true);

    act(() => {
      capturedOnTimeout?.();
    });

    expect(result.current.showWarning).toBe(false);
  });

  it("should cleanup countdown interval on unmount", () => {
    let capturedOnWarning: (() => void) | null = null;

    vi.mocked(useSessionTimeoutModule.useSessionTimeout).mockImplementation(
      ({ onWarning }) => {
        capturedOnWarning = onWarning;
        return { resetTimer: mockResetTimer };
      },
    );

    const { result, unmount } = renderHook(() =>
      useSessionTimeoutWarning({
        timeoutDuration: 1200,
        warningDuration: 120,
        onLogout: mockOnLogout,
      }),
    );

    act(() => {
      capturedOnWarning?.();
    });

    const clearIntervalSpy = vi.spyOn(global, "clearInterval");

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();

    clearIntervalSpy.mockRestore();
  });
});
