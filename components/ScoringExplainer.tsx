'use client';

import { useState } from 'react';

interface ScoringFactor {
  name: string;
  icon: string;
  maxPoints: number;
  description: string;
  levels: { label: string; points: number }[];
}

const SCORING_FACTORS: ScoringFactor[] = [
  {
    name: 'Urgency',
    icon: 'clock',
    maxPoints: 25,
    description: 'How quickly can the seller hand over the vehicle?',
    levels: [
      { label: 'Immediate', points: 25 },
      { label: '1-2 weeks', points: 20 },
      { label: 'Flexible', points: 15 },
      { label: '2-4 weeks', points: 10 },
      { label: 'Unclear', points: 5 },
    ],
  },
  {
    name: 'Negotiation',
    icon: 'handshake',
    maxPoints: 20,
    description: 'How willing is the seller to negotiate on price?',
    levels: [
      { label: 'High', points: 20 },
      { label: 'Medium', points: 15 },
      { label: 'Unclear', points: 10 },
      { label: 'Low', points: 5 },
    ],
  },
  {
    name: 'Car Condition',
    icon: 'star',
    maxPoints: 20,
    description: 'What is the reported condition of the vehicle?',
    levels: [
      { label: 'Excellent', points: 20 },
      { label: 'Good', points: 15 },
      { label: 'Fair', points: 10 },
      { label: 'Unclear', points: 8 },
      { label: 'Poor', points: 5 },
    ],
  },
  {
    name: 'Price Gap',
    icon: 'euro',
    maxPoints: 15,
    description: 'How does the asking price compare to estimation?',
    levels: [
      { label: 'At/Below Est.', points: 15 },
      { label: 'Within 10%', points: 10 },
      { label: 'Above 10%', points: 5 },
    ],
  },
  {
    name: 'Ownership',
    icon: 'user',
    maxPoints: 10,
    description: 'How many previous owners has the vehicle had?',
    levels: [
      { label: 'Single owner', points: 10 },
      { label: '2 owners', points: 7 },
      { label: '3+ owners', points: 5 },
      { label: 'Unclear', points: 3 },
    ],
  },
  {
    name: 'Sentiment',
    icon: 'smile',
    maxPoints: 10,
    description: 'How positive was the conversation tone?',
    levels: [
      { label: 'Positive', points: 10 },
      { label: 'Neutral', points: 5 },
      { label: 'Negative', points: 0 },
    ],
  },
];

function getIcon(name: string) {
  switch (name) {
    case 'clock':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'handshake':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case 'star':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
    case 'euro':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'user':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    case 'smile':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function ScoringExplainer() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="font-medium text-gray-700">How Lead Scoring Works</span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <p className="text-sm text-gray-500 mt-3 mb-4">
            Each lead is scored 0-100 based on deal potential. Higher scores indicate better opportunities.
          </p>

          <div className="space-y-4">
            {SCORING_FACTORS.map((factor) => (
              <div key={factor.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">{getIcon(factor.icon)}</span>
                    <span className="font-medium text-gray-700">{factor.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{factor.maxPoints} pts max</span>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
                    style={{ width: `${(factor.maxPoints / 100) * 100}%` }}
                  />
                </div>

                <p className="text-xs text-gray-400">{factor.description}</p>

                {/* Levels */}
                <div className="flex flex-wrap gap-1">
                  {factor.levels.map((level) => (
                    <span
                      key={level.label}
                      className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600"
                    >
                      {level.label}: {level.points}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Score ranges */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-3">Score Ranges</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                <span className="text-2xl">70+</span>
                <p className="text-sm font-medium text-green-700 mt-1">Hot Lead</p>
                <p className="text-xs text-green-600">Priority follow-up</p>
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                <span className="text-2xl">40-69</span>
                <p className="text-sm font-medium text-yellow-700 mt-1">Warm Lead</p>
                <p className="text-xs text-yellow-600">Good potential</p>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <span className="text-2xl">&lt;40</span>
                <p className="text-sm font-medium text-gray-700 mt-1">Cold Lead</p>
                <p className="text-xs text-gray-600">Lower priority</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
