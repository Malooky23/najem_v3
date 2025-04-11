'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Box, RailSymbol, Truck, UserCircle2 } from "lucide-react";
import { orderTypeSchema, movementTypeSchema, packingTypeSchema, deliveryMethodSchema } from "@/server/db/schema";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderInfoCardProps {
  customerId: string;
  customerName: string;
  orderType: z.infer<typeof orderTypeSchema>;
  movement: z.infer<typeof movementTypeSchema>;
  packingType: z.infer<typeof packingTypeSchema>;
  deliveryMethod: z.infer<typeof deliveryMethodSchema>;
  orderMark: string | undefined;
  isLoading: boolean;
  notes: string | null
}

export function OrderInfoCard({
  customerName,
  movement,
  packingType,
  deliveryMethod,
  orderMark,
  isLoading,
  notes
}: OrderInfoCardProps) {
  // Helper function to format enum-like strings
  const formatLabel = (value: string) => {
    return value.split('_').map(word =>
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <Card className="bg-white/70 shadow-md hover:shadow-lg transition-shadow mt-2">
      <CardHeader className="p-4">
        <CardTitle className="text-lg text-gray-700 flex justify-between">
          <p>Order Information</p>
          {/* <StatusDropdown className="pr-12"/> */}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-auto items-start">

          {/* Movement Type */}
          <div className="space-y-1 ">
            <label className="text-xs text-gray-500">Status</label>
            {isLoading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <StatusDropdown className=" "/>
            )}
          </div>

          {/* Movement Type */}
          <div className="space-y-1 ">
            <label className="text-xs text-gray-500">Movement Type</label>
            {isLoading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
                <div className="pt-[4px] flex items-center h-full text-end gap-2 text-sm font-medium text-gray-700 ">
                  <ArrowUpRight className="w-4 h-4 text-blue-500" />
                <span className="text-end">{movement}</span>
              </div>
            )}
          </div>

          {/* Delivery Method */}
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Delivery Method</label>
            {isLoading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <div className="pt-[4px] flex items-center gap-2 text-sm font-medium text-gray-700">
                <Truck className="w-4 h-4 text-green-500" />
                <span className="">{formatLabel(deliveryMethod)}</span>
              </div>
            )}
          </div>

          {/* Packing Type */}
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Packing Type</label>
            {isLoading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
                <div className="pt-auto flex items-center gap-2 text-sm font-medium text-gray-700">
                <Box className="w-4 h-4 text-orange-500" />
                <span>{formatLabel(packingType)}</span>
              </div>
            )}
          </div>

          {/* Customer */}
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Customer</label>
            {isLoading ? (
              <Skeleton className="h-6 w-32" />
            ) : (
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <UserCircle2 className="w-4 h-4 text-indigo-500" />
                <span className="truncate">{customerName}</span>
              </div>
            )}
          </div>

          {/* Mark */}

          <div className="space-y-1">
            <label className="text-xs text-gray-500">Order Mark</label>
            {isLoading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <RailSymbol className="w-4 h-4 text-indigo-500" />
                <span>{orderMark ?? "-"}</span>
              </div>
            )}
          </div>
        </div>

        {/* Notes Section */}
        <div className="mt-6 space-y-1">
          <label className="text-xs text-gray-500">Notes</label>
          {isLoading ? (
            <Skeleton className="h-4 w-full" />
          ) : (
            <div>
              {notes && notes.length > 80 ? (
                <CollapsibleNotes text={notes} />
              ) : (
                <p className="text-sm text-gray-600 text-wrap break-words">
                  {notes || "No notes available."}
                </p>
              )}
            </div>
          )}
        </div>


      </CardContent>
    </Card>
  );
}




import { useState, useRef, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { StatusDropdown } from "./StatusDropdown";

interface CollapsibleNotesProps {
  text: string;
}

export function CollapsibleNotes({ text }: CollapsibleNotesProps) {
  const [ isExpanded, setIsExpanded ] = useState(false);
  const [ isTruncated, setIsTruncated ] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (textRef.current) {
      setIsTruncated(textRef.current.scrollHeight > textRef.current.clientHeight);
    }
  }, [ text ]);


  return (
    <div className="space-y-2">
      <p
        ref={textRef}
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "text-sm text-gray-600 text-wrap break-words cursor-pointer transition-all",
          !isExpanded && "line-clamp-1"
        )}
      >
        {text || "No notes available."}
      </p>
      {isTruncated && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent click on button from toggling parent p tag click if nested
            setIsExpanded(!isExpanded);
          }}
          className="text-xs text-gray-500 hover:text-gray-700 transition-colors flex items-center space-x-1 group focus:outline-none"
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? "Show Less" : "Show More"}</span>
          {isExpanded ?
            <ChevronUpIcon className="h-4 w-4 group-hover:text-gray-700 text-gray-500 transition-colors" /> :
            <ChevronDownIcon className="h-4 w-4 group-hover:text-gray-700 text-gray-500 transition-colors" />}
        </button>
      )}
    </div>
  );
}