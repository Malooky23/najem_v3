import { NeonGradientCard } from "@/components/magicui/neon-gradient-card";
import { Card, CardTitle } from "@/components/ui/card";

export default function Shipments() {
    return (
        <div className="flex justify-center  items-center p-6  h-full ">

            <NeonGradientCard className=" w-[30%] h-fit items-center justify-center text-center">
                <span className="pointer-events-none z-10  whitespace-pre-wrap  text-center text-6xl font-bold  text-slate-600 tracking-tighter  ">
                    Coming Soon
                </span>
            </NeonGradientCard>
        </div>
    )
}