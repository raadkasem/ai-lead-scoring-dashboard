'use client';

interface FilterBarProps {
  sortBy: string;
  onSortChange: (sort: string) => void;
  filterStatus: string;
  onFilterChange: (filter: string) => void;
}

export default function FilterBar({
  sortBy,
  onSortChange,
  filterStatus,
  onFilterChange,
}: FilterBarProps) {
  const filters = [
    { value: 'all', label: 'All Leads' },
    { value: 'hot', label: 'Hot', color: 'bg-green-100 text-green-700 border-green-300' },
    { value: 'warm', label: 'Warm', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    { value: 'cold', label: 'Cold', color: 'bg-gray-100 text-gray-700 border-gray-300' },
    { value: 'callback', label: 'Callback', color: 'bg-orange-100 text-orange-700 border-orange-300' },
    { value: 'voicemail', label: 'Voicemail', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-white rounded-lg border border-gray-200">
      {/* Sort Dropdown */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Sort by:</label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="score">Score (High to Low)</option>
          <option value="score-asc">Score (Low to High)</option>
          <option value="price">Price (High to Low)</option>
          <option value="price-asc">Price (Low to High)</option>
          <option value="year">Year (Newest)</option>
          <option value="year-asc">Year (Oldest)</option>
        </select>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter:</label>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => onFilterChange(filter.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                filterStatus === filter.value
                  ? filter.color || 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
