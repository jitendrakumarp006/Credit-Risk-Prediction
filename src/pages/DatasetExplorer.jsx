import React, { useState, useMemo } from 'react';
import {
  Database,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Shield
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { RiskBadge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { SortableHeader } from '../components/common/SortableHeader';
import { GERMAN_CREDIT_RECORDS, GERMAN_CREDIT_METADATA } from '../data/germanCreditData';
import { formatCurrency } from '../utils/formatters';
import { exportToCsv } from '../utils/exportCsv';

export function DatasetExplorer() {
  const [search, setSearch] = useState('');
  const [sexFilter, setSexFilter] = useState('all');
  const [housingFilter, setHousingFilter] = useState('all');
  const [purposeFilter, setPurposeFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const meta = GERMAN_CREDIT_METADATA;

  // Filter and sort
  const filteredData = useMemo(() => {
    let result = [...GERMAN_CREDIT_RECORDS];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        item =>
          item.id.toLowerCase().includes(q) ||
          item.purpose.toLowerCase().includes(q) ||
          item.sex.toLowerCase().includes(q) ||
          String(item.age).includes(q) ||
          String(item.creditAmount).includes(q)
      );
    }

    if (sexFilter !== 'all') {
      result = result.filter(item => item.sex === sexFilter);
    }

    if (housingFilter !== 'all') {
      result = result.filter(item => item.housing === housingFilter);
    }

    if (purposeFilter !== 'all') {
      result = result.filter(item => item.purpose === purposeFilter);
    }

    if (riskFilter !== 'all') {
      result = result.filter(item =>
        riskFilter === 'high' ? item.risk === 1 : item.risk === 0
      );
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
  }, [search, sexFilter, housingFilter, purposeFilter, riskFilter, sortField, sortOrder]);

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

  const handleDownloadCsv = () => {
    exportToCsv(GERMAN_CREDIT_RECORDS, 'german_credit_dataset_processed.csv');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-violet-100 text-fintech-primary">
              <Database className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-fintech-primary">
              Benchmark Dataset
            </span>
          </div>
          <h2 className="text-2xl font-bold text-fintech-text tracking-tight mt-1">
            German Credit Dataset Explorer
          </h2>
          <p className="text-xs text-fintech-muted mt-0.5">
            Inspect the 1,000 benchmark records, summary statistics, missing value distributions, and categorical distributions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownloadCsv}
            icon={Download}
          >
            Download CSV (1,000 Rows)
          </Button>
        </div>
      </div>

      {/* Dataset Dimension Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-fintech-border shadow-xs">
          <span className="text-xs text-fintech-muted font-medium">Dataset Rows</span>
          <p className="text-2xl font-bold text-fintech-text mt-1">1,000</p>
          <span className="text-[11px] text-emerald-600 font-medium">100% Loaded</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-fintech-border shadow-xs">
          <span className="text-xs text-fintech-muted font-medium">Cleaned Features</span>
          <p className="text-2xl font-bold text-fintech-text mt-1">10 Columns</p>
          <span className="text-[11px] text-fintech-muted">Dropped Unnamed: 0, added Risk</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-fintech-border shadow-xs">
          <span className="text-xs text-fintech-muted font-medium">Median Credit Amount</span>
          <p className="text-2xl font-bold text-fintech-primary mt-1">$2,320</p>
          <span className="text-[11px] text-amber-700 font-medium">Experimental Target Cutoff</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-fintech-border shadow-xs">
          <span className="text-xs text-fintech-muted font-medium">Missing Value Rate</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">577 / 1,000</p>
          <span className="text-[11px] text-fintech-muted">In Checking & Savings accounts</span>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="p-4 bg-blue-50/80 rounded-xl border border-blue-200 text-blue-900 text-xs flex items-start gap-3">
        <Shield className="w-4 h-4 text-fintech-accent flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Privacy & Research Data Ethics Note:</span> This dataset originates from the renowned German Credit research archive (Hans Hofmann, University of Hamburg / UCI Machine Learning Repository). It contains anonymized historical benchmark data and does not expose real personal customer identities.
        </div>
      </div>

      {/* Numerical Summary Statistics Table */}
      <Card
        title="Numerical Features Summary Statistics"
        subtitle="Distribution parameters calculated across all 1,000 records"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-fintech-border text-fintech-muted bg-slate-50/60">
                <th className="py-2.5 px-4">Feature Name</th>
                <th className="py-2.5 px-4 text-right">Min</th>
                <th className="py-2.5 px-4 text-right">Mean</th>
                <th className="py-2.5 px-4 text-right">Median</th>
                <th className="py-2.5 px-4 text-right">Max</th>
                <th className="py-2.5 px-4 text-right">Std Dev</th>
                <th className="py-2.5 px-4">Data Type & Scale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fintech-borderLight">
              <tr>
                <td className="py-3 px-4 font-bold text-fintech-text">Age</td>
                <td className="py-3 px-4 text-right font-mono">{meta.numericStats.age.min}</td>
                <td className="py-3 px-4 text-right font-mono">{meta.numericStats.age.mean} yrs</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-fintech-primary">{meta.numericStats.age.median} yrs</td>
                <td className="py-3 px-4 text-right font-mono">{meta.numericStats.age.max}</td>
                <td className="py-3 px-4 text-right font-mono">{meta.numericStats.age.stdev}</td>
                <td className="py-3 px-4 text-fintech-muted">Integer (StandardScaler)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-fintech-text">Credit amount</td>
                <td className="py-3 px-4 text-right font-mono">${meta.numericStats.creditAmount.min}</td>
                <td className="py-3 px-4 text-right font-mono">${meta.numericStats.creditAmount.mean}</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-amber-700">${meta.numericStats.creditAmount.median}</td>
                <td className="py-3 px-4 text-right font-mono">${meta.numericStats.creditAmount.max}</td>
                <td className="py-3 px-4 text-right font-mono">${meta.numericStats.creditAmount.stdev}</td>
                <td className="py-3 px-4 text-fintech-muted">Float / Currency (StandardScaler)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-fintech-text">Duration</td>
                <td className="py-3 px-4 text-right font-mono">{meta.numericStats.duration.min} mos</td>
                <td className="py-3 px-4 text-right font-mono">{meta.numericStats.duration.mean} mos</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-fintech-primary">{meta.numericStats.duration.median} mos</td>
                <td className="py-3 px-4 text-right font-mono">{meta.numericStats.duration.max} mos</td>
                <td className="py-3 px-4 text-right font-mono">{meta.numericStats.duration.stdev}</td>
                <td className="py-3 px-4 text-fintech-muted">Integer (Months, StandardScaler)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Missing Values Breakdown */}
      <Card
        title="Missing Values & Imputation Strategy"
        subtitle="Verification of null handling documented in Colab Cell 10"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-fintech-bg rounded-xl border border-fintech-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-fintech-text">Saving accounts</span>
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                183 Missing (18.3%)
              </span>
            </div>
            <p className="text-xs text-fintech-muted leading-relaxed">
              In Cell 10: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-slate-800">df["Saving accounts"].fillna("unknown")</code>. Encoded as alphabetical category 4 in LabelEncoder.
            </p>
          </div>

          <div className="p-4 bg-fintech-bg rounded-xl border border-fintech-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-fintech-text">Checking account</span>
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                394 Missing (39.4%)
              </span>
            </div>
            <p className="text-xs text-fintech-muted leading-relaxed">
              In Cell 10: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-slate-800">df["Checking account"].fillna("unknown")</code>. Encoded as alphabetical category 3 in LabelEncoder.
            </p>
          </div>
        </div>
      </Card>

      {/* Interactive Data Table with Filters */}
      <Card padding="none">
        <div className="p-4 sm:p-5 border-b border-fintech-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-1">
            <Search className="w-4 h-4 text-fintech-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search dataset..."
              className="w-full bg-fintech-bg border border-fintech-border text-xs rounded-xl pl-9 pr-3 py-2 text-fintech-text focus:outline-none focus:ring-2 focus:ring-fintech-primary/30"
            />
          </div>

          <div>
            <select
              value={sexFilter}
              onChange={(e) => {
                setSexFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-fintech-bg border border-fintech-border text-xs rounded-xl px-3 py-2 text-fintech-text focus:outline-none"
            >
              <option value="all">All Sex Categories</option>
              <option value="male">Male (690)</option>
              <option value="female">Female (310)</option>
            </select>
          </div>

          <div>
            <select
              value={housingFilter}
              onChange={(e) => {
                setHousingFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-fintech-bg border border-fintech-border text-xs rounded-xl px-3 py-2 text-fintech-text capitalize focus:outline-none"
            >
              <option value="all">All Housing Types</option>
              <option value="own">Own (713)</option>
              <option value="rent">Rent (179)</option>
              <option value="free">Free (108)</option>
            </select>
          </div>

          <div>
            <select
              value={purposeFilter}
              onChange={(e) => {
                setPurposeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-fintech-bg border border-fintech-border text-xs rounded-xl px-3 py-2 text-fintech-text capitalize focus:outline-none"
            >
              <option value="all">All Purposes</option>
              {meta.categories.purpose.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={riskFilter}
              onChange={(e) => {
                setRiskFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-fintech-bg border border-fintech-border text-xs rounded-xl px-3 py-2 text-fintech-text focus:outline-none"
            >
              <option value="all">All Risk Classes</option>
              <option value="low">Low Risk (&lt;= $2,320)</option>
              <option value="high">High Risk (&gt; $2,320)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {paginatedData.length === 0 ? (
            <div className="p-10">
              <EmptyState
                title="No rows match filter"
                description="Try resetting your dataset query filters."
                actionLabel="Clear filters"
                onAction={() => {
                  setSearch('');
                  setSexFilter('all');
                  setHousingFilter('all');
                  setPurposeFilter('all');
                  setRiskFilter('all');
                }}
              />
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-fintech-border">
                  <SortableHeader field="id" label="ID" currentSortField={sortField} currentSortOrder={sortOrder} onSort={toggleSort} />
                  <SortableHeader field="age" label="Age" currentSortField={sortField} currentSortOrder={sortOrder} onSort={toggleSort} />
                  <SortableHeader field="sex" label="Sex" currentSortField={sortField} currentSortOrder={sortOrder} onSort={toggleSort} />
                  <SortableHeader field="job" label="Job Code" currentSortField={sortField} currentSortOrder={sortOrder} onSort={toggleSort} />
                  <SortableHeader field="housing" label="Housing" currentSortField={sortField} currentSortOrder={sortOrder} onSort={toggleSort} />
                  <SortableHeader field="savingAccounts" label="Saving Acc" currentSortField={sortField} currentSortOrder={sortOrder} onSort={toggleSort} />
                  <SortableHeader field="checkingAccount" label="Checking Acc" currentSortField={sortField} currentSortOrder={sortOrder} onSort={toggleSort} />
                  <SortableHeader field="creditAmount" label="Credit Amt" currentSortField={sortField} currentSortOrder={sortOrder} onSort={toggleSort} />
                  <SortableHeader field="duration" label="Duration" currentSortField={sortField} currentSortOrder={sortOrder} onSort={toggleSort} />
                  <SortableHeader field="purpose" label="Purpose" currentSortField={sortField} currentSortOrder={sortOrder} onSort={toggleSort} />
                  <SortableHeader field="risk" label="Risk" currentSortField={sortField} currentSortOrder={sortOrder} onSort={toggleSort} />
                </tr>
              </thead>
              <tbody className="divide-y divide-fintech-borderLight">
                {paginatedData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-semibold text-fintech-primary">{row.id}</td>
                    <td className="px-4 py-3">{row.age}</td>
                    <td className="px-4 py-3 capitalize text-fintech-muted">{row.sex}</td>
                    <td className="px-4 py-3 font-mono">{row.job}</td>
                    <td className="px-4 py-3 capitalize">{row.housing}</td>
                    <td className="px-4 py-3 capitalize">
                      {row.savingAccountsRaw ? (
                        row.savingAccountsRaw
                      ) : (
                        <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[11px]">
                          unknown
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 capitalize">
                      {row.checkingAccountRaw ? (
                        row.checkingAccountRaw
                      ) : (
                        <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[11px]">
                          unknown
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold text-fintech-text">
                      {formatCurrency(row.creditAmount)}
                    </td>
                    <td className="px-4 py-3">{row.duration} mos</td>
                    <td className="px-4 py-3 capitalize">{row.purpose}</td>
                    <td className="px-4 py-3">
                      <RiskBadge risk={row.risk} label={row.riskLabel} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="px-5 py-3.5 border-t border-fintech-border bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-fintech-muted">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-fintech-text">{(page - 1) * pageSize + 1}</strong> to{' '}
              <strong className="text-fintech-text">
                {Math.min(page * pageSize, totalCount)}
              </strong>{' '}
              of <strong className="text-fintech-text">{totalCount}</strong> rows
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
              className="px-2 py-1"
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
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="px-2 py-1"
            >
              Last
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
