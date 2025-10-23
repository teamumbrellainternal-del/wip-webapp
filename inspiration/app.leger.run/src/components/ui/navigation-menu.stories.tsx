import type { Story } from "@ladle/react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./navigation-menu";
import { cn } from "@/lib/utils";

export const Basic: Story = () => {
  return (
    <div className="p-8">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
              Home
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
              About
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
              Contact
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};

export const WithDropdowns: Story = () => {
  return (
    <div className="p-8">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                <ListItem href="#" title="Analytics">
                  Track your metrics and insights
                </ListItem>
                <ListItem href="#" title="CRM">
                  Manage customer relationships
                </ListItem>
                <ListItem href="#" title="Marketing">
                  Grow your audience
                </ListItem>
                <ListItem href="#" title="Sales">
                  Close more deals
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                <ListItem href="#" title="For Startups">
                  Build and scale your startup
                </ListItem>
                <ListItem href="#" title="For Enterprise">
                  Enterprise-grade solutions
                </ListItem>
                <ListItem href="#" title="For Agencies">
                  Manage client projects
                </ListItem>
                <ListItem href="#" title="For Freelancers">
                  Tools for independent work
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
              Pricing
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};

export const FeaturedContent: Story = () => {
  return (
    <div className="p-8">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Features</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[600px] lg:grid-cols-[.75fr_1fr]">
                <li className="row-span-3">
                  <NavigationMenuLink asChild>
                    <a
                      className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-blue-500 to-purple-600 p-6 no-underline outline-none focus:shadow-md"
                      href="#"
                    >
                      <div className="mb-2 mt-4 text-lg font-medium text-white">
                        AI-Powered Analytics
                      </div>
                      <p className="text-sm leading-tight text-white/90">
                        Get intelligent insights from your data with our advanced AI engine
                      </p>
                    </a>
                  </NavigationMenuLink>
                </li>
                <ListItem href="#" title="Real-time Collaboration">
                  Work together seamlessly
                </ListItem>
                <ListItem href="#" title="Advanced Reporting">
                  Comprehensive analytics and reporting
                </ListItem>
                <ListItem href="#" title="Custom Integrations">
                  Connect with your favorite tools
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
              Resources
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
              Documentation
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};

const ListItem = ({
  className,
  title,
  children,
  ...props
}: { title: string; children: React.ReactNode } & React.ComponentPropsWithoutRef<"a">) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
};
