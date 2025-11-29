import type { Story } from "@ladle/react";
import { useState } from "react";
import { Calendar } from "./calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card";

export const Basic: Story = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="p-8">
      <Card className="inline-block">
        <CardHeader>
          <CardTitle>Basic Calendar</CardTitle>
          <CardDescription>
            Selected: {date?.toLocaleDateString() || "None"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export const DateRange: Story = () => {
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(),
    to: undefined,
  });

  return (
    <div className="p-8">
      <Card className="inline-block">
        <CardHeader>
          <CardTitle>Date Range Selection</CardTitle>
          <CardDescription>
            {dateRange.from
              ? dateRange.to
                ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                : dateRange.from.toLocaleDateString()
              : "Select a date range"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
            className="rounded-md border"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export const WithDisabledDates: Story = () => {
  const [date, setDate] = useState<Date | undefined>();

  const disabledDays = [
    { from: new Date(2025, 0, 1), to: new Date(2025, 0, 5) },
    new Date(2025, 0, 15),
    { dayOfWeek: [0, 6] }, // Disable weekends
  ];

  return (
    <div className="p-8">
      <Card className="inline-block">
        <CardHeader>
          <CardTitle>With Disabled Dates</CardTitle>
          <CardDescription>
            Weekends and specific dates are disabled
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={disabledDays}
            className="rounded-md border"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export const MultipleMonths: Story = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="p-8">
      <Card className="inline-block">
        <CardHeader>
          <CardTitle>Multiple Months</CardTitle>
          <CardDescription>Display two months side by side</CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            className="rounded-md border"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export const WithDefaultMonth: Story = () => {
  const [date, setDate] = useState<Date | undefined>();

  return (
    <div className="p-8">
      <Card className="inline-block">
        <CardHeader>
          <CardTitle>With Default Month</CardTitle>
          <CardDescription>Opens to December 2025</CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            defaultMonth={new Date(2025, 11)}
            className="rounded-md border"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export const MinMaxDates: Story = () => {
  const [date, setDate] = useState<Date | undefined>();

  const fromDate = new Date();
  const toDate = new Date();
  toDate.setMonth(toDate.getMonth() + 1);

  return (
    <div className="p-8">
      <Card className="inline-block">
        <CardHeader>
          <CardTitle>Min/Max Date Constraints</CardTitle>
          <CardDescription>
            Can only select dates within the next month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            fromDate={fromDate}
            toDate={toDate}
            className="rounded-md border"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export const CustomModifiers: Story = () => {
  const [date, setDate] = useState<Date | undefined>();

  const bookedDates = [
    new Date(2025, 0, 10),
    new Date(2025, 0, 11),
    new Date(2025, 0, 12),
  ];

  return (
    <div className="p-8 space-y-4">
      <Card className="inline-block">
        <CardHeader>
          <CardTitle>Custom Modifiers</CardTitle>
          <CardDescription>
            Dates marked as "booked" (highlighted in blue)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            modifiers={{ booked: bookedDates }}
            modifiersClassNames={{
              booked: "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100",
            }}
            className="rounded-md border"
          />
        </CardContent>
      </Card>
      <div className="text-sm text-muted-foreground max-w-md">
        <strong>Example use cases:</strong>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Highlight booked dates in a booking system</li>
          <li>Mark special dates (holidays, events)</li>
          <li>Show availability status</li>
          <li>Indicate price variations</li>
        </ul>
      </div>
    </div>
  );
};

export const MultipleSelection: Story = () => {
  const [dates, setDates] = useState<Date[] | undefined>([]);

  return (
    <div className="p-8">
      <Card className="inline-block">
        <CardHeader>
          <CardTitle>Multiple Date Selection</CardTitle>
          <CardDescription>
            {dates && dates.length > 0
              ? `Selected ${dates.length} date(s)`
              : "No dates selected"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="multiple"
            selected={dates}
            onSelect={setDates}
            className="rounded-md border"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export const BookingSystemExample: Story = () => {
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();

  const bookedDates = [
    { from: new Date(2025, 0, 5), to: new Date(2025, 0, 7) },
    { from: new Date(2025, 0, 15), to: new Date(2025, 0, 18) },
  ];

  const today = new Date();

  return (
    <div className="p-8 space-y-4">
      <Card className="inline-block">
        <CardHeader>
          <CardTitle>Booking System Example</CardTitle>
          <CardDescription>
            {checkIn
              ? checkOut
                ? `${checkIn.toLocaleDateString()} - ${checkOut.toLocaleDateString()}`
                : `Check-in: ${checkIn.toLocaleDateString()}`
              : "Select check-in date"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Check-in</label>
            <Calendar
              mode="single"
              selected={checkIn}
              onSelect={setCheckIn}
              disabled={[...bookedDates, { before: today }]}
              className="rounded-md border mt-2"
            />
          </div>
          {checkIn && (
            <div>
              <label className="text-sm font-medium">Check-out</label>
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={setCheckOut}
                disabled={[...bookedDates, { before: checkIn }]}
                className="rounded-md border mt-2"
              />
            </div>
          )}
        </CardContent>
      </Card>
      <div className="text-sm text-muted-foreground max-w-md">
        <strong>Features demonstrated:</strong>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Disabled past dates</li>
          <li>Blocked booked date ranges</li>
          <li>Sequential selection (check-in → check-out)</li>
          <li>Conditional display (check-out only after check-in)</li>
        </ul>
      </div>
    </div>
  );
};

export const WithFooter: Story = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="p-8">
      <Card className="inline-block">
        <CardHeader>
          <CardTitle>Calendar with Footer</CardTitle>
          <CardDescription>Custom footer with actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
          <div className="flex gap-2 pt-2 border-t">
            <button
              onClick={() => setDate(new Date())}
              className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Today
            </button>
            <button
              onClick={() => setDate(undefined)}
              className="px-3 py-1.5 text-sm rounded-md border hover:bg-accent"
            >
              Clear
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
