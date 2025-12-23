'use client';

import { useState, useEffect, useMemo } from 'react';
import { ScoredLead } from '@/lib/types';
import StatsHeader from '@/components/StatsHeader';
import FilterBar from '@/components/FilterBar';
import LeadCard from '@/components/LeadCard';
import UploadPanel from '@/components/UploadPanel';
import UploadHint from '@/components/UploadHint';
import ScoringModal from '@/components/ScoringModal';
import AuthorModal from '@/components/AuthorModal';
import PromptShowcaseModal from '@/components/PromptShowcaseModal';

interface Stats {
  totalLeads: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  avgScore: number;
  callsConnected: number;
  qualified: number;
}

export default function Dashboard() {
  const [leads, setLeads] = useState<ScoredLead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('score');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  // GET - Just loads stored data (fast)
  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/leads');
      if (!response.ok) throw new Error('Failed to fetch leads');
      const data = await response.json();
      setLeads(data.leads);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // POST - Reprocesses all leads with AI (slow)
  const reprocessLeads = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await fetch('/api/leads', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to reprocess leads');
      const data = await response.json();
      setLeads(data.leads);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setRefreshing(false);
    }
  };

  const handleUploadComplete = () => {
    fetchLeads();
    setShowUpload(false);
  };

  const filteredAndSortedLeads = useMemo(() => {
    let result = [...leads];

    // Apply filter
    switch (filterStatus) {
      case 'hot':
        result = result.filter(l => l.score >= 70);
        break;
      case 'warm':
        result = result.filter(l => l.score >= 40 && l.score < 70);
        break;
      case 'cold':
        result = result.filter(l => l.score < 40);
        break;
      case 'callback':
        result = result.filter(l => l.insights.call_outcome === 'callback_requested');
        break;
      case 'voicemail':
        result = result.filter(l => l.insights.call_outcome === 'voicemail');
        break;
    }

    // Apply sort
    switch (sortBy) {
      case 'score':
        result.sort((a, b) => b.score - a.score);
        break;
      case 'score-asc':
        result.sort((a, b) => a.score - b.score);
        break;
      case 'price':
        result.sort((a, b) => (b.insights.asking_price || b.priceEstimation) - (a.insights.asking_price || a.priceEstimation));
        break;
      case 'price-asc':
        result.sort((a, b) => (a.insights.asking_price || a.priceEstimation) - (b.insights.asking_price || b.priceEstimation));
        break;
      case 'year':
        result.sort((a, b) => b.year - a.year);
        break;
      case 'year-asc':
        result.sort((a, b) => a.year - b.year);
        break;
    }

    return result;
  }, [leads, sortBy, filterStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent mx-auto mb-3"></div>
          <p className="text-gray-600 font-medium">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Lead Dashboard</h1>
              <p className="text-xs text-gray-500">AI-powered lead scoring</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowUpload(!showUpload)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  showUpload
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="hidden sm:inline">{showUpload ? 'Hide' : 'Upload'}</span>
              </button>
              <button
                onClick={reprocessLeads}
                disabled={refreshing || leads.length === 0}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Reprocess all leads with AI"
              >
                <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">{refreshing ? 'Processing...' : 'Reprocess'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        {/* Upload Section */}
        {showUpload && (
          <div className="mb-4 space-y-3 bg-white rounded-xl p-4 shadow-sm">
            <UploadPanel onUploadComplete={handleUploadComplete} />
            <UploadHint />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={fetchLeads}
              className="text-sm text-red-700 font-medium hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!error && leads.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No leads yet</h3>
            <p className="text-gray-500 text-sm mb-4">Upload an Excel or JSON file to get started</p>
            <button
              onClick={() => setShowUpload(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Upload File
            </button>
          </div>
        )}

        {/* Dashboard Content */}
        {leads.length > 0 && (
          <>
            {/* Stats */}
            {stats && <StatsHeader stats={stats} />}

            {/* Filters */}
            <FilterBar
              sortBy={sortBy}
              onSortChange={setSortBy}
              filterStatus={filterStatus}
              onFilterChange={setFilterStatus}
            />

            {/* Results count */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">
                {filteredAndSortedLeads.length} of {leads.length} leads
              </p>
              {refreshing && (
                <p className="text-sm text-blue-600 flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                  Reprocessing with AI...
                </p>
              )}
            </div>

            {/* Lead Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredAndSortedLeads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>

            {filteredAndSortedLeads.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl">
                <p className="text-gray-500">No leads match your filter</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Buttons */}
      <ScoringModal />
      <AuthorModal />
      <PromptShowcaseModal />
    </main>
  );
}
