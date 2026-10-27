import React, { useState, useMemo } from 'react';
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Card } from '../common/Card';
import { RiskBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { SortableHeader } from '../common/SortableHeader';
import { formatCurrency, formatDate } from '../../utils/formatters';

export function RecentAssessmentsTable({ applications, onSelectApplication }) {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [sortField, setSortField] = useState('dateAssessed');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Filter & sort
  const filteredData = useMemo(() => {
    let result = [...applications];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        item =>
          item.id.toLowerCase().includes(q) ||
          item.purpose.toLowerCase().includes(q) ||
          String(item.age).includes(q) ||
          String(item.creditAmount).includes(q)
      );
    }

    if (riskFilter !== 'all') {
      result = result.filter(item =>
        riskFilter === 'high'
          ? item.risk === 1 || item.riskLabel === 'High Risk'
          : item.risk === 0 || item.riskLabel === 'Low Risk'
      );
    }

    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        const c = valA.localeCompare(String(valB));
        return sortOrder === 'asc' ? c : -c;
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    return result;
  }, [applications, search, riskFilter, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <Card
      title="Recent Credit Assessments"
      subtitle="Evaluated profiles from dataset benchmarks and active prediction sessions"
      padding="none"
    >
      {/* Controls: Search and Filters */}
      <div className="p-4 sm:p-5 border-b border-fintech-border flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-fintech-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by ID, purpose, age..."
            className="w-full bg-fintech-bg border border-fintech-border text-xs rounded-xl pl-9 pr-3 py-2 text-fintech-text placeholder:text-fintech-muted focus:outline-none focus:ring-2 focus:ring-fintech-primary/30 focus:border-fintech-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl p-1 bg-fintech-bg border border-fintech-border text-xs">
            <button
              onClick={() => {
                setRiskFilter('all');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                riskFilter === 'all'
                  ? 'bg-white text-fintech-primary shadow-xs font-semibold'
                  : 'text-fintech-muted hover:text-fintech-text'
              }`}
            >
              All ({applications.length})
            </button>
            <button
              onClick={() => {
                setRiskFilter('low');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                riskFilter === 'low'
                  ? 'bg-emerald-50 text-emerald-700 shadow-xs font-semibold'
                  : 'text-fintech-muted hover:text-fintech-text'
              }`}
            >
              Low Risk
            </button>
            <button
              onClick={() => {
                setRiskFilter('high');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                riskFilter === 'high'
                  ? 'bg-rose-50 text-rose-700 shadow-xs font-semibold'
                  : 'text-fintech-muted hover:text-fintech-text'
              }`}
            >
              High Risk
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {paginatedData.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No applications match criteria"
              description="Try adjusting your search terms or filter settings."
              actionLabel="Clear filters"
              onAction={() => {
                setSearch('');
                setRiskFilter('all');
              }}
            />
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-fintech-border">
                <SortableHeader field="id" label="Application ID" currentSortField={sortField} currentSortOrder={sortOrder} onSort={toggleSort} />
                <SortableHeader field="age" label="Age" currentSortField={sortField} currentSortOrder={sortOrder} onSort={toggleSort} />
                <SortableHeader field="creditAmount" label="Credit Amount" currentSortField={sortField} currentSortOrder={sortOrder} onSort={toggleSort} />
                <SortableHeader field="duration" label="Duration" currentSortField={sortField} currentSortOrder={sortOrder} onSort={toggleSort} />
                <SortableHeader field="purpose" label="Loan Purpose" currentSortField={sortField} currentSortOrder={sortOrder} onSort={toggleSort} />
                <SortableHeader field="risk" label="Classification" currentSortField={sortField} currentSortOrder={sortOrder} onSort={toggleSort} />
                <SortableHeader field="dateAssessed" label="Date Assessed" currentSortField={sortField} currentSortOrder={sortOrder} onSort={toggleSort} />
                <th className="px-4 py-3 text-right text-xs font-semibold text-fintech-muted uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fintech-borderLight text-xs">
              {paginatedData.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-violet-50/20 transition-colors group cursor-pointer"
                  onClick={() => onSelectApplication && onSelectApplication(item)}
                >
                  <td className="px-4 py-3.5 font-semibold text-fintech-text flex items-center gap-2">
                    <span className="text-fintech-primary group-hover:underline">
                      {item.id}
                    </span>
                    {item.isDemo ? (
                      <span className="text-[10px] font-medium bg-slate-100 text-fintech-muted px-1.5 py-0.5 rounded">
                        Demo
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium bg-violet-100 text-fintech-primary px-1.5 py-0.5 rounded">
                        Live
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-fintech-text">{item.age} yrs</td>
                  <td className="px-4 py-3.5 font-semibold text-fintech-text">
                    {formatCurrency(item.creditAmount)}
                  </td>
                  <td className="px-4 py-3.5 text-fintech-muted">{item.duration} mos</td>
                  <td className="px-4 py-3.5">
                    <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 text-fintech-text text-[11px] font-medium">
                      {item.purpose}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <RiskBadge risk={item.risk} label={item.riskLabel} size="sm" />
                  </td>
                  <td className="px-4 py-3.5 text-fintech-muted">
                    {formatDate(item.dateAssessed)}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectApplication) {
                          onSelectApplication(item);
                        }
                      }}
                      className="text-fintech-primary hover:bg-violet-50"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="px-5 py-3 border-t border-fintech-border bg-slate-50/50 flex items-center justify-between text-xs text-fintech-muted">
        <div>
          Showing <span className="font-semibold text-fintech-text">{(page - 1) * pageSize + 1}</span> to{' '}
          <span className="font-semibold text-fintech-text">
            {Math.min(page * pageSize, filteredData.length)}
          </span>{' '}
          of <span className="font-semibold text-fintech-text">{filteredData.length}</span> applications
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-2 py-1"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="px-2 font-medium text-fintech-text">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-2 py-1"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
