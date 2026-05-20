/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY;

if (API_KEY && API_KEY !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini Client initialized successfully on server-side.");
  } catch (err) {
    console.error("Failed to initialize Gemini Client with API key:", err);
  }
} else {
  console.log("No valid GEMINI_API_KEY found. AI features will fallback to deterministic simulated response.");
}

// IN-MEMORY DATABASE STATE (Persists for user session on backend)
let users = [
  { id: "u-admin", email: "admin@skillsphere.local", fullName: "Admin Chief", role: "Admin", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", isVerified: true, isSuspended: false, twoFactorEnabled: true },
  { id: "u-alex", email: "alex.dev@skillsphere.local", fullName: "Alex Rivera", role: "Freelancer", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", isVerified: true, isSuspended: false, twoFactorEnabled: false },
  { id: "u-sara", email: "sara.design@skillsphere.local", fullName: "Sara Chen", role: "Freelancer", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80", isVerified: true, isSuspended: false, twoFactorEnabled: true },
  { id: "u-dan", email: "dan.growth@skillsphere.local", fullName: "Dan Patel", role: "Freelancer", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80", isVerified: false, isSuspended: false, twoFactorEnabled: false },
  { id: "u-jane", email: "jane.client@skillsphere.local", fullName: "Jane Miller", role: "Client", avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80", isVerified: true, isSuspended: false, twoFactorEnabled: false },
  { id: "u-bob", email: "bob.startup@skillsphere.local", fullName: "Bob Vance", role: "Client", avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80", isVerified: true, isSuspended: false, twoFactorEnabled: true },
];

let freelancerProfiles = [
  {
    userId: "u-alex",
    title: "Expert Full-Stack React & Node Engineer",
    bio: "Passionate engineer focusing on location-based triggers, high performance react canvas, and robust backends. Over 6 years in production software.",
    skills: [
      { name: "React", level: "Expert" },
      { name: "Node", level: "Expert" },
      { name: "Tailwind", level: "Expert" },
      { name: "PostgreSQL", level: "Intermediate" },
      { name: "Maps Integration", level: "Expert" }
    ],
    hourlyRate: 85,
    certifications: ["Google Cloud Certified Architect", "AWS Developer Associate"],
    workExperience: [
      { id: "exp1", company: "MetaStream Tech", role: "Senior Frontend Lead", duration: "2023 - Present", description: "Led full revamp of location workflows using Mapbox." },
      { id: "exp2", company: "LocalGigs Corp", role: "Full-Stack Dev", duration: "2021 - 2023", description: "Built real-time messaging using standard express routes and memory buses." }
    ],
    portfolio: [
      { id: "p1", title: "Live Ride Tracker", description: "Interactive map plotting active courier delivery times.", imageUrl: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&auto=format&fit=crop&q=80" },
      { id: "p2", title: "SkillMatch Engine v1", description: "Dynamic skill vector dashboard visualizing developer strengths.", imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=80" }
    ],
    availability: {
      slots: ["Mon 09:00 - 12:00", "Tue 13:00 - 17:00", "Wed 09:00 - 12:00", "Thu 13:00 - 17:00", "Fri 10:00 - 15:00"],
      isBooked: { "Mon 09:00 - 12:00": false, "Tue 13:00 - 17:00": true }
    },
    reputationScore: 94,
    profileViews: 342,
    earningsThisMonth: 3820,
    completedJobsCount: 18
  },
  {
    userId: "u-sara",
    title: "Senior Product Designer & Brand Architect",
    bio: "Translating sophisticated requirements into pixel-perfect web and mobile layouts. Specialist in clean design frameworks and dark theme interfaces.",
    skills: [
      { name: "Figma", level: "Expert" },
      { name: "UI Design", level: "Expert" },
      { name: "Mobile UX", level: "Expert" },
      { name: "Tailwind", level: "Intermediate" }
    ],
    hourlyRate: 95,
    certifications: ["Nielsen Norman UX Master Certification"],
    workExperience: [
      { id: "exp3", company: "Prism Creative Studios", role: "Principal Visual Designer", duration: "2022 - Present", description: "Architected modern layout design guidelines. Mentored junior designers." }
    ],
    portfolio: [
      { id: "p3", title: "Midnight Wallet UI", description: "High contrast luxury finance visual suite.", imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&auto=format&fit=crop&q=80" }
    ],
    availability: {
      slots: ["Mon 13:00 - 17:00", "Wed 13:00 - 17:00", "Thu 09:00 - 12:00", "Fri 13:00 - 17:00"],
      isBooked: {}
    },
    reputationScore: 98,
    profileViews: 512,
    earningsThisMonth: 7890,
    completedJobsCount: 29
  },
  {
    userId: "u-dan",
    title: "SEO Strategist & Technical Copywriter",
    bio: "Focusing on local search index optimizations and marketing copy that drives organic acquisition.",
    skills: [
      { name: "SEO", level: "Expert" },
      { name: "Copywriting", level: "Expert" },
      { name: "Marketing", level: "Expert" },
      { name: "React", level: "Beginner" }
    ],
    hourlyRate: 55,
    certifications: ["Google Analytics Individual Qualification"],
    workExperience: [
      { id: "exp4", company: "LocalTraffic", role: "Search Strategist", duration: "2020 - 2024", description: "Helped hyperlocal restaurants increase sales by 120%." }
    ],
    portfolio: [],
    availability: {
      slots: ["Tue 09:00 - 12:00", "Thu 09:00 - 12:00"],
      isBooked: {}
    },
    reputationScore: 88,
    profileViews: 120,
    earningsThisMonth: 1200,
    completedJobsCount: 5
  }
];

let gigs = [
  {
    id: "gig1",
    clientId: "u-jane",
    clientName: "Jane Miller",
    title: "Need React Native Mobile Developer (Hyperlocal Delivery Tracking App)",
    description: "Looking for an expert to implement interactive mobile workflows, centering delivery track and location signals. High fidelity user interfaces and clean state are required.",
    category: "Development",
    budgetMin: 3000,
    budgetMax: 5500,
    location: "New York City, NY",
    skillsRequired: ["React", "Mobile UX", "Maps Integration", "Node"],
    status: "Open",
    milestones: [
      { id: "m1-1", title: "High-fidelity UX design & routing maps integration", description: "Wireframes approved and prototype of map working in container", amount: 1500, status: "Pending" },
      { id: "m1-2", title: "Real-time courier update simulation endpoints", description: "Backend listener and push notifications completed", amount: 2000, status: "Pending" },
      { id: "m1-3", title: "Final rollout, QA and verified Play Store listing", description: "Release builds delivered and approved in play store console", amount: 1500, status: "Pending" }
    ],
    createdAt: "2026-05-18T12:00:00Z"
  },
  {
    id: "gig2",
    clientId: "u-bob",
    clientName: "Bob Vance",
    title: "Revamp Brand Figma Design System & Landing Page",
    description: "Seeking a brand architect to design high-contrast dark-mode web mockups and build interactive landing component frameworks. Perfect typography pairing is mandatory.",
    category: "Design",
    budgetMin: 1200,
    budgetMax: 2000,
    location: "Austin, TX (Remote Acceptable)",
    skillsRequired: ["Figma", "UI Design", "Mobile UX", "Tailwind"],
    status: "In Progress",
    milestones: [
      { id: "m2-1", title: "Figma Board Design System guidelines completed", description: "Colors, typography guidelines, utility component hierarchy set", amount: 800, status: "Escrowed" },
      { id: "m2-2", title: "Tailwind converted landing page layout with motion animations", description: "Fully adaptive responsive website built on React Vite platform", amount: 1000, status: "Pending" }
    ],
    createdAt: "2026-05-19T08:30:00Z"
  }
];

let proposals = [
  {
    id: "prop1",
    gigId: "gig2",
    gigTitle: "Revamp Brand Figma Design System & Landing Page",
    clientId: "u-bob",
    freelancerId: "u-sara",
    freelancerName: "Sara Chen",
    freelancerRating: 4.9,
    bidAmount: 1800,
    coverLetter: "Hi Bob! I would love to build this system for you. Given my Nielsen cert and rich dark theme designs, I'll deliver top results. I can start immediately and deliver the Figma boards in 4 days.",
    timelineDays: 12,
    status: "Accepted",
    createdAt: "2026-05-19T10:00:00Z",
    progressPercentage: 40,
    uploadedFiles: ["BrandGuide_v1_Draft.fig", "ComponentSpecs_Layout.pdf"],
    progressLogs: [
      { id: "l1", text: "Created the Figma playground workspace", timestamp: "2026-05-19T11:00:00Z" },
      { id: "l2", text: "Completed baseline wireframes and delivered to Bob", timestamp: "2026-05-20T09:00:00Z" }
    ]
  },
  {
    id: "prop2",
    gigId: "gig1",
    gigTitle: "Need React Native Mobile Developer (Hyperlocal Delivery Tracking App)",
    clientId: "u-jane",
    freelancerId: "u-alex",
    freelancerName: "Alex Rivera",
    freelancerRating: 4.8,
    bidAmount: 4800,
    coverLetter: "Hi Jane, I have strong experience plotting location telemetry on active screens. I've designed several mobile tracking wrappers and custom server feeds. This budget fits my timeline perfectly.",
    timelineDays: 15,
    status: "Pending",
    createdAt: "2026-05-20T10:15:00Z",
    progressPercentage: 0,
    uploadedFiles: [],
    progressLogs: []
  }
];

let reviews = [
  { id: "r1", gigId: "historic1", gigTitle: "Build Hyperlocal Courier Map Node", reviewerId: "u-jane", reviewerName: "Jane Miller", reviewerRole: "Client", targetId: "u-alex", rating: 5, text: "Alex delivered absolute top work on current coordinates caching! Very knowledgeable about leaflet and optimization. Will hire again.", weightedScoreImpact: 5, isVerifiedReview: true, isFlaggedAsFraud: false, createdAt: "2026-04-12T14:00:00Z" },
  { id: "r2", gigId: "historic2", gigTitle: "Luxurious Hotel App UX Board", reviewerId: "u-bob", reviewerName: "Bob Vance", reviewerRole: "Client", targetId: "u-sara", rating: 5, text: "Stunning aesthetic decisions. She matches color palettes beautifully. Excellent communicator.", weightedScoreImpact: 5, isVerifiedReview: true, isFlaggedAsFraud: false, createdAt: "2026-05-02T16:45:00Z" }
];

let transactions = [
  { id: "tx1", gigId: "gig2", gigTitle: "Revamp Brand Figma Design System & Landing Page", type: "Escrow Lock", amount: 800, status: "Success", senderName: "Bob Vance", receiverName: "SkillSphere Escrow", createdAt: "2026-05-19T10:05:00Z" }
];

let disputes = [];

let bookings = [
  { id: "b1", freelancerId: "u-alex", clientId: "u-bob", clientName: "Bob Vance", slot: "Tue 13:00 - 17:00", status: "Confirmed", title: "Project Onboarding Intake Session", price: 340, createdAt: "2026-05-19T09:30:00Z" }
];

let notifications = [
  { id: "n1", userId: "u-sara", title: "Milestone Paid", text: "Bob Vance has escrowed $800 lock for Figma Board Milestone.", type: "payment", read: false, createdAt: "2026-05-19T10:05:00Z" },
  { id: "n2", userId: "u-jane", title: "New Proposal Received", text: "Alex Rivera submitted a bid on your 'React Native' gig.", type: "success", read: false, createdAt: "2026-05-20T10:15:00Z" }
];

let chatChannels = [
  {
    id: "gig2",
    title: "Revamp Brand Figma Design System & Landing Page",
    participants: [
      { id: "u-bob", name: "Bob Vance", role: "Client" },
      { id: "u-sara", name: "Sara Chen", role: "Freelancer" }
    ],
    messages: [
      { id: "m1", senderId: "u-bob", senderName: "Bob Vance", text: "Hi Sara! Welcome to the gig. Excited to work together.", timestamp: "2026-05-19T10:06:00Z", read: true },
      { id: "m2", senderId: "u-sara", senderName: "Sara Chen", text: "Thrilled to work on this, Bob! I've started the wireframes drafting.", timestamp: "2026-05-19T10:10:00Z", read: true },
      { id: "m3", senderId: "u-sara", senderName: "Sara Chen", text: "Uploaded some file draftings. Let me know what you think.", fileAttachment: { name: "BrandGuide_v1_Draft.fig", url: "#", type: "Figma File" }, timestamp: "2026-05-20T09:05:00Z", read: false }
    ]
  }
];

// AUTH MIDDLEWARE / HELPER MOCK
const getSessionUser = (req: express.Request) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const userId = authHeader.substring(7);
    const matched = users.find(u => u.id === userId);
    return matched || users[1]; // default to Alex
  }
  return users[1]; // default Alex if no token
};

// API ENDPOINTS

// 1. Auth & Profiles
app.get("/api/users", (req, res) => {
  res.json(users);
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (user) {
    if (user.isSuspended) {
      return res.status(403).json({ error: "Your account is temporarily suspended by Admin." });
    }
    res.json({ user, token: user.id });
  } else {
    // create a new freelancer or client user dynamically for quick evaluation
    const isClient = email.toLowerCase().includes("client");
    const isAdmin = email.toLowerCase().includes("admin");
    const id = "u-" + Math.random().toString(36).substring(7);
    const newUser = {
      id,
      email,
      fullName: email.split("@")[0].replace(".", " ").toUpperCase(),
      role: (isAdmin ? "Admin" : isClient ? "Client" : "Freelancer") as any,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      isVerified: false,
      isSuspended: false,
      twoFactorEnabled: false
    };
    users.push(newUser);
    if (!isClient && !isAdmin) {
      freelancerProfiles.push({
        userId: id,
        title: "New Talent Profile",
        bio: "Bio description. Set up your profile.",
        skills: [{ name: "React", level: "Beginner" }],
        hourlyRate: 40,
        certifications: [],
        workExperience: [],
        portfolio: [],
        availability: { slots: ["Mon 09:00 - 12:00"], isBooked: {} },
        reputationScore: 50,
        profileViews: 1,
        earningsThisMonth: 0,
        completedJobsCount: 0
      });
    }
    res.json({ user: newUser, token: id });
  }
});

app.get("/api/auth/me", (req, res) => {
  const u = getSessionUser(req);
  res.json(u);
});

app.get("/api/freelancers", (req, res) => {
  // combine profile data with user core layout
  const detailed = freelancerProfiles.map(p => {
    const u = users.find(usr => usr.id === p.userId);
    return {
      ...p,
      email: u?.email || "",
      fullName: u?.fullName || "Legacy User",
      avatarUrl: u?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      isVerified: u?.isVerified || false,
      isSuspended: u?.isSuspended || false
    };
  });
  res.json(detailed);
});

app.post("/api/freelancers/profile", (req, res) => {
  const u = getSessionUser(req);
  let profile = freelancerProfiles.find(p => p.userId === u.id);
  const { title, bio, skills, hourlyRate } = req.body;
  if (!profile) {
    profile = {
      userId: u.id,
      title: title || "Talent Consultant",
      bio: bio || "",
      skills: skills || [],
      hourlyRate: Number(hourlyRate) || 50,
      certifications: [],
      workExperience: [],
      portfolio: [],
      availability: { slots: ["Mon 09:00 - 12:00"], isBooked: {} },
      reputationScore: 70,
      profileViews: 14,
      earningsThisMonth: 0,
      completedJobsCount: 0
    };
    freelancerProfiles.push(profile);
  } else {
    profile.title = title || profile.title;
    profile.bio = bio || profile.bio;
    profile.skills = skills || profile.skills;
    profile.hourlyRate = Number(hourlyRate) || profile.hourlyRate;
  }
  res.json(profile);
});

// 2. Marketplace & Gigs
app.get("/api/gigs", (req, res) => {
  res.json(gigs);
});

app.post("/api/gigs", (req, res) => {
  const u = getSessionUser(req);
  const { title, description, category, budgetMin, budgetMax, location, skillsRequired, milestones } = req.body;
  const newGig = {
    id: "gig" + Math.random().toString(36).substring(7),
    clientId: u.id,
    clientName: u.fullName,
    title,
    description,
    category,
    budgetMin: Number(budgetMin) || 500,
    budgetMax: Number(budgetMax) || 1200,
    location: location || "Remote",
    skillsRequired: skillsRequired || [],
    status: "Open" as const,
    milestones: (milestones || []).map((m: any, idx: number) => ({
      id: `milestone-${idx}-${Math.random().toString(36).substring(5)}`,
      title: m.title || `Phase ${idx + 1}`,
      description: m.description || "",
      amount: Number(m.amount) || Math.round((budgetMax || 1000) / (milestones.length || 1)),
      status: "Pending" as const
    })),
    createdAt: new Date().toISOString()
  };
  gigs.push(newGig);

  // Notify of new gig
  users.forEach(userItem => {
    if (userItem.role === "Freelancer") {
      notifications.push({
        id: "noti-" + Math.random().toString(36).substring(7),
        userId: userItem.id,
        title: "New Matching Gig Posted!",
        text: `New job matching: "${title}" by ${u.fullName} is open for proposals.`,
        type: "success",
        read: false,
        createdAt: new Date().toISOString()
      });
    }
  });

  res.json(newGig);
});

// 3. Proposals
app.get("/api/proposals", (req, res) => {
  res.json(proposals);
});

app.post("/api/proposals", (req, res) => {
  const u = getSessionUser(req);
  const { gigId, bidAmount, coverLetter, timelineDays } = req.body;
  const associatedGig = gigs.find(g => g.id === gigId);
  const newProposal = {
    id: "prop" + Math.random().toString(36).substring(7),
    gigId,
    gigTitle: associatedGig?.title || "Project Freelance Gig",
    clientId: associatedGig?.clientId || "u-jane",
    freelancerId: u.id,
    freelancerName: u.fullName,
    freelancerRating: 4.8,
    bidAmount: Number(bidAmount),
    coverLetter,
    timelineDays: Number(timelineDays),
    status: "Pending" as const,
    createdAt: new Date().toISOString(),
    progressPercentage: 0,
    uploadedFiles: [],
    progressLogs: []
  };
  proposals.push(newProposal);

  // Notify Client
  if (associatedGig) {
    notifications.push({
      id: "noti-" + Math.random().toString(36).substring(7),
      userId: associatedGig.clientId,
      title: "New Bid Received",
      text: `${u.fullName} placed a proposal bid of $${bidAmount} for "${associatedGig.title}"`,
      type: "info",
      read: false,
      createdAt: new Date().toISOString()
    });
  }

  res.json(newProposal);
});

app.post("/api/proposals/:id/status", (req, res) => {
  const { status } = req.body;
  const prop = proposals.find(p => p.id === req.params.id);
  if (!prop) return res.status(404).json({ error: "Proposal not found" });

  prop.status = status;
  if (status === "Accepted") {
    // change gig state
    const gig = gigs.find(g => g.id === prop.gigId);
    if (gig) {
      gig.status = "In Progress";
      // lock first milestone to escrow status
      if (gig.milestones.length > 0) {
        gig.milestones[0].status = "Escrowed";
        transactions.push({
          id: "tx-" + Math.random().toString(36).substring(7),
          gigId: gig.id,
          gigTitle: gig.title,
          type: "Escrow Lock",
          amount: gig.milestones[0].amount,
          status: "Success",
          senderName: gig.clientName,
          receiverName: "SkillSphere Escrow",
          createdAt: new Date().toISOString()
        });
      }
    }
    // notify freelancer
    notifications.push({
      id: "noti-" + Math.random().toString(36).substring(7),
      userId: prop.freelancerId,
      title: "Proposal Accepted!",
      text: `Your proposal for "${prop.gigTitle}" was accepted. Initial milestone budget locked in Escrow. Track progress now.`,
      type: "payment",
      read: false,
      createdAt: new Date().toISOString()
    });
    // Create chat channel
    const channelExists = chatChannels.some(ch => ch.id === prop.gigId);
    if (!channelExists) {
      const gigDetails = gigs.find(g => g.id === prop.gigId);
      chatChannels.push({
        id: prop.gigId,
        title: prop.gigTitle,
        participants: [
          { id: prop.clientId, name: gigDetails?.clientName || "Client", role: "Client" },
          { id: prop.freelancerId, name: prop.freelancerName, role: "Freelancer" }
        ],
        messages: [
          {
            id: "msg-auth-" + Math.random().toString(36).substring(5),
            senderId: "system",
            senderName: "SkillSphere Agent",
            text: "Welcome to your real-time collaborative milestone channel! Feel free to negotiate details, chat, or share deliverables.",
            timestamp: new Date().toISOString(),
            read: true
          }
        ]
      });
    }
  }
  res.json(prop);
});

// Submit file deliverables / progress
app.post("/api/proposals/:id/progress", (req, res) => {
  const { percentage, logText, uploadedFile } = req.body;
  const prop = proposals.find(p => p.id === req.params.id);
  if (!prop) return res.status(404).json({ error: "Proposal not found" });

  if (percentage !== undefined) prop.progressPercentage = Number(percentage);
  if (logText) {
    prop.progressLogs.push({
      id: "log-" + Math.random().toString(36).substring(7),
      text: logText,
      timestamp: new Date().toISOString()
    });
  }
  if (uploadedFile) {
    prop.uploadedFiles.push(uploadedFile);
  }

  // Auto trigger notify to Client
  notifications.push({
    id: "noti-" + Math.random().toString(36).substring(7),
    userId: prop.clientId,
    title: "Progress Track Updated",
    text: `${prop.freelancerName} updated progress to ${prop.progressPercentage}%: "${logText || 'Uploaded deliverable'}"`,
    type: "info",
    read: false,
    createdAt: new Date().toISOString()
  });

  res.json(prop);
});

// Escrow settlement (Release milestone payouts orRefunds)
app.post("/api/gigs/:id/milestones/:milestoneId/release", (req, res) => {
  const { id, milestoneId } = req.params;
  const gig = gigs.find(g => g.id === id);
  if (!gig) return res.status(404).json({ error: "Gig not found" });

  const ms = gig.milestones.find(m => m.id === milestoneId);
  if (!ms) return res.status(404).json({ error: "Milestone not found" });

  ms.status = "Released";

  // Find corresponding proposal and freelancer
  const prop = proposals.find(p => p.gigId === id && p.status === "Accepted");
  if (prop) {
    // Add transaction audit trail
    transactions.push({
      id: "tx-" + Math.random().toString(36).substring(7),
      gigId: gig.id,
      gigTitle: gig.title,
      type: "Milestone Outflow",
      amount: ms.amount,
      status: "Success",
      senderName: "SkillSphere Escrow",
      receiverName: prop.freelancerName,
      createdAt: new Date().toISOString()
    });

    // Award earnings to freelancer
    const free = freelancerProfiles.find(f => f.userId === prop.freelancerId);
    if (free) {
      free.earningsThisMonth += ms.amount;
    }

    // Notify Freelancer
    notifications.push({
      id: "noti-" + Math.random().toString(36).substring(7),
      userId: prop.freelancerId,
      title: "Escrow Released! +$" + ms.amount,
      text: `Client released payout for milestone "${ms.title}". Funds have been deposited.`,
      type: "payment",
      read: false,
      createdAt: new Date().toISOString()
    });

    // Check if all milestones completed
    const allCompleted = gig.milestones.every(m => m.status === "Released");
    if (allCompleted) {
      gig.status = "Completed";
      prop.status = "Completed";
      if (free) {
        free.completedJobsCount += 1;
      }
    } else {
      // automatically escrow the NEXT milestone
      const nextPendingIdx = gig.milestones.findIndex(m => m.status === "Pending");
      if (nextPendingIdx !== -1) {
        gig.milestones[nextPendingIdx].status = "Escrowed";
        transactions.push({
          id: "tx-" + Math.random().toString(36).substring(7),
          gigId: gig.id,
          gigTitle: gig.title,
          type: "Escrow Lock",
          amount: gig.milestones[nextPendingIdx].amount,
          status: "Success",
          senderName: gig.clientName,
          receiverName: "SkillSphere Escrow",
          createdAt: new Date().toISOString()
        });
      }
    }
  }

  res.json(gig);
});

// Dispute filing
app.post("/api/disputes", (req, res) => {
  const { gigId, proposalId, reason, amount, evidenceText } = req.body;
  const gigInfo = gigs.find(g => g.id === gigId);
  const pInfo = proposals.find(p => p.id === proposalId);

  const disputeItem = {
    id: "disp-" + Math.random().toString(36).substring(7),
    gigId,
    gigTitle: gigInfo?.title || "Project Freelance Gig",
    clientId: gigInfo?.clientId || "u-jane",
    clientName: gigInfo?.clientName || "Client",
    freelancerId: pInfo?.freelancerId || "u-sara",
    freelancerName: pInfo?.freelancerName || "Sara Chen",
    reason,
    amount: Number(amount),
    evidenceUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400",
    evidenceText,
    status: "Open" as const,
    createdAt: new Date().toISOString()
  };

  disputes.push(disputeItem);

  // Notify Admin
  notifications.push({
    id: "noti-" + Math.random().toString(36).substring(7),
    userId: "u-admin",
    title: "New Dispute Filed",
    text: `Dispute requested by client on "${disputeItem.gigTitle}" for amount $${amount}`,
    type: "warning",
    read: false,
    createdAt: new Date().toISOString()
  });

  res.json(disputeItem);
});

// Admin actions
app.get("/api/admin/disputes", (req, res) => {
  res.json(disputes);
});

app.post("/api/admin/disputes/:id/resolve", (req, res) => {
  const { decision, auditComments } = req.body; // e.g. "Release to Freelancer" or "Refund Client"
  const disp = disputes.find(d => d.id === req.params.id);
  if (!disp) return res.status(404).json({ error: "Dispute not found" });

  disp.status = decision === "Release to Freelancer" ? "Resolved (Paid Freelancer)" : "Resolved (Refunded Client)";
  disp.adminDecision = auditComments || "Resolved based on contract code review.";

  // perform payouts/refunds automatically
  const gigObj = gigs.find(g => g.id === disp.gigId);
  if (gigObj) {
    gigObj.status = "Completed";
    gigObj.milestones.forEach(m => {
      if (m.status === "Escrowed") {
        m.status = decision === "Release to Freelancer" ? "Released" : "Refunded";
      }
    });

    transactions.push({
      id: "tx-" + Math.random().toString(36).substring(7),
      gigId: gigObj.id,
      gigTitle: gigObj.title,
      type: decision === "Release to Freelancer" ? "Milestone Outflow" : "Refund",
      amount: disp.amount,
      status: "Success",
      senderName: "SkillSphere Escrow",
      receiverName: decision === "Release to Freelancer" ? disp.freelancerName : disp.clientName,
      createdAt: new Date().toISOString()
    });

    // Notify parties
    notifications.push({
      id: "noti-" + Math.random().toString(36).substring(7),
      userId: disp.clientId,
      title: "Dispute Settled By Admin",
      text: `Admin arbitration finished: "${disp.adminDecision}". Dispute status closed.`,
      type: "info",
      read: false,
      createdAt: new Date().toISOString()
    });

    notifications.push({
      id: "noti-" + Math.random().toString(36).substring(7),
      userId: disp.freelancerId,
      title: "Dispute Settled By Admin",
      text: `Admin arbitration finished: "${disp.adminDecision}". Dispute status closed.`,
      type: "info",
      read: false,
      createdAt: new Date().toISOString()
    });
  }

  res.json(disp);
});

// Admin review / fraud checking / verify user
app.post("/api/admin/users/:id/suspend", (req, res) => {
  const targetUser = users.find(u => u.id === req.params.id);
  if (!targetUser) return res.status(404).json({ error: "User not found" });
  targetUser.isSuspended = !targetUser.isSuspended;
  res.json(targetUser);
});

app.post("/api/admin/users/:id/verify", (req, res) => {
  const targetUser = users.find(u => u.id === req.params.id);
  if (!targetUser) return res.status(404).json({ error: "User not found" });
  targetUser.isVerified = true;
  res.json(targetUser);
});

// Booking slots
app.get("/api/bookings", (req, res) => {
  res.json(bookings);
});

app.post("/api/bookings", (req, res) => {
  const u = getSessionUser(req);
  const { freelancerId, slot, title, price } = req.body;
  const fProfile = freelancerProfiles.find(f => f.userId === freelancerId);
  const newBooking = {
    id: "bk-" + Math.random().toString(36).substring(7),
    freelancerId,
    clientId: u.id,
    clientName: u.fullName,
    slot,
    status: "Pending" as const,
    title,
    price: Number(price) || 120,
    createdAt: new Date().toISOString()
  };
  bookings.push(newBooking);

  if (fProfile) {
    fProfile.availability.isBooked[slot] = true;
  }

  // notify freelancer
  notifications.push({
    id: "noti-" + Math.random().toString(36).substring(7),
    userId: freelancerId,
    title: "New Booking Request",
    text: `${u.fullName} booked you for "${title}" on ${slot}`,
    type: "info",
    read: false,
    createdAt: new Date().toISOString()
  });

  res.json(newBooking);
});

app.post("/api/bookings/:id/status", (req, res) => {
  const { status } = req.body;
  const bk = bookings.find(b => b.id === req.params.id);
  if (!bk) return res.status(404).json({ error: "Booking not found" });
  bk.status = status;

  if (status === "Declined") {
    const fProfile = freelancerProfiles.find(f => f.userId === bk.freelancerId);
    if (fProfile) {
      delete fProfile.availability.isBooked[bk.slot];
    }
  }

  notifications.push({
    id: "noti-" + Math.random().toString(36).substring(7),
    userId: bk.clientId,
    title: "Booking Request Update",
    text: `Your slot booking request has been ${status.toLowerCase()}`,
    type: status === "Confirmed" ? "success" : "warning",
    read: false,
    createdAt: new Date().toISOString()
  });

  res.json(bk);
});

// 4. Chat Collaboration
app.get("/api/chat/:channelId", (req, res) => {
  const chan = chatChannels.find(c => c.id === req.params.channelId);
  if (!chan) {
    // dynamically create if needed for the gig
    const gigObj = gigs.find(g => g.id === req.params.channelId);
    if (gigObj) {
      const activeProp = proposals.find(p => p.gigId === gigObj.id && p.status === "Accepted");
      const newChan = {
        id: gigObj.id,
        title: gigObj.title,
        participants: [
          { id: gigObj.clientId, name: gigObj.clientName, role: "Client" as const },
          { id: activeProp?.freelancerId || "u-alex", name: activeProp?.freelancerName || "Alex Rivera", role: "Freelancer" as const }
        ],
        messages: []
      };
      chatChannels.push(newChan);
      return res.json(newChan);
    }
    return res.status(404).json({ error: "Channel not found" });
  }
  res.json(chan);
});

app.post("/api/chat/:channelId", (req, res) => {
  const { text, fileAttachment } = req.body;
  const u = getSessionUser(req);
  const chan = chatChannels.find(c => c.id === req.params.channelId);
  if (!chan) return res.status(404).json({ error: "Channel not found" });

  const newMsg = {
    id: "msg-" + Math.random().toString(36).substring(7),
    senderId: u.id,
    senderName: u.fullName,
    text,
    fileAttachment,
    timestamp: new Date().toISOString(),
    read: false
  };

  chan.messages.push(newMsg);

  // Send a notify to the OTHER participant
  const otherUser = chan.participants.find(p => p.id !== u.id);
  if (otherUser) {
    notifications.push({
      id: "noti-" + Math.random().toString(36).substring(7),
      userId: otherUser.id,
      title: `Message from ${u.fullName}`,
      text: text.substring(0, 50) + (text.length > 50 ? "..." : ""),
      type: "info",
      read: false,
      createdAt: new Date().toISOString()
    });
  }

  res.json(newMsg);
});

// Notifications
app.get("/api/notifications", (req, res) => {
  const u = getSessionUser(req);
  const userNotis = notifications.filter(n => n.userId === u.id);
  res.json(userNotis);
});

app.post("/api/notifications/read", (req, res) => {
  const u = getSessionUser(req);
  notifications.forEach(n => {
    if (n.userId === u.id) n.read = true;
  });
  res.json({ success: true });
});

// Reviews
app.get("/api/reviews", (req, res) => {
  res.json(reviews);
});

app.post("/api/reviews", (req, res) => {
  const u = getSessionUser(req);
  const { gigId, gigTitle, targetId, rating, text } = req.body;

  const scoreImpact = u.isVerified ? 12 : 5; // verified users improve ratings faster

  const newReview = {
    id: "rev-" + Math.random().toString(36).substring(7),
    gigId,
    gigTitle: gigTitle || "Freelance Consultation",
    reviewerId: u.id,
    reviewerName: u.fullName,
    reviewerRole: u.role,
    targetId,
    rating: Number(rating) || 5,
    text,
    weightedScoreImpact: scoreImpact,
    isVerifiedReview: u.isVerified,
    isFlaggedAsFraud: false,
    createdAt: new Date().toISOString()
  };

  reviews.push(newReview);

  // Dynamically update corresponding freelancer reputation
  const targetProfile = freelancerProfiles.find(f => f.userId === targetId);
  if (targetProfile) {
    const totalImpact = targetProfile.reputationScore * 0.9 + rating * 2;
    targetProfile.reputationScore = Math.min(100, Math.round(totalImpact));
  }

  res.json(newReview);
});


// 5. SERVER-SIDE GEMINI AI CORES (Integrating @google/genai module)

// AI Core 1: Intelligent Gig-to-Freelancer Matching
app.post("/api/ai/match", async (req, res) => {
  const { gigId } = req.body;
  const gigInfo = gigs.find(g => g.id === gigId);
  if (!gigInfo) {
    return res.status(404).json({ error: "Gig not found for matching" });
  }

  const matchesOfFreelancers = freelancerProfiles.map(p => {
    const u = users.find(usr => usr.id === p.userId);
    return {
      userId: p.userId,
      fullName: u?.fullName || "Talent",
      title: p.title,
      skills: p.skills.map(s => `${s.name} (${s.level})`),
      hourlyRate: p.hourlyRate,
      reputationScore: p.reputationScore,
      bio: p.bio
    };
  });

  if (!ai) {
    // FALLBACK Mock Logic if API Key is not supplied or active
    // Simple similarity calculation
    const matchedTalents = matchesOfFreelancers.map(t => {
      let matchingSkillsCount = 0;
      gigInfo.skillsRequired.forEach(sk => {
        if (t.skills.some(skillStr => skillStr.toLowerCase().includes(sk.toLowerCase()))) {
          matchingSkillsCount += 1;
        }
      });
      const skillScore = gigInfo.skillsRequired.length > 0 
        ? Math.round((matchingSkillsCount / gigInfo.skillsRequired.length) * 100)
        : 70;
      
      const similarityScore = Math.round(skillScore * 0.6 + t.reputationScore * 0.4);

      return {
        userId: t.userId,
        fullName: t.fullName,
        title: t.title,
        hourlyRate: t.hourlyRate,
        reputationScore: t.reputationScore,
        similarityScore: Math.max(55, similarityScore),
        recommendationBio: `Alex has expert skill set matching your location targets. We highly recommend Sara if typography design visual metrics form the absolute critical benchmark.`,
        suggestedSkillsForGig: ["Interactive Map Plotting", "Mobile UI Layout Architecture"]
      };
    }).sort((a,b) => b.similarityScore - a.similarityScore);

    return res.json({
      matches: matchedTalents.slice(0, 3),
      trendingSkills: ["Leaflet Maps", "Bento Grid UX Design", "Vite HMR Optimization"],
      matchingSummary: "Simulated offline similarity calculations checked against candidate portfolios."
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are an intelligent freelance staffing algorithm AI. Your goal is to match a posted gig with our pool of top freelancers.
      
      GIG DETAILS:
      Title: ${gigInfo.title}
      Description: ${gigInfo.description}
      Required Skills: ${gigInfo.skillsRequired.join(", ")}
      Location: ${gigInfo.location}
      Budget Range: $${gigInfo.budgetMin} - $${gigInfo.budgetMax}

      CANDIDATES AVAILABLE:
      ${JSON.stringify(matchesOfFreelancers, null, 2)}

      Analyze the job requirements against each candidate’s expertise. Create customized similarity scores, specific actionable reasoning for each talent recommendation (maximum 2 elegant sentences each), and output a list of trending skill technologies in this niche.

      Return the result ONLY as a strict JSON object with this shape. Do not output any markup other than clean JSON.
      {
        "matches": [
          {
            "userId": "string id of candidate",
            "fullName": "name",
            "title": "candidate title",
            "hourlyRate": 85,
            "reputationScore": 95,
            "similarityScore": 95, // 0 to 100 integer
            "recommendationBio": "Custom recommendation explaining exactly why they suit this gig."
          }
        ],
        "trendingSkills": ["Array of 3 skill strings needed in today's freelance market"],
        "matchingSummary": "Overall conversational staff matching summary from AI"
      }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["matches", "trendingSkills", "matchingSummary"],
          properties: {
            matches: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["userId", "fullName", "title", "hourlyRate", "reputationScore", "similarityScore", "recommendationBio"],
                properties: {
                  userId: { type: Type.STRING },
                  fullName: { type: Type.STRING },
                  title: { type: Type.STRING },
                  hourlyRate: { type: Type.NUMBER },
                  reputationScore: { type: Type.NUMBER },
                  similarityScore: { type: Type.NUMBER },
                  recommendationBio: { type: Type.STRING }
                }
              }
            },
            trendingSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            matchingSummary: { type: Type.STRING }
          }
        }
      }
    });

    const bodyText = response.text || "{}";
    const data = JSON.parse(bodyText.trim());
    res.json(data);
  } catch (err: any) {
    console.error("Gemini math execution failed:", err);
    res.status(500).json({ error: "AI Matching failed", details: err.message });
  }
});

// AI Core 2: Actionable Profile Optimize Advice
app.post("/api/ai/suggest", async (req, res) => {
  const { freelancerId } = req.body;
  const profile = freelancerProfiles.find(f => f.userId === freelancerId);
  const uNode = users.find(u => u.id === freelancerId);

  if (!profile || !uNode) {
    return res.status(404).json({ error: "Freelancer Profile not found" });
  }

  const currentActiveGigs = gigs.map(g => ({ title: g.title, desc: g.description, skills: g.skillsRequired }));

  if (!ai) {
    // Offline suggestions fallback
    return res.json({
      tips: [
        "Include links to high-contrast mobile layout prototypes directly in your portfolio cards to show spatial spacing awareness.",
        "Add certified cloud deployment validations to stand out for high-budget projects.",
        "Highlight localized delivery coordinate expertise to capture local transportation tracking gigs."
      ],
      suggestedAdditions: ["Interactive Routing SDKs", "Advanced Tailwind Motion Animations"],
      roleGrade: "A-"
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are a high-level creative coach. Review this freelancer's profile and compare them to the current job board postings. Recommend 3 highly actionable, specific edits they can make to win higher budget rates.
      
      FREELANCER PROFILE:
      Name: ${uNode.fullName}
      Title: ${profile.title}
      Bio: ${profile.bio}
      Skills: ${JSON.stringify(profile.skills)}
      Hourly Rate: $${profile.hourlyRate}

      CURRENT ACTIVE GIGS:
      ${JSON.stringify(currentActiveGigs, null, 2)}

      Provide extreme precision recommendations. Return ONLY a JSON object in this format:
      {
        "tips": ["Tip 1", "Tip 2", "Tip 3"],
        "suggestedAdditions": ["Skill Addition 1", "Skill Addition 2"],
        "roleGrade": "A"
      }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["tips", "suggestedAdditions", "roleGrade"],
          properties: {
            tips: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedAdditions: { type: Type.ARRAY, items: { type: Type.STRING } },
            roleGrade: { type: Type.STRING }
          }
        }
      }
    });

    const parsed = JSON.parse((response.text || "").trim());
    res.json(parsed);
  } catch (e: any) {
    res.status(500).json({ error: "AI Advice service error", details: e.message });
  }
});

// AI Core 3: Fraud detection for Reviews (smart review analytics)
app.post("/api/ai/analyze-review", async (req, res) => {
  const { reviewText, rating } = req.body;

  if (!ai) {
    // offline fraud analyst
    let isFraud = false;
    let confidence = 10;
    if (reviewText.toLowerCase().includes("amazing spectacular perfect rich quick buy")) {
      isFraud = true;
      confidence = 85;
    }
    return res.json({
      isFlaggedAsFraud: isFraud,
      confidenceScore: confidence,
      linguisticIndicators: ["Excessive positive hype without listing descriptive details."],
      analystAdvice: "Verified standard reviewer signature. Safe to publish on user timeline."
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are an Admin Fraud Auditor. Review the following gig client feedback and analyze for potential manipulative fake reviews, spam patterns, or unnatural hyper-praise signals.
      
      REVIEW TEXT: "${reviewText}"
      RATING: ${rating}/5

      Output a JSON evaluation outlining:
      - isFlaggedAsFraud (boolean)
      - confidenceScore (0 to 100 percentage)
      - linguisticIndicators (reasons or patterns found in the text)
      - analystAdvice (actionable admin system log file recommendation)

      Strictly JSON output only:
      {
        "isFlaggedAsFraud": false,
        "confidenceScore": 15,
        "linguisticIndicators": ["Realistic descriptive constraints mentioned", "Normal review pattern"],
        "analystAdvice": "Accept as natural feedback"
      }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["isFlaggedAsFraud", "confidenceScore", "linguisticIndicators", "analystAdvice"],
          properties: {
            isFlaggedAsFraud: { type: Type.BOOLEAN },
            confidenceScore: { type: Type.NUMBER },
            linguisticIndicators: { type: Type.ARRAY, items: { type: Type.STRING } },
            analystAdvice: { type: Type.STRING }
          }
        }
      }
    });

    res.json(JSON.parse((response.text || "").trim()));
  } catch (err: any) {
    res.status(500).json({ error: "Fraud analytics failed", details: err.message });
  }
});

// INTEGRATE VITE IN DEV VS SERVE DIST IN PROD
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted successfully.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving compiled static production files from dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
