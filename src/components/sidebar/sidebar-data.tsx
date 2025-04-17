import {
    ArrowRightLeft,
    Beaker,
    BookOpen,
    Box,
    DollarSign,
    MenuSquare,
    PlusCircle,
    Settings2,
    Ship,
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
        {
            title: "Order Expenses",
            url: "/warehouse/expenses",
            icon: DollarSign,
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
            title: "Orders-Coming Soon",
            url: "/coming-soon",
            icon: MenuSquare
        },
        {
            title: "Payments-Coming Soon",
            url: "/coming-soon",
            icon: DollarSign
        },
        // {
        //     title: "Settings-Coming Soon",
        //     url: "/coming-soon",
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
            name: "Testing",
            url: "/test",
            icon: Beaker
        }
    ]

}

