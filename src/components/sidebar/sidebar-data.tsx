import {
    ArrowRightLeft,
    AudioWaveform,
    Beaker,
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
import test from "node:test"


const warehouse = {
    title: "Warehouse",
    url: "/warehouse",
    icon: Warehouse,
    isActive: true,
    items: [
        {
            title: "Items",
            url: "/experiments/items",
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
    url: "/coming-soon",
    icon: Ship,
    isActive: false,
    items: [
        {
            title: "Orders",
            url: "/coming-soon",
            icon: MenuSquare
        },
        {
            title: "Payments",
            url: "/coming-soon",
            icon: DollarSign
        },
        {
            title: "Settings",
            url: "/coming-soon",
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
            url: "/customers",
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
    ],
    projects: [
        {
            name: "Customers",
            url: "/customers",
            icon: UsersRound
        },
        {
            name: "Experiments",
            url: "/experiments",
            icon: Beaker
        }
    ]

}

