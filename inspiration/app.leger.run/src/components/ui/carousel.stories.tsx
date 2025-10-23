import type { Story } from "@ladle/react";
import { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "./carousel";
import { Card, CardContent } from "./card";

export const Basic: Story = () => {
  return (
    <div className="p-8">
      <div className="max-w-md mx-auto">
        <h3 className="text-lg font-semibold mb-4">Basic Carousel</h3>
        <Carousel className="w-full">
          <CarouselContent>
            {Array.from({ length: 5 }).map((_, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-square items-center justify-center p-6">
                      <span className="text-4xl font-semibold">{index + 1}</span>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
};

export const Vertical: Story = () => {
  return (
    <div className="p-8">
      <div className="max-w-xs mx-auto">
        <h3 className="text-lg font-semibold mb-4">Vertical Carousel</h3>
        <Carousel orientation="vertical" className="w-full max-w-xs">
          <CarouselContent className="h-[300px]">
            {Array.from({ length: 5 }).map((_, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card>
                    <CardContent className="flex items-center justify-center p-6 h-24">
                      <span className="text-3xl font-semibold">{index + 1}</span>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
};

export const MultipleItemsVisible: Story = () => {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-lg font-semibold mb-4">
          Multiple Items Visible (3 per view)
        </h3>
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent>
            {Array.from({ length: 10 }).map((_, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-square items-center justify-center p-6">
                      <span className="text-3xl font-semibold">{index + 1}</span>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
};

export const ImageCarousel: Story = () => {
  const images = [
    { id: 1, color: "bg-blue-500", label: "Image 1" },
    { id: 2, color: "bg-green-500", label: "Image 2" },
    { id: 3, color: "bg-purple-500", label: "Image 3" },
    { id: 4, color: "bg-orange-500", label: "Image 4" },
    { id: 5, color: "bg-pink-500", label: "Image 5" },
  ];

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold mb-4">Image Gallery Carousel</h3>
        <Carousel className="w-full">
          <CarouselContent>
            {images.map((image) => (
              <CarouselItem key={image.id}>
                <div className="p-1">
                  <div className={`${image.color} rounded-lg aspect-video flex items-center justify-center`}>
                    <span className="text-white text-2xl font-semibold">
                      {image.label}
                    </span>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
};

export const WithCurrentSlideIndicator: Story = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useState(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  });

  return (
    <div className="p-8">
      <div className="max-w-md mx-auto">
        <h3 className="text-lg font-semibold mb-4">With Current Slide Indicator</h3>
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            {Array.from({ length: 5 }).map((_, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-square items-center justify-center p-6">
                      <span className="text-4xl font-semibold">{index + 1}</span>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <div className="py-2 text-center text-sm text-muted-foreground">
          Slide {current} of {count}
        </div>
      </div>
    </div>
  );
};

export const WithDotIndicators: Story = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useState(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  });

  const slides = Array.from({ length: 5 });

  return (
    <div className="p-8">
      <div className="max-w-md mx-auto">
        <h3 className="text-lg font-semibold mb-4">With Dot Indicators</h3>
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            {slides.map((_, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-square items-center justify-center p-6">
                      <span className="text-4xl font-semibold">{index + 1}</span>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <div className="flex justify-center gap-2 py-4">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`h-2 w-2 rounded-full transition-all ${
                current === index
                  ? "bg-primary w-6"
                  : "bg-muted-foreground/20 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export const ContentCarousel: Story = () => {
  const testimonials = [
    {
      quote: "This product has transformed how we work. Highly recommend!",
      author: "Sarah Johnson",
      role: "CEO, TechCorp",
    },
    {
      quote: "Incredible value and amazing support team. Five stars!",
      author: "Michael Chen",
      role: "Developer, StartupXYZ",
    },
    {
      quote: "Best investment we've made this year. Game changer.",
      author: "Emily Rodriguez",
      role: "Product Manager, BigCo",
    },
  ];

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold mb-4">Testimonial Carousel</h3>
        <Carousel className="w-full">
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card>
                    <CardContent className="flex flex-col gap-4 p-8">
                      <p className="text-lg italic">"{testimonial.quote}"</p>
                      <div>
                        <p className="font-semibold">{testimonial.author}</p>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
};

export const ResponsiveCarousel: Story = () => {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h3 className="text-lg font-semibold mb-4">
          Responsive Carousel (1/2/3/4 items)
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Resize window to see responsive behavior: 1 item on mobile, 2 on tablet,
          3 on laptop, 4 on desktop
        </p>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {Array.from({ length: 12 }).map((_, index) => (
              <CarouselItem
                key={index}
                className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-square items-center justify-center p-6">
                      <span className="text-2xl font-semibold">{index + 1}</span>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
};

export const WithLooping: Story = () => {
  return (
    <div className="p-8">
      <div className="max-w-md mx-auto">
        <h3 className="text-lg font-semibold mb-4">With Infinite Loop</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Navigate past the last slide to loop back to the first
        </p>
        <Carousel
          opts={{
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {Array.from({ length: 5 }).map((_, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-square items-center justify-center p-6">
                      <span className="text-4xl font-semibold">{index + 1}</span>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
};

export const ProductShowcase: Story = () => {
  const products = [
    { name: "Product A", price: "$99", color: "bg-blue-500" },
    { name: "Product B", price: "$149", color: "bg-green-500" },
    { name: "Product C", price: "$199", color: "bg-purple-500" },
    { name: "Product D", price: "$249", color: "bg-orange-500" },
    { name: "Product E", price: "$299", color: "bg-pink-500" },
  ];

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-lg font-semibold mb-4">Product Showcase</h3>
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent>
            {products.map((product, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card>
                    <CardContent className="p-0">
                      <div className={`${product.color} h-48 rounded-t-lg`} />
                      <div className="p-6">
                        <h4 className="font-semibold text-lg">{product.name}</h4>
                        <p className="text-2xl font-bold text-primary mt-2">
                          {product.price}
                        </p>
                        <button className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                          Add to Cart
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
};
