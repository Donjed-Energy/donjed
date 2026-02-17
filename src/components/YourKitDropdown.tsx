import { Briefcase, Calculator, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface YourKitDropdownProps {
  onOpenCalculator: () => void;
  onOpenSolarQuotation: () => void;
}

export function YourKitDropdown({
  onOpenCalculator,
  onOpenSolarQuotation,
}: YourKitDropdownProps) {
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="flex items-center gap-2 text-zinc-400 hover:text-primary hover:bg-primary/10 rounded-full h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-medium transition-colors"
            >
              <Briefcase className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              <span className="hidden xs:inline sm:inline">Your Kit</span>
              <span className="xs:hidden sm:hidden">Kit</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Your energy tools</p>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-card dark:bg-[#1e1e1e] border-border dark:border-white/10"
      >
        <DropdownMenuItem
          onClick={onOpenCalculator}
          className="flex items-center gap-3 py-3 cursor-pointer focus:bg-muted dark:focus:bg-white/10"
        >
          <Calculator className="w-4 h-4 text-primary" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground dark:text-zinc-200">
              Energy Calculator
            </span>
            <span className="text-xs text-muted-foreground dark:text-zinc-500">
              Calculate your energy usage
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onOpenSolarQuotation}
          className="flex items-center gap-3 py-3 cursor-pointer focus:bg-muted dark:focus:bg-white/10"
        >
          <FileText className="w-4 h-4 text-amber-500" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground dark:text-zinc-200">
              Solar Quotation
            </span>
            <span className="text-xs text-muted-foreground dark:text-zinc-500">
              View our installation catalog
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
