'use client';

import { ScoredLead } from '@/lib/types';
import ScoreBadge from './ScoreBadge';

interface LeadCardProps {
  lead: ScoredLead;
}

export default function LeadCard({ lead }: LeadCardProps) {
  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (km: number | undefined) => {
    if (!km) return null;
    return new Intl.NumberFormat('de-DE').format(km) + ' km';
  };

  const getOutcomeStyle = (outcome: string) => {
    const styles: Record<string, string> = {
      qualified: 'bg-green-100 text-green-700',
      callback_requested: 'bg-blue-100 text-blue-700',
      not_interested: 'bg-red-100 text-red-700',
      voicemail: 'bg-gray-100 text-gray-600',
      failed: 'bg-gray-100 text-gray-600',
    };
    return styles[outcome] || 'bg-gray-100 text-gray-600';
  };

  const getOutcomeLabel = (outcome: string) => {
    const labels: Record<string, string> = {
      qualified: 'Qualified',
      callback_requested: 'Callback Requested',
      not_interested: 'Not Interested',
      voicemail: 'Voicemail',
      failed: 'No Contact',
    };
    return labels[outcome] || outcome;
  };

  const getHandoverLabel = (date: string) => {
    const labels: Record<string, string> = {
      immediate: 'Immediate',
      '1-2 weeks': '1-2 Weeks',
      '2-4 weeks': '2-4 Weeks',
      flexible: 'Flexible',
      unclear: 'Unknown',
    };
    return labels[date] || date;
  };

  const getConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor',
      unclear: 'Unknown',
    };
    return labels[condition] || condition;
  };

  const getStatusBorderColor = () => {
    if (lead.score >= 70) return 'border-l-green-500';
    if (lead.score >= 40) return 'border-l-yellow-500';
    return 'border-l-gray-300';
  };

  const getStatusBgColor = () => {
    if (lead.score >= 70) return 'bg-green-50';
    if (lead.score >= 40) return 'bg-yellow-50';
    return 'bg-white';
  };

  // Determine which CTA to show
  const getCTAButton = () => {
    if (lead.isHot) {
      return (
        <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Contact Seller
        </button>
      );
    }
    if (lead.insights.call_outcome === 'callback_requested') {
      return (
        <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Schedule Callback
        </button>
      );
    }
    if (lead.insights.call_outcome === 'voicemail') {
      return (
        <button className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Retry Call
        </button>
      );
    }
    if (lead.score >= 40 && lead.insights.call_outcome === 'qualified') {
      return (
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Follow Up
        </button>
      );
    }
    // Default CTA for all other leads
    return (
      <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        View Details
      </button>
    );
  };

  return (
    <div className={`h-full flex flex-col rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all ${getStatusBgColor()}`}>
      {/* Photo Header with placeholder */}
      <div className="relative h-40 bg-gray-100 shrink-0 overflow-hidden">
        <img
          src={lead.photoUrl || '/images/car-placeholder.jpg'}
          alt={`${lead.make} ${lead.model}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/images/car-placeholder.jpg';
          }}
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        {/* Score badge */}
        <div className="absolute top-2 right-2">
          <ScoreBadge score={lead.score} />
        </div>
        {/* Car info overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-white font-bold text-lg truncate drop-shadow-md">
            {lead.make} {lead.model}
          </h3>
          <p className="text-white/80 text-sm drop-shadow">
            {lead.year}
            {formatMileage(lead.mileage) && <> • {formatMileage(lead.mileage)}</>}
          </p>
        </div>
      </div>

      {/* Seller Info & Status */}
      <div className={`border-l-4 ${getStatusBorderColor()} px-4 py-2 shrink-0`}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-gray-700 truncate">
            {lead.name} {lead.lastName}
          </p>
          <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${getOutcomeStyle(lead.insights.call_outcome)}`}>
            {getOutcomeLabel(lead.insights.call_outcome)}
          </span>
        </div>
      </div>

      {/* Key Metrics - 3 Column Grid */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 border-t border-b border-gray-100 bg-white shrink-0">
        <div className="px-3 py-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Price</p>
          <p className="font-semibold text-gray-900 text-sm">
            {formatPrice(lead.insights.asking_price || lead.priceEstimation)}
          </p>
          {lead.insights.asking_price && lead.insights.asking_price !== lead.priceEstimation && (
            <p className="text-xs text-gray-400">
              Est: {formatPrice(lead.priceEstimation)}
            </p>
          )}
        </div>
        <div className="px-3 py-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Handover</p>
          <p className="font-semibold text-gray-900 text-sm">
            {getHandoverLabel(lead.insights.handover_date)}
          </p>
        </div>
        <div className="px-3 py-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Condition</p>
          <p className="font-semibold text-gray-900 text-sm">
            {getConditionLabel(lead.insights.car_condition)}
          </p>
        </div>
      </div>

      {/* Additional Info Row */}
      <div className="px-4 py-2 bg-white flex items-center justify-between text-xs text-gray-500 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-4">
          <span>
            Owners: <strong className="text-gray-700">{lead.insights.num_owners ?? '?'}</strong>
          </span>
          <span>
            Negotiation: <strong className="text-gray-700 capitalize">{lead.insights.willingness_to_negotiate}</strong>
          </span>
        </div>
        <span className="text-gray-400">ID: {lead.id}</span>
      </div>

      {/* Key Notes - This section grows to fill available space */}
      <div className="flex-1 bg-white">
        {lead.insights.key_notes &&
         lead.insights.key_notes !== 'Unable to extract notes' &&
         lead.insights.key_notes !== 'No transcript available or call failed' &&
         lead.insights.key_notes !== 'Call went to voicemail - no conversation' &&
         lead.insights.key_notes !== 'Error during extraction' && (
          <div className="px-4 py-3">
            <p className="text-sm text-gray-700 leading-relaxed">
              {lead.insights.key_notes}
            </p>
          </div>
        )}
      </div>

      {/* CTA Button - Always at bottom */}
      <div className="px-4 py-3 bg-white border-t border-gray-100 mt-auto shrink-0">
        {getCTAButton()}
      </div>
    </div>
  );
}
