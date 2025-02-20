import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignupPage() {

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col  py-12 sm:px-6 lg:px-8">
            <Card className="h-[screen-30%]">
                <CardHeader className="text-2xl font-semibold">
                    Damn that sucks...
                </CardHeader>
                <CardContent>
                    You cant reset your password yet.
                </CardContent>
            </Card>
        </div>
    )
}