import type { Story } from "@ladle/react";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Label } from "./label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card";
import { Button } from "./button";

export const Basic: Story = () => {
  const [value, setValue] = useState("option-1");

  return (
    <div className="p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Basic Radio Group</CardTitle>
          <CardDescription>Select one option</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={value} onValueChange={setValue}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option-1" id="option-1" />
              <Label htmlFor="option-1">Option 1</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option-2" id="option-2" />
              <Label htmlFor="option-2">Option 2</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option-3" id="option-3" />
              <Label htmlFor="option-3">Option 3</Label>
            </div>
          </RadioGroup>
          <p className="text-sm text-muted-foreground">Selected: {value}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export const WithDescriptions: Story = () => {
  const [value, setValue] = useState("comfortable");

  return (
    <div className="p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Display Density</CardTitle>
          <CardDescription>Choose how you want to view content</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={value} onValueChange={setValue}>
            <div className="flex items-start space-x-3 space-y-0">
              <RadioGroupItem value="compact" id="compact" className="mt-1" />
              <div className="space-y-1 flex-1">
                <Label htmlFor="compact" className="font-medium">Compact</Label>
                <p className="text-sm text-muted-foreground">
                  See more content at once with minimal spacing
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 space-y-0">
              <RadioGroupItem value="comfortable" id="comfortable" className="mt-1" />
              <div className="space-y-1 flex-1">
                <Label htmlFor="comfortable" className="font-medium">Comfortable</Label>
                <p className="text-sm text-muted-foreground">
                  Balanced layout with moderate spacing
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 space-y-0">
              <RadioGroupItem value="spacious" id="spacious" className="mt-1" />
              <div className="space-y-1 flex-1">
                <Label htmlFor="spacious" className="font-medium">Spacious</Label>
                <p className="text-sm text-muted-foreground">
                  Maximum readability with generous spacing
                </p>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
};

export const PaymentMethod: Story = () => {
  const [method, setMethod] = useState("card");

  return (
    <div className="p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Select your preferred payment method</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={method} onValueChange={setMethod}>
            <div className="flex items-start space-x-3 border rounded-lg p-4">
              <RadioGroupItem value="card" id="card" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="card" className="font-medium">Credit or Debit Card</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Visa, Mastercard, American Express
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 border rounded-lg p-4">
              <RadioGroupItem value="paypal" id="paypal" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="paypal" className="font-medium">PayPal</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Fast and secure payment
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 border rounded-lg p-4">
              <RadioGroupItem value="bank" id="bank" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="bank" className="font-medium">Bank Transfer</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Direct bank account transfer
                </p>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
};

export const PricingPlans: Story = () => {
  const [plan, setPlan] = useState("pro");

  const plans = [
    { id: "free", name: "Free", price: "$0", features: ["Up to 3 projects", "Basic support"] },
    { id: "pro", name: "Pro", price: "$29", features: ["Unlimited projects", "Priority support", "Advanced analytics"] },
    { id: "enterprise", name: "Enterprise", price: "$99", features: ["Everything in Pro", "Dedicated support", "Custom integrations"] },
  ];

  return (
    <div className="p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Choose Your Plan</CardTitle>
          <CardDescription>Select the plan that works for you</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={plan} onValueChange={setPlan} className="grid md:grid-cols-3 gap-4">
            {plans.map((planItem) => (
              <div key={planItem.id} className="relative">
                <RadioGroupItem
                  value={planItem.id}
                  id={planItem.id}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={planItem.id}
                  className="flex flex-col border-2 rounded-lg p-4 cursor-pointer hover:bg-accent peer-data-[state=checked]:border-primary"
                >
                  <span className="font-semibold text-lg">{planItem.name}</span>
                  <span className="text-3xl font-bold mt-2">{planItem.price}</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                  <ul className="mt-4 space-y-2">
                    {planItem.features.map((feature, i) => (
                      <li key={i} className="text-sm flex items-center gap-2">
                        <span className="text-primary">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </Label>
              </div>
            ))}
          </RadioGroup>
          <Button className="w-full mt-6">Subscribe to {plans.find(p => p.id === plan)?.name}</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export const NotificationSettings: Story = () => {
  const [frequency, setFrequency] = useState("daily");

  return (
    <div className="p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Notification Frequency</CardTitle>
          <CardDescription>How often do you want to receive notifications?</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={frequency} onValueChange={setFrequency}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="realtime" id="realtime" />
              <Label htmlFor="realtime">Real-time (as they happen)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hourly" id="hourly" />
              <Label htmlFor="hourly">Hourly digest</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="daily" id="daily" />
              <Label htmlFor="daily">Daily summary</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="weekly" id="weekly" />
              <Label htmlFor="weekly">Weekly roundup</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="never" id="never" />
              <Label htmlFor="never">Never</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
};

export const WithDisabledOption: Story = () => {
  const [value, setValue] = useState("option-1");

  return (
    <div className="p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Radio Group with Disabled Option</CardTitle>
          <CardDescription>Some options may be unavailable</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={value} onValueChange={setValue}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option-1" id="r1" />
              <Label htmlFor="r1">Available Option</Label>
            </div>
            <div className="flex items-center space-x-2 opacity-50">
              <RadioGroupItem value="option-2" id="r2" disabled />
              <Label htmlFor="r2">Disabled Option</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option-3" id="r3" />
              <Label htmlFor="r3">Another Available Option</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
};
