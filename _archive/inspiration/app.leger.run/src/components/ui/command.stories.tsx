import type { Story } from "@ladle/react";
import { useState } from "react";
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "./command";
import { Card } from "./card";
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  FileText,
  Mail,
  Search,
} from "lucide-react";
import { Button } from "./button";

export const Basic: Story = () => {
  const [value, setValue] = useState("");

  return (
    <div className="p-8">
      <Card className="max-w-md mx-auto">
        <Command>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem onSelect={() => setValue("calendar")}>
                <Calendar className="mr-2 h-4 w-4" />
                <span>Calendar</span>
              </CommandItem>
              <CommandItem onSelect={() => setValue("search-emoji")}>
                <Smile className="mr-2 h-4 w-4" />
                <span>Search Emoji</span>
              </CommandItem>
              <CommandItem onSelect={() => setValue("calculator")}>
                <Calculator className="mr-2 h-4 w-4" />
                <span>Calculator</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Settings">
              <CommandItem onSelect={() => setValue("profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
                <CommandShortcut>⌘P</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => setValue("billing")}>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing</span>
                <CommandShortcut>⌘B</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => setValue("settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
                <CommandShortcut>⌘S</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </Card>
      {value && (
        <p className="text-center mt-4 text-sm text-muted-foreground">
          Selected: {value}
        </p>
      )}
    </div>
  );
};

export const WithDialog: Story = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  // In a real app, this would be triggered by Cmd+K
  const handleSelect = (value: string) => {
    setValue(value);
    setOpen(false);
  };

  return (
    <div className="p-8">
      <div className="max-w-md mx-auto space-y-4">
        <div>
          <Button onClick={() => setOpen(true)} variant="outline" className="w-full">
            <Search className="mr-2 h-4 w-4" />
            Open Command Palette
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>

        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Actions">
              <CommandItem onSelect={() => handleSelect("new-file")}>
                <FileText className="mr-2 h-4 w-4" />
                <span>New File</span>
                <CommandShortcut>⌘N</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => handleSelect("new-email")}>
                <Mail className="mr-2 h-4 w-4" />
                <span>New Email</span>
                <CommandShortcut>⌘E</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => handleSelect("new-event")}>
                <Calendar className="mr-2 h-4 w-4" />
                <span>New Event</span>
                <CommandShortcut>⌘⇧E</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Settings">
              <CommandItem onSelect={() => handleSelect("profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
                <CommandShortcut>⌘P</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => handleSelect("settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
                <CommandShortcut>⌘,</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>

        {value && (
          <div className="text-center text-sm text-muted-foreground">
            Last selected: <span className="font-mono">{value}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const FileSearch: Story = () => {
  const files = [
    { name: "README.md", path: "docs/" },
    { name: "package.json", path: "root" },
    { name: "index.tsx", path: "src/" },
    { name: "App.tsx", path: "src/" },
    { name: "main.css", path: "src/styles/" },
    { name: "utils.ts", path: "src/lib/" },
    { name: "types.ts", path: "src/types/" },
  ];

  return (
    <div className="p-8">
      <Card className="max-w-md mx-auto">
        <Command>
          <CommandInput placeholder="Search files..." />
          <CommandList>
            <CommandEmpty>No files found.</CommandEmpty>
            <CommandGroup heading="Files">
              {files.map((file) => (
                <CommandItem key={file.path + file.name}>
                  <FileText className="mr-2 h-4 w-4" />
                  <span>{file.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {file.path}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </Card>
    </div>
  );
};

export const QuickActions: Story = () => {
  const [value, setValue] = useState("");

  const actions = [
    { id: "send-email", label: "Send Email", icon: Mail, shortcut: "⌘E" },
    { id: "create-event", label: "Create Event", icon: Calendar, shortcut: "⌘K" },
    { id: "new-document", label: "New Document", icon: FileText, shortcut: "⌘N" },
  ];

  return (
    <div className="p-8">
      <Card className="max-w-md mx-auto">
        <Command>
          <CommandInput placeholder="What do you want to do?" />
          <CommandList>
            <CommandEmpty>No actions found.</CommandEmpty>
            <CommandGroup heading="Quick Actions">
              {actions.map((action) => (
                <CommandItem
                  key={action.id}
                  onSelect={() => setValue(action.id)}
                >
                  <action.icon className="mr-2 h-4 w-4" />
                  <span>{action.label}</span>
                  <CommandShortcut>{action.shortcut}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </Card>
      {value && (
        <p className="text-center mt-4 text-sm text-muted-foreground">
          Triggered: {value}
        </p>
      )}
    </div>
  );
};

export const MultipleGroups: Story = () => {
  return (
    <div className="p-8">
      <Card className="max-w-md mx-auto">
        <Command>
          <CommandInput placeholder="Search commands..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Navigation">
              <CommandItem>
                <span>Go to Home</span>
                <CommandShortcut>⌘H</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <span>Go to Dashboard</span>
                <CommandShortcut>⌘D</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Actions">
              <CommandItem>
                <span>Create New</span>
                <CommandShortcut>⌘N</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <span>Save</span>
                <CommandShortcut>⌘S</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <span>Delete</span>
                <CommandShortcut>⌘⌫</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Settings">
              <CommandItem>
                <span>Preferences</span>
                <CommandShortcut>⌘,</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <span>Keyboard Shortcuts</span>
                <CommandShortcut>⌘/</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </Card>
    </div>
  );
};

export const WithEmptyState: Story = () => {
  return (
    <div className="p-8">
      <Card className="max-w-md mx-auto">
        <Command>
          <CommandInput placeholder="Search for something that doesn't exist..." />
          <CommandList>
            <CommandEmpty>
              <div className="py-6 text-center">
                <Search className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm font-medium">No results found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try searching for something else
                </p>
              </div>
            </CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem>This won't show because search has no results</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </Card>
    </div>
  );
};

export const UserSwitcher: Story = () => {
  const [selectedUser, setSelectedUser] = useState("john@example.com");

  const users = [
    { email: "john@example.com", name: "John Doe" },
    { email: "jane@example.com", name: "Jane Smith" },
    { email: "admin@example.com", name: "Admin User" },
  ];

  return (
    <div className="p-8">
      <Card className="max-w-md mx-auto">
        <Command>
          <CommandInput placeholder="Switch user..." />
          <CommandList>
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup heading="Users">
              {users.map((user) => (
                <CommandItem
                  key={user.email}
                  onSelect={() => setSelectedUser(user.email)}
                >
                  <User className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                  {selectedUser === user.email && (
                    <span className="ml-auto text-xs text-primary">✓</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </Card>
      <p className="text-center mt-4 text-sm text-muted-foreground">
        Current user: {selectedUser}
      </p>
    </div>
  );
};

export const AppSwitcher: Story = () => {
  const apps = [
    { id: "mail", name: "Mail", icon: Mail, shortcut: "⌘1" },
    { id: "calendar", name: "Calendar", icon: Calendar, shortcut: "⌘2" },
    { id: "files", name: "Files", icon: FileText, shortcut: "⌘3" },
    { id: "settings", name: "Settings", icon: Settings, shortcut: "⌘," },
  ];

  return (
    <div className="p-8">
      <Card className="max-w-md mx-auto">
        <Command>
          <CommandInput placeholder="Switch to app..." />
          <CommandList>
            <CommandEmpty>No apps found.</CommandEmpty>
            <CommandGroup heading="Applications">
              {apps.map((app) => (
                <CommandItem key={app.id}>
                  <app.icon className="mr-2 h-4 w-4" />
                  <span>{app.name}</span>
                  <CommandShortcut>{app.shortcut}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </Card>
    </div>
  );
};

export const RecentSearches: Story = () => {
  const recentSearches = [
    "API documentation",
    "React hooks",
    "TypeScript interfaces",
    "CSS Grid",
  ];

  const suggestions = ["JavaScript", "Python", "React", "Vue", "Angular"];

  return (
    <div className="p-8">
      <Card className="max-w-md mx-auto">
        <Command>
          <CommandInput placeholder="Search anything..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Recent Searches">
              {recentSearches.map((search) => (
                <CommandItem key={search}>
                  <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{search}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Suggestions">
              {suggestions.map((suggestion) => (
                <CommandItem key={suggestion}>
                  <span>{suggestion}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </Card>
    </div>
  );
};
