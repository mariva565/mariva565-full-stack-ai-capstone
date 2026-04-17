import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ConfirmModal } from "../components/confirm-modal";

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type PendingConfirm = ConfirmOptions & {
  resolve: (accepted: boolean) => void;
};

type ConfirmDialogContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const ConfirmDialogContext = createContext<ConfirmDialogContextValue>({
  confirm: async () => false,
});

export function useConfirmDialog() {
  return useContext(ConfirmDialogContext);
}

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const queueRef = useRef<PendingConfirm[]>([]);
  const pendingRef = useRef<PendingConfirm | null>(null);

  const showNext = useCallback(() => {
    const next = queueRef.current.shift() ?? null;
    pendingRef.current = next;
    setPending(next);
  }, []);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        queueRef.current.push({ ...options, resolve });
        if (!pendingRef.current) {
          showNext();
        }
      }),
    [showNext]
  );

  const closeWithResult = useCallback(
    (accepted: boolean) => {
      const current = pendingRef.current;
      if (!current) {
        return;
      }
      current.resolve(accepted);
      showNext();
    },
    [showNext]
  );

  const handleConfirm = useCallback(() => {
    closeWithResult(true);
  }, [closeWithResult]);

  const handleCancel = useCallback(() => {
    closeWithResult(false);
  }, [closeWithResult]);

  useEffect(() => {
    return () => {
      pendingRef.current?.resolve(false);
      for (const queued of queueRef.current) {
        queued.resolve(false);
      }
      queueRef.current = [];
      pendingRef.current = null;
    };
  }, []);

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      <ConfirmModal
        visible={Boolean(pending)}
        title={pending?.title ?? ""}
        message={pending?.message ?? ""}
        confirmLabel={pending?.confirmLabel}
        cancelLabel={pending?.cancelLabel}
        destructive={pending?.destructive ?? false}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmDialogContext.Provider>
  );
}
