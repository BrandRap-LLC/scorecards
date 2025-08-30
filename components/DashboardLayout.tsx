'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  Building2, 
  TrendingUp, 
  Search, 
  Globe, 
  Database,
  Menu,
  X,
  ChevronDown,
  Home
} from 'lucide-react';
import { DashboardLayoutProps, NavigationItem } from '@/types/dashboard';

const navigationItems: NavigationItem[] = [
  {
    href: '/dashboard',
    label: 'Executive Overview',
    icon: Home
  },
  {
    href: '/analytics',
    label: 'Analytics & Trends',
    icon: TrendingUp
  },
  {
    href: '/campaigns',
    label: 'Campaign Performance',
    icon: BarChart3
  },
  {
    href: '/seo',
    label: 'SEO Performance',
    icon: Search
  },
  {
    href: '/compare',
    label: 'Company Comparison',
    icon: Building2
  },
  {
    href: '/data',
    label: 'Data Tables',
    icon: Database
  }
];

export function DashboardLayout({ 
  children, 
  title, 
  subtitle, 
  showFilters = false 
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname.startsWith('/dashboard/');
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">Analytics</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-8 px-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                {Icon && <Icon className="w-5 h-5" />}
                {item.label}
                {item.badge && (
                  <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Company Quick Access */}
        <div className="mt-8 px-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Quick Access
          </h3>
          <div className="space-y-1">
            <Link
              href="/dashboard/all"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
            >
              <Globe className="w-4 h-4" />
              All Companies
            </Link>
            {/* Add individual company links here if needed */}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div>
                {title && (
                  <h1 className="text-xl font-semibold text-gray-900">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-500">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Header actions */}
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}