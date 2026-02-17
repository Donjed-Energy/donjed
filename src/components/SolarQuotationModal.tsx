import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SolarQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const IMAGES = [
  {
    src: "/images/1_20260124_122420_0000.jpg",
    alt: "Solar Installation 1",
    title: "Project Site 1",
  },
  {
    src: "/images/2_20260124_122420_0001.jpg",
    alt: "Solar Installation 2",
    title: "Project Site 2",
  },
  {
    src: "/images/3_20260124_122420_0002.jpg",
    alt: "Solar Installation 3",
    title: "Project Site 3",
  },
  {
    src: "/images/4_20260124_122420_0003.jpg",
    alt: "Solar Installation 4",
    title: "Project Site 4",
  },
  {
    src: "/images/5_20260124_122420_0004.jpg",
    alt: "Solar Installation 5",
    title: "Project Site 5",
  },
  {
    src: "/images/6_20260124_122420_0005.jpg",
    alt: "Solar Installation 6",
    title: "Project Site 6",
  },
  {
    src: "/images/7_20260124_122420_0006.jpg",
    alt: "Solar Installation 7",
    title: "Project Site 7",
  },
  {
    src: "/images/8_20260124_122420_0007.jpg",
    alt: "Solar Installation 8",
    title: "Project Site 8",
  },
].sort((a, b) => a.src.localeCompare(b.src)); // Sort by filename ascending

export function SolarQuotationModal({
  isOpen,
  onClose,
}: SolarQuotationModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset index when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
    }
  }, [isOpen]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % IMAGES.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + IMAGES.length) % IMAGES.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrev();
    if (e.key === "ArrowRight") handleNext();
  };

  // Swipe support
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      handleNext();
    }
    if (isRightSwipe) {
      handlePrev();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-5xl w-full p-0 overflow-hidden bg-black/90 border-zinc-800"
        onKeyDown={handleKeyDown}
      >
        <div
          className="relative w-full aspect-video flex items-center justify-center group touch-pan-y"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Close Button */}

          {/* Navigation Buttons */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-40 text-white/70 hover:text-white hover:bg-black/40 rounded-full w-12 h-12 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex"
            onClick={handlePrev}
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-40 text-white/70 hover:text-white hover:bg-black/40 rounded-full w-12 h-12 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex"
            onClick={handleNext}
          >
            <ChevronRight className="w-8 h-8" />
          </Button>

          {/* Image */}
          <div className="w-full h-full relative">
            <img
              src={IMAGES[currentIndex].src}
              alt={IMAGES[currentIndex].alt}
              className="w-full h-full object-contain pointer-events-none"
            />
            {/* Image Overlay Title */}
          </div>
        </div>

        {/* Thumbnails / Indicators */}
        <div className="flex justify-center gap-2 p-4 bg-zinc-900 border-t border-zinc-800">
          {IMAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all",
                idx === currentIndex
                  ? "bg-primary scale-110"
                  : "bg-zinc-600 hover:bg-zinc-500",
              )}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
