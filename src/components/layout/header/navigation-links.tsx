import { NavigationMenuList } from "@radix-ui/react-navigation-menu";
import { navigationConfig } from "./config";
import { NavigationLink } from "./navigation-link";

interface NavigationLinksProps {
  userType: string | undefined;
  isAdmin: boolean;
}

export function NavigationLinks({ userType, isAdmin }: NavigationLinksProps) {
  if (!userType) return null;

  const links = (() => {
    switch (userType) {
      case "EMPLOYEE":
        return [
          ...navigationConfig.EMPLOYEE.basic,
          ...(isAdmin ? navigationConfig.EMPLOYEE.admin : []),
        ];
      case "CUSTOMER":
        return navigationConfig.CUSTOMER;
      default:
        return [];
    }
  })();

  return (
    <NavigationMenuList className="flex  gap-6">
      {links.map((link) => (
        <NavigationLink key={link.href} {...link} />
      ))}
    </NavigationMenuList>
  );
} 