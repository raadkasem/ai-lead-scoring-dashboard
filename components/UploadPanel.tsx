'use client';

import { useState, useCallback, useRef } from 'react';

interface UploadResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    totalLeads: number;
    hotLeads: number;
    warmLeads: number;
    coldLeads: number;
    avgScore: number;
    fileName: string;
  };
  missingColumns?: string[];
}

type UploadStage =
  | 'idle'
  | 'uploading'
  | 'validating'
  | 'parsing'
  | 'extracting'
  | 'scoring'
  | 'saving'
  | 'complete'
  | 'error';

function getStageMessage(stage: UploadStage, isJson: boolean): string {
  const messages: Record<UploadStage, string> = {
    idle: 'Drop your file here or click to browse',
    uploading: `Uploading your ${isJson ? 'JSON' : 'Excel'} file...`,
    validating: 'Validating file format...',
    parsing: isJson ? 'Parsing JSON data...' : 'Reading spreadsheet data...',
    extracting: 'Analyzing transcripts with AI...',
    scoring: 'Calculating priority scores...',
    saving: 'Saving processed data...',
    complete: 'All done!',
    error: 'An error occurred',
  };
  return messages[stage];
}

interface Props {
  onUploadComplete?: () => void;
}

export default function UploadPanel({ onUploadComplete }: Props) {
  const [stage, setStage] = useState<UploadStage>('idle');
  const [dragActive, setDragActive] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isJsonFile, setIsJsonFile] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const processFile = async (file: File) => {
    setResult(null);
    setErrorMessage('');

    // Detect file type
    const isJson = file.name.endsWith('.json') || file.type === 'application/json';
    setIsJsonFile(isJson);

    setStage('uploading');

    try {
      // Simulate stage progression
      await new Promise(r => setTimeout(r, 300));
      setStage('validating');

      const formData = new FormData();
      formData.append('file', file);

      await new Promise(r => setTimeout(r, 200));
      setStage('parsing');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      setStage('extracting');
      await new Promise(r => setTimeout(r, 500));

      const data: UploadResult = await response.json();

      if (!response.ok) {
        setStage('error');
        setErrorMessage(data.error || 'Upload failed');
        setResult(data);
        return;
      }

      setStage('scoring');
      await new Promise(r => setTimeout(r, 300));

      setStage('saving');
      await new Promise(r => setTimeout(r, 200));

      setStage('complete');
      setResult(data);

      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (err) {
      setStage('error');
      setErrorMessage(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const reset = () => {
    setStage('idle');
    setResult(null);
    setErrorMessage('');
    setIsJsonFile(false);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const isProcessing = !['idle', 'complete', 'error'].includes(stage);

  return (
    <div className="w-full">
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${stage === 'complete' ? 'border-green-500 bg-green-50' : ''}
          ${stage === 'error' ? 'border-red-500 bg-red-50' : ''}
          ${isProcessing ? 'border-blue-500 bg-blue-50' : ''}
          ${stage === 'idle' ? 'cursor-pointer' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={stage === 'idle' ? handleClick : undefined}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.json"
          onChange={handleChange}
          className="hidden"
        />

        {/* Icon */}
        <div className="mb-4">
          {stage === 'idle' && (
            <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          )}
          {isProcessing && (
            <div className="w-12 h-12 mx-auto">
              <svg className="animate-spin text-blue-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          )}
          {stage === 'complete' && (
            <svg className="w-12 h-12 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {stage === 'error' && (
            <svg className="w-12 h-12 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        {/* Message */}
        <p className={`text-lg font-medium ${stage === 'error' ? 'text-red-600' : stage === 'complete' ? 'text-green-600' : 'text-gray-600'}`}>
          {stage === 'error' ? errorMessage : getStageMessage(stage, isJsonFile)}
        </p>

        {/* Progress stages indicator */}
        {isProcessing && (
          <div className="mt-4 flex justify-center gap-2">
            {(['uploading', 'validating', 'parsing', 'extracting', 'scoring', 'saving'] as UploadStage[]).map((s, i) => {
              const stageOrder = ['uploading', 'validating', 'parsing', 'extracting', 'scoring', 'saving'];
              const currentIndex = stageOrder.indexOf(stage);
              const isComplete = i < currentIndex;
              const isCurrent = s === stage;

              return (
                <div
                  key={s}
                  className={`w-2 h-2 rounded-full transition-all ${
                    isComplete ? 'bg-blue-500' : isCurrent ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'
                  }`}
                />
              );
            })}
          </div>
        )}

        {/* Success result */}
        {stage === 'complete' && result?.data && (
          <div className="mt-4 text-sm text-gray-600">
            <p className="font-semibold text-green-700 text-base mb-2">
              {result.data.totalLeads} leads imported, {result.data.hotLeads} hot leads found!
            </p>
            <div className="flex justify-center gap-4 mt-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {result.data.hotLeads} Hot
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {result.data.warmLeads} Warm
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {result.data.coldLeads} Cold
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Average score: {result.data.avgScore}/100
            </p>
          </div>
        )}

        {/* Error details */}
        {stage === 'error' && result?.missingColumns && (
          <div className="mt-4 text-sm text-red-600">
            <p className="font-medium">Missing columns:</p>
            <p className="text-red-500">{result.missingColumns.join(', ')}</p>
          </div>
        )}

        {/* Reset button */}
        {(stage === 'complete' || stage === 'error') && (
          <button
            onClick={reset}
            className="mt-4 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Upload Another File
          </button>
        )}

        {/* File type hint */}
        {stage === 'idle' && (
          <p className="mt-2 text-xs text-gray-400">
            Supported formats: Excel (.xlsx, .xls) or JSON
          </p>
        )}
      </div>
    </div>
  );
}
