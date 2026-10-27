import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GERMAN_CREDIT_METADATA } from '../data/germanCreditData';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { RiskBadge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { SortableHeader } from '../components/common/SortableHeader';
import { ApplicationDetailsDrawer } from '../components/common/ApplicationDetailsDrawer';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportToCsv } from '../utils/exportCsv';

export function Applications() {
  const { applications, globalSearchQuery, setGlobalSearchQuery } = useApp();

  const [search, setSearch] = useState(globalSearchQuery || '');
  const [riskFilter, setRiskFilter] = useState('all');
  const [purposeFilter, setPurposeFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedApp, setSelectedApp] = useState(null);

  // Sync if globalSearchQuery changes
  React.useEffect(() => {
    if (globalSearchQuery !== undefined) {
      setSearch(globalSearchQuery);
      setPage(1);
    }
  }, [globalSearchQuery]);

  // Query and filter data
  const filteredData = useMemo(() => {
    let result = [...applications];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        item =>
          item.id.toLowerCase().includes(q) ||
          item.purpose.toLowerCase().includes(q) ||
          item.sex.toLowerCase().includes(q) ||
          String(item.age).includes(q) ||
          String(item.creditAmount).includes(q) ||
          (item.dateAssessed && item.dateAssessed.includes(q))
      );
    }

    if (riskFilter !== 'all') {
      result = result.filter(item =>
        riskFilter === 'high'
          ? item.risk === 1 || item.riskLabel === 'High Risk'
          : item.risk === 0 || item.riskLabel === 'Low Risk'
      );
    }

    if (purposeFilter !== 'all') {
      result = result.filter(item => item.purpose === purposeFilter);
    }

    if (durationFilter !== 'all') {
      result = result.filter(item => {
        const d = Number(item.duration);
        if (durationFilter === 'short') return d <= 12;
        if (durationFilter === 'medium') return d > 12 && d <= 36;
        if (durationFilter === 'long') return d > 36;
        return true;
      });
    }

    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'string') {
        const comp = valA.localeCompare(String(valB));
        return sortOrder === 'asc' ? comp : -comp;
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    return result;
  }, [applications, search, riskFilter, purposeFilter, durationFilter, sortField, sortOrder]);

  const totalCount = filteredData.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleExport = () => {
    exportToCsv(filteredData, `credit_risk_applications_filtered_${Date.now()}.csv`);
  };

  const resetAllFilters = () => {
    setSearch('');
    setGlobalSearchQuery('');
    setRiskFilter('all');
    setPurposeFilter('all');
    setDurationFilter('all');
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-violet-100 text-fintech-primary">
              <FileSpreadsheet className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-fintech-primary">
              Applications Registry
            </span>
          </div>
          <h2 className="text-2xl font-bold text-fintech-text tracking-tight mt-1">
            Credit Assessment Records
          </h2>
          <p className="text-xs text-fintech-muted mt-0.5">
            Audit, filter, and inspect applicant profiles evaluated under the German Credit model pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExport}
            icon={Download}
          >
            Export CSV ({totalCount})
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card padding="none">
        <div className="p-4 sm:p-5 border-b border-fintech-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Field */}
          <div className="relative">
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

          {/* Risk Classification Filter */}
          <div>
            <select
              value={riskFilter}
              onChange={(e) => {
                setRiskFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-fintech-bg border border-fintech-border text-xs rounded-xl px-3 py-2 text-fintech-text focus:outline-none focus:ring-2 focus:ring-fintech-primary/30 focus:border-fintech-primary"
            >
              <option value="all">All Classifications</option>
              <option value="low">Low Risk Only (Class 0)</option>
              <option value="high">High Risk Only (Class 1)</option>
            </select>
          </div>

          {/* Purpose Filter */}
          <div>
            <select
              value={purposeFilter}
              onChange={(e) => {
                setPurposeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-fintech-bg border border-fintech-border text-xs rounded-xl px-3 py-2 text-fintech-text capitalize focus:outline-none focus:ring-2 focus:ring-fintech-primary/30 focus:border-fintech-primary"
            >
              <option value="all">All Loan Purposes</option>
              {GERMAN_CREDIT_METADATA.categories.purpose.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Duration Filter */}
          <div className="flex items-center gap-2">
            <select
              value={durationFilter}
              onChange={(e) => {
                setDurationFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-fintech-bg border border-fintech-border text-xs rounded-xl px-3 py-2 text-fintech-text focus:outline-none focus:ring-2 focus:ring-fintech-primary/30 focus:border-fintech-primary"
            >
              <option value="all">All Durations</option>
              <option value="short">Short (&lt;= 12 months)</option>
              <option value="medium">Medium (13 - 36 months)</option>
              <option value="long">Long (&gt; 36 months)</option>
            </select>

            {(search || riskFilter !== 'all' || purposeFilter !== 'all' || durationFilter !== 'all') && (
              <button
                onClick={resetAllFilters}
                className="p-2 text-fintech-muted hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                title="Reset all filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Applications Data Table */}
        <div className="overflow-x-auto">
          {paginatedData.length === 0 ? (
            <div className="p-10">
              <EmptyState
                title="No credit applications match the filter criteria"
                description="Try clearing your search query or loosening the risk and purpose filters."
                actionLabel="Reset all filters"
                onAction={resetAllFilters}
              />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-fintech-border">
                  <SortableHeader field="id" label="Application ID" currentSortField={sortField} currentSortOrder={sortOrder} onSort={toggleSort} />
                  <SortableHeader field="age" label="Age" currentSortField={sortField} currentSortOrder={sortOrder} onSort={toggleSort} />
                  <SortableHeader field="sex" label="Sex" currentSortField={sortField} currentSortOrder={sortOrder} onSort={toggleSort} />
                  <SortableHeader field="housing" label="Housing" currentSortField={sortField} currentSortOrder={sortOrder} onSort={toggleSort} />
                  <SortableHeader field="creditAmount" label="Credit Amount" currentSortField={sortField} currentSortOrder={sortOrder} onSort={toggleSort} />
                  <SortableHeader field="duration" label="Duration" currentSortField={sortField} currentSortOrder={sortOrder} onSort={toggleSort} />
                  <SortableHeader field="purpose" label="Purpose" currentSortField={sortField} currentSortOrder={sortOrder} onSort={toggleSort} />
                  <SortableHeader field="risk" label="Risk Result" currentSortField={sortField} currentSortOrder={sortOrder} onSort={toggleSort} />
                  <SortableHeader field="dateAssessed" label="Date Assessed" currentSortField={sortField} currentSortOrder={sortOrder} onSort={toggleSort} />
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-fintech-muted uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fintech-borderLight text-xs">
                {paginatedData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-violet-50/20 transition-colors group cursor-pointer"
                    onClick={() => setSelectedApp(item)}
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
                    <td className="px-4 py-3.5 text-fintech-muted capitalize">{item.sex}</td>
                    <td className="px-4 py-3.5 text-fintech-muted capitalize">{item.housing}</td>
                    <td className="px-4 py-3.5 font-bold text-fintech-text">
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
                          setSelectedApp(item);
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

        {/* Pagination & Page Size Control Footer */}
        <div className="px-5 py-3.5 border-t border-fintech-border bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-fintech-muted">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-fintech-text">{(page - 1) * pageSize + 1}</strong> to{' '}
              <strong className="text-fintech-text">
                {Math.min(page * pageSize, totalCount)}
              </strong>{' '}
              of <strong className="text-fintech-text">{totalCount}</strong> applications
            </span>

            <div className="hidden sm:flex items-center gap-1.5 ml-2">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-white border border-fintech-border rounded-md px-2 py-0.5 text-xs text-fintech-text focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-2 py-1 text-xs"
            >
              First
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2 py-1"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-3 font-semibold text-fintech-text">
              {page} / {totalPages}
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
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="px-2 py-1 text-xs"
            >
              Last
            </Button>
          </div>
        </div>
      </Card>

      {/* Application Details Drawer */}
      <ApplicationDetailsDrawer
        application={selectedApp}
        isOpen={Boolean(selectedApp)}
        onClose={() => setSelectedApp(null)}
      />
    </div>
  );
}
