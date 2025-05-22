import Image from "next/image";
import { useState, useEffect, useRef } from "react";

interface Image {
  url: string;
  alt: string;
}

interface InfiniteImageSliderProps {
  images?: Image[];
  stayDuration?: number;
  transitionDuration?: number;
  height?: string;
  pauseOnHover?: boolean;
}

export default function InfiniteImageSlider({
  images = [
    // Default sample images
    { url: "/api/placeholder/800/400", alt: "Slide 1" },
    { url: "/api/placeholder/800/400", alt: "Slide 2" },
    { url: "/api/placeholder/800/400", alt: "Slide 3" },
    { url: "/api/placeholder/800/400", alt: "Slide 4" },
    { url: "/api/placeholder/800/400", alt: "Slide 5" },
  ],
  stayDuration = 3000, // Time each image stays visible in ms
  transitionDuration = 500, // Transition speed in ms
  height = "h-64",
  pauseOnHover = true,
}: InfiniteImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Function to advance to the next slide
  const goToNextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  // Effect to handle the automatic cycling
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    timerRef.current = setTimeout(() => {
      goToNextSlide();
    }, stayDuration);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, isPaused, stayDuration, images.length]);

  return (
    <div
      className={`w-full ${height} overflow-hidden relative rounded-[24px]`}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <div className="h-full w-full relative rounded-[24px]">
        {images.map((image, index) => {
          // Calculate opacity and z-index for each image
          const isActive = index === currentIndex;

          return (
            <div
              key={`slide-${index}`}
              className="absolute top-0 left-0 w-full h-full rounded-[24px]"
              style={{
                opacity: isActive ? 1 : 0,
                zIndex: isActive ? 1 : 0,
                transition: `opacity ${transitionDuration}ms ease-in-out`,
              }}
            >
              {/* <img
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-contain rounded-[24px]"
              /> */}
              <Image src={image.url} alt={image.alt} width={500} height={100} className='h-full' />
            </div>
          );
        })}
      </div>
    </div>
  );
}
