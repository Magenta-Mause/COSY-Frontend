import { useTranslation } from "react-i18next";

const useTranslationPrefix = (prefix: string) => {
  return useTranslation(undefined, { keyPrefix: prefix });
};

export default useTranslationPrefix;
