import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { NavigationMenu } from "@radix-ui/react-navigation-menu";
import { NavigationLinks } from "./navigation-links";
import { UserMenu } from "./user-menu";
import Image from 'next/image'

// ... existing imports ...

export async function Header() {
  const session = await auth();
  const userType = session?.user?.userType;
  const isAdmin = session?.user?.isAdmin || false;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-12 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* <div className="h-full flex items-center px-6"> */}
      <div className="h-full flex items-center ">
        <NavigationMenu className="w-full grid grid-cols-3 items-center">
          <div className="  flex flex-row justify-self-start">
            <div className="mx-3 ">
            <Image src='/favicon.ico' alt="logo" width={40} height={40} />
            </div>
            <div className="gap-2 flex items-center">
            <Link href="/dashboard" className="text-lg sm:text-xl font-bold truncate">
              <span className="hidden sm:inline">Najem Aleen</span>
              <span className="sm:hidden">NAS</span>
            </Link>
            </div>


          </div>
          <div className="flex justify-items-center bg-purple-300">
            {session?.user && <NavigationLinks userType={userType} isAdmin={isAdmin} />}
          </div>

          <div className="ml-auto flex items-center  space-x-4 min-w-[100px]">
            <UserMenu session={session} />
          </div>
        </NavigationMenu>
      </div>
    </header>
  );
}

// return (
//   <header className="border-b bg-white">
//     <div className="container mx-auto px-2 sm:px-4 py-4">
//       <NavigationMenu className="flex justify-between items-center">
//         <div className="flex items-center gap-4 sm:gap-8">
//           <Logo />
//           {session?.user && (
//                  <div className="justify-self-center">
//                  <NavigationLinks userType={userType} isAdmin={isAdmin} />
//                </div>
//             // <NavigationLinks userType={userType} isAdmin={isAdmin} />
//           )}
//         </div>
//         <UserMenu session={session} />
//       </NavigationMenu>
//     </div>
//   </header>
// );
// }