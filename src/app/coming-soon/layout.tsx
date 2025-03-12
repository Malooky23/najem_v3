import { Button } from "@/components/ui/button";
import Link from "next/link";


export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-full w-full overflow-hidden"> {/* **CRITICAL: flex, h-full, w-full, overflow-hidden** */}
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
            />


            {children}

        </div>
    );
}

