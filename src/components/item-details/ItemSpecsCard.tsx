import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ItemSchemaType } from "@/types/items";
import { Ruler, Scale } from 'lucide-react';
import { FieldItem } from './FieldItem'; // Assuming FieldItem is moved here or imported globally
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import React, { useState, useEffect } from "react"; // Import React and useEffect
import { DimensionItem, formatDimension } from './DimensionItem'; // Assuming these are moved/created

interface ItemSpecsCardProps {
  item: ItemSchemaType;
  isLoading: boolean;
}

// Wrap the component with React.memo for performance optimization
export const ItemSpecsCard = React.memo(function ItemSpecsCard({ item, isLoading }: ItemSpecsCardProps) {
  const [ dimensionUnit, setDimensionUnit ] = useState<'cm' | 'm'>('cm');

  // Reset dimension unit to default ('cm') when the item itself changes (identified by itemId)
  // This prevents the unit from staying 'm' if the user navigates to a different item
  // after toggling the unit on a previous item.
  useEffect(() => {
    setDimensionUnit('cm'); // Reset to default when item changes
  }, [ item.itemId ]); // Depend only on the item's unique identifier

  const hasSpecs = item.weightGrams || item.dimensions;

  if (isLoading) {
    return (
      <Card className="overflow-hidden border shadow-sm bg-white/70">
        <CardHeader className="bg-muted/30 p-4 border-b">
          <Skeleton className="h-5 w-1/2" />
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    )
  }

  // Don't render the card if no specs exist
  if (!hasSpecs) {
    return null;
  }

  // Generate a unique ID for the switch based on the item ID to avoid conflicts
  // if multiple instances of this card exist with potentially the same base ID.
  const switchId = `dimension-unit-display-${item.itemId || 'default'}`;

  return (
    <Card className="overflow-hidden border shadow-sm bg-white/70">
      <CardHeader className="bg-muted/30 p-4 border-b">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Ruler className="h-4 w-4 text-purple-600" />
            Specifications
          </CardTitle>
          {/* Conditionally render Switch only if dimensions exist */}
          {item.dimensions && (
            <div className="flex items-center space-x-2">
              <Label htmlFor={switchId} className="text-xs text-muted-foreground">cm</Label>
              <Switch
                id={switchId} // Use unique ID
                checked={dimensionUnit === 'm'}
                onCheckedChange={(checked) => setDimensionUnit(checked ? 'm' : 'cm')}
                className="h-4 w-7 data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-gray-300"
                aria-label="Toggle dimension unit between centimeters and meters"
              />
              <Label htmlFor={switchId} className="text-xs text-muted-foreground">m</Label>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Weight */}
        {item.weightGrams !== undefined && item.weightGrams !== null && (
          <FieldItem
            icon={Scale}
            label="Weight"
            value={
              item.weightGrams > 0
                ? (item.weightGrams >= 1000
                  ? `${(item.weightGrams / 1000).toFixed(2)} kg`
                  : `${item.weightGrams} g`)
                : "-"
            }
            iconClassName="text-purple-600"
          />
        )}

        {/* Separator if both weight and dimensions exist */}
        {item.dimensions && (item.weightGrams !== undefined && item.weightGrams !== null) && <Separator className="my-3" />}

        {/* Dimensions */}
        {item.dimensions && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Dimensions ({dimensionUnit})</p>
            <div className="grid grid-cols-3 gap-3">
              {/* Use DimensionItem helper */}
              <DimensionItem label="Width" value={formatDimension(item.dimensions.width, dimensionUnit)} />
              <DimensionItem label="Height" value={formatDimension(item.dimensions.height, dimensionUnit)} />
              <DimensionItem label="Length" value={formatDimension(item.dimensions.length, dimensionUnit)} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}); // End of React.memo wrapper