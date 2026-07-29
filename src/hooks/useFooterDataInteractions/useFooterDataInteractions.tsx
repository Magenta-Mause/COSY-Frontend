import { useQueryClient } from "@tanstack/react-query";
import { getGetFooterQueryKey, useUpdateFooter } from "@/api/generated/backend-api.ts";
import type { FooterUpdateDto } from "@/api/generated/model";
import { notificationModal } from "@/lib/notificationModal";
import { useAppDispatch } from "@/stores/hooks.ts";
import { footerSliceActions } from "@/stores/slices/footerSlice.ts";
import useTranslationPrefix from "../useTranslationPrefix/useTranslationPrefix";

const useFooterDataInteractions = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { t } = useTranslationPrefix("toasts");

  const { mutateAsync: updateFooterMutateAsync } = useUpdateFooter({
    mutation: {
      onSuccess: (updatedFooter) => {
        dispatch(footerSliceActions.updateFooter(updatedFooter));
        notificationModal.success({ message: t("updateFooterSuccess") });
      },
      onError: (err) => {
        notificationModal.error({ message: t("updateFooterError"), cause: err });
        throw err;
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: getGetFooterQueryKey(),
        });
      },
    },
  });

  const updateFooter = async (data: FooterUpdateDto) => {
    return await updateFooterMutateAsync({ data });
  };

  return {
    updateFooter,
  };
};

export default useFooterDataInteractions;
