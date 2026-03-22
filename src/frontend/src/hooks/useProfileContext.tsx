import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
} from "react";

const LS_KEY = "hh_display_name";

// Simple external store for display name
let listeners: Array<() => void> = [];

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot() {
  return localStorage.getItem(LS_KEY) || "";
}

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export function setGlobalDisplayName(name: string) {
  localStorage.setItem(LS_KEY, name);
  emitChange();
}

interface ProfileContextValue {
  displayName: string;
  setDisplayName: (name: string) => void;
}

const ProfileContext = createContext<ProfileContextValue>({
  displayName: "",
  setDisplayName: () => {},
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const displayName = useSyncExternalStore(subscribe, getSnapshot, () => "");

  const setDisplayName = useCallback((name: string) => {
    setGlobalDisplayName(name);
  }, []);

  return (
    <ProfileContext.Provider value={{ displayName, setDisplayName }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileContext() {
  return useContext(ProfileContext);
}
