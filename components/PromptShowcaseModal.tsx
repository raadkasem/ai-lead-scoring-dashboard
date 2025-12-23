'use client';

import { useState, useEffect } from 'react';

interface LLMConfig {
  model: string;
  provider: string;
  baseUrl: string;
  temperature: number;
  maxTokens: number;
  prompts: {
    system: string;
    user: string;
  };
}

const EXTRACTION_FIELDS = [
  { field: 'asking_price', type: 'number | null', description: 'Final negotiated price in EUR' },
  { field: 'willingness_to_negotiate', type: 'enum', description: 'Seller flexibility on price' },
  { field: 'handover_date', type: 'enum', description: 'When vehicle can be handed over' },
  { field: 'car_condition', type: 'enum', description: 'Reported vehicle condition' },
  { field: 'num_owners', type: 'number | null', description: 'Number of previous owners' },
  { field: 'sentiment', type: 'enum', description: 'Overall conversation tone' },
  { field: 'call_outcome', type: 'enum', description: 'Result of the call' },
  { field: 'key_notes', type: 'string', description: 'Brief English summary' },
];

type TabType = 'system' | 'user' | 'fields';

export default function PromptShowcaseModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('system');
  const [config, setConfig] = useState<LLMConfig | null>(null);

  useEffect(() => {
    if (isOpen && !config) {
      fetch('/api/llm-config')
        .then((res) => res.json())
        .then((data) => setConfig(data))
        .catch((err) => {
          console.error('Failed to fetch LLM config:', err);
        });
    }
  }, [isOpen, config]);

  const tabs = [
    { id: 'system' as TabType, label: 'System Prompt', icon: '🧠' },
    { id: 'user' as TabType, label: 'User Prompt', icon: '📝' },
    { id: 'fields' as TabType, label: 'Output Schema', icon: '📊' },
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 h-14 px-5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 z-40 group"
        title="View AI Prompts"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
        <span className="font-medium text-sm">View AI Prompts</span>
      </button>

      {/* Modal Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          {/* Modal Content */}
          <div
            className="bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between bg-gradient-to-r from-teal-600 to-cyan-600">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">AI Prompt Engineering</h2>
                  <p className="text-teal-100 text-sm">How we extract insights from transcripts</p>
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

            {/* Tabs */}
            <div className="px-6 pt-4 bg-gray-900">
              <div className="flex gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'bg-gray-800 text-white border-t border-l border-r border-gray-700'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="bg-gray-800 border-t border-gray-700">
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-220px)]">
                {activeTab === 'system' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs font-mono rounded">role: system</span>
                      <span className="text-gray-500 text-xs">Sets the AI&apos;s behavior and expertise</span>
                    </div>
                    <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
                      {config?.prompts?.system ? (
                        <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
                          {config.prompts.system}
                        </pre>
                      ) : (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-teal-500 border-t-transparent"></div>
                        </div>
                      )}
                    </div>
                    <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-4">
                      <h4 className="text-teal-400 font-medium text-sm mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Why this approach?
                      </h4>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        The system prompt establishes the AI as a domain expert in German automotive sales.
                        By explicitly requiring JSON output without markdown, we ensure reliable parsing
                        and eliminate post-processing complexity.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'user' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-mono rounded">role: user</span>
                      <span className="text-gray-500 text-xs">Contains the transcript and extraction instructions</span>
                    </div>
                    <div className="bg-gray-900 rounded-xl p-4 border border-gray-700 overflow-x-auto">
                      {config?.prompts?.user ? (
                        <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
                          {config.prompts.user.split('\n').map((line: string, i: number) => {
                            // Highlight different parts
                            if (line.includes('"')) {
                              return (
                                <span key={i}>
                                  {line.split(/(".*?")/).map((part: string, j: number) =>
                                    part.startsWith('"') ? (
                                      <span key={j} className="text-yellow-400">{part}</span>
                                    ) : (
                                      <span key={j}>{part}</span>
                                    )
                                  )}
                                  {'\n'}
                                </span>
                              );
                            }
                            if (line.startsWith('-')) {
                              return <span key={i} className="text-cyan-400">{line}{'\n'}</span>;
                            }
                            if (line.includes('{transcript}')) {
                              return <span key={i}>{line.replace('{transcript}', '')}<span className="text-pink-400 bg-pink-500/10 px-1 rounded">{'{transcript}'}</span>{'\n'}</span>;
                            }
                            if (line.startsWith('Important') || line.startsWith('Required') || line.startsWith('If the')) {
                              return <span key={i} className="text-green-400 font-semibold">{line}{'\n'}</span>;
                            }
                            return <span key={i}>{line}{'\n'}</span>;
                          })}
                        </pre>
                      ) : (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                        </div>
                      )}
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                      <h4 className="text-blue-400 font-medium text-sm mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Key Design Decisions
                      </h4>
                      <ul className="text-gray-400 text-sm space-y-1">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>German-specific rules handle linguistic nuances (number words, expressions)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>Strict JSON schema ensures type-safe responses</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>Edge case handling for voicemail/failed calls</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'fields' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs font-mono rounded">ExtractedInsights</span>
                      <span className="text-gray-500 text-xs">TypeScript interface for AI output</span>
                    </div>
                    <div className="grid gap-3">
                      {EXTRACTION_FIELDS.map((field) => (
                        <div
                          key={field.field}
                          className="bg-gray-900 rounded-xl p-4 border border-gray-700 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <code className="text-cyan-400 font-mono text-sm bg-cyan-500/10 px-2 py-1 rounded">
                              {field.field}
                            </code>
                            <span className="text-gray-400 text-sm">{field.description}</span>
                          </div>
                          <span className="text-purple-400 font-mono text-xs bg-purple-500/10 px-2 py-1 rounded">
                            {field.type}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                      <h4 className="text-green-400 font-medium text-sm mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Type Safety
                      </h4>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        All AI responses are validated against TypeScript interfaces before use.
                        Invalid responses fall back to safe defaults, ensuring the application
                        never crashes due to malformed AI output.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-900 border-t border-gray-700">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Model: <span className="text-gray-300 font-mono">{config?.model || '...'}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Temp: <span className="text-gray-300 font-mono">{config?.temperature ?? '...'}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Max tokens: <span className="text-gray-300 font-mono">{config?.maxTokens ?? '...'}</span>
                  </span>
                </div>
                <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-md">
                  {config?.provider || 'Loading...'} API
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
