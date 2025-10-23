import type { Story } from "@ladle/react";
import { useState } from "react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
} from "./context-menu";
import { Card } from "./card";
import {
  Copy,
  Scissors,
  ClipboardPaste,
  Download,
  Share,
  Trash,
  Edit,
  FileText,
  FolderOpen,
} from "lucide-react";

export const Basic: Story = () => {
  return (
    <div className="p-8">
      <div className="max-w-md mx-auto">
        <p className="text-sm text-muted-foreground mb-4 text-center">
          Right-click on the card below
        </p>
        <ContextMenu>
          <ContextMenuTrigger>
            <Card className="flex h-[150px] w-full items-center justify-center border-2 border-dashed">
              <p className="text-sm text-muted-foreground">Right click here</p>
            </Card>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </ContextMenuItem>
            <ContextMenuItem>
              <Scissors className="mr-2 h-4 w-4" />
              Cut
            </ContextMenuItem>
            <ContextMenuItem>
              <ClipboardPaste className="mr-2 h-4 w-4" />
              Paste
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    </div>
  );
};

export const WithShortcuts: Story = () => {
  return (
    <div className="p-8">
      <div className="max-w-md mx-auto">
        <p className="text-sm text-muted-foreground mb-4 text-center">
          Right-click to see keyboard shortcuts
        </p>
        <ContextMenu>
          <ContextMenuTrigger>
            <Card className="flex h-[150px] w-full items-center justify-center border-2 border-dashed">
              <p className="text-sm text-muted-foreground">Right click here</p>
            </Card>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>
              Copy
              <ContextMenuShortcut>⌘C</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>
              Cut
              <ContextMenuShortcut>⌘X</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>
              Paste
              <ContextMenuShortcut>⌘V</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>
              Delete
              <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    </div>
  );
};

export const WithCheckboxes: Story = () => {
  const [showBookmarks, setShowBookmarks] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showDownloads, setShowDownloads] = useState(true);

  return (
    <div className="p-8">
      <div className="max-w-md mx-auto space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          Right-click to toggle visibility options
        </p>
        <ContextMenu>
          <ContextMenuTrigger>
            <Card className="flex h-[150px] w-full items-center justify-center border-2 border-dashed">
              <p className="text-sm text-muted-foreground">Right click here</p>
            </Card>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuLabel>Visibility</ContextMenuLabel>
            <ContextMenuSeparator />
            <ContextMenuCheckboxItem
              checked={showBookmarks}
              onCheckedChange={setShowBookmarks}
            >
              Show Bookmarks
            </ContextMenuCheckboxItem>
            <ContextMenuCheckboxItem
              checked={showHistory}
              onCheckedChange={setShowHistory}
            >
              Show History
            </ContextMenuCheckboxItem>
            <ContextMenuCheckboxItem
              checked={showDownloads}
              onCheckedChange={setShowDownloads}
            >
              Show Downloads
            </ContextMenuCheckboxItem>
          </ContextMenuContent>
        </ContextMenu>
        <div className="text-sm space-y-1">
          <p>Bookmarks: {showBookmarks ? "Visible" : "Hidden"}</p>
          <p>History: {showHistory ? "Visible" : "Hidden"}</p>
          <p>Downloads: {showDownloads ? "Visible" : "Hidden"}</p>
        </div>
      </div>
    </div>
  );
};

export const WithRadioGroup: Story = () => {
  const [sortBy, setSortBy] = useState("name");

  return (
    <div className="p-8">
      <div className="max-w-md mx-auto space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          Right-click to change sort order
        </p>
        <ContextMenu>
          <ContextMenuTrigger>
            <Card className="flex h-[150px] w-full items-center justify-center border-2 border-dashed">
              <p className="text-sm text-muted-foreground">Right click here</p>
            </Card>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuLabel>Sort by</ContextMenuLabel>
            <ContextMenuSeparator />
            <ContextMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
              <ContextMenuRadioItem value="name">Name</ContextMenuRadioItem>
              <ContextMenuRadioItem value="date">Date Modified</ContextMenuRadioItem>
              <ContextMenuRadioItem value="size">Size</ContextMenuRadioItem>
              <ContextMenuRadioItem value="type">Type</ContextMenuRadioItem>
            </ContextMenuRadioGroup>
          </ContextMenuContent>
        </ContextMenu>
        <p className="text-sm text-center">Current sort: {sortBy}</p>
      </div>
    </div>
  );
};

export const WithSubmenus: Story = () => {
  return (
    <div className="p-8">
      <div className="max-w-md mx-auto">
        <p className="text-sm text-muted-foreground mb-4 text-center">
          Right-click to see nested submenus
        </p>
        <ContextMenu>
          <ContextMenuTrigger>
            <Card className="flex h-[150px] w-full items-center justify-center border-2 border-dashed">
              <p className="text-sm text-muted-foreground">Right click here</p>
            </Card>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </ContextMenuItem>
            <ContextMenuItem>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <Share className="mr-2 h-4 w-4" />
                Share
              </ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem>Email</ContextMenuItem>
                <ContextMenuItem>Copy Link</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem>Twitter</ContextMenuItem>
                <ContextMenuItem>Facebook</ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <Download className="mr-2 h-4 w-4" />
                Export
              </ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem>Export as PDF</ContextMenuItem>
                <ContextMenuItem>Export as CSV</ContextMenuItem>
                <ContextMenuItem>Export as JSON</ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator />
            <ContextMenuItem className="text-destructive">
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    </div>
  );
};

export const WithDisabledItems: Story = () => {
  return (
    <div className="p-8">
      <div className="max-w-md mx-auto">
        <p className="text-sm text-muted-foreground mb-4 text-center">
          Some actions are disabled
        </p>
        <ContextMenu>
          <ContextMenuTrigger>
            <Card className="flex h-[150px] w-full items-center justify-center border-2 border-dashed">
              <p className="text-sm text-muted-foreground">Right click here</p>
            </Card>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </ContextMenuItem>
            <ContextMenuItem disabled>
              <Scissors className="mr-2 h-4 w-4" />
              Cut (disabled)
            </ContextMenuItem>
            <ContextMenuItem disabled>
              <ClipboardPaste className="mr-2 h-4 w-4" />
              Paste (nothing to paste)
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>
              <Download className="mr-2 h-4 w-4" />
              Download
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    </div>
  );
};

export const FileManagerExample: Story = () => {
  const [action, setAction] = useState<string | null>(null);

  return (
    <div className="p-8">
      <div className="max-w-md mx-auto space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          File manager context menu example
        </p>
        <ContextMenu>
          <ContextMenuTrigger>
            <Card className="p-6 border-2 border-dashed">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium">Document.pdf</p>
                  <p className="text-xs text-muted-foreground">2.4 MB • Modified today</p>
                </div>
              </div>
            </Card>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onSelect={() => setAction("open")}>
              <FolderOpen className="mr-2 h-4 w-4" />
              Open
              <ContextMenuShortcut>⏎</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => setAction("rename")}>
              <Edit className="mr-2 h-4 w-4" />
              Rename
              <ContextMenuShortcut>⌘R</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onSelect={() => setAction("copy")}>
              <Copy className="mr-2 h-4 w-4" />
              Copy
              <ContextMenuShortcut>⌘C</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => setAction("duplicate")}>
              Duplicate
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <Share className="mr-2 h-4 w-4" />
                Share
              </ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem onSelect={() => setAction("share-email")}>
                  Email Link
                </ContextMenuItem>
                <ContextMenuItem onSelect={() => setAction("share-copy")}>
                  Copy Link
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuItem onSelect={() => setAction("download")}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onSelect={() => setAction("delete")}
              className="text-destructive focus:text-destructive"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
              <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        {action && (
          <div className="p-3 bg-muted rounded-md text-sm">
            Last action: <span className="font-mono">{action}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const TextEditorExample: Story = () => {
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [fontSize, setFontSize] = useState("medium");

  return (
    <div className="p-8">
      <div className="max-w-md mx-auto space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          Text editor formatting menu
        </p>
        <ContextMenu>
          <ContextMenuTrigger>
            <Card className="p-6 min-h-[150px] border-2 border-dashed">
              <p className={`${isBold ? "font-bold" : ""} ${isItalic ? "italic" : ""}`}>
                Right-click this text to format it. Lorem ipsum dolor sit amet,
                consectetur adipiscing elit.
              </p>
            </Card>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuLabel>Format</ContextMenuLabel>
            <ContextMenuSeparator />
            <ContextMenuCheckboxItem checked={isBold} onCheckedChange={setIsBold}>
              Bold
              <ContextMenuShortcut>⌘B</ContextMenuShortcut>
            </ContextMenuCheckboxItem>
            <ContextMenuCheckboxItem checked={isItalic} onCheckedChange={setIsItalic}>
              Italic
              <ContextMenuShortcut>⌘I</ContextMenuShortcut>
            </ContextMenuCheckboxItem>
            <ContextMenuSeparator />
            <ContextMenuLabel>Font Size</ContextMenuLabel>
            <ContextMenuRadioGroup value={fontSize} onValueChange={setFontSize}>
              <ContextMenuRadioItem value="small">Small</ContextMenuRadioItem>
              <ContextMenuRadioItem value="medium">Medium</ContextMenuRadioItem>
              <ContextMenuRadioItem value="large">Large</ContextMenuRadioItem>
            </ContextMenuRadioGroup>
          </ContextMenuContent>
        </ContextMenu>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Bold: {isBold ? "On" : "Off"}</p>
          <p>Italic: {isItalic ? "On" : "Off"}</p>
          <p>Font size: {fontSize}</p>
        </div>
      </div>
    </div>
  );
};
