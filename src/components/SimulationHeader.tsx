/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Notification } from '../types';
import { Shield, Bell, CheckCircle, RefreshCw, Layers, BadgeAlert, Coins } from 'lucide-react';

interface SimulationHeaderProps {
  currentUser: User;
  allUsers: User[];
  onSwitchUser: (userId: string) => void;
  notifications: Notification[];
  onMarkNotificationsRead: () => void;
}

export default function SimulationHeader({
  currentUser,
  allUsers,
  onSwitchUser,
  notifications,
  onMarkNotificationsRead
}: SimulationHeaderProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand logo */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/20">
            <Layers className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-sans font-bold tracking-tight text-lg text-white">SkillSphere</span>
              <span className="text-[10px] uppercase font-mono bg-indigo-500/25 px-1.5 py-0.5 rounded text-indigo-300 font-semibold tracking-wide border border-indigo-500/30">
                Core
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans tracking-wide">Intelligent Hyperlocal Freelancing</p>
          </div>
        </div>

        {/* Dynamic Simulation Quick-Swap Banner */}
        <div className="hidden md:flex items-center space-x-1 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
          <span className="text-xs text-slate-400 px-2 font-mono flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin-slow" />
            Active Role:
          </span>
          {allUsers.slice(0, 4).map((u) => {
            const isActive = u.id === currentUser.id;
            return (
              <button
                key={u.id}
                onClick={() => onSwitchUser(u.id)}
                className={`text-xs px-2.5 py-1 rounded-md transition-all duration-300 font-sans font-medium flex items-center gap-1 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {u.fullName.split(' ')[0]}
                <span className="text-[9px] opacity-75">({u.role})</span>
              </button>
            );
          })}
          {/* Admin Switcher */}
          <button
            onClick={() => onSwitchUser("u-admin")}
            className={`text-xs px-2.5 py-1 rounded-md transition-all duration-300 font-sans font-medium ${
              currentUser.role === 'Admin'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-rose-400 hover:text-rose-300 hover:bg-slate-800'
            }`}
          >
            Admin Panel
          </button>
        </div>

        {/* User profile & interactive alerts */}
        <div className="flex items-center space-x-4">
          
          {/* Notifications feed */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) {
                  onMarkNotificationsRead();
                }
              }}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-rose-500 text-[10px] font-sans font-bold flex items-center justify-center rounded-full text-white ring-2 ring-slate-900 animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2.5 w-80 bg-slate-950 rounded-xl border border-slate-800 shadow-2xl p-4 text-slate-200 z-50">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
                  <span className="font-sans font-semibold text-xs tracking-tight text-white flex items-center gap-1.5">
                    Live Feed Logs
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Real-Time Subscription
                  </span>
                </div>
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">No active notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-lg border text-xs leading-relaxed transition-all ${
                          n.read ? 'bg-slate-900/30 border-slate-905' : 'bg-slate-900 border-indigo-500/20 shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="font-semibold text-slate-100 block mb-0.5 text-[11px] uppercase tracking-wide">
                            {n.title}
                          </span>
                          <span className="text-[9px] text-slate-500">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px]">{n.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-3 p-1 rounded-xl hover:bg-slate-800/80 transition text-left"
            >
              <div className="relative">
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={currentUser.fullName}
                  className="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-800"
                />
                {currentUser.isVerified && (
                  <CheckCircle className="absolute -bottom-1 -right-1 w-4 h-4 text-emerald-400 fill-slate-950" />
                )}
              </div>
              <div className="hidden lg:block">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-sans font-semibold text-white truncate max-w-[120px]">
                    {currentUser.fullName}
                  </span>
                  {currentUser.role === 'Admin' && <Shield className="w-3 h-3 text-rose-400" />}
                </div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{currentUser.role}</p>
              </div>
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2.5 w-64 bg-slate-950 rounded-xl border border-slate-800 shadow-2xl p-4 text-slate-200 z-50">
                <div className="flex items-center space-x-3 pb-3 border-b border-slate-800 mb-3">
                  <div className="relative">
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.fullName}
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-800"
                    />
                    {currentUser.isVerified && (
                      <CheckCircle className="absolute -bottom-1 -right-1 w-4 h-4 text-emerald-400 fill-slate-950" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-white">{currentUser.fullName}</h4>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">
                      {currentUser.role} Account
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-200">Email:</span> {currentUser.email}
                  </p>
                  <div className="flex items-center justify-between text-[11px] bg-slate-900 p-2 rounded border border-slate-800/60">
                    <span className="text-slate-400">Simulation Status</span>
                    <span className="text-emerald-400 font-mono font-medium">Synced Active</span>
                  </div>
                  <div className="text-[10px] text-slate-500 pt-1 mt-1 border-t border-slate-800 text-center">
                    Switch role globally from the Quick Swap Bar.
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Mobile Switch Bar */}
      <div className="md:hidden flex items-center justify-around bg-slate-950 border-t border-slate-850 px-2 py-1.5 scrollbar-none overflow-x-auto">
        <span className="text-[10px] text-slate-400 font-mono uppercase mr-1">Demo Swap:</span>
        {allUsers.map((u) => (
          <button
            key={u.id}
            onClick={() => onSwitchUser(u.id)}
            className={`text-[10px] px-2 py-1 rounded transition-all font-sans font-medium whitespace-nowrap ${
              u.id === currentUser.id ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {u.fullName.split(' ')[0]} ({u.role[0]})
          </button>
        ))}
        <button
          onClick={() => onSwitchUser("u-admin")}
          className={`text-[10px] px-2 py-1 rounded transition-all font-sans font-medium whitespace-nowrap ${
            currentUser.role === 'Admin' ? 'bg-rose-600 text-white shadow' : 'text-rose-400'
          }`}
        >
          Admin (A)
        </button>
      </div>
    </header>
  );
}
