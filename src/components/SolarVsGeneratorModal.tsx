import { useState, useEffect } from "react";
import { X, Fuel, Sun, Sparkles, TrendingUp, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SolarVsGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGetAdvice: (comparisonData: string) => void;
}

const GEN_SIZES = [
  {
    label: "Small (I pass my neighbor) < 1.5kVA",
    value: "1kva",
    solarPrice: 850000,
    solarLabel: "1kVA Inverter System",
  },
  {
    label: "Medium (Tiger/Sumec) 2.5 - 3.5kVA",
    value: "3kva",
    solarPrice: 2500000,
    solarLabel: "3kVA Hybrid System",
  },
  {
    label: "Standard 5 - 6.5kVA",
    value: "5kva",
    solarPrice: 3800000,
    solarLabel: "5kVA Hybrid System",
  },
  {
    label: "Large 8 - 10kVA",
    value: "8kva",
    solarPrice: 5500000,
    solarLabel: "8kVA Hybrid System",
  },
  {
    label: "Extra Large 15kVA+",
    value: "15kva",
    solarPrice: 9500000,
    solarLabel: "15kVA+ Commercial System",
  },
];

export function SolarVsGeneratorModal({
  isOpen,
  onClose,
  onGetAdvice,
}: SolarVsGeneratorModalProps) {
  // Inputs
  const [genSize, setGenSize] = useState<string>("3kva");
  const [fuelSpend, setFuelSpend] = useState<number>(5000);
  const [spendFrequency, setSpendFrequency] = useState<"Daily" | "Weekly">(
    "Daily",
  );

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculations
  const selectedGen =
    GEN_SIZES.find((g) => g.value === genSize) || GEN_SIZES[1];
  const equivalentSolarPrice = selectedGen.solarPrice;

  // Calculate monthly fuel spend
  const monthlyFuelSpend =
    spendFrequency === "Daily" ? fuelSpend * 30 : fuelSpend * 4.3; // 4.3 weeks in a month

  // Yearly Projections
  const yearlyFuelSpend = monthlyFuelSpend * 12;
  const twoYearFuelSpend = yearlyFuelSpend * 2;

  // Savings (Solar Cost - Fuel Spend over time)
  // Simplified: "Spending more on fuel" = Yearly Fuel Spend

  const savingsTwoYear = twoYearFuelSpend - equivalentSolarPrice; // Usually positive by year 2 or 3

  const handleGetAdvice = () => {
    const comparisonData = `
I need advice comparing solar vs generator based on my current spending.

**My Generator Details:**
- Generator Size: ${selectedGen.label}
- Fuel Spend: ₦${fuelSpend.toLocaleString()} per ${spendFrequency}
- Estimated Monthly Fuel Spend: ₦${monthlyFuelSpend.toLocaleString()}
- Estimated Yearly Fuel Spend: ₦${yearlyFuelSpend.toLocaleString()}

**Equivalent Solar Option:**
- Recommended System: ${selectedGen.solarLabel}
- Estimated System Price: ₦${equivalentSolarPrice.toLocaleString()}

**Financial Trade-off:**
- If I keep using the generator for 2 years, I will spend: ₦${twoYearFuelSpend.toLocaleString()} on fuel alone.
- If I switch to solar, the upfront cost is: ₦${equivalentSolarPrice.toLocaleString()}.

Please analyze these numbers. How much will I save in the long run? Is the switch worth it right now for my specific fuel spending?
    `.trim();

    onGetAdvice(comparisonData);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full sm:max-w-xl bg-card dark:bg-[#18181b] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-border dark:border-white/10 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 sm:top-5 right-3 sm:right-5 p-2 rounded-full hover:bg-muted dark:hover:bg-white/10 transition-colors z-20 text-muted-foreground dark:text-zinc-400 hover:text-foreground dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-border dark:border-white/5 relative z-10 bg-card dark:bg-[#18181b]">
          <h2 className="text-lg sm:text-xl font-medium text-foreground dark:text-white flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-500" />
            Solar vs Gen Savings
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground dark:text-zinc-400 mt-1">
            See how much you can save by switching
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 relative z-10 space-y-6">
          {/* User Input Section */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-foreground dark:text-zinc-300 mb-1.5 block">
                What size is your generator?
              </Label>
              <Select value={genSize} onValueChange={setGenSize}>
                <SelectTrigger className="w-full bg-muted dark:bg-white/5 border-border dark:border-white/10 h-11 text-foreground dark:text-zinc-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card dark:bg-[#27272a] border-border dark:border-white/10">
                  {GEN_SIZES.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground dark:text-zinc-300 mb-1.5 block">
                How much do you spend on fuel?
              </Label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-zinc-500">
                    ₦
                  </span>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Amount"
                    value={fuelSpend || ""}
                    onChange={(e) => setFuelSpend(Number(e.target.value))}
                    className="pl-7 bg-muted dark:bg-white/5 border-border dark:border-white/10 h-11 text-foreground dark:text-zinc-200"
                  />
                </div>
                <div className="w-1/3">
                  <Select
                    value={spendFrequency}
                    onValueChange={(val: any) => setSpendFrequency(val)}
                  >
                    <SelectTrigger className="w-full bg-muted dark:bg-white/5 border-border dark:border-white/10 h-11 text-foreground dark:text-zinc-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card dark:bg-[#27272a] border-border dark:border-white/10">
                      <SelectItem value="Daily">Daily</SelectItem>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-border dark:bg-white/5 w-full" />

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* The Generator Path */}
            <div className="bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex flex-col">
              <h3 className="text-sm font-medium text-red-500 dark:text-red-400 flex items-center gap-2 mb-2">
                <Fuel className="w-4 h-4" />
                If you stick with Gen
              </h3>
              <p className="text-xs text-muted-foreground dark:text-zinc-400 mb-4">
                You will burn through cash:
              </p>

              <div className="mt-auto space-y-2">
                <div>
                  <span className="text-xs text-muted-foreground block">
                    Monthly Burn
                  </span>
                  <span className="text-lg font-semibold text-red-500">
                    ₦{monthlyFuelSpend.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">
                    Yearly Burn
                  </span>
                  <span className="text-xl font-bold text-red-600">
                    ₦{yearlyFuelSpend.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* The Solar Path */}
            <div className="bg-green-500/5 dark:bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex flex-col">
              <h3 className="text-sm font-medium text-green-500 dark:text-green-400 flex items-center gap-2 mb-2">
                <Sun className="w-4 h-4" />
                If you switch to Solar
              </h3>
              <p className="text-xs text-muted-foreground dark:text-zinc-400 mb-4">
                Equivalent {selectedGen.solarLabel}:
              </p>

              <div className="mt-auto space-y-2">
                <div>
                  <span className="text-xs text-muted-foreground block">
                    One-time Investment
                  </span>
                  <span className="text-xl font-bold text-green-600">
                    ₦{equivalentSolarPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Insight Box */}
          <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/20 rounded-full shrink-0">
                <PiggyBank className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-foreground dark:text-white text-sm">
                  Savings Projection
                </h4>
                <p className="text-xs text-muted-foreground dark:text-zinc-400 mt-1 leading-relaxed">
                  In 2 years, your generator fuel would cost you{" "}
                  <span className="font-bold text-red-500">
                    ₦{twoYearFuelSpend.toLocaleString()}
                  </span>
                  . Switching to solar costs{" "}
                  <span className="font-bold text-amber-500">
                    ₦{equivalentSolarPrice.toLocaleString()}
                  </span>
                  .
                </p>

                {savingsTwoYear > 0 ? (
                  <p className="text-sm font-semibold text-green-500 mt-2 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    You save ₦{savingsTwoYear.toLocaleString()} in just 2 years!
                  </p>
                ) : (
                  <p className="text-xs text-amber-500 mt-2">
                    It takes a bit longer to break even, but you gain 24/7
                    silent power immediately.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border dark:border-white/5 p-4 sm:p-6 bg-card dark:bg-[#18181b] relative z-10 rounded-b-3xl">
          <Button
            onClick={handleGetAdvice}
            className="w-full bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 text-primary-foreground font-medium py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Sparkles className="w-4 h-4" />
            Analyze My Savings with AI
          </Button>
        </div>
      </div>
    </div>
  );
}
