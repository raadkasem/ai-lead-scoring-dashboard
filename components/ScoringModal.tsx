'use client';

import { useState } from 'react';

interface ScoringFactor {
  name: string;
  maxPoints: number;
  description: string;
  levels: { label: string; points: number }[];
}

const SCORING_FACTORS: ScoringFactor[] = [
  {
    name: 'Urgency',
    maxPoints: 25,
    description: 'How quickly can the seller hand over the vehicle?',
    levels: [
      { label: 'Immediate', points: 25 },
      { label: '1-2 weeks', points: 20 },
      { label: 'Flexible', points: 15 },
      { label: '2-4 weeks', points: 10 },
    ],
  },
  {
    name: 'Negotiation',
    maxPoints: 20,
    description: 'How willing is the seller to negotiate on price?',
    levels: [
      { label: 'High', points: 20 },
      { label: 'Medium', points: 15 },
      { label: 'Low', points: 5 },
    ],
  },
  {
    name: 'Car Condition',
    maxPoints: 20,
    description: 'What is the reported condition of the vehicle?',
    levels: [
      { label: 'Excellent', points: 20 },
      { label: 'Good', points: 15 },
      { label: 'Fair', points: 10 },
    ],
  },
  {
    name: 'Price Gap',
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
    maxPoints: 10,
    description: 'How many previous owners has the vehicle had?',
    levels: [
      { label: 'Single owner', points: 10 },
      { label: '2 owners', points: 7 },
      { label: '3+ owners', points: 5 },
    ],
  },
  {
    name: 'Sentiment',
    maxPoints: 10,
    description: 'How positive was the conversation tone?',
    levels: [
      { label: 'Positive', points: 10 },
      { label: 'Neutral', points: 5 },
      { label: 'Negative', points: 0 },
    ],
  },
];

export default function ScoringModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40 group"
        title="How Scoring Works"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span className="absolute right-full mr-3 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          How Scoring Works
        </span>
      </button>

      {/* Modal Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          {/* Modal Content */}
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-600 to-purple-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">How Lead Scoring Works</h2>
                  <p className="text-purple-200 text-sm">Score = 0-100 based on deal potential</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
              <div className="space-y-4">
                {SCORING_FACTORS.map((factor) => (
                  <div key={factor.name} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{factor.name}</h3>
                      <span className="text-sm font-medium text-purple-600">{factor.maxPoints} pts max</span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                        style={{ width: `${factor.maxPoints}%` }}
                      />
                    </div>

                    <p className="text-sm text-gray-500 mb-3">{factor.description}</p>

                    {/* Levels */}
                    <div className="flex flex-wrap gap-2">
                      {factor.levels.map((level) => (
                        <span
                          key={level.label}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-white border border-gray-200 text-gray-600"
                        >
                          <span>{level.label}</span>
                          <span className="font-semibold text-purple-600">{level.points}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer - Score Ranges */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-green-100 rounded-xl">
                  <div className="text-2xl font-bold text-green-700">70+</div>
                  <div className="text-sm font-medium text-green-600">Hot Lead</div>
                </div>
                <div className="text-center p-3 bg-yellow-100 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-700">40-69</div>
                  <div className="text-sm font-medium text-yellow-600">Warm Lead</div>
                </div>
                <div className="text-center p-3 bg-gray-100 rounded-xl">
                  <div className="text-2xl font-bold text-gray-700">&lt;40</div>
                  <div className="text-sm font-medium text-gray-600">Cold Lead</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
