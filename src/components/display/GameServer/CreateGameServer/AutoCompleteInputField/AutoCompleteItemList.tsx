import { Label } from "@/components/ui/label";
import { type ReactNode, useEffect, useRef } from "react";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import type { AutoCompleteItem, GameServerCreationValue } from "./types";

interface AutoCompleteItemRowProps<
  TSelectedItem,
  TAutoCompleteData extends GameServerCreationValue,
> {
  item: AutoCompleteItem<TSelectedItem, TAutoCompleteData>;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onHover: (index: number) => void;
}

function AutoCompleteItemRow<TSelectedItem, TAutoCompleteData extends GameServerCreationValue>({
  item,
  index,
  isSelected,
  onSelect,
  onHover,
}: AutoCompleteItemRowProps<TSelectedItem, TAutoCompleteData>) {
  return (
    <div
      role="option"
      aria-selected={isSelected}
      data-index={index}
      tabIndex={-1}
      className={
        "flex flex-auto items-center px-2 py-1.5 cursor-pointer rounded-sm " +
        (isSelected ? "bg-accent text-accent-foreground" : "")
      }
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      onMouseEnter={() => onHover(index)}
    >
      {item.leftSlot && <div className="shrink-0 mr-2">{item.leftSlot}</div>}
      <Label className="text-base flex justify-between w-full cursor-pointer">
        <p className="text-ellipsis">{item.label}</p>
        {item.additionalInformation && <p className="opacity-50">{item.additionalInformation}</p>}
      </Label>
    </div>
  );
}

interface FallbackItemRowProps {
  label: string;
  labelRenderer?: (displayValue: string) => ReactNode;
  displayValue: string;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onHover: (index: number) => void;
}

function FallbackItemRow({
  label,
  labelRenderer,
  displayValue,
  index,
  isSelected,
  onSelect,
  onHover,
}: FallbackItemRowProps) {
  return (
    <div
      role="option"
      aria-selected={isSelected}
      data-index={index}
      tabIndex={-1}
      className={
        "flex flex-auto items-center px-2 py-1.5 cursor-pointer rounded-sm " +
        (isSelected ? "bg-accent text-accent-foreground" : "")
      }
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      onMouseEnter={() => onHover(index)}
    >
      {labelRenderer?.(displayValue) ?? (
        <Label className="flex justify-between w-full cursor-pointer">
          <p className="text-ellipsis text-base">{label}</p>
        </Label>
      )}
    </div>
  );
}

interface AutoCompleteItemListProps<
  TSelectedItem,
  TAutoCompleteData extends GameServerCreationValue,
> {
  items: AutoCompleteItem<TSelectedItem, TAutoCompleteData>[] | undefined;
  isLoading: boolean;
  isError: boolean;
  selectedIndex: number;
  loadingLabel: string;
  fallbackValue: TAutoCompleteData;
  noItemsLabel?: string;
  noItemsLabelRenderer?: (displayValue: string) => ReactNode;
  displayValue: string;
  onSelectItem: (item: AutoCompleteItem<TSelectedItem, TAutoCompleteData>) => void;
  onHoverItem: (index: number) => void;
  maxItems?: number;
  alwaysIncludeFallback?: boolean;
}

function AutoCompleteItemList<TSelectedItem, TAutoCompleteData extends GameServerCreationValue>({
  items,
  isLoading,
  isError,
  selectedIndex,
  loadingLabel,
  fallbackValue,
  noItemsLabel,
  noItemsLabelRenderer,
  displayValue,
  onSelectItem,
  onHoverItem,
  maxItems = 20,
  alwaysIncludeFallback = false,
}: AutoCompleteItemListProps<TSelectedItem, TAutoCompleteData>) {
  const { t } = useTranslationPrefix("components.CreateGameServer.autoCompleteInputField");

  const listboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const selected = listboxRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    selected?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const handleFallbackSelect = () =>
    onSelectItem({
      value: fallbackValue,
      label: noItemsLabel ?? t("noResultsLabel"),
    } as AutoCompleteItem<TSelectedItem, TAutoCompleteData>);

  const fallbackLabel = noItemsLabel ?? t("noResultsLabel");

  if (isLoading) {
    if (alwaysIncludeFallback) {
      return (
        <div role="listbox" className="flex flex-col gap-0.5">
          <FallbackItemRow
            label={fallbackLabel}
            labelRenderer={noItemsLabelRenderer}
            displayValue={displayValue}
            index={0}
            isSelected={selectedIndex === 0}
            onSelect={handleFallbackSelect}
            onHover={onHoverItem}
          />
          <div className="px-2 py-1.5 text-sm text-muted-foreground">{loadingLabel}</div>
        </div>
      );
    }
    return <div className="px-2 py-1.5 text-sm text-muted-foreground">{loadingLabel}</div>;
  }

  if (isError || !items || items.length === 0) {
    if (alwaysIncludeFallback) {
      return (
        <FallbackItemRow
          label={fallbackLabel}
          labelRenderer={noItemsLabelRenderer}
          displayValue={displayValue}
          index={0}
          isSelected={selectedIndex === 0}
          onSelect={handleFallbackSelect}
          onHover={onHoverItem}
        />
      );
    }
    return (
      <div className="px-2 py-1.5 text-sm text-muted-foreground">
        {noItemsLabelRenderer?.(displayValue) ?? fallbackLabel}
      </div>
    );
  }

  const visibleItems = items.slice(0, maxItems);
  return (
    <div
      ref={listboxRef}
      role="listbox"
      className="flex flex-col gap-0.5 overflow-y-auto max-h-64"
      onWheel={(e) => e.stopPropagation()}
    >
      {alwaysIncludeFallback && (
        <FallbackItemRow
          label={fallbackLabel}
          labelRenderer={noItemsLabelRenderer}
          displayValue={displayValue}
          index={0}
          isSelected={selectedIndex === 0}
          onSelect={handleFallbackSelect}
          onHover={onHoverItem}
        />
      )}
      {visibleItems.map((item, index) => (
        <AutoCompleteItemRow
          key={item.value.toString()}
          item={item}
          index={alwaysIncludeFallback ? index + 1 : index}
          isSelected={selectedIndex === (alwaysIncludeFallback ? index + 1 : index)}
          onSelect={() => onSelectItem(item)}
          onHover={onHoverItem}
        />
      ))}
    </div>
  );
}

export default AutoCompleteItemList;
