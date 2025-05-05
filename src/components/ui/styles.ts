import { itemTypes } from "@/server/db/schema";

export const itemTypeClasses: Record<typeof itemTypes.enumValues[ number ], string> = {
    CARTON: "focus:bg-blue-400/40 bg-blue-400/20 text-blue-700 border-1 border-blue-300",
    BOX: "focus:bg-green-500/40 bg-green-500/20 text-green-700 border-1 border-green-400",
    SACK: "focus:bg-purple-500/40 bg-purple-500/20 text-purple-700 border-1 border-purple-300",
    EQUIPMENT: "focus:bg-orange-500/40 bg-orange-500/20 text-orange-700 border-1 border-orange-300",
    PALLET: "focus:bg-yellow-100/100 bg-yellow-100 text-yellow-800 border-1 border-yellow-400",
    CAR: "focus:bg-blue-500/40 bg-blue-500/30 text-blue-700 border-1 border-blue-300",
    SINGLE: "focus:bg-red-500/40 bg-red-500/20 text-red-700 border-red-500 border-1",
    ROLL: "focus:bg-fuchsia-500/40 bg-fuchsia-500/20 text-fuchsia-800 border-1 border-fuchsia-300",
    OTHER: "focus:bg-pink-500/40 bg-pink-500/20 text-gray-700 border-1 border-pink-300",
};
