import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";

export default function RegisterCustomerPage() {
  return (
      <div className=" flex flex-row min-h-full justify-center items-center p-2 m-2">


        <Card className="w-[50%] ">
          <CardTitle className="text-center m-4 text-xl" >
            <h1>Assign account to customer profile</h1>
          </CardTitle>
          <CardContent>
            <p>Your account is not linked to a business/individual profile.</p>
            <p>
              Please enter your details to link your account and continue using
              the platform.
            </p>
          </CardContent>
        </Card>
    </div>
  );
}
