import { Button } from "@/components/ui/button";

interface ProductCardProps {
  content: string;
}

interface ProductDetails {
  name: string;
  price: string;
  features: string[];
}

function parseProductContent(content: string): ProductDetails | null {
  const nameMatch = content.match(/\*\*Product Name:\*\*\s*(.*)/);
  const priceMatch = content.match(/\*\*Price Range:\*\*\s*(.*)/);
  const featuresMatch = content.match(/\*\*Features:\*\*\s*\n([\s\S]*)/);

  if (!nameMatch || !priceMatch || !featuresMatch) {
    return null;
  }

  const features = featuresMatch[1]
    .split("\n")
    .map((f) => f.replace(/^- /, "").trim())
    .filter((f) => f);

  return {
    name: nameMatch[1].trim(),
    price: priceMatch[1].trim(),
    features,
  };
}

export function ProductCard({ content }: ProductCardProps) {
  const product = parseProductContent(content);

  if (!product) {
    return (
      <div className="text-sm whitespace-pre-wrap leading-relaxed">
        {content}
      </div>
    );
  }

  return (
    <div className="border border-primary/20 rounded-xl p-4 bg-primary/5 space-y-3">
      <h3 className="text-base font-semibold text-foreground">
        {product.name}
      </h3>
      <div>
        <p className="text-xs text-muted-foreground">Price Range</p>
        <p className="text-xl font-bold text-primary">{product.price}</p>
      </div>
      <div>
        <p className="text-xs font-medium text-foreground mb-1.5">
          Key Features
        </p>
        <ul className="space-y-1 text-sm text-muted-foreground">
          {product.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <Button
        size="sm"
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-2"
      >
        Get Quote
      </Button>
    </div>
  );
}
