import { cn } from "@/lib/utils";
import { memo } from "react";

interface ContentLayoutProps {
  isMobile: boolean;
  isDetailsOpen: boolean;
  children: React.ReactNode;
}

const ContentLayout = memo(function ContentLayout({
  isMobile,
  isDetailsOpen,
  children,
}: ContentLayoutProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-md transition-all duration-300 overflow-hidden",
        isMobile
          ? isDetailsOpen
            ? "hidden"
            : "w-full"
          : isDetailsOpen
          ? "w-[60%]"
          : "w-full"
      )}
    >
      {children}
    </div>
  );
});

export default ContentLayout;