import {
    ArrowRightLeft,
    AudioWaveform,
    BookOpen,
    Bot,
    Box,
    Command,
    DollarSign,
    Frame,
    GalleryVerticalEnd,
    Map,
    MenuSquare,
    PieChart,
    PlusCircle,
    Settings2,
    Ship,
    SquareTerminal,
    UsersRound,
    Warehouse,
} from "lucide-react"


const warehouse = {
    title: "Warehouse",
    url: "/warehouse",
    icon: Warehouse,
    isActive: true,
    items: [
        {
            title: "Items",
            url: "/warehouse/items",
            icon: Box,
        },
        {
            title: "Orders",
            url: "/warehouse/orders",
            icon: BookOpen,
        },
        {
            title: "Movements",
            url: "/warehouse/tx",
            icon: ArrowRightLeft,
        },
    ],
}
const shipments = {
    title: "Shipments",
    url: "/shipments",
    icon: Ship,
    isActive: false,
    items: [
        {
            title: "Orders",
            // url: "/shipments/orders",
            icon: MenuSquare
        },
        {
            title: "Payments",
            // url: "/shipments/payments",
            icon: DollarSign
        },
        {
            title: "Settings",
            // url: "/shipments/settings",
            icon: Settings2,
        },
        // {
        //     title: "Orders",
        //     url: "/shipments/orders",
        //     icon: MenuSquare
        // },
        // {
        //     title: "Payments",
        //     url: "/shipments/payments",
        //     icon: DollarSign
        // },
        // {
        //     title: "Settings",
        //     url: "/shipments/settings",
        //     icon: Settings2,
        // },
    ],
}
const customers = {
    title: "Customers",
    url: "/customers",
    icon: UsersRound,
    isActive: false,
    items: [
        {
            title: "Create Customer",
            url: "/customers/new",
            icon: PlusCircle
        },
        {
            title: "All Customers",
            url: "/customers",
            icon: UsersRound,
        },
    ],
}

export const data = {
    navMain: [
        warehouse,
        shipments,        
        customers,
    ],

}

