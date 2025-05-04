import { memo } from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { EnrichedOrderSchemaType } from '@/types/orders'; // Adjust path if needed

// Re-usable StatusBadge (keep it simple or memoize if it becomes complex)
const StatusBadge = ({ status }: { status: string }) => {
    const getStatusStyles = (status: string) => {
        const baseStyles = "px-2 py-1 rounded-full text-xs font-semibold w-24 text-center inline-block";
        const statuses: { [ key: string ]: string } = {
            "DRAFT": "bg-gray-500/20 text-gray-700",
            "PENDING": "bg-yellow-500/20 text-yellow-700",
            "PROCESSING": "bg-blue-500/20 text-blue-700",
            "COMPLETED": "bg-green-500/20 text-green-700",
            "READY": "bg-purple-500/20 text-purple-700",
            "CANCELLED": "bg-red-500/20 text-red-700",
        };
        return `${baseStyles} ${statuses[ status ] || statuses[ "PENDING" ]}`;
    };

    return (
        <div className="flex justify-center items-center w-full">
            <span className={getStatusStyles(status)}>{status}</span>
        </div>
    );
};

// Props for the memoized row
interface OrderTableRowProps {
    order: EnrichedOrderSchemaType;
    isSelected: boolean;
    onClick: (order: EnrichedOrderSchemaType) => void;
}

// Use React.memo for the row component
export const OrderTableRow = memo<OrderTableRowProps>(function OrderTableRow({
    order,
    isSelected,
    onClick
}) {
    // console.log(`Rendering Row: ${order.orderNumber}, Selected: ${isSelected}`); // For debugging renders

    return (
        <TableRow
            key={order.orderId} // Key is still important here for React's list diffing
            className={cn(
                "cursor-pointer",
                "hover:bg-muted/60", // Standard hover effect
                isSelected && "border-blue-100  bg-blue-100/40 hover:bg-blue-100/50 dark:bg-primary/20", // Use a theme-aware selection color
            )}
            onClick={() => onClick(order)}
        // Add data-testid or other attributes if needed
        // data-testid={`order-row-${order.orderId}`}
        >
            <TableCell className="font-medium">
                #{order.orderNumber}
            </TableCell>
            <TableCell className="w-[80px]"> {/* Fixed width can help layout */}
                <Badge variant="outline" className={cn("w-16 flex items-center justify-center gap-1 border",
                "",
                    order.movement === "IN"
                        ? "bg-green-100 border-green-200 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 border-red-200 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                )}>
                    {order.movement === "IN"
                        ? <ArrowDownLeft className="w-3.5 h-3.5" />
                        : <ArrowUpRight className="w-3.5 h-3.5" />
                    }
                    {order.movement}
                </Badge>
            </TableCell>
            <TableCell className="w-[120px]"> {/* Fixed width can help layout */}
                <StatusBadge status={order.status} />
            </TableCell>
            <TableCell className="truncate max-w-[200px]"> {/* Add truncate if names can be long */}
                {order.customerName || '-'}
            </TableCell>
            <TableCell className="w-[100px]"> {/* Fixed width can help layout */}
                {order.items?.length ?? 0} {order.items?.length === 1 ? 'item' : 'items'}
            </TableCell>
            <TableCell className="text-muted-foreground text-xs w-[110px]"> {/* Fixed width & subtle style */}
                {format(new Date(order.createdAt), 'MMM d, yyyy')}
            </TableCell>
        </TableRow>
    );
});

// Optional: If StatusBadge becomes complex, memoize it too
// export const MemoizedStatusBadge = memo(StatusBadge);