import { auth } from "@/lib/auth/auth";
import { QUERIES } from "@/server/db/queries";

export default async function page(){
    const session = await auth();
    if (!session?.user){
        return <div>Unauthorized</div>
    }


    return <div>Dashboard</div>
  }