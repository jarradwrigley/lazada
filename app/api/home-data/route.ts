import { NextRequest, NextResponse } from "next/server";

// Mock data interfaces
interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
  comments: number;
}

interface UserStats {
  totalPosts: number;
  totalLikes: number;
  totalFollowers: number;
  totalFollowing: number;
  joinedDate: string;
}

interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "mention";
  message: string;
  isRead: boolean;
  createdAt: string;
  from: string;
}

interface HomeData {
  posts: Post[];
  stats: UserStats;
  notifications: Notification[];
  featuredContent: {
    title: string;
    description: string;
    imageUrl: string;
  }[];
}

// Mock data generators
const generateMockPosts = (): Post[] => {
  const titles = [
    "Getting Started with Next.js 14",
    "The Future of Web Development",
    "Building Scalable React Applications",
    "Understanding TypeScript Generics",
    "CSS Grid vs Flexbox: When to Use What",
    "State Management in Modern React",
    "API Design Best Practices",
    "Mobile-First Development Strategies",
  ];

  const authors = [
    "John Doe",
    "Jane Smith",
    "Alex Johnson",
    "Sarah Wilson",
    "Mike Brown",
  ];

  return Array.from({ length: 8 }, (_, i) => ({
    id: `post-${i + 1}`,
    title: titles[i] || `Sample Post ${i + 1}`,
    content: `This is the content for post ${
      i + 1
    }. It contains valuable insights about web development and programming best practices. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
    author: authors[i % authors.length],
    createdAt: new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    ).toISOString(),
    likes: Math.floor(Math.random() * 100) + 1,
    comments: Math.floor(Math.random() * 25) + 1,
  }));
};

const generateMockStats = (): UserStats => ({
  totalPosts: Math.floor(Math.random() * 50) + 10,
  totalLikes: Math.floor(Math.random() * 500) + 50,
  totalFollowers: Math.floor(Math.random() * 1000) + 100,
  totalFollowing: Math.floor(Math.random() * 300) + 50,
  joinedDate: "2023-01-15T00:00:00.000Z",
});

const generateMockNotifications = (): Notification[] => {
  const notifications = [
    {
      type: "like" as const,
      message: 'liked your post "Getting Started with Next.js"',
      from: "John Doe",
    },
    {
      type: "comment" as const,
      message: 'commented on your post "React Best Practices"',
      from: "Jane Smith",
    },
    {
      type: "follow" as const,
      message: "started following you",
      from: "Alex Johnson",
    },
    {
      type: "mention" as const,
      message: "mentioned you in a post",
      from: "Sarah Wilson",
    },
    {
      type: "like" as const,
      message: 'liked your comment on "TypeScript Tips"',
      from: "Mike Brown",
    },
  ];

  return notifications
    .slice(0, Math.floor(Math.random() * 5) + 1)
    .map((notif, i) => ({
      id: `notif-${i + 1}`,
      type: notif.type,
      message: notif.message,
      from: notif.from,
      isRead: Math.random() > 0.5,
      createdAt: new Date(
        Date.now() - Math.random() * 24 * 60 * 60 * 1000
      ).toISOString(),
    }));
};

const generateFeaturedContent = () => [
  {
    title: "Weekly Developer Digest",
    description:
      "Stay updated with the latest in web development, frameworks, and industry trends.",
    imageUrl: "/api/placeholder/400/200",
  },
  {
    title: "Community Spotlight",
    description:
      "Discover amazing projects and contributions from our developer community.",
    imageUrl: "/api/placeholder/400/200",
  },
  {
    title: "Learning Resources",
    description:
      "Curated tutorials, guides, and courses to accelerate your development journey.",
    imageUrl: "/api/placeholder/400/200",
  },
];

// Simulate different loading scenarios
const getLoadingDelay = () => {
  const scenario = Math.random();

  if (scenario < 0.1) {
    // 10% chance of very slow response (3-5 seconds)
    return Math.random() * 2000 + 3000;
  } else if (scenario < 0.3) {
    // 20% chance of slow response (1.5-3 seconds)
    return Math.random() * 1500 + 1500;
  } else {
    // 70% chance of normal response (0.5-1.5 seconds)
    return Math.random() * 1000 + 500;
  }
};

// Simulate occasional errors for testing error handling
const shouldSimulateError = () => {
  return Math.random() < 0.05; // 5% chance of error
};

export async function GET(request: NextRequest) {
  try {
    // Simulate loading delay
    const delay = getLoadingDelay();
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Simulate occasional server errors
    if (shouldSimulateError()) {
      return NextResponse.json(
        {
          success: false,
          message: "Simulated server error - please try again",
        },
        { status: 500 }
      );
    }

    // Optional: Check authentication (uncomment if you want to test auth)
    // const session = await getServerSession();
    // if (!session) {
    //   return NextResponse.json(
    //     { success: false, message: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    // Generate mock data
    const homeData: HomeData = {
      posts: generateMockPosts(),
      stats: generateMockStats(),
      notifications: generateMockNotifications(),
      featuredContent: generateFeaturedContent(),
    };

    // Add some console logging to see the API being called
    console.log(
      `[API] Home data fetched - ${delay.toFixed(0)}ms delay simulated`
    );
    console.log(
      `[API] Returning ${homeData.posts.length} posts, ${homeData.notifications.length} notifications`
    );

    return NextResponse.json({
      success: true,
      data: homeData,
      meta: {
        loadTime: delay,
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      },
    });
  } catch (error) {
    console.error("[API Error] Failed to fetch home data:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Optional: Handle POST requests for testing different scenarios
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scenario } = body;

    let delay = 1000;
    let shouldError = false;

    // Allow frontend to specify test scenarios
    switch (scenario) {
      case "fast":
        delay = 200;
        break;
      case "slow":
        delay = 3000;
        break;
      case "very-slow":
        delay = 5000;
        break;
      case "error":
        shouldError = true;
        break;
      default:
        delay = getLoadingDelay();
    }

    await new Promise((resolve) => setTimeout(resolve, delay));

    if (shouldError) {
      return NextResponse.json(
        { success: false, message: "Requested error scenario" },
        { status: 500 }
      );
    }

    const homeData: HomeData = {
      posts: generateMockPosts(),
      stats: generateMockStats(),
      notifications: generateMockNotifications(),
      featuredContent: generateFeaturedContent(),
    };

    return NextResponse.json({
      success: true,
      data: homeData,
      meta: {
        scenario,
        loadTime: delay,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Invalid request body" },
      { status: 400 }
    );
  }
}
