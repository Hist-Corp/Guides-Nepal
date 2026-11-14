export const mockHosts = [
  { id: 101, name: "Himalayan Trails Co.", city: "Kathmandu", status: "active", featured: false, guidesCount: 8, experiencesCount: 12, revenueTotal: 48250 },
  { id: 102, name: "Valley Heritage Tours", city: "Bhaktapur", status: "active", featured: true, guidesCount: 5, experiencesCount: 7, revenueTotal: 26580 },
  { id: 103, name: "Pokhara Adventures", city: "Pokhara", status: "suspended", featured: false, guidesCount: 3, experiencesCount: 4, revenueTotal: 12900 }
]

export const mockGuides = [
  { id: 201, name: "Ram Bahadur", verified: true, level: "senior", rating: 4.9, reviews: 120, languages: ["English", "Nepali", "Newari"] },
  { id: 202, name: "Sita Sharma", verified: true, level: "regular", rating: 4.7, reviews: 85, languages: ["English", "Nepali"] },
  { id: 203, name: "Kiran Adhikari", verified: false, level: "regular", rating: 4.4, reviews: 33, languages: ["English"] }
]

export const mockWriters = [
  { id: 401, name: "Nabin Lama", email: "nabin@example.com", status: "active" },
  { id: 402, name: "Asmita K.", email: "asmita@example.com", status: "active" }
]

export const mockExperiences = [
  { id: 1, title: "Bhaktapur Heritage Walk", city: "Bhaktapur", price: 50, duration: "4h", status: "listed", rating: 4.8 },
  { id: 2, title: "Patan Cultural Circuit", city: "Lalitpur", price: 45, duration: "3h", status: "listed", rating: 4.6 },
  { id: 3, title: "Pokhara Lakeside Evening", city: "Pokhara", price: 35, duration: "2h", status: "draft", rating: 4.2 }
]

export const mockBookings = [
  { id: 301, experienceTitle: "Bhaktapur Heritage Walk", date: "2026-02-02", guests: 3, price: 150, status: "confirmed", customerName: "Alice Kim" },
  { id: 302, experienceTitle: "Patan Cultural Circuit", date: "2026-02-05", guests: 2, price: 90, status: "pending", customerName: "Ben Singh" },
  { id: 303, experienceTitle: "Pokhara Lakeside Evening", date: "2026-02-07", guests: 4, price: 140, status: "cancelled", customerName: "Chloe Wang" }
]

export const mockPayouts = [
  { id: "P-1001", runDate: "2026-01-15", amount: 1200, status: "completed", items: 18 },
  { id: "P-1002", runDate: "2026-01-31", amount: 980, status: "processing", items: 12 },
  { id: "P-1003", runDate: "2026-02-15", amount: 0, status: "scheduled", items: 0 }
]

export const mockAnalyticsSeries = [
  { label: "Bookings", value: 22 },
  { label: "Bookings", value: 28 },
  { label: "Bookings", value: 25 },
  { label: "Bookings", value: 31 },
  { label: "Bookings", value: 29 }
]

/* ---------------- Visual analytics datasets ---------------- */

/** Platform growth — bookings · users · tours across the last 8 weeks. */
export const growthSeries = [
  { week: "W1", bookings: 120, users: 210, tours: 24 },
  { week: "W2", bookings: 145, users: 246, tours: 26 },
  { week: "W3", bookings: 138, users: 252, tours: 27 },
  { week: "W4", bookings: 172, users: 289, tours: 29 },
  { week: "W5", bookings: 168, users: 305, tours: 30 },
  { week: "W6", bookings: 210, users: 358, tours: 33 },
  { week: "W7", bookings: 248, users: 402, tours: 35 },
  { week: "W8", bookings: 265, users: 437, tours: 38 },
];

/** Bookings per weekday (weekly rhythm). */
export const weeklyBookings = [
  { day: "Mon", value: 22 },
  { day: "Tue", value: 28 },
  { day: "Wed", value: 25 },
  { day: "Thu", value: 31 },
  { day: "Fri", value: 29 },
  { day: "Sat", value: 42 },
  { day: "Sun", value: 38 },
];

/** Booking heatmap — weekday × time-slot intensity (7 × 6). */
export const bookingHeatmap = {
  slots: ["6a", "9a", "12p", "3p", "6p", "9p"],
  matrix: [
    [2, 8, 14, 11, 18, 6],
    [3, 10, 16, 13, 20, 7],
    [2, 9, 15, 12, 22, 9],
    [4, 12, 18, 15, 24, 10],
    [5, 14, 21, 18, 28, 14],
    [9, 22, 30, 27, 34, 20],
    [7, 19, 26, 23, 30, 17],
  ],
};

/** Review-score distribution histogram. */
export const ratingHistogram = [
  { label: "1★", value: 8, color: "#f87171" },
  { label: "2★", value: 15, color: "#fb923c" },
  { label: "3★", value: 64, color: "#fbbf24" },
  { label: "4★", value: 186, color: "#60a5fa" },
  { label: "5★", value: 412, color: "#2563eb" },
];

/** Average review score by city. */
export const cityRatings = [
  { label: "Kathmandu", value: 4.8 },
  { label: "Pokhara", value: 4.9 },
  { label: "Lalitpur", value: 4.7 },
  { label: "Bhaktapur", value: 4.6 },
  { label: "Bharatpur", value: 4.5 },
];

/** Bookings by city (horizontal bars). */
export const bookingsByCity = [
  { label: "Kathmandu", value: 640 },
  { label: "Pokhara", value: 512 },
  { label: "Lalitpur", value: 348 },
  { label: "Bhaktapur", value: 296 },
  { label: "Bharatpur", value: 184 },
];

/** Where travelers come from — travel-relevant traffic mix. */
export const mockSources = [
  { label: "Direct search", value: 350, color: "#2563eb" },
  { label: "Social media", value: 300, color: "#ff8a5c" },
  { label: "Referrals", value: 200, color: "#34d399" },
  { label: "Travel partners", value: 150, color: "#38bdf8" },
];

/** Support ticket mix by priority. */
export const ticketsByPriority = [
  { label: "Urgent", value: 12 },
  { label: "High", value: 24 },
  { label: "Normal", value: 58 },
  { label: "Low", value: 21 },
];

export const mockEarningsHistory = [
  { date: "Jan 10", amount: 340 },
  { date: "Jan 12", amount: 420 },
  { date: "Jan 15", amount: 380 },
  { date: "Jan 18", amount: 510 },
  { date: "Jan 20", amount: 465 },
  { date: "Jan 22", amount: 590 },
  { date: "Jan 24", amount: 545 },
  { date: "Jan 27", amount: 660 },
  { date: "Jan 29", amount: 615 },
  { date: "Jan 31", amount: 720 },
]

export const mockSchedule = [
  { date: "2026-02-02", tour: "Bhaktapur Heritage Walk", time: "09:00" },
  { date: "2026-02-05", tour: "Patan Cultural Circuit", time: "14:00" },
  { date: "2026-02-07", tour: "Pokhara Lakeside Evening", time: "18:00" }
]

export const mockSettings = [
  { key: "platformFee", value: "12%" },
  { key: "refundPolicy", value: "Free cancellation up to 24h" },
  { key: "citiesEnabled", value: "Kathmandu, Bhaktapur, Patan, Pokhara" }
]

export const mockTasks = [
  { id: "T-001", title: "Update experience descriptions", due: "2026-02-03", status: "in-progress" },
  { id: "T-002", title: "Finalize quarterly revenue review", due: "2026-02-10", status: "pending" },
  { id: "T-003", title: "Launch new Pokhara tour", due: "2026-02-14", status: "scheduled" },
  { id: "T-004", title: "Guide verification queue", due: "2026-02-05", status: "pending" }
]

export const mockActivity = [
  { time: "09:12", text: "Alice booked Bhaktapur Heritage Walk" },
  { time: "10:25", text: "Sita updated tour pricing" },
  { time: "11:03", text: "Ram completed guide verification upload" },
  { time: "13:47", text: "Payout run P-1002 moved to processing" }
]

export const mockEmployees = [
  { name: "John Doe", email: "john@company.com", department: "Operations", role: "Senior Guide Manager", status: "active" },
  { name: "Sarah B.", email: "sarah@company.com", department: "Marketing", role: "Content Strategist", status: "active" },
  { name: "Angela P.", email: "angela@company.com", department: "IT", role: "Data Specialist", status: "on leave" },
  { name: "Dawa J.", email: "dawa@company.com", department: "Finance", role: "Finance Analyst", status: "active" }
]

export const mockScheduleItems = [
  { time: "10:00 AM", title: "Marketing strategy presentation", tag: "Marketing" },
  { time: "1:30 PM", title: "HR policy update session", tag: "HR" },
  { time: "3:00 PM", title: "Customer feedback analysis", tag: "Support" },
  { time: "5:30 PM", title: "Financial reporting session", tag: "Finance" }
]

export const mockHostTasks = [
  { id: "H-001", title: "Publish Pokhara tour update", due: "2026-02-06", status: "scheduled" },
  { id: "H-002", title: "Review cancelled bookings", due: "2026-02-04", status: "pending" },
  { id: "H-003", title: "Adjust pricing for Bhaktapur", due: "2026-02-09", status: "in-progress" }
]

export const mockGuideTasks = [
  { id: "G-001", title: "Confirm upcoming assignments", due: "2026-02-03", status: "pending" },
  { id: "G-002", title: "Upload new profile photo", due: "2026-02-05", status: "scheduled" },
  { id: "G-003", title: "Update language skills", due: "2026-02-08", status: "in-progress" }
]

export const mockHostScheduleItems = [
  { time: "11:00 AM", title: "Host team sync", tag: "Operations" },
  { time: "2:00 PM", title: "Experience media review", tag: "Content" }
]

export const mockGuideScheduleItems = [
  { time: "08:30 AM", title: "Meet group at Durbar Square", tag: "Tour" },
  { time: "4:00 PM", title: "Planning session", tag: "Personal" }
]
