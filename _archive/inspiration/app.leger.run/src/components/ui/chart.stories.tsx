import type { Story } from "@ladle/react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Area,
  AreaChart,
  Pie,
  PieChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "./chart";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./card";

const monthlyData = [
  { month: "Jan", value: 186 },
  { month: "Feb", value: 305 },
  { month: "Mar", value: 237 },
  { month: "Apr", value: 273 },
  { month: "May", value: 209 },
  { month: "Jun", value: 314 },
];

const chartConfig = {
  value: {
    label: "Value",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export const BasicBarChart: Story = () => {
  return (
    <div className="p-8">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Basic Bar Chart</CardTitle>
          <CardDescription>Monthly values for 2025</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill="var(--color-value)" radius={8} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export const BasicLineChart: Story = () => {
  return (
    <div className="p-8">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Basic Line Chart</CardTitle>
          <CardDescription>Trend over 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--color-value)"
                strokeWidth={2}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export const BasicAreaChart: Story = () => {
  return (
    <div className="p-8">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Basic Area Chart</CardTitle>
          <CardDescription>Filled area under the curve</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-value)"
                fill="var(--color-value)"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export const MultipleSeriesBarChart: Story = () => {
  const data = [
    { month: "Jan", revenue: 186, expenses: 140 },
    { month: "Feb", revenue: 305, expenses: 200 },
    { month: "Mar", revenue: 237, expenses: 180 },
    { month: "Apr", revenue: 273, expenses: 210 },
    { month: "May", revenue: 209, expenses: 150 },
    { month: "Jun", revenue: 314, expenses: 220 },
  ];

  const config = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
    expenses: {
      label: "Expenses",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  return (
    <div className="p-8">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Multiple Series Bar Chart</CardTitle>
          <CardDescription>Revenue vs Expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={config}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={8} />
              <Bar dataKey="expenses" fill="var(--color-expenses)" radius={8} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export const StackedBarChart: Story = () => {
  const data = [
    { month: "Jan", desktop: 120, mobile: 66 },
    { month: "Feb", desktop: 180, mobile: 125 },
    { month: "Mar", desktop: 150, mobile: 87 },
    { month: "Apr", desktop: 165, mobile: 108 },
    { month: "May", desktop: 135, mobile: 74 },
    { month: "Jun", desktop: 195, mobile: 119 },
  ];

  const config = {
    desktop: {
      label: "Desktop",
      color: "hsl(var(--chart-1))",
    },
    mobile: {
      label: "Mobile",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  return (
    <div className="p-8">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Stacked Bar Chart</CardTitle>
          <CardDescription>Desktop vs Mobile traffic</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={config}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="desktop"
                stackId="a"
                fill="var(--color-desktop)"
                radius={[0, 0, 4, 4]}
              />
              <Bar
                dataKey="mobile"
                stackId="a"
                fill="var(--color-mobile)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export const MultipleLineChart: Story = () => {
  const data = [
    { month: "Jan", users: 186, sessions: 320 },
    { month: "Feb", users: 305, sessions: 480 },
    { month: "Mar", users: 237, sessions: 390 },
    { month: "Apr", users: 273, sessions: 420 },
    { month: "May", users: 209, sessions: 350 },
    { month: "Jun", users: 314, sessions: 510 },
  ];

  const config = {
    users: {
      label: "Users",
      color: "hsl(var(--chart-1))",
    },
    sessions: {
      label: "Sessions",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  return (
    <div className="p-8">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Multiple Line Chart</CardTitle>
          <CardDescription>Users and sessions over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={config}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                type="monotone"
                dataKey="users"
                stroke="var(--color-users)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="sessions"
                stroke="var(--color-sessions)"
                strokeWidth={2}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export const SimplePieChart: Story = () => {
  const data = [
    { name: "Chrome", value: 400, fill: "hsl(var(--chart-1))" },
    { name: "Safari", value: 300, fill: "hsl(var(--chart-2))" },
    { name: "Firefox", value: 200, fill: "hsl(var(--chart-3))" },
    { name: "Edge", value: 100, fill: "hsl(var(--chart-4))" },
  ];

  const config = {
    chrome: { label: "Chrome" },
    safari: { label: "Safari" },
    firefox: { label: "Firefox" },
    edge: { label: "Edge" },
  } satisfies ChartConfig;

  return (
    <div className="p-8">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Simple Pie Chart</CardTitle>
          <CardDescription>Browser market share</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={config} className="aspect-square">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie data={data} dataKey="value" nameKey="name" />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export const WithCustomColors: Story = () => {
  const data = [
    { month: "Jan", value: 186 },
    { month: "Feb", value: 305 },
    { month: "Mar", value: 237 },
    { month: "Apr", value: 273 },
    { month: "May", value: 209 },
    { month: "Jun", value: 314 },
  ];

  const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--chart-1))",
  ];

  const config = {
    value: {
      label: "Value",
    },
  } satisfies ChartConfig;

  return (
    <div className="p-8">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Custom Colors Per Bar</CardTitle>
          <CardDescription>Each bar has a different color</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={config}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" radius={8}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export const ResponsiveChart: Story = () => {
  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Responsive Chart</CardTitle>
          <CardDescription>
            Automatically adjusts to container size
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium mb-2">Small</p>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="var(--color-value)" radius={8} />
              </BarChart>
            </ChartContainer>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Medium</p>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="var(--color-value)" radius={8} />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const DashboardExample: Story = () => {
  const revenueData = [
    { month: "Jan", value: 18600 },
    { month: "Feb", value: 30500 },
    { month: "Mar", value: 23700 },
    { month: "Apr", value: 27300 },
    { month: "May", value: 20900 },
    { month: "Jun", value: 31400 },
  ];

  const trafficData = [
    { source: "Organic", value: 4500, fill: "hsl(var(--chart-1))" },
    { source: "Direct", value: 3200, fill: "hsl(var(--chart-2))" },
    { source: "Referral", value: 2100, fill: "hsl(var(--chart-3))" },
    { source: "Social", value: 1800, fill: "hsl(var(--chart-4))" },
  ];

  const revenueConfig = {
    value: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const trafficConfig = {
    organic: { label: "Organic" },
    direct: { label: "Direct" },
    referral: { label: "Referral" },
    social: { label: "Social" },
  } satisfies ChartConfig;

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueConfig}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-value)"
                  fill="var(--color-value)"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <CardDescription>Visitor distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={trafficConfig} className="aspect-square">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie data={trafficData} dataKey="value" nameKey="source" />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
