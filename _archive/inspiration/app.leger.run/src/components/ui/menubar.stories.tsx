import type { Story } from "@ladle/react";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarLabel,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
} from "./menubar";
import { useState } from "react";

export const Basic: Story = () => {
  return (
    <div className="p-8">
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New Tab <MenubarShortcut>⌘T</MenubarShortcut></MenubarItem>
            <MenubarItem>New Window <MenubarShortcut>⌘N</MenubarShortcut></MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Close Tab <MenubarShortcut>⌘W</MenubarShortcut></MenubarItem>
            <MenubarItem>Close Window <MenubarShortcut>⌘⇧W</MenubarShortcut></MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Undo <MenubarShortcut>⌘Z</MenubarShortcut></MenubarItem>
            <MenubarItem>Redo <MenubarShortcut>⌘⇧Z</MenubarShortcut></MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Cut <MenubarShortcut>⌘X</MenubarShortcut></MenubarItem>
            <MenubarItem>Copy <MenubarShortcut>⌘C</MenubarShortcut></MenubarItem>
            <MenubarItem>Paste <MenubarShortcut>⌘V</MenubarShortcut></MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Zoom In <MenubarShortcut>⌘+</MenubarShortcut></MenubarItem>
            <MenubarItem>Zoom Out <MenubarShortcut>⌘-</MenubarShortcut></MenubarItem>
            <MenubarItem>Reset Zoom <MenubarShortcut>⌘0</MenubarShortcut></MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  );
};

export const WithCheckboxes: Story = () => {
  const [showBookmarks, setShowBookmarks] = useState(true);
  const [showFullURLs, setShowFullURLs] = useState(false);

  return (
    <div className="p-8">
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem checked={showBookmarks} onCheckedChange={setShowBookmarks}>
              Show Bookmarks Bar <MenubarShortcut>⌘⇧B</MenubarShortcut>
            </MenubarCheckboxItem>
            <MenubarCheckboxItem checked={showFullURLs} onCheckedChange={setShowFullURLs}>
              Show Full URLs
            </MenubarCheckboxItem>
            <MenubarSeparator />
            <MenubarItem>Enter Full Screen <MenubarShortcut>⌘⌃F</MenubarShortcut></MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  );
};

export const WithRadioGroup: Story = () => {
  const [textSize, setTextSize] = useState("medium");

  return (
    <div className="p-8">
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarLabel>Text Size</MenubarLabel>
            <MenubarRadioGroup value={textSize} onValueChange={setTextSize}>
              <MenubarRadioItem value="small">Small</MenubarRadioItem>
              <MenubarRadioItem value="medium">Medium</MenubarRadioItem>
              <MenubarRadioItem value="large">Large</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <p className="mt-4 text-sm text-muted-foreground">Selected: {textSize}</p>
    </div>
  );
};

export const WithSubmenus: Story = () => {
  return (
    <div className="p-8">
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New File <MenubarShortcut>⌘N</MenubarShortcut></MenubarItem>
            <MenubarSub>
              <MenubarSubTrigger>New From Template</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>Blank Document</MenubarItem>
                <MenubarItem>Letter</MenubarItem>
                <MenubarItem>Resume</MenubarItem>
                <MenubarItem>Invoice</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarItem>Open <MenubarShortcut>⌘O</MenubarShortcut></MenubarItem>
            <MenubarSub>
              <MenubarSubTrigger>Open Recent</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>document-1.txt</MenubarItem>
                <MenubarItem>document-2.txt</MenubarItem>
                <MenubarItem>document-3.txt</MenubarItem>
                <MenubarSeparator />
                <MenubarItem>Clear Recent</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  );
};

export const TextEditorMenu: Story = () => {
  const [showRuler, setShowRuler] = useState(true);
  const [showStatusBar, setShowStatusBar] = useState(true);
  const [theme, setTheme] = useState("light");

  return (
    <div className="p-8 space-y-4">
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New <MenubarShortcut>⌘N</MenubarShortcut></MenubarItem>
            <MenubarItem>Open <MenubarShortcut>⌘O</MenubarShortcut></MenubarItem>
            <MenubarItem>Save <MenubarShortcut>⌘S</MenubarShortcut></MenubarItem>
            <MenubarItem>Save As... <MenubarShortcut>⌘⇧S</MenubarShortcut></MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Print <MenubarShortcut>⌘P</MenubarShortcut></MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Undo <MenubarShortcut>⌘Z</MenubarShortcut></MenubarItem>
            <MenubarItem>Redo <MenubarShortcut>⌘⇧Z</MenubarShortcut></MenubarItem>
            <MenubarSeparator />
            <MenubarSub>
              <MenubarSubTrigger>Find</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>Find <MenubarShortcut>⌘F</MenubarShortcut></MenubarItem>
                <MenubarItem>Find Next <MenubarShortcut>⌘G</MenubarShortcut></MenubarItem>
                <MenubarItem>Find Previous <MenubarShortcut>⌘⇧G</MenubarShortcut></MenubarItem>
                <MenubarSeparator />
                <MenubarItem>Replace <MenubarShortcut>⌘⌥F</MenubarShortcut></MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem checked={showRuler} onCheckedChange={setShowRuler}>
              Show Ruler
            </MenubarCheckboxItem>
            <MenubarCheckboxItem checked={showStatusBar} onCheckedChange={setShowStatusBar}>
              Show Status Bar
            </MenubarCheckboxItem>
            <MenubarSeparator />
            <MenubarLabel>Theme</MenubarLabel>
            <MenubarRadioGroup value={theme} onValueChange={setTheme}>
              <MenubarRadioItem value="light">Light</MenubarRadioItem>
              <MenubarRadioItem value="dark">Dark</MenubarRadioItem>
              <MenubarRadioItem value="auto">System</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>Help</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Documentation</MenubarItem>
            <MenubarItem>Keyboard Shortcuts</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Check for Updates</MenubarItem>
            <MenubarItem>About</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <div className="text-sm text-muted-foreground space-y-1">
        <p>Ruler: {showRuler ? "Visible" : "Hidden"}</p>
        <p>Status Bar: {showStatusBar ? "Visible" : "Hidden"}</p>
        <p>Theme: {theme}</p>
      </div>
    </div>
  );
};
