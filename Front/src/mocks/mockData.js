export const MOCK_FALLBACK = {
  categories: [
    { id: "1", name: "Web Development", iconUrl: "💻" },
    { id: "2", name: "Graphic Design", iconUrl: "🎨" },
    { id: "3", name: "Digital Marketing", iconUrl: "📈" },
    { id: "4", name: "Content Writing", iconUrl: "✍️" },
    { id: "5", name: "Video & Animation", iconUrl: "🎬" },
    { id: "6", name: "AI & Data Science", iconUrl: "🤖" }
  ],
  services: [
    { 
      id: "1", 
      title: "Full-Stack Web App", 
      description: "React + Node.js full stack application", 
      price: 1500, 
      deliveryDays: 14, 
      averageRating: 4.9, 
      providerName: "Alex Rivera", 
      categoryName: "Web Development", 
      images: ["https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800"] 
    },
    { 
      id: "2", 
      title: "Logo & Brand Identity", 
      description: "Creative logo design for your startup", 
      price: 250, 
      deliveryDays: 3, 
      averageRating: 4.8, 
      providerName: "Sarah Chen", 
      categoryName: "Graphic Design", 
      images: ["https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800"] 
    },
    { 
      id: "3", 
      title: "SEO Optimization", 
      description: "Boost your search engine rankings", 
      price: 400, 
      deliveryDays: 7, 
      averageRating: 4.7, 
      providerName: "Marcus Thorne", 
      categoryName: "Digital Marketing", 
      images: ["https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800"] 
    },
    { 
      id: "4", 
      title: "Enterprise AI Training", 
      description: "Custom AI model for business automation", 
      price: 3000, 
      deliveryDays: 30, 
      averageRating: 5.0, 
      providerName: "Dr. Elena Vance", 
      categoryName: "AI & Data Science", 
      images: ["https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800"] 
    }
  ]
};

export const wrapResponse = (data) => ({
  statusCode: 200,
  isSuccess: true,
  message: "Mock Success",
  data: data
});

