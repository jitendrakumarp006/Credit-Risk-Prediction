import React from 'react';
import {
  AlertTriangle,
  CheckCircle,
  FileText,
  Layers,
  Printer,
  Save,
  RotateCcw
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { RiskBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { formatCurrency, formatDate, getJobTitle } from '../../utils/formatters';

export function PredictionResultModal({
  result,
  isOpen,
  onClose,
  onSaveToLedger,
  onResetForm,
  isSaved
}) {
  if (!result) return null;

  const isHighRisk = result.prediction === 1 || result.riskLabel === 'High Risk';
  const applicant = result.applicantData || {};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Credit Risk Assessment Report"
      subtitle={`Model: ${result.modelName} • Pipeline ${result.modelVersion}`}
      maxWidth="max-w-3xl"
      footer={
        <div className="flex flex-wrap items-center justify-between w-full gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onResetForm();
              onClose();
            }}
            icon={RotateCcw}
          >
            Reset Form
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.print()}
              icon={Printer}
            >
              Print Report
            </Button>
            <Button
              variant={isSaved ? "secondary" : "primary"}
              size="sm"
              onClick={onSaveToLedger}
              disabled={isSaved}
              icon={Save}
            >
              {isSaved ? 'Saved to Applications' : 'Save Assessment'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Risk Classification Banner */}
        <div
          className={`p-5 rounded-2xl border flex items-start gap-4 ${
            isHighRisk
              ? 'bg-rose-50 border-rose-200 text-rose-950'
              : 'bg-emerald-50 border-emerald-200 text-emerald-950'
          }`}
        >
          <div
            className={`p-3 rounded-xl mt-0.5 ${
              isHighRisk ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
            }`}
          >
            {isHighRisk ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <CheckCircle className="w-6 h-6" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs uppercase tracking-wider font-bold">
                Model Classification Output
              </span>
              <RiskBadge risk={result.prediction} label={result.riskLabel} size="lg" />
            </div>

            <h3 className="text-xl font-bold mt-1 tracking-tight">
              {result.riskLabel} (Class {result.prediction})
            </h3>

            <p className="text-xs mt-2 leading-relaxed opacity-90">
              {result.explanation}
            </p>
          </div>
        </div>

        {/* Model Probabilities Breakdown (if exposed by Scikit-Learn model) */}
        {result.probabilities && (
          <div className="p-4 bg-white rounded-xl border border-fintech-border shadow-xs text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-fintech-text text-xs flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-fintech-primary" />
                Model Classification Scores (predict_proba)
              </span>
              <span className="text-[10px] text-fintech-muted font-mono">
                Class 0: {(result.probabilities.class_0_score * 100).toFixed(1)}% | Class 1: {(result.probabilities.class_1_score * 100).toFixed(1)}%
              </span>
            </div>
            
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${result.probabilities.class_0_score * 100}%` }}
                className="bg-emerald-500 h-full transition-all duration-500"
                title={`Low Risk Score: ${(result.probabilities.class_0_score * 100).toFixed(1)}%`}
              />
              <div
                style={{ width: `${result.probabilities.class_1_score * 100}%` }}
                className="bg-rose-500 h-full transition-all duration-500"
                title={`High Risk Score: ${(result.probabilities.class_1_score * 100).toFixed(1)}%`}
              />
            </div>

            <p className="text-[11px] text-fintech-muted italic">
              {result.probabilities.semantic_meaning}
            </p>
          </div>
        )}

        {/* Essential Academic Limitation Disclaimer */}
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Target Definition & Statistical Score Transparency</span>
          </div>
          <p className="leading-relaxed">
            The Google Colab training notebook created the target <code className="bg-amber-100/70 px-1 py-0.5 rounded text-amber-950">Risk</code> directly from whether Credit Amount exceeds the dataset median ($2,319.50).
          </p>
          <p className="text-amber-800">
            • <strong>Classification Meaning:</strong> Class 0 represents an applicant whose requested loan amount is at or below the experimental median threshold ($2,319.50), while Class 1 represents a loan above the median.
          </p>
          <p className="text-amber-800">
            • <strong>Experimental Model Scores:</strong> Any displayed classification scores represent model confidence for the experimental median-threshold split, not calibrated probabilities of loan default.
          </p>
          <p className="text-amber-800">
            • <strong>Production Underwriting Note:</strong> Commercial credit risk systems train on verified historical 90+ days past due (DPD) repayment delinquencies rather than loan amounts.
          </p>
        </div>

        {/* Applicant Input Summary */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-fintech-muted flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-fintech-primary" />
            Submitted Applicant Profile
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-fintech-bg rounded-xl border border-fintech-border">
              <span className="text-fintech-muted block text-[11px]">Age</span>
              <span className="font-semibold text-fintech-text text-sm mt-0.5 block">
                {applicant.age} yrs
              </span>
            </div>

            <div className="p-3 bg-fintech-bg rounded-xl border border-fintech-border">
              <span className="text-fintech-muted block text-[11px]">Sex</span>
              <span className="font-semibold text-fintech-text text-sm mt-0.5 block capitalize">
                {applicant.sex}
              </span>
            </div>

            <div className="p-3 bg-fintech-bg rounded-xl border border-fintech-border">
              <span className="text-fintech-muted block text-[11px]">Housing</span>
              <span className="font-semibold text-fintech-text text-sm mt-0.5 block capitalize">
                {applicant.housing}
              </span>
            </div>

            <div className="p-3 bg-fintech-bg rounded-xl border border-fintech-border">
              <span className="text-fintech-muted block text-[11px]">Job Code</span>
              <span className="font-semibold text-fintech-text text-xs mt-0.5 block truncate">
                {getJobTitle(applicant.job)}
              </span>
            </div>

            <div className="p-3 bg-fintech-bg rounded-xl border border-fintech-border">
              <span className="text-fintech-muted block text-[11px]">Credit Requested</span>
              <span className="font-bold text-fintech-primary text-sm mt-0.5 block">
                {formatCurrency(applicant.creditAmount)}
              </span>
            </div>

            <div className="p-3 bg-fintech-bg rounded-xl border border-fintech-border">
              <span className="text-fintech-muted block text-[11px]">Duration</span>
              <span className="font-semibold text-fintech-text text-sm mt-0.5 block">
                {applicant.duration} months
              </span>
            </div>

            <div className="p-3 bg-fintech-bg rounded-xl border border-fintech-border">
              <span className="text-fintech-muted block text-[11px]">Savings</span>
              <span className="font-semibold text-fintech-text text-sm mt-0.5 block capitalize">
                {applicant.savingAccounts}
              </span>
            </div>

            <div className="p-3 bg-fintech-bg rounded-xl border border-fintech-border">
              <span className="text-fintech-muted block text-[11px]">Checking</span>
              <span className="font-semibold text-fintech-text text-sm mt-0.5 block capitalize">
                {applicant.checkingAccount}
              </span>
            </div>
          </div>

          <div className="p-3 bg-fintech-bg rounded-xl border border-fintech-border text-xs flex items-center justify-between">
            <span className="text-fintech-muted">Loan Purpose Category:</span>
            <span className="font-semibold text-fintech-text capitalize bg-white px-2.5 py-1 rounded-lg border border-fintech-border">
              {applicant.purpose}
            </span>
          </div>
        </div>

        {/* Feature Vector Representation */}
        <div className="p-4 bg-slate-50/75 rounded-xl border border-fintech-border space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-fintech-text flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-fintech-primary" />
              Preprocessed Model Input Vector (LabelEncoded)
            </span>
            <span className="text-[11px] font-mono text-fintech-muted">
              StandardScaler input
            </span>
          </div>
          <div className="p-2.5 bg-white rounded-lg border border-fintech-border font-mono text-xs text-slate-700 overflow-x-auto select-all">
            [{result.encodedFeatures ? result.encodedFeatures.join(', ') : ''}]
          </div>
          <p className="text-[11px] text-fintech-muted">
            Vector order: [Age, Sex(0/1), Job(0-3), Housing(0-2), Saving(0-4), Checking(0-3), CreditAmount, Duration, Purpose(0-7)]
          </p>
        </div>

        {/* Model Execution Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1 border-t border-fintech-borderLight text-fintech-muted">
          <div>
            <span className="block text-[11px]">Evaluated Classifier:</span>
            <span className="font-semibold text-fintech-text">{result.modelName}</span>
          </div>
          <div>
            <span className="block text-[11px]">Reported Accuracy:</span>
            <span className="font-semibold text-emerald-600">{result.modelAccuracyReported}</span>
          </div>
          <div>
            <span className="block text-[11px]">Execution Source:</span>
            <span className={`font-semibold ${result.isDemo ? 'text-amber-700' : 'text-emerald-700'}`}>
              {result.isDemo ? 'Demo Client Engine' : 'Live FastAPI Backend'}
            </span>
          </div>
          <div>
            <span className="block text-[11px]">Execution Timestamp:</span>
            <span className="font-semibold text-fintech-text">{formatDate(result.timestamp)}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
