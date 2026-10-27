import React from 'react';
import {
  User,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { Drawer } from './Drawer';
import { RiskBadge, Badge } from './Badge';
import { Button } from './Button';
import { formatCurrency, formatDate, getJobTitle } from '../../utils/formatters';

export function ApplicationDetailsDrawer({ application, isOpen, onClose }) {
  if (!application) return null;

  const isHighRisk = application.risk === 1 || application.riskLabel === 'High Risk';
  const medianThreshold = 2320;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span>Application {application.id}</span>
          {application.isDemo ? (
            <Badge variant="outline" size="sm" className="bg-slate-100 text-fintech-muted font-normal text-[11px]">
              Demo Benchmark
            </Badge>
          ) : (
            <Badge variant="primary" size="sm" className="text-[11px]">
              Live Assessment
            </Badge>
          )}
        </div>
      }
      subtitle={`Assessed on ${formatDate(application.dateAssessed)} • ${application.isDemo ? 'German Credit Dataset' : 'Live Inference Session'}`}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              window.print();
            }}
          >
            Print Profile
          </Button>
        </>
      }
    >
      {/* Classification Banner */}
      <div
        className={`p-4 rounded-xl border flex items-start gap-3.5 ${
          isHighRisk
            ? 'bg-rose-50/70 border-rose-200 text-rose-950'
            : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
        }`}
      >
        <div
          className={`p-2 rounded-xl mt-0.5 ${
            isHighRisk ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
          }`}
        >
          {isHighRisk ? (
            <AlertTriangle className="w-5 h-5" />
          ) : (
            <CheckCircle className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm">
              Classification: {application.riskLabel || (isHighRisk ? 'High Risk' : 'Low Risk')}
            </h4>
            <RiskBadge risk={application.risk} label={application.riskLabel} size="sm" />
          </div>
          <p className="text-xs mt-1 leading-relaxed opacity-90">
            {isHighRisk
              ? `Requested credit of ${formatCurrency(application.creditAmount)} exceeds the median benchmark of ${formatCurrency(medianThreshold)}. Assigned to High Risk (Class 1) under notebook target logic.`
              : `Requested credit of ${formatCurrency(application.creditAmount)} is at or below the median benchmark of ${formatCurrency(medianThreshold)}. Assigned to Low Risk (Class 0) under notebook target logic.`}
          </p>
        </div>
      </div>

      {/* Experimental Model Disclaimer */}
      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block">Academic Target Formulation Note</span>
          This prediction is based on the Google Colab experimental target (`Credit amount &gt; median`). It is an academic exercise and should not be used as an actuarially validated probability of default.
        </div>
      </div>

      {/* Applicant Demographic Details */}
      <div className="space-y-3">
        <h5 className="text-xs font-semibold uppercase tracking-wider text-fintech-muted flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-fintech-primary" />
          Demographic Profile
        </h5>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-fintech-bg rounded-xl border border-fintech-border">
            <span className="text-fintech-muted block text-[11px]">Age</span>
            <span className="font-semibold text-fintech-text text-sm mt-0.5 block">
              {application.age} years old
            </span>
          </div>

          <div className="p-3 bg-fintech-bg rounded-xl border border-fintech-border">
            <span className="text-fintech-muted block text-[11px]">Sex</span>
            <span className="font-semibold text-fintech-text text-sm mt-0.5 block capitalize">
              {application.sex}
            </span>
          </div>

          <div className="p-3 bg-fintech-bg rounded-xl border border-fintech-border">
            <span className="text-fintech-muted block text-[11px]">Housing Status</span>
            <span className="font-semibold text-fintech-text text-sm mt-0.5 block capitalize">
              {application.housing}
            </span>
          </div>

          <div className="p-3 bg-fintech-bg rounded-xl border border-fintech-border">
            <span className="text-fintech-muted block text-[11px]">Employment (Job Code)</span>
            <span className="font-semibold text-fintech-text text-xs mt-0.5 block truncate">
              {getJobTitle(application.job)}
            </span>
          </div>
        </div>
      </div>

      {/* Financial & Loan Details */}
      <div className="space-y-3">
        <h5 className="text-xs font-semibold uppercase tracking-wider text-fintech-muted flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-fintech-primary" />
          Loan & Banking Information
        </h5>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-fintech-bg rounded-xl border border-fintech-border">
            <span className="text-fintech-muted block text-[11px]">Credit Amount</span>
            <span className="font-bold text-fintech-primary text-base mt-0.5 block">
              {formatCurrency(application.creditAmount)}
            </span>
          </div>

          <div className="p-3 bg-fintech-bg rounded-xl border border-fintech-border">
            <span className="text-fintech-muted block text-[11px]">Duration</span>
            <span className="font-semibold text-fintech-text text-sm mt-0.5 block">
              {application.duration} months
            </span>
          </div>

          <div className="p-3 bg-fintech-bg rounded-xl border border-fintech-border">
            <span className="text-fintech-muted block text-[11px]">Saving Accounts</span>
            <span className="font-semibold text-fintech-text text-sm mt-0.5 block capitalize">
              {application.savingAccounts || 'Unknown (Missing)'}
            </span>
          </div>

          <div className="p-3 bg-fintech-bg rounded-xl border border-fintech-border">
            <span className="text-fintech-muted block text-[11px]">Checking Account</span>
            <span className="font-semibold text-fintech-text text-sm mt-0.5 block capitalize">
              {application.checkingAccount || 'Unknown (Missing)'}
            </span>
          </div>
        </div>

        <div className="p-3 bg-fintech-bg rounded-xl border border-fintech-border text-xs">
          <span className="text-fintech-muted block text-[11px]">Declared Loan Purpose</span>
          <span className="font-semibold text-fintech-text text-sm mt-0.5 block capitalize">
            {application.purpose}
          </span>
        </div>
      </div>

      {/* Pipeline Feature Vector */}
      <div className="p-4 rounded-xl border border-fintech-border bg-slate-50/50 space-y-2">
        <h5 className="text-xs font-semibold uppercase tracking-wider text-fintech-muted flex items-center justify-between">
          <span>Notebook Feature Vector (X)</span>
          <span className="text-[10px] text-fintech-primary font-mono font-medium">9 Features</span>
        </h5>
        <p className="text-[11px] text-fintech-muted leading-relaxed">
          Order: Age, Sex, Job, Housing, Saving accounts, Checking account, Credit amount, Duration, Purpose.
        </p>
        <div className="bg-white p-2.5 rounded-lg border border-fintech-border font-mono text-[11px] text-slate-800 break-all select-all">
          [{application.age}, {application.sex === 'female' ? 0 : 1}, {application.job}, {application.housing === 'free' ? 0 : application.housing === 'own' ? 1 : 2}, {application.creditAmount}, {application.duration}]
        </div>
      </div>
    </Drawer>
  );
}
