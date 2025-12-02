import { type ReactNode, useEffect } from "react";
import useDataLoading from "@/hooks/useDataLoading/useDataLoading.tsx";

const AuthProvider = (props: { children: ReactNode }) => {
  const { loadGameServers } = useDataLoading();
  useEffect(() => {
    loadGameServers();
  }, [loadGameServers]);
  return props.children;
};

export default AuthProvider;
