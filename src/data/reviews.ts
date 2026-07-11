export interface GoogleReview {
  reviewerName: string;
  rating: number;
  reviewText: string;
  date?: string;
  avatarInitial: string;
  avatarBg: string; // Tailwind color class for background avatar
}

export const googleReviewsData: GoogleReview[] = [
  {
    reviewerName: "Surya Pratap Rana",
    rating: 5,
    reviewText: "Bahut hi behtareen anubhav raha. Darshan bina kisi pareshani ke sampann hua. Staff ka vyavhaar vinamr aur sahayak tha. Main Kamakhya Yatra ko zarur recommend karunga.",
    date: "July, 2026",
    avatarInitial: "S",
    avatarBg: "bg-blue-600"
  },
  {
    reviewerName: "Priya Sharma",
    rating: 5,
    reviewText: "Our Kamakhya temple yatra was perfectly organized. Darshan timings, stay, and transport were all smooth. The team was caring and professional throughout.",
    date: "March, 2026",
    avatarInitial: "P",
    avatarBg: "bg-amber-600"
  },
  {
    reviewerName: "Rahul Mehta",
    rating: 5,
    reviewText: "Booked a Darjeeling and Gangtok holiday package. Hotels were comfortable, itinerary was well planned, and the guide knew every local highlight. Highly recommend!",
    date: "February, 2026",
    avatarInitial: "R",
    avatarBg: "bg-emerald-600"
  },
  {
    reviewerName: "Ananya Das",
    rating: 5,
    reviewText: "Videsh Yatra to Nepal exceeded expectations. Visa help, sightseeing, and meals were handled seamlessly. Kamakhya Yatra made our family trip stress-free.",
    date: "January, 2026",
    avatarInitial: "A",
    avatarBg: "bg-indigo-600"
  },
  {
    reviewerName: "Meera Nair",
    rating: 5,
    reviewText: "Excellent value on our Kerala holiday. Flight, hotel, and houseboat were coordinated without any last-minute surprises. Truly a premium experience.",
    date: "November, 2025",
    avatarInitial: "M",
    avatarBg: "bg-rose-600"
  },
  {
    reviewerName: "Vikram Singh",
    rating: 4,
    reviewText: "From enquiry to return, the Dharmic pilgrimage felt sacred and well-guided. Transparent pricing and responsive support. We will travel with them again.",
    date: "December, 2025",
    avatarInitial: "V",
    avatarBg: "bg-teal-600"
  }
];
