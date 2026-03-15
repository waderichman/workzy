const currentAccount = {
  id: "me",
  name: "Irene Parker",
  homeBase: "Santa Monica, CA",
  zipCode: "90401",
  serviceZipCodes: ["90401", "90402", "90403", "90404", "90291", "90292", "90066"],
  bio: "Reliable local marketplace profile for posting jobs and picking up flexible work.",
  posterStats: {
    tasksPosted: 18,
    hireRate: "92%",
    completedCount: 15,
    rating: {
      average: 4.9,
      count: 24
    }
  },
  taskerStats: {
    jobsWon: 34,
    earningsLabel: "$4.8k",
    completedCount: 29,
    rating: {
      average: 4.8,
      count: 31
    }
  }
};

const categories = [
  { id: "cleaning", label: "Cleaning", icon: "sparkles", accent: "#b7f3df" },
  { id: "moving", label: "Moving", icon: "cube", accent: "#ffd7a1" },
  { id: "handyman", label: "Handyman", icon: "construct", accent: "#c7d2fe" },
  { id: "delivery", label: "Delivery", icon: "bicycle", accent: "#fecdd3" },
  { id: "pets", label: "Pet Care", icon: "paw", accent: "#fde68a" }
];

const users = [
  {
    id: "u1",
    name: "Maya Chen",
    tagline: "5-star mover and furniture assembler",
    taskerRating: { average: 4.9, count: 126 },
    posterRating: { average: 4.8, count: 18 },
    jobsCompleted: 126,
    tasksPosted: 14,
    responseTime: "Replies in 6 min",
    avatarColor: "#d1fae5",
    zipCode: "90291",
    serviceZipCodes: ["90291", "90292", "90401", "90403"]
  },
  {
    id: "u2",
    name: "Jordan Tate",
    tagline: "Deep-clean specialist for apartments and Airbnbs",
    taskerRating: { average: 4.8, count: 89 },
    posterRating: { average: 4.7, count: 11 },
    jobsCompleted: 89,
    tasksPosted: 21,
    responseTime: "Replies in 9 min",
    avatarColor: "#fee2e2",
    zipCode: "90292",
    serviceZipCodes: ["90292", "90291", "90401", "90066"]
  },
  {
    id: "u3",
    name: "Elena Ruiz",
    tagline: "Handyman for mounting, patching, and small repairs",
    taskerRating: { average: 4.9, count: 141 },
    posterRating: { average: 4.9, count: 9 },
    jobsCompleted: 141,
    tasksPosted: 10,
    responseTime: "Replies in 14 min",
    avatarColor: "#dbeafe",
    zipCode: "90066",
    serviceZipCodes: ["90066", "90404", "90403", "90230"]
  }
];

const tasks = [
  {
    id: "t1",
    title: "Help move a one-bedroom apartment",
    description:
      "Need one strong extra set of hands for two hours. Elevator building, no truck needed.",
    categoryId: "moving",
    location: "Venice",
    zipCode: "90291",
    distanceLabel: "2.4 mi away",
    budget: 140,
    timeline: "Today, 4:30 PM",
    status: "open",
    postedAt: "14m ago",
    postedBy: "me",
    offers: 4,
    questions: 3,
    tags: ["stairs", "heavy lifting", "same day"]
  },
  {
    id: "t2",
    title: "Deep clean after short-term rental checkout",
    description:
      "Kitchen, bathroom, linens, and quick reset for next guest. Supplies provided onsite.",
    categoryId: "cleaning",
    location: "Marina del Rey",
    zipCode: "90292",
    distanceLabel: "3.1 mi away",
    budget: 110,
    timeline: "Tomorrow morning",
    status: "open",
    postedAt: "32m ago",
    postedBy: "u2",
    offers: 6,
    questions: 2,
    tags: ["airbnb", "3 hours", "repeat work"]
  },
  {
    id: "t3",
    title: "Mount TV and hide cables neatly",
    description:
      "55-inch TV already unpacked. Looking for someone experienced with drywall and clean cable routing.",
    categoryId: "handyman",
    location: "Culver City",
    zipCode: "90066",
    distanceLabel: "5.8 mi away",
    budget: 175,
    timeline: "This weekend",
    status: "assigned",
    postedAt: "1h ago",
    postedBy: "u3",
    assignedTo: "me",
    agreedPrice: 190,
    offers: 5,
    questions: 4,
    tags: ["tools needed", "wall mount", "precise finish"]
  },
  {
    id: "t4",
    title: "Pick up catering tray and deliver to studio",
    description:
      "Pickup in West Hollywood, delivery in Burbank before noon. Need careful handling and updates in chat.",
    categoryId: "delivery",
    location: "West Hollywood",
    zipCode: "90403",
    distanceLabel: "9.7 mi away",
    budget: 65,
    timeline: "Friday, 10:00 AM",
    status: "completed",
    postedAt: "2h ago",
    postedBy: "u1",
    assignedTo: "me",
    agreedPrice: 70,
    offers: 3,
    questions: 1,
    tags: ["car required", "time sensitive"]
  },
  {
    id: "t5",
    title: "Dog walk and feeding for two evenings",
    description: "Need a reliable local dog lover for Friday and Saturday evening visits.",
    categoryId: "pets",
    location: "Downtown LA",
    zipCode: "90012",
    distanceLabel: "Out of area",
    budget: 80,
    timeline: "This weekend",
    status: "open",
    postedAt: "49m ago",
    postedBy: "u2",
    offers: 1,
    questions: 1,
    tags: ["dogs", "two visits", "out of radius"]
  }
];

const conversations = [
  {
    id: "c1",
    taskId: "t1",
    participantIds: ["me", "u1"],
    messages: [
      {
        id: "m1",
        senderId: "u1",
        text: "Can you confirm if there are any stairs at either building?",
        sentAt: "11:08 AM",
        kind: "question"
      },
      {
        id: "m2",
        senderId: "me",
        text: "No stairs. Elevator on both ends and parking is easy.",
        sentAt: "11:12 AM",
        kind: "message"
      },
      {
        id: "m3",
        senderId: "u1",
        text: "I can do it for $160 if the couch is included.",
        sentAt: "11:15 AM",
        kind: "offer",
        offerAmount: 160
      },
      {
        id: "m4",
        senderId: "me",
        text: "Couch is included. If we settle at $150, I can book now.",
        sentAt: "11:18 AM",
        kind: "offer",
        offerAmount: 150
      }
    ]
  },
  {
    id: "c2",
    taskId: "t3",
    participantIds: ["me", "u3"],
    messages: [
      {
        id: "m5",
        senderId: "me",
        text: "Do you bring a stud finder and cable cover kit?",
        sentAt: "9:42 AM",
        kind: "question"
      },
      {
        id: "m6",
        senderId: "u3",
        text: "Yes, both. I usually quote $190 for that setup.",
        sentAt: "9:48 AM",
        kind: "offer",
        offerAmount: 190
      },
      {
        id: "m7",
        senderId: "u3",
        text: "Offer accepted. I can be there Saturday morning.",
        sentAt: "9:50 AM",
        kind: "system"
      }
    ]
  }
];

const reviews = [
  {
    id: "r1",
    taskId: "t4",
    reviewerId: "u1",
    revieweeId: "me",
    role: "tasker",
    rating: 5,
    text: "Fast communication and handled the drop-off perfectly.",
    createdAt: "2d ago"
  },
  {
    id: "r2",
    taskId: "t4",
    reviewerId: "me",
    revieweeId: "u1",
    role: "poster",
    rating: 5,
    text: "Clear pickup notes and instant payment after delivery.",
    createdAt: "2d ago"
  }
];

const highlights = {
  openTasks: tasks.filter((task) => task.status === "open").length,
  activeTaskers: 148,
  averageReply: "12 min"
};

module.exports = {
  currentAccount,
  categories,
  users,
  tasks,
  conversations,
  reviews,
  highlights
};
