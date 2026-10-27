import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  Cpu,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { datasetService } from '../services/datasetService';
import { KpiCard } from '../components/dashboard/KpiCard';
import {
  RiskDistributionChart,
  CreditAmountChart,
  PurposeChart,
  DurationChart,
  AgeDistributionChart
} from '../components/dashboard/DashboardCharts';
import { RecentAssessmentsTable } from '../components/dashboard/RecentAssessmentsTable';
import { ApplicationDetailsDrawer } from '../components/common/ApplicationDetailsDrawer';
import { Button } from '../components/common/Button';
import { formatNumber } from '../utils/formatters';

export function Dashboard() {
  const navigate = useNavigate();
  const { applications, isBackendConnected } = useApp();
  const [selectedApp, setSelectedApp] = useState(null);

  // Calculate dynamic KPIs from applications
  const stats = useMemo(() => {
    let low = 0;
    let high = 0;
    applications.forEach(app => {
      if (app.risk === 1 || app.riskLabel === 'High Risk') high++;
      else low++;
    });

    const total = applications.length || 1;
    return {
      total: applications.length,
      low,
      high,
      lowPercent: ((low / total) * 100).toFixed(1),
      highPercent: ((high / total) * 100).toFixed(1)
    };
  }, [applications]);

  // Aggregated chart datasets
  const riskDistribution = useMemo(() => datasetService.getRiskDistribution(applications), [applications]);
  const creditDistribution = useMemo(() => datasetService.getCreditAmountDistribution(applications), [applications]);
  const purposeDistribution = useMemo(() => datasetService.getPurposeDistribution(applications), [applications]);
  const durationDistribution = useMemo(() => datasetService.getDurationDistribution(applications), [applications]);
  const ageDistribution = useMemo(() => datasetService.getAgeDistribution(applications), [applications]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Target Disclaimer Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-violet-50 via-purple-50 to-blue-50 rounded-2xl border border-violet-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-fintech-primary/10 text-fintech-primary flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-fintech-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-fintech-text">
                Experimental Model Context & College Project Scope
              </h2>
              <span className="text-[11px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                Target Leakage Advisory
              </span>
            </div>
            <p className="text-xs text-fintech-muted mt-1 leading-relaxed max-w-3xl">
              This application interfaces the German Credit Dataset and four classifiers from your Google Colab notebook. The classification target was created as <span className="font-mono font-semibold text-slate-800">Credit amount &gt; median ($2,320)</span>. Outputs reflect this experimental rule rather than a validated probability of loan default.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/prediction')}
            icon={Sparkles}
          >
            Predict New Risk
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/analytics')}
          >
            Review Leakage
          </Button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <KpiCard
          title="Total Applications Analyzed"
          value={formatNumber(stats.total)}
          subvalue="1,000 base + sessions"
          icon={FileText}
          trendLabel="German Credit Benchmark"
          badgeText={isBackendConnected ? "Live Backend" : "Demo Benchmark"}
          color="violet"
        />

        <KpiCard
          title="Low-Risk Classifications"
          value={formatNumber(stats.low)}
          subvalue={`${stats.lowPercent}%`}
          icon={ShieldCheck}
          trendLabel="Credit Amount <= $2,320"
          badgeText="Class 0 Target"
          color="emerald"
        />

        <KpiCard
          title="High-Risk Classifications"
          value={formatNumber(stats.high)}
          subvalue={`${stats.highPercent}%`}
          icon={AlertTriangle}
          trendLabel="Credit Amount > $2,320"
          badgeText="Class 1 Target"
          color="rose"
        />

        <KpiCard
          title="Active ML Models"
          value="4 Models"
          subvalue="Trained in Colab"
          icon={Cpu}
          trendLabel="RF: 100%, LR: 98%, SVM: 94%"
          badgeText="StandardScaler"
          color="blue"
        />
      </div>

      {/* Primary Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        <div className="lg:col-span-1">
          <RiskDistributionChart data={riskDistribution} />
        </div>
        <div className="lg:col-span-2">
          <CreditAmountChart data={creditDistribution} />
        </div>
      </div>

      {/* Secondary Charts: Purpose, Duration, Age */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        <div className="lg:col-span-1">
          <PurposeChart data={purposeDistribution} />
        </div>
        <div className="lg:col-span-1">
          <DurationChart data={durationDistribution} />
        </div>
        <div className="lg:col-span-1">
          <AgeDistributionChart data={ageDistribution} />
        </div>
      </div>

      {/* Recent Applications Ledger Table */}
      <RecentAssessmentsTable
        applications={applications}
        onSelectApplication={(app) => setSelectedApp(app)}
      />

      {/* Details Slide-out Drawer */}
      <ApplicationDetailsDrawer
        application={selectedApp}
        isOpen={Boolean(selectedApp)}
        onClose={() => setSelectedApp(null)}
      />
    </div>
  );
}
