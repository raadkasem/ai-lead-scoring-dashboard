'use client';

import { useState } from 'react';

interface ColumnInfo {
  name: string;
  required: boolean;
  description: string;
  example: string;
}

const COLUMNS: ColumnInfo[] = [
  { name: 'ID', required: true, description: 'Unique identifier', example: '4030040' },
  { name: 'Name', required: true, description: 'First name', example: 'Ibrahim' },
  { name: 'Last Name', required: false, description: 'Last name', example: 'Almas' },
  { name: 'Make', required: true, description: 'Car manufacturer', example: 'Tesla' },
  { name: 'Modell', required: true, description: 'Car model', example: 'Model Y' },
  { name: 'Year', required: true, description: 'Manufacturing year', example: '2024' },
  { name: 'Price Estimation', required: true, description: 'Estimated price (EUR)', example: '35000' },
  { name: 'Status', required: false, description: 'Call status', example: 'called' },
  { name: 'Transcript', required: true, description: 'Full call transcript', example: 'User: Hallo...' },
  { name: 'Call Successful', required: false, description: 'Was call successful?', example: 'true' },
];

export default function UploadHint() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium text-gray-700">File Format Guide</span>
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
            Upload Excel (.xlsx) or JSON files. For Excel, use these column names (case-insensitive):
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 font-medium text-gray-600">Column</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-600">Required</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-600">Description</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-600">Example</th>
                </tr>
              </thead>
              <tbody>
                {COLUMNS.map((col) => (
                  <tr key={col.name} className="border-b border-gray-100 last:border-0">
                    <td className="py-2 px-2 font-mono text-xs bg-gray-50 rounded">{col.name}</td>
                    <td className="py-2 px-2">
                      {col.required ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                          Required
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                          Optional
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-gray-600">{col.description}</td>
                    <td className="py-2 px-2 text-gray-400 font-mono text-xs truncate max-w-[120px]">
                      {col.example}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex gap-2">
              <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-sm text-amber-800">
                <p className="font-medium">Important</p>
                <p className="mt-1">
                  Each upload replaces all existing data. Make sure your Excel file contains all leads you want to analyze.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
