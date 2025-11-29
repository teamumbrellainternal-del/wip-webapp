import type { Story } from "@ladle/react";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "./hover-card";
import { Button } from "./button";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Badge } from "./badge";
import { CalendarDays, MapPin, Link as LinkIcon } from "lucide-react";

export const Basic: Story = () => {
  return (
    <div className="p-8 flex justify-center">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="link">Hover over me</Button>
        </HoverCardTrigger>
        <HoverCardContent>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Hover Card</h4>
            <p className="text-sm text-muted-foreground">
              This is additional information that appears when hovering.
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

export const UserProfile: Story = () => {
  return (
    <div className="p-8 flex justify-center">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="link">@johnsmith</Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="flex gap-4">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>JS</AvatarFallback>
            </Avatar>
            <div className="space-y-1 flex-1">
              <h4 className="text-sm font-semibold">John Smith</h4>
              <p className="text-sm text-muted-foreground">
                Software Engineer • Building cool stuff on the web
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                <CalendarDays className="h-3 w-3" />
                <span>Joined January 2024</span>
              </div>
              <div className="flex gap-1 mt-2">
                <Badge variant="secondary" className="text-xs">
                  React
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  TypeScript
                </Badge>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

export const ProductPreview: Story = () => {
  return (
    <div className="p-8 flex justify-center">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="outline">View Product</Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="space-y-3">
            <div className="aspect-video bg-gradient-to-r from-blue-500 to-purple-500 rounded-md" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Premium Wireless Headphones</h4>
              <p className="text-xs text-muted-foreground">
                High-quality audio with active noise cancellation
              </p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold">$199</span>
                <span className="text-sm text-muted-foreground line-through">
                  $299
                </span>
                <Badge variant="destructive" className="text-xs">
                  33% OFF
                </Badge>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

export const LinkPreview: Story = () => {
  return (
    <div className="p-8 flex justify-center">
      <div className="max-w-md">
        <p className="text-sm">
          Check out this{" "}
          <HoverCard>
            <HoverCardTrigger asChild>
              <a
                href="#"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                awesome article
              </a>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <div className="aspect-video bg-gradient-to-r from-green-500 to-teal-500 rounded-md" />
                <h4 className="text-sm font-semibold">
                  10 Tips for Better React Performance
                </h4>
                <p className="text-xs text-muted-foreground">
                  Learn how to optimize your React applications for better
                  performance and user experience.
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <LinkIcon className="h-3 w-3" />
                  <span>blog.example.com</span>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
          {" "}about React performance optimization.
        </p>
      </div>
    </div>
  );
};

export const LocationInfo: Story = () => {
  return (
    <div className="p-8 flex justify-center">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="ghost" size="sm">
            <MapPin className="h-4 w-4 mr-2" />
            San Francisco, CA
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="space-y-3">
            <div className="aspect-video bg-gradient-to-r from-orange-400 to-pink-500 rounded-md flex items-center justify-center text-white">
              <div className="text-center">
                <MapPin className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm font-medium">San Francisco, CA</p>
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Location Details</h4>
              <p className="text-xs text-muted-foreground">
                Known for the Golden Gate Bridge, tech industry, and vibrant
                culture. Population: 873,965
              </p>
              <div className="pt-2 text-xs text-muted-foreground">
                <p>Timezone: PST (UTC-8)</p>
                <p>Climate: Mediterranean</p>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

export const WithCustomWidth: Story = () => {
  return (
    <div className="p-8 flex justify-center gap-4">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="outline">Small</Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-48">
          <p className="text-xs">Compact hover card with minimal content.</p>
        </HoverCardContent>
      </HoverCard>

      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="outline">Large</Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-96">
          <div className="space-y-2">
            <h4 className="font-semibold">Extended Information</h4>
            <p className="text-sm text-muted-foreground">
              This hover card has more width to accommodate longer content and
              more detailed information. You can customize the width using
              Tailwind classes.
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

export const TeamMember: Story = () => {
  return (
    <div className="p-8 flex justify-center">
      <div className="max-w-sm">
        <h3 className="text-lg font-semibold mb-4">Our Team</h3>
        <div className="space-y-3">
          {[
            {
              name: "Sarah Johnson",
              role: "Product Manager",
              bio: "Leading product strategy and roadmap planning",
              joined: "March 2023",
            },
            {
              name: "Michael Chen",
              role: "Lead Engineer",
              bio: "Building scalable systems and mentoring developers",
              joined: "January 2022",
            },
          ].map((member) => (
            <HoverCard key={member.name}>
              <HoverCardTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback>
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarFallback className="text-lg">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 flex-1">
                    <h4 className="text-sm font-semibold">{member.name}</h4>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                    <p className="text-xs text-muted-foreground pt-1">
                      {member.bio}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                      <CalendarDays className="h-3 w-3" />
                      <span>Joined {member.joined}</span>
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export const StatusIndicator: Story = () => {
  const statuses = [
    { status: "online", color: "bg-green-500", label: "Online" },
    { status: "away", color: "bg-yellow-500", label: "Away" },
    { status: "busy", color: "bg-red-500", label: "Busy" },
    { status: "offline", color: "bg-gray-500", label: "Offline" },
  ];

  return (
    <div className="p-8 flex justify-center gap-4">
      {statuses.map((item) => (
        <HoverCard key={item.status}>
          <HoverCardTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent">
              <div className={`h-2 w-2 rounded-full ${item.color}`} />
              <span className="text-sm">{item.label}</span>
            </button>
          </HoverCardTrigger>
          <HoverCardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${item.color}`} />
                <h4 className="text-sm font-semibold">{item.label}</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                {item.status === "online" &&
                  "Available for chat and collaboration"}
                {item.status === "away" &&
                  "May not respond immediately"}
                {item.status === "busy" &&
                  "In a meeting or focused work session"}
                {item.status === "offline" &&
                  "Not currently available"}
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
      ))}
    </div>
  );
};
