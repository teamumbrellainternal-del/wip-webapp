import type { Story } from "@ladle/react";
import { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Textarea } from "./textarea";
import { Card, CardContent } from "./card";

export const Basic: Story = () => {
  return (
    <div className="p-8">
      <Drawer>
        <DrawerTrigger asChild>
          <Button>Open Drawer</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Drawer Title</DrawerTitle>
            <DrawerDescription>
              This is a basic drawer component
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <p className="text-sm text-muted-foreground">
              Drawer content goes here. Swipe down or tap outside to close.
            </p>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export const WithForm: Story = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    console.log({ name, email, message });
    // Reset form
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="p-8">
      <Drawer>
        <DrawerTrigger asChild>
          <Button>Contact Us</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Contact Form</DrawerTitle>
            <DrawerDescription>
              Send us a message and we'll get back to you soon
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={handleSubmit}>Submit</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export const WithScrollableContent: Story = () => {
  return (
    <div className="p-8">
      <Drawer>
        <DrawerTrigger asChild>
          <Button>View Terms</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Terms and Conditions</DrawerTitle>
            <DrawerDescription>
              Please read our terms carefully
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-4 text-sm">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <p>
                Ut enim ad minim veniam, quis nostrud exercitation ullamco
                laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse
                cillum dolore eu fugiat nulla pariatur.
              </p>
              <p>
                Excepteur sint occaecat cupidatat non proident, sunt in culpa
                qui officia deserunt mollit anim id est laborum.
              </p>
              <p>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                accusantium doloremque laudantium, totam rem aperiam.
              </p>
              <p>
                Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit
                aut fugit, sed quia consequuntur magni dolores eos qui ratione
                voluptatem sequi nesciunt.
              </p>
              <p>
                Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet,
                consectetur, adipisci velit, sed quia non numquam eius modi
                tempora incidunt.
              </p>
            </div>
          </div>
          <DrawerFooter>
            <Button>Accept</Button>
            <DrawerClose asChild>
              <Button variant="outline">Decline</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export const FilterDrawer: Story = () => {
  const [priceRange, setPriceRange] = useState("all");
  const [category, setCategory] = useState("all");

  return (
    <div className="p-8">
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline">Filters</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Filter Products</DrawerTitle>
            <DrawerDescription>
              Refine your search results
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 space-y-6">
            <div className="space-y-3">
              <Label>Price Range</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="price"
                    value="all"
                    checked={priceRange === "all"}
                    onChange={(e) => setPriceRange(e.target.value)}
                  />
                  <span className="text-sm">All Prices</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="price"
                    value="0-50"
                    checked={priceRange === "0-50"}
                    onChange={(e) => setPriceRange(e.target.value)}
                  />
                  <span className="text-sm">$0 - $50</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="price"
                    value="50-100"
                    checked={priceRange === "50-100"}
                    onChange={(e) => setPriceRange(e.target.value)}
                  />
                  <span className="text-sm">$50 - $100</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="price"
                    value="100+"
                    checked={priceRange === "100+"}
                    onChange={(e) => setPriceRange(e.target.value)}
                  />
                  <span className="text-sm">$100+</span>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Category</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="category"
                    value="all"
                    checked={category === "all"}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                  <span className="text-sm">All Categories</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="category"
                    value="electronics"
                    checked={category === "electronics"}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                  <span className="text-sm">Electronics</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="category"
                    value="clothing"
                    checked={category === "clothing"}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                  <span className="text-sm">Clothing</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="category"
                    value="books"
                    checked={category === "books"}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                  <span className="text-sm">Books</span>
                </label>
              </div>
            </div>
          </div>
          <DrawerFooter>
            <Button>Apply Filters</Button>
            <Button
              variant="outline"
              onClick={() => {
                setPriceRange("all");
                setCategory("all");
              }}
            >
              Clear All
            </Button>
            <DrawerClose asChild>
              <Button variant="ghost">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export const ProductDetails: Story = () => {
  const product = {
    name: "Premium Wireless Headphones",
    price: "$199",
    description: "High-quality wireless headphones with active noise cancellation",
    features: [
      "40-hour battery life",
      "Active noise cancellation",
      "Premium sound quality",
      "Comfortable over-ear design",
    ],
  };

  return (
    <div className="p-8">
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold">{product.name}</h3>
          <p className="text-2xl font-bold text-primary mt-2">{product.price}</p>
          <Drawer>
            <DrawerTrigger asChild>
              <Button className="mt-4 w-full">View Details</Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>{product.name}</DrawerTitle>
                <DrawerDescription>{product.description}</DrawerDescription>
              </DrawerHeader>
              <div className="p-4 space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Key Features</h4>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="text-sm flex items-center gap-2">
                        <span className="text-primary">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-3xl font-bold text-primary">
                  {product.price}
                </div>
              </div>
              <DrawerFooter>
                <Button>Add to Cart</Button>
                <DrawerClose asChild>
                  <Button variant="outline">Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </CardContent>
      </Card>
    </div>
  );
};

export const ConfirmationDrawer: Story = () => {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="p-8 space-y-4">
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="destructive">Delete Account</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Are you absolutely sure?</DrawerTitle>
            <DrawerDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
              <p className="text-sm font-medium text-destructive">
                Warning: This is a permanent action
              </p>
            </div>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button
                variant="destructive"
                onClick={() => setConfirmed(true)}
              >
                Yes, delete my account
              </Button>
            </DrawerClose>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      {confirmed && (
        <p className="text-sm text-muted-foreground">
          Action confirmed (demo only)
        </p>
      )}
    </div>
  );
};

export const SettingsDrawer: Story = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("en");

  return (
    <div className="p-8">
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline">Settings</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Settings</DrawerTitle>
            <DrawerDescription>
              Manage your preferences
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Use dark color scheme
                </p>
              </div>
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                className="h-4 w-4"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>
          <DrawerFooter>
            <Button>Save Changes</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
