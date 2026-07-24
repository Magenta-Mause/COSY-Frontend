import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import AutoCompleteItemList from "./AutoCompleteItemList";
import type { AutoCompleteInputFieldProps, GameServerCreationValue } from "./types";
import { useAutoComplete } from "./useAutoComplete";

function AutoCompleteInputField<TSelectedItem, TAutoCompleteData extends GameServerCreationValue>({
  attribute,
  selectionKey,
  validator,
  placeholder,
  onItemSelect,
  noAutoCompleteItemsLabelRenderer,
  noAutoCompleteItemsLabel,
  fallbackValue,
  searchId,
  searchCallback,
  disableDebounce,
  disableCache,
  defaultOpen,
  description,
  label,
  alwaysIncludeFallback,
}: AutoCompleteInputFieldProps<TSelectedItem, TAutoCompleteData>) {
  const { t } = useTranslationPrefix("components.CreateGameServer.autoCompleteInputField");

  const effectiveId = attribute ?? selectionKey;

  const {
    open,
    setOpen,
    displayName,
    isLoading,
    isError,
    autoCompleteItems,
    selectedIndex,
    inputRef,
    selectItem,
    handleInputChange,
    handleInputKeyDown,
    handleItemHover,
  } = useAutoComplete({
    attribute,
    selectionKey,
    validator,
    searchId,
    searchCallback,
    disableDebounce,
    disableCache,
    onItemSelect,
    alwaysIncludeFallback,
    fallbackValue,
    fallbackLabel: noAutoCompleteItemsLabel,
  });

  return (
    <Popover open={open}>
      <PopoverTrigger tabIndex={-1}>
        <div className="w-full" tabIndex={-1}>
          <Input
            ref={inputRef}
            placeholder={placeholder}
            header={label}
            description={description}
            id={effectiveId}
            value={displayName}
            onClick={() => defaultOpen && setOpen(true)}
            onFocus={() => defaultOpen && setOpen(true)}
            onChange={(e) => handleInputChange(e.target.value)}
            autoComplete="off"
            onKeyDown={handleInputKeyDown}
            className={"w-full"}
          />
        </div>
      </PopoverTrigger>

      <PopoverContent
        className="w-[35vw] z-500"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <AutoCompleteItemList
          items={autoCompleteItems}
          isLoading={isLoading}
          isError={isError}
          selectedIndex={selectedIndex}
          loadingLabel={t("loadingLabel")}
          fallbackValue={fallbackValue}
          noItemsLabel={noAutoCompleteItemsLabel}
          noItemsLabelRenderer={noAutoCompleteItemsLabelRenderer}
          displayValue={displayName}
          onSelectItem={selectItem}
          onHoverItem={handleItemHover}
          alwaysIncludeFallback={alwaysIncludeFallback}
        />
      </PopoverContent>
    </Popover>
  );
}

export default AutoCompleteInputField;
