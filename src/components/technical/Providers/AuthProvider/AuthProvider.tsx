import { type ReactNode, useEffect } from "react";
import useDataLoading from "@/hooks/useDataLoading/useDataLoading.tsx";

const AuthProvider = (props: { children: ReactNode }) => {
  const { loadAllData } = useDataLoading();
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);
  return props.children;
};

export default AuthProvider;
