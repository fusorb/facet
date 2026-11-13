import type { ReactNode } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@fusorb/facet-components";

export interface MobileSheetsProps {
  catalogOpen: boolean;
  onCatalogOpenChange: (open: boolean) => void;
  inspectorOpen: boolean;
  onInspectorOpenChange: (open: boolean) => void;
  catalog: ReactNode;
  inspector: ReactNode;
}

export function MobileSheets({
  catalogOpen,
  onCatalogOpenChange,
  inspectorOpen,
  onInspectorOpenChange,
  catalog,
  inspector,
}: MobileSheetsProps) {
  return (
    <>
      <Sheet open={catalogOpen} onOpenChange={onCatalogOpenChange}>
        <SheetContent side="left" className="w-80 p-4">
          <SheetHeader className="text-left">
            <SheetTitle>Catalog</SheetTitle>
            <SheetDescription className="sr-only">Browse the component catalog</SheetDescription>
          </SheetHeader>
          <div className="mt-4 h-[calc(100dvh-6rem)] overflow-hidden">{catalog}</div>
        </SheetContent>
      </Sheet>

      <Sheet open={inspectorOpen} onOpenChange={onInspectorOpenChange}>
        <SheetContent side="right" className="w-80 p-4">
          <SheetHeader className="text-left">
            <SheetTitle>Controls</SheetTitle>
            <SheetDescription className="sr-only">Edit the selected example</SheetDescription>
          </SheetHeader>
          <div className="mt-4 h-[calc(100dvh-6rem)] overflow-y-auto overflow-x-hidden">
            {inspector}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
