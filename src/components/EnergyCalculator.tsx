import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Appliance {
  id: string;
  name: string;
  watts: number;
  timeOfUsage: "Day" | "Night" | "Day and Night";
  quantity: number;
  hours: number;
  necessary: boolean;
}

const COMMON_APPLIANCES = [
  "Air Conditioner",
  "Refrigerator",
  "TV",
  "Fan",
  "Light Bulb",
  "Laptop",
  "Washing Machine",
  "Microwave",
  "Water Heater",
];

interface EnergyCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EnergyCalculator({ isOpen, onClose }: EnergyCalculatorProps) {
  const [appliances, setAppliances] = useState<Appliance[]>([
    {
      id: "1",
      name: "",
      watts: 0,
      timeOfUsage: "Day and Night",
      quantity: 1,
      hours: 1,
      necessary: false,
    },
  ]);

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

  const addAppliance = () => {
    setAppliances([
      ...appliances,
      {
        id: Date.now().toString(),
        name: "",
        watts: 0,
        timeOfUsage: "Day and Night",
        quantity: 1,
        hours: 1,
        necessary: false,
      },
    ]);
  };

  const removeAppliance = (id: string) => {
    setAppliances(appliances.filter((a) => a.id !== id));
  };

  const updateAppliance = (id: string, field: keyof Appliance, value: any) => {
    setAppliances(
      appliances.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const totalWatts = appliances.reduce(
    (acc, curr) =>
      acc + (Number(curr.watts) || 0) * (Number(curr.quantity) || 0),
    0
  );

  const totalWh = appliances.reduce(
    (acc, curr) =>
      acc +
      (Number(curr.watts) || 0) *
        (Number(curr.quantity) || 0) *
        (Number(curr.hours) || 0),
    0
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full sm:max-w-4xl bg-card dark:bg-[#18181b] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-border dark:border-white/10 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 sm:top-5 right-3 sm:right-5 p-2 rounded-full hover:bg-muted dark:hover:bg-white/10 transition-colors z-20 text-muted-foreground dark:text-zinc-400 hover:text-foreground dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-4 sm:p-8 pb-3 sm:pb-6 border-b border-border dark:border-white/5 relative z-10 bg-card dark:bg-[#18181b]">
          <h2 className="text-lg sm:text-xl font-medium text-foreground dark:text-white flex items-center gap-2">
            Energy Calculator
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground dark:text-zinc-400 mt-1">
            Calculate your estimated energy usage
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-3 sm:p-6 md:p-8 relative z-10">
          {/* Mobile Card Layout */}
          <div className="sm:hidden space-y-3">
            {appliances.map((appliance) => (
              <div
                key={appliance.id}
                className="bg-muted dark:bg-white/5 border border-border dark:border-white/5 rounded-xl p-3 space-y-3"
              >
                {/* Row 1: Appliance + Delete */}
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Select
                      value={appliance.name}
                      onValueChange={(val) =>
                        updateAppliance(appliance.id, "name", val)
                      }
                    >
                      <SelectTrigger className="w-full bg-background dark:bg-transparent border-border dark:border-white/10 text-foreground dark:text-zinc-200 h-9">
                        <SelectValue placeholder="Select appliance..." />
                      </SelectTrigger>
                      <SelectContent className="bg-card dark:bg-[#27272a] border-border dark:border-white/10 text-foreground dark:text-zinc-200">
                        {COMMON_APPLIANCES.map((ap) => (
                          <SelectItem
                            key={ap}
                            value={ap}
                            className="focus:bg-muted dark:focus:bg-white/10 focus:text-foreground dark:focus:text-white cursor-pointer"
                          >
                            {ap}
                          </SelectItem>
                        ))}
                        <SelectItem
                          value="custom"
                          className="focus:bg-muted dark:focus:bg-white/10 focus:text-foreground dark:focus:text-white cursor-pointer"
                        >
                          Custom...
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <button
                    onClick={() => removeAppliance(appliance.id)}
                    className="text-muted-foreground dark:text-zinc-500 hover:text-destructive dark:hover:text-red-400 p-2 rounded-md hover:bg-muted dark:hover:bg-white/5 transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Row 2: Watts + Usage */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wide text-muted-foreground dark:text-zinc-500 mb-1 block">
                      Watts
                    </label>
                    <Input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      placeholder="0"
                      value={appliance.watts || ""}
                      onChange={(e) =>
                        updateAppliance(appliance.id, "watts", e.target.value)
                      }
                      className="bg-background dark:bg-transparent border-border dark:border-white/10 h-9 text-foreground dark:text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wide text-muted-foreground dark:text-zinc-500 mb-1 block">
                      Usage Time
                    </label>
                    <Select
                      value={appliance.timeOfUsage}
                      onValueChange={(val) =>
                        updateAppliance(appliance.id, "timeOfUsage", val)
                      }
                    >
                      <SelectTrigger className="w-full bg-background dark:bg-transparent border-border dark:border-white/10 h-9 text-foreground dark:text-zinc-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card dark:bg-[#27272a] border-border dark:border-white/10 text-foreground dark:text-zinc-200">
                        <SelectItem
                          value="Day"
                          className="focus:bg-muted dark:focus:bg-white/10"
                        >
                          Day
                        </SelectItem>
                        <SelectItem
                          value="Night"
                          className="focus:bg-muted dark:focus:bg-white/10"
                        >
                          Night
                        </SelectItem>
                        <SelectItem
                          value="Day and Night"
                          className="focus:bg-muted dark:focus:bg-white/10"
                        >
                          Day & Night
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 3: Qty + Hours + Necessary */}
                <div className="grid grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="text-[10px] uppercase tracking-wide text-muted-foreground dark:text-zinc-500 mb-1 block">
                      Qty
                    </label>
                    <Input
                      type="number"
                      min="1"
                      inputMode="numeric"
                      value={appliance.quantity}
                      onChange={(e) =>
                        updateAppliance(
                          appliance.id,
                          "quantity",
                          e.target.value
                        )
                      }
                      className="bg-background dark:bg-transparent border-border dark:border-white/10 h-9 text-foreground dark:text-zinc-200 text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wide text-muted-foreground dark:text-zinc-500 mb-1 block">
                      Hours
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="24"
                      inputMode="numeric"
                      value={appliance.hours}
                      onChange={(e) =>
                        updateAppliance(appliance.id, "hours", e.target.value)
                      }
                      className="bg-background dark:bg-transparent border-border dark:border-white/10 h-9 text-foreground dark:text-zinc-200 text-center"
                    />
                  </div>
                  <div className="flex items-center gap-2 h-9 justify-center">
                    <Checkbox
                      checked={appliance.necessary}
                      onCheckedChange={(checked) =>
                        updateAppliance(appliance.id, "necessary", checked)
                      }
                      className="border-muted-foreground dark:border-zinc-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <span className="text-xs text-muted-foreground dark:text-zinc-400">
                      Essential
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden sm:block">
            <div className="min-w-[600px]">
              {/* Table Header */}
              <div className="grid grid-cols-[2fr,1fr,1.5fr,0.8fr,1fr,0.8fr,0.5fr] gap-4 mb-4 text-xs font-medium text-muted-foreground dark:text-zinc-500 uppercase tracking-wider px-2">
                <div>Appliance</div>
                <div>Watts</div>
                <div>Usage</div>
                <div>Qty</div>
                <div>Hours</div>
                <div className="text-center">Need</div>
                <div className="text-center"></div>
              </div>

              {/* List */}
              <div className="space-y-2">
                {appliances.map((appliance) => (
                  <div
                    key={appliance.id}
                    className="grid grid-cols-[2fr,1fr,1.5fr,0.8fr,1fr,0.8fr,0.5fr] gap-4 items-center bg-muted dark:bg-white/5 border border-border dark:border-white/5 rounded-xl p-3 hover:bg-muted/80 dark:hover:bg-white/[0.07] transition-colors group"
                  >
                    <div className="relative">
                      <Select
                        value={appliance.name}
                        onValueChange={(val) =>
                          updateAppliance(appliance.id, "name", val)
                        }
                      >
                        <SelectTrigger className="w-full bg-transparent border-none focus:ring-0 text-foreground dark:text-zinc-200 placeholder:text-muted-foreground dark:placeholder:text-zinc-600 h-9 p-0 shadow-none">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent className="bg-card dark:bg-[#27272a] border-border dark:border-white/10 text-foreground dark:text-zinc-200">
                          {COMMON_APPLIANCES.map((ap) => (
                            <SelectItem
                              key={ap}
                              value={ap}
                              className="focus:bg-muted dark:focus:bg-white/10 focus:text-foreground dark:focus:text-white cursor-pointer"
                            >
                              {ap}
                            </SelectItem>
                          ))}
                          <SelectItem
                            value="custom"
                            className="focus:bg-muted dark:focus:bg-white/10 focus:text-foreground dark:focus:text-white cursor-pointer"
                          >
                            Custom...
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Input
                      type="number"
                      min="0"
                      placeholder="W"
                      value={appliance.watts || ""}
                      onChange={(e) =>
                        updateAppliance(appliance.id, "watts", e.target.value)
                      }
                      className="bg-transparent border-0 border-b border-border dark:border-white/10 rounded-none px-0 h-8 text-foreground dark:text-zinc-200 focus-visible:ring-0 focus-visible:border-primary placeholder:text-muted-foreground dark:placeholder:text-zinc-700"
                    />

                    <Select
                      value={appliance.timeOfUsage}
                      onValueChange={(val) =>
                        updateAppliance(appliance.id, "timeOfUsage", val)
                      }
                    >
                      <SelectTrigger className="w-full bg-transparent border-none h-8 p-0 text-foreground dark:text-zinc-200 focus:ring-0 shadow-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card dark:bg-[#27272a] border-border dark:border-white/10 text-foreground dark:text-zinc-200">
                        <SelectItem
                          value="Day"
                          className="focus:bg-muted dark:focus:bg-white/10"
                        >
                          Day
                        </SelectItem>
                        <SelectItem
                          value="Night"
                          className="focus:bg-muted dark:focus:bg-white/10"
                        >
                          Night
                        </SelectItem>
                        <SelectItem
                          value="Day and Night"
                          className="focus:bg-muted dark:focus:bg-white/10"
                        >
                          Day & Night
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      type="number"
                      min="1"
                      value={appliance.quantity}
                      onChange={(e) =>
                        updateAppliance(
                          appliance.id,
                          "quantity",
                          e.target.value
                        )
                      }
                      className="bg-transparent border-0 border-b border-border dark:border-white/10 rounded-none px-0 h-8 text-foreground dark:text-zinc-200 focus-visible:ring-0 focus-visible:border-primary text-center"
                    />

                    <Input
                      type="number"
                      min="0"
                      max="24"
                      value={appliance.hours}
                      onChange={(e) =>
                        updateAppliance(appliance.id, "hours", e.target.value)
                      }
                      className="bg-transparent border-0 border-b border-border dark:border-white/10 rounded-none px-0 h-8 text-foreground dark:text-zinc-200 focus-visible:ring-0 focus-visible:border-primary text-center"
                    />

                    <div className="flex justify-center">
                      <Checkbox
                        checked={appliance.necessary}
                        onCheckedChange={(checked) =>
                          updateAppliance(appliance.id, "necessary", checked)
                        }
                        className="border-muted-foreground dark:border-zinc-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground"
                      />
                    </div>

                    <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => removeAppliance(appliance.id)}
                        className="text-muted-foreground dark:text-zinc-500 hover:text-destructive dark:hover:text-red-400 p-1 rounded-md hover:bg-muted dark:hover:bg-white/5 transition-colors"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border dark:border-white/5 p-3 sm:p-6 bg-card dark:bg-[#18181b] relative z-10 rounded-b-3xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
            <Button
              variant="ghost"
              onClick={addAppliance}
              className="w-full sm:w-auto text-muted-foreground dark:text-zinc-400 hover:text-primary hover:bg-primary/10 gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Appliance
            </Button>

            <div className="flex flex-col items-center sm:items-end w-full sm:w-auto">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-light text-foreground dark:text-white tracking-tight">
                  {totalWatts.toLocaleString()}
                </span>
                <span className="text-xs sm:text-sm font-medium text-muted-foreground dark:text-zinc-500">
                  Watts total
                </span>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground dark:text-zinc-500">
                {totalWh.toLocaleString().replace(/,/g, "")} Wh estimated daily
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
