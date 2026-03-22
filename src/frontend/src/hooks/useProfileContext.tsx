import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useActor } from "./useActor";

const LS_KEY = "hh_display_name";

interface ProfileContextValue {
  displayName: string;
  setDisplayName: (name: string) => void;
}

const ProfileContext = createContext<ProfileContextValue>({
  displayName: "",
  setDisplayName: () => {},
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { actor, isFetching } = useActor();
  const [displayName, setDisplayNameState] = useState<string>(
    () => localStorage.getItem(LS_KEY) || "",
  );
  // Track whether the user has explicitly set a name locally so we never overwrite it
  const userHasSetName = useRef<boolean>(!!localStorage.getItem(LS_KEY));

  // Seed from backend ONLY when there is no local value yet
  useEffect(() => {
    if (!actor || isFetching) return;
    if (userHasSetName.current) return;
    actor
      .getCallerUserProfile()
      .then((profile) => {
        if (profile?.name && !userHasSetName.current) {
          setDisplayNameState(profile.name);
          localStorage.setItem(LS_KEY, profile.name);
          userHasSetName.current = true;
        }
      })
      .catch(() => {});
  }, [actor, isFetching]);

  function setDisplayName(name: string) {
    userHasSetName.current = true;
    setDisplayNameState(name);
    localStorage.setItem(LS_KEY, name);
  }

  return (
    <ProfileContext.Provider value={{ displayName, setDisplayName }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileContext() {
  return useContext(ProfileContext);
}
