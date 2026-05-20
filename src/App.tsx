/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  User, 
  UserRole, 
  FreelancerProfile, 
  Gig, 
  Proposal, 
  ChatMessage, 
  ChatChannel, 
  Review, 
  Transaction, 
  Dispute, 
  Notification, 
  Booking, 
  SearchFilters 
} from './types';
import SimulationHeader from './components/SimulationHeader';
import { 
  Search, 
  Sparkles, 
  Briefcase, 
  User as UserIcon, 
  Calendar, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  Plus, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp, 
  SlidersHorizontal, 
  MapPin, 
  ShieldAlert, 
  Send, 
  Paperclip, 
  ChevronRight, 
  Star, 
  Award, 
  History, 
  Settings, 
  Lock, 
  TrendingDown, 
  Users, 
  LineChart, 
  Eye, 
  LogOut,
  Info
} from 'lucide-react';

export default function App() {
  // Authentication & Global Swapping state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [authToken, setAuthToken] = useState<string>('');

  // Domain states
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [freelancers, setFreelancers] = useState<(FreelancerProfile & { fullName: string; avatarUrl: string; email: string; isVerified: boolean })[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // UX Navigation & Filters
  const [activeTab, setActiveTab] = useState<'marketplace' | 'talents' | 'my-contracts' | 'my-schedule' | 'freelancer-insights'>('marketplace');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [minBudget, setMinBudget] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);

  // Active Chats panel
  const [activeChatChannelId, setActiveChatChannelId] = useState<string | null>(null);
  const [chatChannel, setChatChannel] = useState<ChatChannel | null>(null);
  const [chatInputMessage, setChatInputMessage] = useState('');
  const [uploadedChatFile, setUploadedChatFile] = useState<{ name: string; type: string } | null>(null);

  // AI Dialogs & Modals
  const [showPostGigModal, setShowPostGigModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState<Gig | null>(null);
  const [showBookingModal, setShowBookingModal] = useState<(FreelancerProfile & { fullName: string }) | null>(null);
  const [showDisputeModal, setShowDisputeModal] = useState<Proposal | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<Proposal | null>(null);
  const [aiMatchLoading, setAiMatchLoading] = useState(false);
  const [aiMatchResult, setAiMatchResult] = useState<{ matches: any[]; trendingSkills: string[]; matchingSummary: string } | null>(null);
  const [activeAnalysisGigId, setActiveAnalysisGigId] = useState<string | null>(null);
  
  const [aiAdviceLoading, setAiAdviceLoading] = useState(false);
  const [aiAdviceResult, setAiAdviceResult] = useState<{ tips: string[]; suggestedAdditions: string[]; roleGrade: string } | null>(null);
  
  const [reviewFraudCheckLoading, setReviewFraudCheckLoading] = useState(false);
  const [reviewFraudResult, setReviewFraudResult] = useState<{ isFlaggedAsFraud: boolean; confidenceScore: number; linguisticIndicators: string[]; analystAdvice: string } | null>(null);

  // Form states
  const [newGigTitle, setNewGigTitle] = useState('');
  const [newGigDesc, setNewGigDesc] = useState('');
  const [newGigCategory, setNewGigCategory] = useState('Development');
  const [newGigLocation, setNewGigLocation] = useState('');
  const [newGigBudgetMin, setNewGigBudgetMin] = useState(500);
  const [newGigBudgetMax, setNewGigBudgetMax] = useState(3000);
  const [newGigSkills, setNewGigSkills] = useState('');
  const [newGigMilestones, setNewGigMilestones] = useState<{ title: string; amount: number; description: string }[]>([
    { title: 'Milestone 1: Kickoff & Layout design', amount: 1000, description: 'High fidelity UI template approval' },
    { title: 'Milestone 2: Final integrated deployment', amount: 2000, description: 'Vite package build with responsive styling complete' }
  ]);

  // Bid forms
  const [bidAmount, setBidAmount] = useState<number>(1000);
  const [bidCoverLetter, setBidCoverLetter] = useState('');
  const [bidTimeline, setBidTimeline] = useState<number>(7);

  // Milestone Progress forms
  const [updateProgressProposalId, setUpdateProgressProposalId] = useState<string | null>(null);
  const [progressLogText, setProgressLogText] = useState('');
  const [progressPercentageValue, setProgressPercentageValue] = useState<number>(30);
  const [progressFileMock, setProgressFileMock] = useState('');

  // Booking details form
  const [bookingSlot, setBookingSlot] = useState('');
  const [bookingTitle, setBookingTitle] = useState('');
  const [bookingPrice, setBookingPrice] = useState(100);

  // Dispute form
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeEvidence, setDisputeEvidence] = useState('');

  // Review form
  const [reviewRatingValue, setReviewRatingValue] = useState<number>(5);
  const [reviewTextValue, setReviewTextValue] = useState('');

  // System notifications
  const [feedbackToast, setFeedbackToast] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // 1. Initial Data Load & Sync
  useEffect(() => {
    fetchUsers();
    fetchMarketplaceGigs();
    fetchTalentsList();
    fetchActiveProposals();
    fetchNotifications();
    fetchBookings();
    fetchReviews();
    fetchAdminDisputes();
  }, []);

  // Fetch Core Users
  const fetchUsers = async () => {
    try {
      const r = await fetch('/api/users');
      if (r.ok) {
        const data = await r.json();
        setAllUsers(data);
        // By default logs into Alex Rivera (Freelancer)
        const alex = data.find((u: User) => u.id === 'u-alex') || data[1] || data[0];
        if (alex) {
          setCurrentUser(alex);
          setAuthToken(alex.id);
        }
      }
    } catch (err) {
      showToast('Connection to backend failed. Operating on visual client mock data.', 'error');
    }
  };

  const fetchMarketplaceGigs = async () => {
    try {
      const r = await fetch('/api/gigs');
      if (r.ok) setGigs(await r.json());
    } catch (_) {}
  };

  const fetchTalentsList = async () => {
    try {
      const r = await fetch('/api/freelancers');
      if (r.ok) setFreelancers(await r.json());
    } catch (_) {}
  };

  const fetchActiveProposals = async () => {
    try {
      const r = await fetch('/api/proposals');
      if (r.ok) setProposals(await r.json());
    } catch (_) {}
  };

  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      const r = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${currentUser.id}` }
      });
      if (r.ok) setNotifications(await r.json());
    } catch (_) {}
  };

  const fetchBookings = async () => {
    try {
      const r = await fetch('/api/bookings');
      if (r.ok) setBookings(await r.json());
    } catch (_) {}
  };

  const fetchReviews = async () => {
    try {
      const r = await fetch('/api/reviews');
      if (r.ok) setReviews(await r.json());
    } catch (_) {}
  };

  const fetchAdminDisputes = async () => {
    try {
      const r = await fetch('/api/admin/disputes');
      if (r.ok) setDisputes(await r.json());
    } catch (_) {}
  };

  // Switch role dynamically
  const handleUserSwitch = (userId: string) => {
    const found = allUsers.find(u => u.id === userId);
    if (found) {
      if (found.isSuspended) {
        showToast(`Cannot switch. ${found.fullName} account is suspended.`, 'error');
        return;
      }
      setCurrentUser(found);
      setAuthToken(found.id);
      setActiveTab(found.role === 'Admin' ? 'marketplace' : found.role === 'Client' ? 'marketplace' : 'my-contracts');
      showToast(`Switched active profile context to ${found.fullName} (${found.role})`, 'success');
      // refresh notifications & details
      setTimeout(() => {
        fetchNotifications();
      }, 50);
    }
  };

  // Helper toaster triggers
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setFeedbackToast({ text, type });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 4500);
  };

  // Notifications update
  const handleMarkNotificationsRead = async () => {
    if (!currentUser) return;
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${currentUser.id}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (_) {}
  };

  // Post a gig endpoint orchestration
  const handlePostGigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGigTitle || !newGigDesc) {
      showToast('Please fill out the Gig Title and Description.', 'error');
      return;
    }
    if (!currentUser) return;

    const bodyData = {
      title: newGigTitle,
      description: newGigDesc,
      category: newGigCategory,
      budgetMin: newGigBudgetMin,
      budgetMax: newGigBudgetMax,
      location: newGigLocation || 'Remote, Global',
      skillsRequired: newGigSkills.split(',').map(s => s.trim()).filter(Boolean),
      milestones: newGigMilestones
    };

    try {
      const r = await fetch('/api/gigs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.id}`
        },
        body: JSON.stringify(bodyData)
      });
      if (r.ok) {
        const newlyCreated = await r.json();
        setGigs(prev => [newlyCreated, ...prev]);
        showToast('Successfully published hyperlocal gig! Live matching emails sent.', 'success');
        setShowPostGigModal(false);
        // Reset form
        setNewGigTitle('');
        setNewGigDesc('');
        setNewGigLocation('');
        setNewGigSkills('');
        fetchMarketplaceGigs();
      }
    } catch (_) {
      showToast('Offline fallback: Simulating gig listing locally.', 'info');
    }
  };

  // Submit Bid proposal on active gig
  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showApplyModal || !currentUser) return;

    try {
      const r = await fetch('/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.id}`
        },
        body: JSON.stringify({
          gigId: showApplyModal.id,
          bidAmount,
          coverLetter: bidCoverLetter,
          timelineDays: bidTimeline
        })
      });
      if (r.ok) {
        showToast(`Proposal bid of $${bidAmount} successfully registered!`, 'success');
        setShowApplyModal(null);
        setBidCoverLetter('');
        fetchActiveProposals();
      }
    } catch (_) {}
  };

  // Accept or decline proposal (Client chooses Freelancer)
  const handleProposalStatusUpdate = async (proposalId: string, targetStatus: 'Accepted' | 'Rejected') => {
    if (!currentUser) return;
    try {
      const r = await fetch(`/api/proposals/${proposalId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.id}`
        },
        body: JSON.stringify({ status: targetStatus })
      });
      if (r.ok) {
        showToast(`Proposal has been ${targetStatus.toLowerCase()} successfully. Escrow registered!`, 'success');
        fetchActiveProposals();
        fetchMarketplaceGigs();
        fetchNotifications();
      }
    } catch (_) {}
  };

  // Real-Time Chat System implementation
  const fetchChatMessages = async (channelId: string) => {
    if (!currentUser) return;
    try {
      const r = await fetch(`/api/chat/${channelId}`, {
        headers: { 'Authorization': `Bearer ${currentUser.id}` }
      });
      if (r.ok) {
        setChatChannel(await r.json());
      }
    } catch (_) {}
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatChannelId || !chatInputMessage.trim() && !uploadedChatFile || !currentUser) return;

    const attachmentObj = uploadedChatFile ? {
      name: uploadedChatFile.name,
      url: '#',
      type: uploadedChatFile.type
    } : undefined;

    try {
      const r = await fetch(`/api/chat/${activeChatChannelId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.id}`
        },
        body: JSON.stringify({
          text: chatInputMessage,
          fileAttachment: attachmentObj
        })
      });
      if (r.ok) {
        setChatInputMessage('');
        setUploadedChatFile(null);
        fetchChatMessages(activeChatChannelId);
      }
    } catch (_) {}
  };

  // Milestone Escrow Release System
  const handleMilestoneRelease = async (gigId: string, milestoneId: string, amount: number) => {
    if (!currentUser) return;
    try {
      const r = await fetch(`/api/gigs/${gigId}/milestones/${milestoneId}/release`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.id}`
        }
      });
      if (r.ok) {
        showToast(`Escrow milestone cleared. $${amount} disbursed to freelancer!`, 'success');
        fetchMarketplaceGigs();
        fetchActiveProposals();
        fetchNotifications();
      }
    } catch (_) {}
  };

  // Submit progress percentages + Log text
  const handleProgressReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateProgressProposalId || !currentUser) return;

    try {
      const r = await fetch(`/api/proposals/${updateProgressProposalId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.id}`
        },
        body: JSON.stringify({
          percentage: Number(progressPercentageValue),
          logText: progressLogText,
          uploadedFile: progressFileMock || undefined
        })
      });
      if (r.ok) {
        showToast(`Work milestone tracker parsed. Status successfully logged to contract!`, 'success');
        setUpdateProgressProposalId(null);
        setProgressLogText('');
        setProgressFileMock('');
        fetchActiveProposals();
        fetchNotifications();
      }
    } catch (_) {}
  };

  // Book Calendar slot
  const handleBookSlotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showBookingModal || !bookingSlot || !currentUser) return;

    try {
      const r = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.id}`
        },
        body: JSON.stringify({
          freelancerId: showBookingModal.userId,
          slot: bookingSlot,
          title: bookingTitle || 'Strategy & Blueprint Session',
          price: bookingPrice
        })
      });
      if (r.ok) {
        showToast(`Slot book request registered for review: ${bookingSlot}`, 'success');
        setShowBookingModal(null);
        setBookingSlot('');
        setBookingTitle('');
        setBookingPrice(100);
        fetchBookings();
        fetchTalentsList();
      }
    } catch (_) {}
  };

  const handleBookingStatusUpdate = async (bookingId: string, status: 'Confirmed' | 'Declined') => {
    if (!currentUser) return;
    try {
      const r = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.id}`
        },
        body: JSON.stringify({ status })
      });
      if (r.ok) {
        showToast(`Booking has been ${status.toLowerCase()}!`, 'success');
        fetchBookings();
        fetchTalentsList();
      }
    } catch (_) {}
  };

  // Dispute Filing 
  const handleFileDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showDisputeModal || !disputeReason) return;

    try {
      const r = await fetch('/api/disputes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.id}`
        },
        body: JSON.stringify({
          gigId: showDisputeModal.gigId,
          proposalId: showDisputeModal.id,
          reason: disputeReason,
          amount: showDisputeModal.bidAmount,
          evidenceText: disputeEvidence
        })
      });
      if (r.ok) {
        showToast('Legal escrow dispute submitted. Arbitration review active.', 'info');
        setShowDisputeModal(null);
        setDisputeReason('');
        setDisputeEvidence('');
        fetchAdminDisputes();
      }
    } catch (_) {}
  };

  // Resolve disputes (Admin action)
  const handleAdminResolveDispute = async (disputeId: string, decision: 'Release to Freelancer' | 'Refund Client') => {
    if (!currentUser) return;
    try {
      const r = await fetch(`/api/admin/disputes/${disputeId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.id}`
        },
        body: JSON.stringify({
          decision,
          auditComments: `Resolved via automated system validation logic. Decision: ${decision}`
        })
      });
      if (r.ok) {
        showToast(`Dispute resolved. Contract payout configured!`, 'success');
        fetchAdminDisputes();
        fetchMarketplaceGigs();
        fetchActiveProposals();
      }
    } catch (_) {}
  };

  // Toggle Verification / Suspend status (Admin action)
  const handleToggleSuspendUser = async (targetUserId: string) => {
    try {
      const r = await fetch(`/api/admin/users/${targetUserId}/suspend`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${currentUser?.id}` }
      });
      if (r.ok) {
        const updated = await r.json();
        showToast(`User suspension updated for profile.`, 'info');
        setAllUsers(prev => prev.map(u => u.id === targetUserId ? { ...u, isSuspended: updated.isSuspended } : u));
      }
    } catch (_) {}
  };

  const handleAssignVerifiedBadge = async (targetUserId: string) => {
    try {
      const r = await fetch(`/api/admin/users/${targetUserId}/verify`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${currentUser?.id}` }
      });
      if (r.ok) {
        showToast(`Professional credentials thoroughly validated. Professional Badge issued!`, 'success');
        setAllUsers(prev => prev.map(u => u.id === targetUserId ? { ...u, isVerified: true } : u));
        fetchTalentsList();
      }
    } catch (_) {}
  };

  // Client creates feedback Review
  const handlePostReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showReviewModal || !currentUser) return;

    // AI smart validation check for potential fake review 
    setReviewFraudCheckLoading(true);
    setReviewFraudResult(null);
    try {
      const fraudRes = await fetch('/api/ai/analyze-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewText: reviewTextValue, rating: reviewRatingValue })
      });
      if (fraudRes.ok) {
        const evalData = await fraudRes.json();
        setReviewFraudResult(evalData);
        if (evalData.isFlaggedAsFraud) {
          showToast(`Wait! AI Auditor flagged this review. Suspension confidence: ${evalData.confidenceScore}%`, 'error');
        }
      }
    } catch (_) {}
    setReviewFraudCheckLoading(false);

    // Persist standard review
    try {
      const r = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.id}`
        },
        body: JSON.stringify({
          gigId: showReviewModal.gigId,
          gigTitle: showReviewModal.gigTitle,
          targetId: showReviewModal.freelancerId,
          rating: reviewRatingValue,
          text: reviewTextValue
        })
      });
      if (r.ok) {
        showToast('Your rating feedback has been posted!', 'success');
        setShowReviewModal(null);
        setReviewTextValue('');
        fetchReviews();
        fetchTalentsList();
      }
    } catch (_) {}
  };

  // AI Matching Recommendation triggered by Client 
  const handleTriggerAIMatching = async (gigId: string) => {
    setAiMatchLoading(true);
    setAiMatchResult(null);
    setActiveAnalysisGigId(gigId);
    try {
      const r = await fetch('/api/ai/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gigId })
      });
      if (r.ok) {
        const matches = await r.json();
        setAiMatchResult(matches);
      }
    } catch (_) {
      showToast('Intelligent AI simulation failed to execute.', 'error');
    }
    setAiMatchLoading(false);
  };

  // AI Coaching Career Optimizations triggered by Freelancer
  const handleTriggerAICoaching = async (freelancerId: string) => {
    setAiAdviceLoading(true);
    setAiAdviceResult(null);
    try {
      const r = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ freelancerId })
      });
      if (r.ok) {
        const data = await r.json();
        setAiAdviceResult(data);
        showToast('Premium AI career tips downloaded!', 'success');
      }
    } catch (_) {
      showToast('Coaching optimizer service offline.', 'error');
    }
    setAiAdviceLoading(false);
  };

  // Filter computations
  const filteredGigs = gigs.filter(g => {
    const matchesQuery = g.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      g.skillsRequired.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'All' || g.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesLoc = !selectedLocation || g.location.toLowerCase().includes(selectedLocation.toLowerCase());
    const matchesBudget = g.budgetMin >= minBudget || g.budgetMax >= minBudget;
    return matchesQuery && matchesCat && matchesLoc && matchesBudget;
  });

  const filteredTalents = freelancers.filter(f => {
    const matchesQuery = f.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      f.skills.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesBudget = f.hourlyRate >= minBudget;
    return matchesQuery && matchesBudget;
  });

  // Active Chats context calculations
  const myProposals = proposals.filter(p => p.freelancerId === currentUser?.id || p.clientId === currentUser?.id);
  const myContractsContracts = myProposals.filter(p => p.status === 'Accepted' || p.status === 'Completed');
  const activeBookings = bookings.filter(b => b.clientId === currentUser?.id || b.freelancerId === currentUser?.id);

  // Admin platform aggregations
  const platformRevenueTotal = gigs.reduce((acc, g) => {
    const acceptedProp = proposals.find(p => p.gigId === g.id && (p.status === 'Accepted' || p.status === 'Completed'));
    return acc + (acceptedProp ? acceptedProp.bidAmount * 0.15 : 0); // 15% platform commission cut
  }, 450);

  const activeGigsCount = gigs.filter(g => g.status === 'In Progress').length;
  const verifiedFreelancersCount = allUsers.filter(u => u.role === 'Freelancer' && u.isVerified).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white antialiased">
      
      {/* Toast Alert Banner */}
      {feedbackToast && (
        <div className={`fixed bottom-6 right-6 z-[100] max-w-sm px-4.5 py-4 rounded-xl border flex items-start gap-3 shadow-2xl transition-all duration-300 animate-slide-in ${
          feedbackToast.type === 'error' 
            ? 'bg-rose-950/90 border-rose-500/30 text-rose-200' 
            : feedbackToast.type === 'info' 
              ? 'bg-slate-900/90 border-indigo-500/30 text-indigo-300' 
              : 'bg-indigo-950/90 border-emerald-500/30 text-emerald-300'
        }`}>
          <div className="p-1 rounded bg-slate-900/40">
            {feedbackToast.type === 'error' ? <AlertTriangle className="w-4 h-4 text-rose-400" /> : <Sparkles className="w-4 h-4 text-emerald-400" />}
          </div>
          <div className="flex-1">
            <span className="text-xs font-semibold block uppercase tracking-wide opacity-90">System Notice</span>
            <p className="text-[11px] leading-relaxed opacity-80">{feedbackToast.text}</p>
          </div>
        </div>
      )}

      {/* Persistent Swapping Header Component */}
      {currentUser && (
        <SimulationHeader 
          currentUser={currentUser}
          allUsers={allUsers}
          onSwitchUser={handleUserSwitch}
          notifications={notifications}
          onMarkNotificationsRead={handleMarkNotificationsRead}
        />
      )}

      {/* Main Core View Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all">

        {/* TOP INTRO BANNER HERO */}
        <div className="relative mb-8 p-6.5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800/80 overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-xs font-mono text-indigo-400 border border-indigo-500/20">
                  HYPERLOCAL MATCHING GATEWAY ACTIVE
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-red-400" /> New York &amp; Texas Zones
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Empower local freelancing with smart visual pipelines
              </h1>
              <p className="text-xs text-slate-400 max-w-2xl mt-1">
                A premium, secure environment with intelligent matching, automatic milestone escrow deposits, and real-time collaboration chats.
              </p>
            </div>
            {/* Quick stats for display */}
            <div className="flex items-center gap-4.5 bg-slate-950/80 p-3 rounded-xl border border-slate-800/60 self-start md:self-center">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500 block">Total Gigs</span>
                <span className="text-lg font-bold text-white">{gigs.length}</span>
              </div>
              <div className="border-l border-slate-800 h-8" />
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500 block">Active Escrow</span>
                <span className="text-lg font-bold text-emerald-400">${proposals.filter(p => p.status === 'Accepted').reduce((acc, cr) => acc + cr.bidAmount, 0)}</span>
              </div>
              <div className="border-l border-slate-800 h-8" />
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500 block">Verified Talent</span>
                <span className="text-lg font-bold text-indigo-400">{freelancers.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* INTERACTIVE COMPONENT: SWAPPABLE CONTEXT PANEL (ADMIN vs USER) */}

        {currentUser?.role === 'Admin' ? (
          
          /* ==================== ADMIN AUDITING DESK ==================== */
          <div className="space-y-8 animate-fade-in">
            
            {/* Admin Metrics Dashboard Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/60 p-4.5 rounded-xl border border-slate-850">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-slate-400">ESTIMATED COMMISSIONS</span>
                  <LineChart className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold tracking-tight text-white">${platformRevenueTotal.toFixed(0)}</span>
                  <span className="text-[10px] text-emerald-400 font-mono">(15% cut)</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">From successfully accepted &amp; completed milestones</p>
              </div>
              <div className="bg-slate-900/60 p-4.5 rounded-xl border border-slate-850">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-slate-400">CONTRACT SECURITY STATUS</span>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-lg font-bold text-emerald-400 flex items-center gap-1.5">
                  ● 100% Locked Escrow
                </span>
                <p className="text-[10px] text-slate-500 mt-1">Milestone funds isolated on simulated blockchain ledger</p>
              </div>
              <div className="bg-slate-900/60 p-4.5 rounded-xl border border-slate-850">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-slate-400">ARBITRATIONS NEEDED</span>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-2xl font-bold text-amber-400">
                  {disputes.filter(d => d.status === 'Open').length} Active Files
                </span>
                <p className="text-[10px] text-slate-500 mt-1">Escrow funds temporarily held pending admin decision</p>
              </div>
              <div className="bg-slate-900/60 p-4.5 rounded-xl border border-slate-850">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-slate-400">USER AUDITED FRAUD</span>
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                </div>
                <span className="text-xl font-bold text-red-400">
                  {allUsers.filter(u => u.isSuspended).length} Accounts Suspended
                </span>
                <p className="text-[10px] text-slate-500 mt-1">Linguistic review scanning active on user timelines</p>
              </div>
            </div>

            {/* Platform Users Audit Panel of Real-Time MERN collection */}
            <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-850">
              <div className="flex items-center justify-between mb-4.5 pb-2.5 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-semibold text-white">Master Hyperlocal Platform Users Directory</h3>
                  <p className="text-[11px] text-slate-400">Admin actions to toggle verification levels and suspend suspicious clients or bad actors.</p>
                </div>
                <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/30">
                  {allUsers.length} Users Total
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-mono text-[10px]">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3">Role Type</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">Suspension Status</th>
                      <th className="p-3">Verify Badge</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {allUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-900/30">
                        <td className="p-3 flex items-center space-x-2.5">
                          <img src={u.avatarUrl} alt="" className="w-7 h-7 rounded-lg object-cover" />
                          <span className="font-semibold text-white">{u.fullName}</span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] border ${
                            u.role === 'Admin' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                            u.role === 'Client' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' :
                            'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-400">{u.email}</td>
                        <td className="p-3">
                          {u.isSuspended ? (
                            <span className="text-red-400 font-medium">Flagged &amp; Suspended</span>
                          ) : (
                            <span className="text-emerald-400">Regular Active</span>
                          )}
                        </td>
                        <td className="p-3">
                          {u.isVerified ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400">
                              <CheckCircle className="w-3.5 h-3.5" /> Checked
                            </span>
                          ) : (
                            <span className="text-slate-500">Unverified Credentials</span>
                          )}
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          {!u.isVerified && u.role !== 'Admin' && (
                            <button
                              onClick={() => handleAssignVerifiedBadge(u.id)}
                              className="px-2 py-1 rounded bg-emerald-600/25 hover:bg-emerald-600 border border-emerald-500/30 text-[10px] text-emerald-300 transition"
                            >
                              Verify Badge
                            </button>
                          )}
                          {u.role !== 'Admin' && (
                            <button
                              onClick={() => handleToggleSuspendUser(u.id)}
                              className={`px-2 py-1 rounded text-[10px] transition ${
                                u.isSuspended 
                                  ? 'bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 border border-emerald-500/30' 
                                  : 'bg-red-600/20 hover:bg-red-600 text-red-400 border border-red-500/30'
                              }`}
                            >
                              {u.isSuspended ? 'Pardon User' : 'Suspend Account'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Admin Disputes & Arbitration Center */}
            <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-850">
              <div className="pb-3 border-b border-slate-800 mb-4.5">
                <h3 className="text-sm font-semibold text-white">Hyperlocal Milestone Mediation Disputes Desk</h3>
                <p className="text-[11px] text-slate-400">Review contractual disputes, evidence archives, and decide whether escrow gets disbursed to freelancers or refunded to client.</p>
              </div>

              {disputes.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  All contracts safely synchronized. No active disputes filed.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {disputes.map(disp => (
                    <div key={disp.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                            disp.status === 'Open' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-slate-850 border-slate-700 text-slate-400'
                          }`}>
                            {disp.status}
                          </span>
                          <h4 className="font-semibold text-white text-xs mt-1">{disp.gigTitle}</h4>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Dispute Amount</span>
                          <span className="font-bold text-rose-400 text-sm">${disp.amount}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-[11px] bg-slate-900 p-2.5 rounded border border-slate-850/60">
                        <div>
                          <span className="text-slate-500 block">Filing Client:</span>
                          <span className="text-slate-200 font-semibold">{disp.clientName}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Target Freelancer:</span>
                          <span className="text-slate-200 font-semibold">{disp.freelancerName}</span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-300 space-y-1 bg-slate-900/40 p-3 rounded">
                        <p className="font-medium text-[11px] text-amber-300 uppercase font-mono">Dispute Claim Description:</p>
                        <p className="italic font-sans">"{disp.reason}"</p>
                        {disp.evidenceText && (
                          <div className="pt-2 border-t border-slate-800/80 mt-1">
                            <span className="text-[10px] text-slate-400 font-mono block">Evidence Text submitted:</span>
                            <p className="text-slate-300 text-[11px] font-mono select-all">"{disp.evidenceText}"</p>
                          </div>
                        )}
                      </div>

                      {disp.status === 'Open' ? (
                        <div className="flex items-center space-x-3 pt-2">
                          <button
                            onClick={() => handleAdminResolveDispute(disp.id, 'Release to Freelancer')}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-750 text-white font-medium text-xs py-1.5 px-3 rounded-lg transition text-center"
                          >
                            Release Funds to Freelancer ({disp.freelancerName})
                          </button>
                          <button
                            onClick={() => handleAdminResolveDispute(disp.id, 'Refund Client')}
                            className="flex-1 bg-rose-600 hover:bg-rose-750 text-white font-medium text-xs py-1.5 px-3 rounded-lg transition text-center"
                          >
                            Refund Client ({disp.clientName})
                          </button>
                        </div>
                      ) : (
                        <div className="text-[10px] font-mono text-slate-400 bg-slate-900 p-2 rounded">
                          <span className="text-emerald-400 font-semibold block uppercase">Mediation Settled:</span>
                          Decision Comments: "{disp.adminDecision}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        ) : (
          
          /* ==================== CLIENT & FREELANCER SPACE ==================== */
          <div className="space-y-6">

            {/* Quick Filter Swapping Navigation tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-2 rounded-xl border border-slate-800">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => { setActiveTab('marketplace'); fetchMarketplaceGigs(); }}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                    activeTab === 'marketplace' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Gigs Board Marketplace
                </button>
                <button
                  onClick={() => { setActiveTab('talents'); fetchTalentsList(); }}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                    activeTab === 'talents' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  Freelance Directory
                </button>
                <button
                  onClick={() => { setActiveTab('my-contracts'); fetchActiveProposals(); }}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 relative ${
                    activeTab === 'my-contracts' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  My Direct Contracts
                  {myContractsContracts.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-emerald-500 w-2.5 h-2.5 rounded-full ring-2 ring-slate-900" />
                  )}
                </button>
                <button
                  onClick={() => { setActiveTab('my-schedule'); fetchBookings(); }}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                    activeTab === 'my-schedule' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Schedule Planner &amp; Books
                </button>
                {currentUser?.role === 'Freelancer' && (
                  <button
                    onClick={() => { setActiveTab('freelancer-insights'); fetchReviews(); }}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 text-amber-300 hover:text-amber-200`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    AI Insights &amp; Reviews
                  </button>
                )}
              </div>

              {/* Client Action: Publish a Gig */}
              {currentUser?.role === 'Client' && (
                <button
                  onClick={() => setShowPostGigModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-750 text-white font-medium text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Publish New Gig
                </button>
              )}

              {/* Freelancer Action: Custom Career coaching advice summary */}
              {currentUser?.role === 'Freelancer' && (
                <button
                  onClick={() => handleTriggerAICoaching(currentUser.id)}
                  className="bg-slate-950 hover:bg-slate-900 text-amber-400 hover:text-amber-300 font-medium text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition border border-amber-500/25 cursor-pointer animate-pulse"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Get AI Coaching Tips
                </button>
              )}
            </div>

            {/* AI COACHING ACTION PANEL (Triggered dynamic response) */}
            {aiAdviceLoading && (
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 animate-pulse text-center">
                <p className="text-xs text-slate-300 font-mono">Running Intelligent Career Advice diagnostics on your profile...</p>
              </div>
            )}
            
            {aiAdviceResult && (
              <div className="bg-slate-900 border border-amber-500/30 p-5 rounded-xl space-y-3 relative animate-slide-in">
                <button 
                  onClick={() => setAiAdviceResult(null)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-white text-xs"
                >
                  ✕ Close
                </button>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded bg-amber-500/10 text-amber-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-amber-300">Hyperlocal Career Coaching Optimize Recommendations</h3>
                    <p className="text-[10px] text-slate-400">Calculated based on available candidate match indexes of New York and Austin job postings.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  {aiAdviceResult.tips.map((tip, idx) => (
                    <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                      <span className="font-mono font-bold text-amber-400 text-[10px] uppercase block mb-1">Tip #{idx+1}</span>
                      "{tip}"
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-3.5 border-t border-slate-800/60 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-slate-400">Dynamic skills highly suggested for current gigs:</span>
                    {aiAdviceResult.suggestedAdditions.map((sk, index) => (
                      <span key={index} className="bg-slate-950 px-2 py-0.5 rounded text-[10px] text-indigo-300 font-mono border border-slate-800">
                        {sk}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-[10px]">AI-Assessed Grade:</span>
                    <span className="font-extrabold text-sm text-emerald-400 bg-emerald-900/20 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                      {aiAdviceResult.roleGrade}
                    </span>
                  </div>
                </div>
              </div>
            )}


            {/* PRIMARY VIEWPORT SPLIT */}

            {activeTab === 'marketplace' && (
              <div className="space-y-4.5">
                
                {/* Search Header Banner */}
                <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-850/80 flex flex-col md:flex-row gap-3.5 items-center">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search hyperlocal gigs by title, skills, location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 pl-9 pr-4 py-2 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  
                  {/* Category filters */}
                  <div className="flex items-center gap-1.5 self-start md:self-center overflow-x-auto max-w-full">
                    {['All', 'Development', 'Design', 'Marketing'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-xs px-2.5 py-1 rounded-md whitespace-nowrap ${
                          selectedCategory === cat 
                            ? 'bg-indigo-600/25 text-indigo-400 font-semibold border border-indigo-500/30' 
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="p-2 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-400 hover:text-white"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Extensible budget range filters */}
                {showFilters && (
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 animate-fade-in flex flex-wrap gap-4 items-center">
                    <div>
                      <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Minimum Budget Target</label>
                      <input
                        type="range"
                        min="0"
                        max="5000"
                        step="100"
                        value={minBudget}
                        onChange={(e) => setMinBudget(Number(e.target.value))}
                        className="w-48 bg-slate-800 accent-indigo-500"
                      />
                      <span className="text-xs text-indigo-400 font-mono font-semibold ml-2">${minBudget}+</span>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Geographic Zone</label>
                      <input
                        type="text"
                        placeholder="e.g. New York, Remote"
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="bg-slate-950 border border-slate-850 rounded px-2.5 py-1 text-xs text-slate-200"
                      />
                    </div>
                  </div>
                )}

                {/* Active Gigs List */}
                <div className="grid grid-cols-1 gap-4">
                  {filteredGigs.length === 0 ? (
                    <div className="text-center py-10 bg-slate-900/20 border border-slate-850/60 rounded-xl">
                      <p className="text-xs text-slate-500">No hyperlocal gigs matching search queries found.</p>
                    </div>
                  ) : (
                    filteredGigs.map(g => {
                      const clientAppliers = proposals.filter(p => p.gigId === g.id);
                      const isCreator = g.clientId === currentUser?.id;

                      return (
                        <div key={g.id} className="bg-slate-900 border border-slate-800/80 hover:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-lg transition flex flex-col md:flex-row justify-between gap-5 relative overflow-hidden">
                          {/* Left Details column */}
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="bg-indigo-600/10 text-indigo-400 border border-indigo-500/25 text-[9px] uppercase font-mono px-2 py-0.5 rounded font-semibold tracking-wide">
                                {g.category}
                              </span>
                              <span className="text-slate-500 font-mono text-[10px]">{new Date(g.createdAt).toLocaleDateString()}</span>
                              <span className="text-slate-500">•</span>
                              <span className="text-slate-400 text-[10px] font-medium flex items-center gap-0.5">
                                <MapPin className="w-3.5 h-3.5 text-red-500/80" /> {g.location}
                              </span>
                            </div>

                            <h3 className="text-sm font-semibold text-white leading-relaxed hover:text-indigo-400 cursor-pointer">{g.title}</h3>
                            <p className="text-[11px] text-slate-400 font-normal leading-relaxed mb-3 pr-2.5">{g.description}</p>

                            <div className="flex flex-wrap gap-1.5 p-1">
                              {g.skillsRequired.map((s, idx) => (
                                <span key={idx} className="bg-slate-950 rounded px-2.5 py-0.5 text-[10px] border border-slate-850 text-slate-300 font-mono">
                                  {s}
                                </span>
                              ))}
                            </div>

                            {/* Milestones list visualizer */}
                            <div className="pt-3.5">
                              <span className="text-[10px] text-slate-500 font-mono block uppercase mb-1.5">Project Scope Milestones ({g.milestones.length})</span>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                {g.milestones.map((ms, msIdx) => (
                                  <div key={ms.id || msIdx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-850/65 text-[10px]">
                                    <div className="flex justify-between items-center mb-0.5">
                                      <span className="font-semibold text-slate-300 truncate max-w-[120px]">{ms.title}</span>
                                      <span className="font-bold text-indigo-400 font-mono">${ms.amount}</span>
                                    </div>
                                    <p className="text-slate-500 text-[9px] line-clamp-1">{ms.description}</p>
                                    <div className="mt-1 flex items-center justify-between text-[9px]">
                                      <span className="text-slate-400">Escrow state:</span>
                                      <span className={`font-mono ${
                                        ms.status === 'Released' ? 'text-emerald-400' :
                                        ms.status === 'Escrowed' ? 'text-indigo-400 font-bold' :
                                        'text-slate-500'
                                      }`}>{ms.status}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                          </div>

                          {/* Right Control Actions column */}
                          <div className="flex flex-col justify-between items-end gap-3 min-w-[200px] border-t md:border-t-0 md:border-l border-slate-800 pt-4.5 md:pt-0 md:pl-5">
                            <div className="text-right">
                              <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Est. Budget Pool</span>
                              <span className="font-bold text-white text-base">${g.budgetMin} - ${g.budgetMax}</span>
                              <p className="text-[9px] font-mono text-slate-400 mt-1">Client: {g.clientName}</p>
                            </div>

                            <div className="w-full space-y-2">
                              {currentUser?.role === 'Freelancer' && (
                                <button
                                  onClick={() => setShowApplyModal(g)}
                                  className="w-full bg-indigo-600 hover:bg-indigo-750 text-white font-semibold text-xs py-2 px-3 rounded-xl transition"
                                >
                                  Submit Bid Proposal
                                </button>
                              )}

                              {isCreator && (
                                <div className="space-y-1.5 w-full">
                                  <span className="text-[9px] font-mono block text-slate-400 text-center uppercase">Auditing Admin Tool</span>
                                  <button
                                    onClick={() => handleTriggerAIMatching(g.id)}
                                    className="w-full bg-slate-950 hover:bg-slate-900 text-emerald-400 border border-emerald-500/20 text-xs py-1.5 px-3 rounded-lg font-medium flex items-center justify-center gap-1 transition"
                                  >
                                    <Sparkles className="w-4.5 h-4.5 text-emerald-400" /> AI Matches recomendations
                                  </button>
                                  <div className="text-[9px] text-center text-slate-500">
                                    {clientAppliers.length} Bid proposals registered
                                  </div>
                                </div>
                              )}
                            </div>

                          </div>

                        </div>
                      );
                    })
                  )}
                </div>

                {/* AI-MATCHES RESULT PANEL */}
                {aiMatchLoading && (
                  <div className="p-8 rounded-2xl bg-slate-900 border border-slate-850 animate-pulse text-center space-y-3">
                    <Sparkles className="w-6 h-6 text-emerald-400 animate-spin mx-auto" />
                    <p className="text-xs text-slate-300 font-mono">Comparing gig specifications against candidate vector spaces with intelligent flash embeddings...</p>
                  </div>
                )}

                {aiMatchResult && !aiMatchLoading && (
                  <div className="bg-slate-900 border border-indigo-500/30 p-6 rounded-2xl space-y-4 animate-slide-in relative">
                    <button 
                      onClick={() => setAiMatchResult(null)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-white font-mono text-xs"
                    >
                      ✕ Close AI Result
                    </button>
                    
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl text-indigo-400">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Gemini Staffing Optimizer Recommendation System</h3>
                        <p className="text-xs text-slate-400">Customized matching calculations generated on the backend using strict validation indexes.</p>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850/80 text-xs text-slate-300 italic">
                      💡 <strong>Overall staff matching analysis</strong>: "{aiMatchResult.matchingSummary}"
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {aiMatchResult.matches.map((matchCandidate: any, matchIdx: number) => {
                        return (
                          <div key={matchCandidate.userId || matchIdx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 relative">
                            <span className="absolute top-3 right-3 text-lg font-extrabold text-indigo-400 font-mono shadow bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                              {matchCandidate.similarityScore}%
                            </span>
                            <div className="space-y-1">
                              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Candidate Rank #{matchIdx+1}</span>
                              <h4 className="font-bold text-white text-xs">{matchCandidate.fullName}</h4>
                              <p className="text-[10px] text-indigo-300">{matchCandidate.title}</p>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed italic border-t border-slate-900 pt-2 font-mono">
                              "{matchCandidate.recommendationBio}"
                            </p>
                            <div className="flex items-center justify-between pt-1 border-t border-slate-900 font-semibold text-[10px] text-slate-400">
                              <span>Hourly Rate: ${matchCandidate.hourlyRate}/hr</span>
                              <span className="text-emerald-400">RepScore: {matchCandidate.reputationScore}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-850/60 items-center">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">Current high demand skill trends:</span>
                      {aiMatchResult.trendingSkills.map((sk, index) => (
                        <span key={index} className="bg-slate-950 border border-slate-800 px-2.5 py-0.5 rounded text-[10px] text-indigo-400 font-mono">
                          {sk}
                        </span>
                      ))}
                    </div>

                  </div>
                )}

              </div>
            )}

            {activeTab === 'talents' && (
              <div className="space-y-4">
                
                {/* Search bar context for talents */}
                <div className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-850/80 flex items-center justify-between">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search top local freelance professionals by credentials or expertise..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 pl-9 pr-4 py-2 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Grid list of freelancers */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6.5">
                  {filteredTalents.map(f => {
                    return (
                      <div key={f.userId} className="bg-slate-900 border border-slate-850 rounded-2xl p-5 hover:border-slate-800 transition flex flex-col justify-between space-y-4 shadow-sm relative overflow-hidden">
                        
                        {/* Reputation Banner */}
                        <div className="absolute top-0 right-0 py-1 px-3 bg-gradient-to-l from-indigo-500/20 to-transparent rounded-bl-xl border-b border-l border-slate-800">
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-amber-300">
                            <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" /> {f.reputationScore}%
                          </span>
                        </div>

                        <div className="space-y-3">
                          
                          {/* Profile Core */}
                          <div className="flex items-center space-x-3 pb-3 border-b border-slate-850">
                            <img src={f.avatarUrl} alt="" className="w-11 h-11 rounded-lg object-cover ring-2 ring-slate-800" />
                            <div>
                              <div className="flex items-center gap-1">
                                <h4 className="font-semibold text-white text-xs">{f.fullName}</h4>
                                {f.isVerified && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                              </div>
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Est Rate: ${f.hourlyRate}/hr</p>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <p className="font-bold text-slate-200 text-xs truncate">{f.title}</p>
                            <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">"{f.bio}"</p>
                          </div>

                          {/* Skills pill list */}
                          <div className="flex flex-wrap gap-1 pt-1.5">
                            {f.skills.map((skVal, idx) => (
                              <span key={idx} className="bg-slate-950 px-2 py-0.5 rounded text-[10px] font-mono border border-slate-800/80 text-indigo-300">
                                {skVal.name} <span className="text-[8px] text-slate-500">({skVal.level})</span>
                              </span>
                            ))}
                          </div>

                          {/* Work history summary timeline indicator */}
                          {f.workExperience.length > 0 && (
                            <div className="text-[10px] bg-slate-950/40 p-2 rounded border border-slate-850/60 leading-relaxed">
                              <span className="text-slate-500 font-mono uppercase block text-[9px] mb-0.5">Verified Career History</span>
                              <span className="font-semibold text-slate-200">{f.workExperience[0].company}</span> — {f.workExperience[0].role} ({f.workExperience[0].duration})
                            </div>
                          )}

                          {/* Availability schedule slot selector */}
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono block text-slate-500 uppercase">Interactive Service Slots</span>
                            <div className="flex flex-wrap gap-1 max-h-12 overflow-y-auto">
                              {f.availability.slots.map((slot, index) => {
                                const isBooked = f.availability.isBooked[slot];
                                return (
                                  <span key={index} className={`px-1.5 py-0.5 rounded text-[8px] font-mono border ${
                                    isBooked 
                                      ? 'bg-rose-950/40 border-rose-500/20 text-rose-400 line-through' 
                                      : 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400'
                                  }`}>
                                    {slot.split(' ')[0]} {slot.split(' ')[1]}
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                        </div>

                        <div className="pt-2 border-t border-slate-850/60 w-full flex gap-2">
                          <button
                            onClick={() => setShowBookingModal(f)}
                            className="flex-1 bg-indigo-600/20 hover:bg-indigo-600 font-semibold text-xs text-indigo-200 py-1.5 px-3 rounded-xl border border-indigo-500/30 hover:text-white transition"
                          >
                            Book Local Consultation
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            {activeTab === 'my-contracts' && (
              <div className="space-y-5 animate-fade-in">
                
                <div className="pb-2.5 border-b border-slate-800">
                  <h3 className="text-sm font-semibold text-white">Direct Project Contracts Dashboard</h3>
                  <p className="text-[11px] text-slate-400">Orchestrate active milestone deliverables, chat logs, percentage progress submissions, and disputes here.</p>
                </div>

                {myProposals.length === 0 ? (
                  <div className="text-center py-10 bg-slate-900/20 rounded-xl text-slate-500 text-xs border border-slate-850/60">
                    No active direct proposals or contracts parsed on your active timeline.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Column: Direct Contracts cards */}
                    <div className="lg:col-span-2 space-y-4">
                      {myProposals.map(p => {
                        const isContractClient = p.clientId === currentUser?.id;
                        const targetedGig = gigs.find(g => g.id === p.gigId);

                        return (
                          <div key={p.id} className="bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                            
                            {/* Card Header Status */}
                            <div className="flex flex-wrap justify-between items-start gap-2.5">
                              <div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                                  p.status === 'Accepted' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' :
                                  p.status === 'Completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                  p.status === 'Rejected' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                  'bg-slate-850 border-slate-700 text-slate-400'
                                }`}>
                                  Contract: {p.status}
                                </span>
                                <h4 className="font-semibold text-white text-xs mt-1.5">{p.gigTitle}</h4>
                              </div>

                              <div className="text-right">
                                <span className="text-[10px] text-slate-500 uppercase font-mono block">Direct Contract Bid</span>
                                <span className="font-bold text-white text-base">${p.bidAmount}</span>
                              </div>
                            </div>

                            {/* Info grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 text-[11px] bg-slate-950 p-3 rounded-xl border border-slate-850/80">
                              <div>
                                <span className="text-slate-500 font-mono text-[9px] uppercase block">Assigned Freelancer:</span>
                                <span className="text-slate-200">{p.freelancerName} ({p.freelancerRating} ★)</span>
                              </div>
                              <div>
                                <span className="text-slate-500 font-mono text-[9px] uppercase block">Budget Status:</span>
                                <span className="text-amber-400 font-semibold flex items-center gap-1">
                                  <Lock className="w-3.5 h-3.5 text-amber-400" /> Milestone Escrowed
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500 font-mono text-[9px] uppercase block">Completion Pace:</span>
                                <span className="text-slate-200 font-medium">{p.timelineDays} days timeline limit</span>
                              </div>
                            </div>

                            {/* Cover letter snippet */}
                            <div className="text-xs text-slate-300 bg-slate-950/40 p-3.5 rounded-xl border border-slate-855 leading-relaxed">
                              <span className="text-slate-400 font-mono uppercase block text-[9px] mb-1">Proposal Pitch Letter:</span>
                              "{p.coverLetter}"
                            </div>

                            {/* Interactive progress bar */}
                            <div className="space-y-1.5 pt-1">
                              <div className="flex justify-between items-center text-[10px] text-slate-400">
                                <span>Project Completion Percentage:</span>
                                <span className="font-bold font-mono text-indigo-400">{p.progressPercentage}%</span>
                              </div>
                              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 h-full rounded-full transition-all duration-300" style={{ width: `${p.progressPercentage}%` }} />
                              </div>
                            </div>

                            {/* Progress submissions logs history list */}
                            {p.progressLogs.length > 0 && (
                              <div className="space-y-2">
                                <span className="text-[10px] text-slate-500 uppercase font-mono block">Milestone Progress Feed Logs</span>
                                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                  {p.progressLogs.map((log) => (
                                    <div key={log.id} className="p-2 rounded bg-slate-950/60 border border-slate-850/60 text-[10px] flex items-start justify-between">
                                      <p className="text-slate-300 italic font-mono flex-1">"{log.text}"</p>
                                      <span className="text-[8px] text-slate-500 ml-2">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Interactive Control buttons context */}
                            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-850/65">
                              
                              {/* Message Room chat toggle */}
                              <button
                                onClick={() => {
                                  setActiveChatChannelId(p.gigId);
                                  fetchChatMessages(p.gigId);
                                }}
                                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-750 text-white font-medium text-xs flex items-center gap-1.5 transition"
                              >
                                <MessageSquare className="w-3.5 h-3.5" /> Collaboration Message Chat
                              </button>

                              {/* Progress report trigger for Freelancers */}
                              {currentUser?.role === 'Freelancer' && p.status === 'Accepted' && (
                                <button
                                  onClick={() => {
                                    setUpdateProgressProposalId(p.id);
                                    setProgressPercentageValue(p.progressPercentage);
                                  }}
                                  className="px-3.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 text-slate-300 font-medium text-xs border border-slate-800 transition"
                                >
                                  Submit Deliverables / Log Progress
                                </button>
                              )}

                              {/* Milestones Escrow Disbursement controls for Clients */}
                              {isContractClient && p.status === 'Accepted' && targetedGig && (
                                <div className="flex items-center gap-1.5 flex-1 justify-end">
                                  {targetedGig.milestones.filter(m => m.status === 'Escrowed').map(msCur => (
                                    <button
                                      key={msCur.id}
                                      onClick={() => handleMilestoneRelease(p.gigId, msCur.id, msCur.amount)}
                                      className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white font-semibold text-xs border border-emerald-500/35 transition flex items-center gap-1"
                                    >
                                      Disburse: "{msCur.title}" (${msCur.amount})
                                    </button>
                                  ))}
                                </div>
                              )}

                              {/* Escrow Dispute Filing for Clients */}
                              {isContractClient && p.status === 'Accepted' && (
                                <button
                                  onClick={() => setShowDisputeModal(p)}
                                  className="px-3.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-950 text-rose-400 font-semibold text-xs border border-rose-500/25 transition ml-auto flex items-center gap-1"
                                >
                                  <AlertTriangle className="w-3.5 h-3.5" /> Request Dispute Review
                                </button>
                              )}

                              {/* Create Review for Clients */}
                              {isContractClient && p.status === 'Completed' && (
                                <button
                                  onClick={() => setShowReviewModal(p)}
                                  className="px-3.5 py-1.5 rounded-lg bg-slate-950 text-amber-400 border border-amber-500/25 font-semibold text-xs transition flex items-center gap-1.5"
                                >
                                  <Star className="w-3.5 h-3.5 text-amber-400" /> Share Verification Review
                                </button>
                              )}

                              {/* Client accepting or rejecting bid applications */}
                              {isContractClient && p.status === 'Pending' && (
                                <div className="flex items-center space-x-2.5 ml-auto">
                                  <button
                                    onClick={() => handleProposalStatusUpdate(p.id, 'Accepted')}
                                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded"
                                  >
                                    Accept Bid Pitch &amp; Escrow Deposit
                                  </button>
                                  <button
                                    onClick={() => handleProposalStatusUpdate(p.id, 'Rejected')}
                                    className="px-3 py-1 bg-red-950/40 border border-red-500/30 text-red-400 font-semibold text-xs rounded"
                                  >
                                    Pass Bid
                                  </button>
                                </div>
                              )}

                            </div>

                          </div>
                        );
                      })}
                    </div>

                    {/* Right Column: Active Interactive Chat panel */}
                    <div className="lg:col-span-1 bg-slate-900 border border-slate-850 rounded-2xl flex flex-col h-[520px] overflow-hidden">
                      
                      {/* Active Chat Header */}
                      <div className="bg-slate-950 p-4 border-b border-slate-850 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 font-mono uppercase block">Real-time collaboration channel</span>
                          <span className="text-white font-bold text-xs truncate max-w-[200px] block">
                            {activeChatChannelId ? `Gig Context: ID ${activeChatChannelId}` : 'Select a contract room'}
                          </span>
                        </div>
                        <MessageSquare className="w-4 h-4 text-indigo-400" />
                      </div>

                      {/* Messages body list */}
                      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-950/30">
                        {!activeChatChannelId ? (
                          <div className="h-full flex flex-col items-center justify-center text-center p-4">
                            <span className="text-[11px] text-slate-500 font-sans block max-w-xs mt-1">
                              Click "Collaboration Message Chat" on any accepted project card to load active channel logs.
                            </span>
                          </div>
                        ) : !chatChannel || chatChannel.messages.length === 0 ? (
                          <div className="text-center py-10 text-slate-500 text-xs font-mono">
                            No current messages parsed. Send a greeting to begin milestone integration.
                          </div>
                        ) : (
                          chatChannel.messages.map((m) => {
                            const isMe = m.senderId === currentUser?.id;
                            return (
                              <div key={m.id} className={`flex flex-col max-w-[85%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                                <span className="text-[9px] text-slate-500 font-mono mb-0.5">{m.senderName}</span>
                                <div className={`p-2.5 rounded-xl text-xs leading-relaxed ${
                                  isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-900 text-slate-100 rounded-bl-none border border-slate-800'
                                }`}>
                                  <p>{m.text}</p>
                                  {m.fileAttachment && (
                                    <div className="mt-1.5 p-1 bg-slate-950/40 rounded flex items-center gap-1.5 text-[9px]">
                                      <Paperclip className="w-3.5 h-3.5 text-indigo-300" />
                                      <span className="text-indigo-200 select-all">{m.fileAttachment.name}</span>
                                    </div>
                                  )}
                                </div>
                                <span className="text-[8px] text-slate-500 font-mono mt-0.5">
                                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Chat Footer send bar */}
                      {activeChatChannelId && (
                        <form onSubmit={handleSendChatMessage} className="p-3 border-t border-slate-850 bg-slate-950 space-y-2">
                          
                          {/* Mock attachment buttons */}
                          <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
                            <button
                              type="button"
                              onClick={() => setUploadedChatFile({ name: 'DraftSpecs_Final_approved.pdf', type: 'Proposal Spec' })}
                              className="hover:text-amber-400 transition flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
                            >
                              <Paperclip className="w-3 h-3" /> Attach approved draft mockup (.pdf)
                            </button>
                            {uploadedChatFile && (
                              <span className="text-emerald-400 font-mono">{uploadedChatFile.name} loaded</span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={chatInputMessage}
                              onChange={(e) => setChatInputMessage(e.target.value)}
                              placeholder="Write safe collaboration message here..."
                              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                            />
                            <button
                              type="submit"
                              className="bg-indigo-600 hover:bg-indigo-750 p-2 rounded-lg text-white transition flex-shrink-0"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </form>
                      )}

                    </div>

                  </div>
                )}

              </div>
            )}

            {activeTab === 'my-schedule' && (
              <div className="space-y-4 animate-fade-in text-xs">
                
                <div className="pb-2.5 border-b border-slate-800">
                  <h3 className="text-sm font-semibold text-white">Hyperlocal Availability Scheduler</h3>
                  <p className="text-[11px] text-slate-400">Direct bookings for onboarding blueprints, project intakes, and architecture sessions.</p>
                </div>

                {activeBookings.length === 0 ? (
                  <div className="text-center py-10 bg-slate-900/20 rounded-xl text-slate-500">
                    No active scheduling slot reservations parsed on your active user credentials.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
                    {activeBookings.map(b => {
                      const isBookingFreelancer = b.freelancerId === currentUser?.id;
                      return (
                        <div key={b.id} className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-3 relative">
                          <span className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[9px] font-mono border ${
                            b.status === 'Confirmed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-bold' :
                            b.status === 'Declined' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                            'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          }`}>
                            slot: {b.status}
                          </span>

                          <div className="space-y-1">
                            <span className="text-[9px] text-slate-400 font-mono block">Intake Session Proposal</span>
                            <h4 className="font-bold text-white text-xs">{b.title}</h4>
                            <p className="text-[11px] text-indigo-300 font-mono">Reserved Slot: {b.slot}</p>
                          </div>

                          <div className="flex justify-between items-center text-[10px] bg-slate-950 p-2.5 rounded border border-slate-900 font-mono">
                            <span>Client Partner: {b.clientName}</span>
                            <span className="text-emerald-400 font-bold">${b.price} Rate</span>
                          </div>

                          {isBookingFreelancer && b.status === 'Pending' && (
                            <div className="flex items-center space-x-3 pt-2">
                              <button
                                onClick={() => handleBookingStatusUpdate(b.id, 'Confirmed')}
                                className="flex-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-[10px]"
                              >
                                Accept Consult Reservation
                              </button>
                              <button
                                onClick={() => handleBookingStatusUpdate(b.id, 'Declined')}
                                className="flex-1 px-3 py-1 bg-red-950 border border-red-500/30 text-rose-400 rounded font-semibold text-[10px]"
                              >
                                Decline
                              </button>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            )}

            {activeTab === 'freelancer-insights' && currentUser?.role === 'Freelancer' && (
              <div className="space-y-6 animate-fade-in text-xs">
                
                {/* Insights metrics row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4.5">
                  <div className="bg-slate-900 p-4.5 rounded-2xl border border-slate-850 space-y-1 relative">
                    <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wide">Reputation Score Target</span>
                    <h4 className="text-2xl font-bold text-amber-400">98% Verified Weighted</h4>
                    <p className="text-[10px] text-slate-400">Verified reviews improve this score 2.4x faster.</p>
                  </div>
                  <div className="bg-slate-900 p-4.5 rounded-2xl border border-slate-850 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wide">Dynamic Profile views</span>
                    <h4 className="text-2xl font-bold text-white">512 Hits This Month</h4>
                    <p className="text-[10px] text-slate-400">Increased by 45% post Maps Integration skill addition.</p>
                  </div>
                  <div className="bg-slate-900 p-4.5 rounded-2xl border border-slate-850 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wide">Hourly Rate Benchmark</span>
                    <h4 className="text-2xl font-bold text-indigo-400">$95 / Hour Price</h4>
                    <p className="text-[10px] text-slate-400">Optimal average price tier based on active New York competitors.</p>
                  </div>
                  <div className="bg-slate-900 p-4.5 rounded-2xl border border-slate-850 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wide">Completed Contracts</span>
                    <h4 className="text-2xl font-bold text-emerald-400">29 Milestones Released</h4>
                    <p className="text-[10px] text-slate-400">100% job completion speed score registered.</p>
                  </div>
                </div>

                {/* SVG Visual bar charts analytics for freelancer */}
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-850 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Monthly Contract Earnings Progression</h3>
                    <p className="text-[11px] text-slate-400">Interactive telemetry mapping total revenue disbursed through Escrow.</p>
                  </div>

                  {/* SVG Custom interactive bar charting */}
                  <div className="h-44 flex items-end justify-between gap-4 pt-6 pb-2.5 px-4 bg-slate-950 rounded-xl border border-slate-850 relative">
                    <div className="absolute top-2 left-3 text-[9px] font-mono text-slate-500">REVENUE DISBURSED ($)</div>
                    {[
                      { month: 'Jan', revenue: 2400 },
                      { month: 'Feb', revenue: 3800 },
                      { month: 'Mar', revenue: 5120 },
                      { month: 'Apr', revenue: 4790 },
                      { month: 'May', revenue: 7890 },
                    ].map((mVal, index) => {
                      const percentHeight = Math.round((mVal.revenue / 8000) * 100);
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                          <span className="text-[10px] font-mono font-bold text-indigo-300 opacity-0 group-hover:opacity-100 transition duration-200">
                            ${mVal.revenue}
                          </span>
                          <div 
                            className="w-full max-w-16 bg-gradient-to-t from-indigo-750 via-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-500 hover:brightness-125 hover:shadow-lg shadow-indigo-500/20"
                            style={{ height: `${percentHeight}%` }}
                          />
                          <span className="text-[10px] font-mono text-slate-400 block pt-1">{mVal.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Candidate Client Verification Reviews list */}
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-850 space-y-4">
                  <div className="pb-2.5 border-b border-slate-800">
                    <h3 className="text-sm font-semibold text-white">Active Reputation Timeline &amp; Reviews</h3>
                    <p className="text-[11px] text-slate-400 font-normal">Ratings verified by automated escrow billing logs match system.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reviews.map(rev => (
                      <div key={rev.id} className="p-4 bg-slate-950 rounded-xl border border-slate-805 space-y-2 relative">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] text-indigo-400 font-mono block mb-0.5">{rev.reviewerName} ({rev.reviewerRole})</span>
                            <span className="italic text-[11px] text-slate-300">"{rev.text}"</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1">
                            {rev.rating} ★
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[9px] text-slate-500 pt-1.5 border-t border-slate-900 font-mono">
                          <span>Verification impact weight: +{rev.weightedScoreImpact} points</span>
                          <span className="text-emerald-400">Escrow Match Verified</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>

        )}

      </main>

      {/* ==================== SCREEN OVERLAYS / INTERACTIVE MODALS ==================== */}

      {/* MODAL 1: POST A GIG (Client Workflow) */}
      {showPostGigModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6.5 max-w-2xl w-full space-y-4 relative animate-scale-up text-xs">
            <button
              onClick={() => setShowPostGigModal(false)}
              className="absolute top-4.5 right-4.5 text-slate-400 hover:text-white font-mono text-xs"
            >
              ✕ Close
            </button>

            <div>
              <h3 className="text-sm font-bold text-white">Publish Hyperlocal Freelance Gig Listing</h3>
              <p className="text-[11px] text-slate-400">Your gig milestones budget is safely locked in escrow when proposals get approved by you.</p>
            </div>

            <form onSubmit={handlePostGigSubmit} className="space-y-4.5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1.5 font-mono text-[10px] uppercase">Service category</label>
                  <select
                    value={newGigCategory}
                    onChange={(e) => setNewGigCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white uppercase font-semibold"
                  >
                    <option value="Development">Development (Technology)</option>
                    <option value="Design">Design (Creative Architecture)</option>
                    <option value="Marketing">Marketing (SEO optimization)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1.5 font-mono text-[10px] uppercase">Job title (descriptive)</label>
                  <input
                    type="text"
                    value={newGigTitle}
                    onChange={(e) => setNewGigTitle(e.target.value)}
                    placeholder="e.g. Build locator delivery Maps tracking React Native"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1.5 font-mono text-[10px] uppercase">Required Credentials Skills (comma separated)</label>
                <input
                  type="text"
                  value={newGigSkills}
                  onChange={(e) => setNewGigSkills(e.target.value)}
                  placeholder="e.g. React, Node, Tailwind, Maps Integration"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-slate-400 font-medium mb-1.5 font-mono text-[10px] uppercase">Zone Location</label>
                  <input
                    type="text"
                    value={newGigLocation}
                    onChange={(e) => setNewGigLocation(e.target.value)}
                    placeholder="e.g. Austin, TX (Local)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1.5 font-mono text-[10px] uppercase">Min Budget Estimate ($)</label>
                  <input
                    type="number"
                    value={newGigBudgetMin}
                    onChange={(e) => setNewGigBudgetMin(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1.5 font-mono text-[10px] uppercase">Max Budget Estimate ($)</label>
                  <input
                    type="number"
                    value={newGigBudgetMax}
                    onChange={(e) => setNewGigBudgetMax(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1.5 font-mono text-[10px] uppercase">Project description brief</label>
                <textarea
                  value={newGigDesc}
                  onChange={(e) => setNewGigDesc(e.target.value)}
                  rows={3}
                  placeholder="Clearly detail task expectations, scope milestones target dates, and responsive formatting criteria..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Scope Milestones input display */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-850/80 space-y-2">
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Configured Escrow Payments Milestone Schedule</span>
                {newGigMilestones.map((ms, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-300 font-sans">{ms.title}</span>
                    <span className="font-mono text-indigo-400 font-bold">${ms.amount}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPostGigModal(false)}
                  className="flex-1 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white py-2 px-3 rounded-xl transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-750 text-white font-bold py-2 px-3 rounded-xl transition shadow-lg shadow-indigo-600/20"
                >
                  Verify Blueprint &amp; Publish Gig
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SUBMIT BID PROPOSAL (Freelancer Workflow) */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full space-y-4 relative animate-scale-up text-xs">
            <button
              onClick={() => setShowApplyModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-mono text-xs"
            >
              ✕ Close
            </button>

            <div>
              <h3 className="text-sm font-bold text-white">Create Bid Proposal Pitch</h3>
              <p className="text-[11px] text-slate-400">Targeting gig: <strong>{showApplyModal.title}</strong></p>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">My Bid Amount ($)</label>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Timeline needed (Days)</label>
                  <input
                    type="number"
                    value={bidTimeline}
                    onChange={(e) => setBidTimeline(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Proposal pitch &amp; bio deliverables</label>
                <textarea
                  value={bidCoverLetter}
                  onChange={(e) => setBidCoverLetter(e.target.value)}
                  rows={4}
                  placeholder="Detail why your hyperlocal skill set perfectly fits this gig..."
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(null)}
                  className="flex-1 bg-slate-950 text-slate-400 py-1.5 px-3 rounded text-center transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1.5 px-3 rounded text-center transition"
                >
                  Submit Proposal Lock
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: BOOK CONSULTATION (Client swappers) */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-sm w-full space-y-4 relative animate-scale-up text-xs">
            <button
              onClick={() => setShowBookingModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div>
              <h3 className="text-sm font-bold text-white">Book Hyperlocal Direct Consult</h3>
              <p className="text-[11px] text-indigo-400">With expert: {showBookingModal.fullName}</p>
            </div>

            <form onSubmit={handleBookSlotSubmit} className="space-y-4">
              
              <div>
                <label className="block mb-1 text-slate-400 font-mono text-[10px]">SELECT ACTIVE SERVICE SLOT</label>
                <select
                  value={bookingSlot}
                  onChange={(e) => setBookingSlot(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
                  required
                >
                  <option value="">-- Choose Slot --</option>
                  {showBookingModal.availability.slots.map((sl, idx) => (
                    <option key={idx} value={sl} disabled={showBookingModal.availability.isBooked[sl]}>
                      {sl} {showBookingModal.availability.isBooked[sl] ? '(Booked)' : '(Available)'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-slate-400 font-mono text-[10px]">CONSULTATION TITLE OBJECTIVE</label>
                <input
                  type="text"
                  value={bookingTitle}
                  onChange={(e) => setBookingTitle(e.target.value)}
                  placeholder="e.g. Courier coordinate maps flow review"
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-400 font-mono text-[10px]">PRICING RATE LIMIT ($)</label>
                <input
                  type="number"
                  value={bookingPrice}
                  onChange={(e) => setBookingPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-3 rounded transition"
              >
                Submit Direct Reservation Slot
              </button>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: REQUEST DISPUTE REVIEW (Milestone payments lock) */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl max-w-md w-full space-y-4 relative animate-scale-up text-xs">
            <button
              onClick={() => setShowDisputeModal(null)}
              className="absolute top-4 right-4 text-slate-450 hover:text-white"
            >
              ✕
            </button>

            <div>
              <h3 className="text-sm font-bold text-rose-450 flex items-center gap-1.5">
                <AlertTriangle className="w-5 h-5 text-rose-450" /> Raise Escrow Dispute Settlement
              </h3>
              <p className="text-[11px] text-slate-400">Arbiter Chief will review submitted details and disburse locked milestones.</p>
            </div>

            <form onSubmit={handleFileDisputeSubmit} className="space-y-4">
              
              <div>
                <label className="block mb-1 text-slate-500 font-mono text-[10px]">DISPUTE REASON DESC</label>
                <textarea
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. Freelancer stopped communicating or delivered files containing bad syntax..."
                  className="w-full bg-slate-950 border border-slate-800 p-2 text-xs text-white rounded focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-500 font-mono text-[10px]">COMPLETED CODE EVIDENCE LINK OR DATA (Optional)</label>
                <textarea
                  value={disputeEvidence}
                  onChange={(e) => setDisputeEvidence(e.target.value)}
                  rows={2}
                  placeholder="Paste terminal compile error logs description or relevant specifications..."
                  className="w-full bg-slate-950 border border-slate-800 p-2 text-xs text-white rounded font-mono"
                />
              </div>

              <div className="flex justify-between items-center text-[10px] bg-slate-950 p-2.5 rounded border border-slate-900 leading-relaxed text-slate-300">
                <span>Disputed Escrow Value:</span>
                <span className="font-bold text-rose-400">${showDisputeModal.bidAmount}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(null)}
                  className="flex-1 bg-slate-950 hover:bg-slate-900 text-slate-400 py-1.5 px-3 rounded duration-150"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-rose-600 hover:bg-rose-750 text-white font-semibold py-1.5 px-3 rounded duration-150"
                >
                  File Claim Log
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: DELIVER PROGRESS LOGS (Freelancer workflow) */}
      {updateProgressProposalId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5.5 max-w-sm w-full space-y-4 animate-scale-up text-xs">
            <button
              onClick={() => setUpdateProgressProposalId(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div>
              <h3 className="text-sm font-bold text-white">Deliver Project Progress</h3>
              <p className="text-[11px] text-slate-400">Updates will immediately prompt your Client to disburse escrow milestones.</p>
            </div>

            <form onSubmit={handleProgressReportSubmit} className="space-y-4">
              
              <div>
                <label className="block mb-1.5 text-slate-400 font-mono text-[10px]">COMPLETION PERCENTAGE ({progressPercentageValue}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={progressPercentageValue}
                  onChange={(e) => setProgressPercentageValue(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 accent-indigo-500 rounded p-1"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-400 font-mono text-[10px]">WORK UPDATE LOG DESCRIPTIVE</label>
                <input
                  type="text"
                  value={progressLogText}
                  onChange={(e) => setProgressLogText(e.target.value)}
                  placeholder="e.g. Completed high fidelity wireframes design"
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-400 font-mono text-[10px]">SUBMIT DELIVERABLE FILENAME MOCK</label>
                <input
                  type="text"
                  value={progressFileMock}
                  onChange={(e) => setProgressFileMock(e.target.value)}
                  placeholder="e.g. Figma_Layout_v2_release.fig"
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-3 rounded transition"
              >
                Log Deliverables Checklist
              </button>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: CREATE REVIEW & VERIFIED RATE FEEDBACK (Client workflow) */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 max-w-lg w-full space-y-4 animate-scale-up text-xs">
            <button
              onClick={() => setShowReviewModal(null)}
              className="absolute top-4 right-4 text-slate-450 hover:text-white"
            >
              ✕
            </button>

            <div>
              <div className="flex items-center gap-1">
                <h3 className="text-sm font-bold text-white">Create Verification Review</h3>
                <span className="bg-amber-500/10 text-amber-300 font-mono text-[9px] px-1.5 py-0.5 rounded border border-amber-500/20">
                  AI FRAUD CHECK ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Share rating with {showReviewModal.freelancerName} based on completing: <strong>{showReviewModal.gigTitle}</strong></p>
            </div>

            <form onSubmit={handlePostReviewSubmit} className="space-y-4">
              
              <div>
                <label className="block mb-1 text-slate-400 font-mono text-[10px] uppercase">Review rating score ({reviewRatingValue} / 5 Stars)</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={reviewRatingValue}
                  onChange={(e) => setReviewRatingValue(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-400 font-mono text-[10px] uppercase">Linguistic Feedback Timeline Review Description</label>
                <textarea
                  value={reviewTextValue}
                  onChange={(e) => setReviewTextValue(e.target.value)}
                  rows={4}
                  placeholder="Detail coordinate precision, communication speed, React optimization, and formatting quality..."
                  className="w-full bg-slate-950 border border-slate-800 p-2 text-xs text-white rounded focus:outline-none"
                  required
                />
              </div>

              {reviewFraudCheckLoading && (
                <div className="p-3 bg-slate-950 border border-slate-850 rounded text-center text-slate-400 flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  Running AI Fraud Analyser logic scans in token history...
                </div>
              )}

              {reviewFraudResult && (
                <div className={`p-3.5 rounded-lg border text-[11px] leading-relaxed relative font-mono ${
                  reviewFraudResult.isFlaggedAsFraud ? 'bg-red-950/40 border-red-500/35 text-red-300' : 'bg-emerald-950/20 border-emerald-500/35 text-emerald-300'
                }`}>
                  <span className="font-bold uppercase tracking-wide text-[9px] block mb-1">
                    {reviewFraudResult.isFlaggedAsFraud ? '⚠️ AI Flagged Fake Review Alert' : '✓ AI Verified Honest Sentiment'}
                  </span>
                  <p className="text-slate-200 mt-1">"{reviewFraudResult.analystAdvice}"</p>
                  <p className="text-[10px] text-slate-400 mt-1.5">Confidence probability score: {reviewFraudResult.confidenceScore}%</p>
                </div>
              )}

              <button
                type="submit"
                disabled={reviewFraudCheckLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-750 text-white font-bold py-2 px-3 rounded-lg transition"
              >
                Validate and Publish Review Timeline
              </button>

            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 mt-14 py-8 text-center text-[11px] text-slate-500">
        <p className="font-mono">SkillSphere Intelligent Hyperlocal System © 2026. Handcrafted pixel-perfect layout.</p>
        <p className="mt-1 text-slate-600">All payment locks registered directly on sandboxed MERN mock escrow node.</p>
      </footer>

    </div>
  );
}
