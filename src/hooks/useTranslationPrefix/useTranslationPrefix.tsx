import type { KeyPrefix } from "i18next";
import { useTranslation } from "react-i18next";

const useTranslationPrefix = <TKeyPrefix extends KeyPrefix<"translation">>(
  prefix: TKeyPrefix,
) => {
  return useTranslation("translation", { keyPrefix: prefix });
};

export default useTranslationPrefix;
