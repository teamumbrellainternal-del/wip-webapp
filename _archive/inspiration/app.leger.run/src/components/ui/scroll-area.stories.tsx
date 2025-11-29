import type { Story } from "@ladle/react";
import { ScrollArea, ScrollBar } from "./scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card";
import { Separator } from "./separator";

export const VerticalScroll: Story = () => {
  return (
    <div className="p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Vertical Scroll Area</CardTitle>
          <CardDescription>Scroll to see more content</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-72 w-full rounded-md border p-4">
            <div className="space-y-4">
              {Array.from({ length: 50 }).map((_, i) => (
                <div key={i} className="text-sm">
                  <h4 className="font-medium">Item {i + 1}</h4>
                  <p className="text-muted-foreground">
                    This is the content for item {i + 1}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export const HorizontalScroll: Story = () => {
  return (
    <div className="p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Horizontal Scroll Area</CardTitle>
          <CardDescription>Scroll horizontally to see more items</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full whitespace-nowrap rounded-md border">
            <div className="flex w-max space-x-4 p-4">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="h-48 w-48 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold"
                >
                  Item {i + 1}
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export const MessageList: Story = () => {
  const messages = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    sender: i % 3 === 0 ? "Alice" : i % 3 === 1 ? "Bob" : "Charlie",
    message: `This is message number ${i + 1}`,
    time: `${Math.floor(i / 6)}h ago`,
  }));

  return (
    <div className="p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Messages</CardTitle>
          <CardDescription>Recent conversation</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <div className="p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={msg.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{msg.sender}</p>
                      <p className="text-sm text-muted-foreground mt-1">{msg.message}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{msg.time}</span>
                  </div>
                  {i < messages.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export const ImageGallery: Story = () => {
  const colors = [
    "from-red-400 to-pink-600",
    "from-blue-400 to-cyan-600",
    "from-green-400 to-emerald-600",
    "from-purple-400 to-pink-600",
    "from-yellow-400 to-orange-600",
    "from-indigo-400 to-purple-600",
  ];

  return (
    <div className="p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Image Gallery</CardTitle>
          <CardDescription>Scroll in both directions</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full rounded-md border">
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-48 rounded-md bg-gradient-to-br ${
                      colors[i % colors.length]
                    } flex items-center justify-center text-white font-semibold`}
                  >
                    Image {i + 1}
                  </div>
                ))}
              </div>
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export const CodeViewer: Story = () => {
  const code = `function calculateSum(numbers) {
  let total = 0;

  for (let i = 0; i < numbers.length; i++) {
    total += numbers[i];
  }

  return total;
}

const myNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const result = calculateSum(myNumbers);

console.log('Sum:', result);

// More code examples
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

class DataProcessor {
  constructor(data) {
    this.data = data;
    this.processed = false;
  }

  process() {
    this.data = this.data.map(item => item * 2);
    this.processed = true;
  }

  getResult() {
    return this.processed ? this.data : null;
  }
}

const processor = new DataProcessor([1, 2, 3, 4, 5]);
processor.process();
console.log(processor.getResult());`;

  return (
    <div className="p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Code Viewer</CardTitle>
          <CardDescription>Scroll to see the full code</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full rounded-md border">
            <pre className="p-4">
              <code className="text-sm font-mono">{code}</code>
            </pre>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export const TagsList: Story = () => {
  const tags = [
    "React", "TypeScript", "JavaScript", "Node.js", "Next.js", "Tailwind CSS",
    "GraphQL", "REST API", "MongoDB", "PostgreSQL", "Redis", "Docker",
    "Kubernetes", "AWS", "Azure", "Git", "CI/CD", "Testing", "Jest",
    "Cypress", "Storybook", "Webpack", "Vite", "ESLint", "Prettier",
  ];

  return (
    <div className="p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Technology Tags</CardTitle>
          <CardDescription>Scrollable tag list</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64 rounded-md border p-4">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  {tag}
                </span>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export const DataTable: Story = () => {
  const data = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: i % 3 === 0 ? "Admin" : i % 3 === 1 ? "Editor" : "Viewer",
    status: i % 2 === 0 ? "Active" : "Inactive",
  }));

  return (
    <div className="p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Users Table</CardTitle>
          <CardDescription>Scrollable data table</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full rounded-md border">
            <table className="w-full">
              <thead className="sticky top-0 bg-background border-b">
                <tr>
                  <th className="p-3 text-left text-sm font-medium">ID</th>
                  <th className="p-3 text-left text-sm font-medium">Name</th>
                  <th className="p-3 text-left text-sm font-medium">Email</th>
                  <th className="p-3 text-left text-sm font-medium">Role</th>
                  <th className="p-3 text-left text-sm font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.id} className="border-b">
                    <td className="p-3 text-sm">{row.id}</td>
                    <td className="p-3 text-sm">{row.name}</td>
                    <td className="p-3 text-sm text-muted-foreground">{row.email}</td>
                    <td className="p-3 text-sm">{row.role}</td>
                    <td className="p-3 text-sm">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
