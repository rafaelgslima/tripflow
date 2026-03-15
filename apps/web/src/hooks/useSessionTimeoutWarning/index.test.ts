import { renderHook, act, waitFor } from "@testing-library/react";
import { useSessionTimeoutWarning } from "./index";
import * as useSessionTimeoutModule from "@/hooks/useSessionTimeout";

jest.mock("@/hooks/useSessionTimeout");

describe("useSessionTimeoutWarning", () => {
  let mockResetTimer: jest.Mock;
  let mockOnLogout: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockResetTimer = jest.fn();
    mockOnLogout = jest.fn().mockResolvedValue(undefined);

    (useSessionTimeoutModule.useSessionTimeout as jest.Mock).mockReturnValue({
      resetTimer: mockResetTimer,
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
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

    (useSessionTimeoutModule.useSessionTimeout as jest.Mock).mockImplementation(
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

    (useSessionTimeoutModule.useSessionTimeout as jest.Mock).mockImplementation(
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
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.remainingSeconds).toBe(119);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(result.current.remainingSeconds).toBe(117);
  });

  it("should extend session and hide warning when handleExtendSession is called", () => {
    let capturedOnWarning: (() => void) | null = null;

    (useSessionTimeoutModule.useSessionTimeout as jest.Mock).mockImplementation(
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

    (useSessionTimeoutModule.useSessionTimeout as jest.Mock).mockImplementation(
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

    (useSessionTimeoutModule.useSessionTimeout as jest.Mock).mockImplementation(
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

    (useSessionTimeoutModule.useSessionTimeout as jest.Mock).mockImplementation(
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

    const clearIntervalSpy = jest.spyOn(global, "clearInterval");

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();

    clearIntervalSpy.mockRestore();
  });
});
