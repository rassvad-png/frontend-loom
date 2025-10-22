import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

type ResponsiveDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
};

export function ResponsiveDrawer({ open, onOpenChange, title, description, children }: ResponsiveDrawerProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[90vh]">
          {(title || description) && (
            <DrawerHeader className="px-6">
              {title ? <DrawerTitle>{title}</DrawerTitle> : null}
              {description ? <DrawerDescription>{description}</DrawerDescription> : null}
            </DrawerHeader>
          )}
          <div className="px-6 pb-6 overflow-y-auto h-full">{children}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[580px] sm:max-w-[600px] p-0">
        {(title || description) && (
          <SheetHeader className="px-7 pt-6">
            {title ? <SheetTitle>{title}</SheetTitle> : null}
            {description ? <SheetDescription>{description}</SheetDescription> : null}
          </SheetHeader>
        )}
        <div className="px-6 pb-6 overflow-y-auto h-full">{children}</div>
      </SheetContent>
    </Sheet>
  );
}


