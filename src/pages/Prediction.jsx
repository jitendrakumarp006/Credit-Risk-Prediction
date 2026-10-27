import React, { useState } from 'react';
import {
  Sparkles,
  RotateCcw,
  AlertCircle,
  AlertTriangle,
  User,
  DollarSign,
  Calendar
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { predictRisk, MODEL_CONFIGS } from '../services/predictionService';
import { GERMAN_CREDIT_METADATA } from '../data/germanCreditData';
import { APPLICANT_PRESETS } from '../data/demoData';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { PredictionResultModal } from '../components/prediction/PredictionResultModal';

const INITIAL_FORM = {
  age: 35,
  sex: 'male',
  job: 2,
  housing: 'own',
  savingAccounts: 'little',
  checkingAccount: 'moderate',
  creditAmount: 2500,
  duration: 24,
  purpose: 'car'
};

export function Prediction() {
  const { addApplication, activeModel, setActiveModel, isBackendConnected } = useApp();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Validate form inputs
  const validateForm = () => {
    const errs = {};

    const ageNum = Number(formData.age);
    if (!formData.age && formData.age !== 0) {
      errs.age = 'Age is required.';
    } else if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
      errs.age = 'Age must be between 18 and 100 years.';
    }

    if (!formData.sex) {
      errs.sex = 'Please select a sex.';
    } else if (!['male', 'female'].includes(formData.sex)) {
      errs.sex = 'Invalid category for sex.';
    }

    if (formData.job === '' || formData.job === null || formData.job === undefined) {
      errs.job = 'Job classification code is required.';
    } else if (![0, 1, 2, 3].includes(Number(formData.job))) {
      errs.job = 'Job code must be 0, 1, 2, or 3.';
    }

    if (!formData.housing) {
      errs.housing = 'Housing status is required.';
    } else if (!['own', 'rent', 'free'].includes(formData.housing)) {
      errs.housing = 'Invalid housing category.';
    }

    const creditNum = Number(formData.creditAmount);
    if (!formData.creditAmount) {
      errs.creditAmount = 'Credit amount is required.';
    } else if (isNaN(creditNum) || creditNum <= 0) {
      errs.creditAmount = 'Credit amount must be a positive number.';
    } else if (creditNum < 100 || creditNum > 50000) {
      errs.creditAmount = 'Credit amount must be between $100 and $50,000.';
    }

    const durationNum = Number(formData.duration);
    if (!formData.duration) {
      errs.duration = 'Loan duration is required.';
    } else if (isNaN(durationNum) || durationNum <= 0) {
      errs.duration = 'Duration must be a positive number.';
    } else if (durationNum < 4 || durationNum > 72) {
      errs.duration = 'Duration must be between 4 and 72 months.';
    }

    if (!formData.savingAccounts) {
      errs.savingAccounts = 'Saving accounts selection is required.';
    }

    if (!formData.checkingAccount) {
      errs.checkingAccount = 'Checking account selection is required.';
    }

    if (!formData.purpose) {
      errs.purpose = 'Loan purpose is required.';
    } else if (!GERMAN_CREDIT_METADATA.categories.purpose.includes(formData.purpose)) {
      errs.purpose = 'Selected purpose is not supported by the dataset.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const loadPreset = (preset) => {
    setFormData({ ...preset.data });
    setErrors({});
    setIsSaved(false);
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    setPredictionResult(null);
    setIsSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setIsSaved(false);

    try {
      const result = await predictRisk(formData, activeModel, true);
      setPredictionResult(result);
      setIsResultModalOpen(true);
    } catch (err) {
      setErrors({ form: err.message || 'Error occurred while computing prediction.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToLedger = () => {
    if (!predictionResult || isSaved) return;

    const newRecord = {
      id: predictionResult.id,
      age: Number(formData.age),
      sex: formData.sex,
      job: Number(formData.job),
      jobLabel: GERMAN_CREDIT_METADATA.categories.jobs.find(j => j.code === Number(formData.job))?.label || `Job ${formData.job}`,
      housing: formData.housing,
      savingAccounts: formData.savingAccounts,
      savingAccountsRaw: formData.savingAccounts === 'unknown' ? null : formData.savingAccounts,
      checkingAccount: formData.checkingAccount,
      checkingAccountRaw: formData.checkingAccount === 'unknown' ? null : formData.checkingAccount,
      creditAmount: Number(formData.creditAmount),
      duration: Number(formData.duration),
      purpose: formData.purpose,
      risk: predictionResult.prediction,
      riskLabel: predictionResult.riskLabel,
      dateAssessed: new Date().toISOString().split('T')[0],
      isDemo: !isBackendConnected
    };

    addApplication(newRecord);
    setIsSaved(true);
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-violet-100 text-fintech-primary">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-fintech-primary">
              Interactive Inference Engine
            </span>
          </div>
          <h2 className="text-2xl font-bold text-fintech-text tracking-tight mt-1">
            Credit Risk Prediction
          </h2>
          <p className="text-xs text-fintech-muted mt-0.5">
            Submit applicant demographic & financial indicators to evaluate credit risk through the trained machine learning pipeline.
          </p>
        </div>

        {/* Model Selection Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-fintech-border rounded-xl shadow-xs self-start">
          {Object.keys(MODEL_CONFIGS).map((modelKey) => (
            <button
              key={modelKey}
              type="button"
              onClick={() => setActiveModel(modelKey)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeModel === modelKey
                  ? 'bg-fintech-primary text-white font-semibold shadow-xs'
                  : 'text-fintech-muted hover:text-fintech-text hover:bg-slate-50'
              }`}
            >
              {modelKey}
            </button>
          ))}
        </div>
      </div>

      {/* Target Definition Advisory Callout */}
      <div className="p-4 bg-amber-50/90 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-amber-950">
            Current Target Definition Note:
          </p>
          <p className="leading-relaxed text-amber-800">
            The target in your Google Colab project was constructed by checking if <code className="bg-amber-100 font-mono px-1 py-0.5 rounded text-amber-950">Credit amount &gt; $2,320</code> (dataset median). All predictions represent this experimental split. No probability of default is fabricated.
          </p>
        </div>
      </div>

      {/* Quick-Fill Preset Samples */}
      <Card
        title="Quick-Fill Test Presets"
        subtitle="Load preconfigured applicant scenarios including the notebook's verified test sample"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {APPLICANT_PRESETS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => loadPreset(preset)}
              className="p-3.5 rounded-xl border border-fintech-border hover:border-fintech-primary hover:bg-violet-50/30 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-semibold text-fintech-text group-hover:text-fintech-primary block">
                  {preset.title}
                </span>
                <span className="text-[11px] font-medium text-fintech-muted mt-0.5 block">
                  {preset.subtitle}
                </span>
                <p className="text-[10px] text-fintech-subtle mt-1.5 leading-snug">
                  {preset.notes}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-fintech-borderLight flex items-center justify-between text-[11px] text-fintech-primary font-medium">
                <span>Load Values</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Main Prediction Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Demographics */}
        <Card
          title="1. Applicant Demographics"
          subtitle="Basic personal and employment classification characteristics"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Age */}
            <div>
              <label className="block text-xs font-semibold text-fintech-text mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-fintech-primary" />
                Applicant Age (Years) *
              </label>
              <input
                type="number"
                min="18"
                max="100"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                className={`w-full bg-fintech-bg border ${
                  errors.age ? 'border-rose-500 ring-1 ring-rose-500' : 'border-fintech-border'
                } rounded-xl px-3.5 py-2 text-xs text-fintech-text focus:outline-none focus:ring-2 focus:ring-fintech-primary/30 focus:border-fintech-primary transition-all`}
                placeholder="e.g. 35"
              />
              {errors.age && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.age}</p>
              )}
            </div>

            {/* Sex */}
            <div>
              <label className="block text-xs font-semibold text-fintech-text mb-1.5">
                Sex (Dataset Category) *
              </label>
              <select
                value={formData.sex}
                onChange={(e) => handleInputChange('sex', e.target.value)}
                className={`w-full bg-fintech-bg border ${
                  errors.sex ? 'border-rose-500 ring-1 ring-rose-500' : 'border-fintech-border'
                } rounded-xl px-3 py-2 text-xs text-fintech-text focus:outline-none focus:ring-2 focus:ring-fintech-primary/30 focus:border-fintech-primary transition-all`}
              >
                <option value="male">Male (69% in dataset)</option>
                <option value="female">Female (31% in dataset)</option>
              </select>
              {errors.sex && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.sex}</p>
              )}
            </div>

            {/* Job Code */}
            <div>
              <label className="block text-xs font-semibold text-fintech-text mb-1.5 flex items-center justify-between">
                <span>Job Classification (0-3) *</span>
                <span className="text-[10px] text-fintech-muted font-normal">Dataset Codes</span>
              </label>
              <select
                value={formData.job}
                onChange={(e) => handleInputChange('job', Number(e.target.value))}
                className={`w-full bg-fintech-bg border ${
                  errors.job ? 'border-rose-500 ring-1 ring-rose-500' : 'border-fintech-border'
                } rounded-xl px-3 py-2 text-xs text-fintech-text focus:outline-none focus:ring-2 focus:ring-fintech-primary/30 focus:border-fintech-primary transition-all`}
              >
                {GERMAN_CREDIT_METADATA.categories.jobs.map((job) => (
                  <option key={job.code} value={job.code}>
                    {job.label}
                  </option>
                ))}
              </select>
              {errors.job && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.job}</p>
              )}
            </div>

            {/* Housing */}
            <div>
              <label className="block text-xs font-semibold text-fintech-text mb-1.5">
                Housing Status *
              </label>
              <select
                value={formData.housing}
                onChange={(e) => handleInputChange('housing', e.target.value)}
                className={`w-full bg-fintech-bg border ${
                  errors.housing ? 'border-rose-500 ring-1 ring-rose-500' : 'border-fintech-border'
                } rounded-xl px-3 py-2 text-xs text-fintech-text focus:outline-none focus:ring-2 focus:ring-fintech-primary/30 focus:border-fintech-primary transition-all`}
              >
                <option value="own">Own (71.3% of applicants)</option>
                <option value="rent">Rent (17.9% of applicants)</option>
                <option value="free">Free / Government (10.8%)</option>
              </select>
              {errors.housing && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.housing}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Section 2: Banking & Loan Specifications */}
        <Card
          title="2. Financial Profile & Loan Terms"
          subtitle="Credit size, duration, account balances, and stated purpose"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Credit Amount */}
            <div>
              <label className="block text-xs font-semibold text-fintech-text mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-fintech-primary" />
                  Credit Amount ($) *
                </span>
                <span className="text-[10px] text-amber-700 font-mono">
                  Median: $2,320
                </span>
              </label>
              <input
                type="number"
                min="100"
                max="50000"
                step="50"
                value={formData.creditAmount}
                onChange={(e) => handleInputChange('creditAmount', e.target.value)}
                className={`w-full bg-fintech-bg border ${
                  errors.creditAmount ? 'border-rose-500 ring-1 ring-rose-500' : 'border-fintech-border'
                } rounded-xl px-3.5 py-2 text-xs text-fintech-text font-semibold focus:outline-none focus:ring-2 focus:ring-fintech-primary/30 focus:border-fintech-primary transition-all`}
                placeholder="e.g. 2500"
              />
              <p className="text-[10px] text-fintech-muted mt-1">
                Amounts &gt; $2,320 trigger High Risk in the experimental model.
              </p>
              {errors.creditAmount && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.creditAmount}</p>
              )}
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-semibold text-fintech-text mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-fintech-primary" />
                Duration (Months) *
              </label>
              <input
                type="number"
                min="4"
                max="72"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                className={`w-full bg-fintech-bg border ${
                  errors.duration ? 'border-rose-500 ring-1 ring-rose-500' : 'border-fintech-border'
                } rounded-xl px-3.5 py-2 text-xs text-fintech-text focus:outline-none focus:ring-2 focus:ring-fintech-primary/30 focus:border-fintech-primary transition-all`}
                placeholder="e.g. 24"
              />
              <p className="text-[10px] text-fintech-muted mt-1">
                Dataset range: 4 to 72 months (mean: 20.9 mos)
              </p>
              {errors.duration && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.duration}</p>
              )}
            </div>

            {/* Saving Accounts */}
            <div>
              <label className="block text-xs font-semibold text-fintech-text mb-1.5">
                Saving Accounts Balance *
              </label>
              <select
                value={formData.savingAccounts}
                onChange={(e) => handleInputChange('savingAccounts', e.target.value)}
                className={`w-full bg-fintech-bg border ${
                  errors.savingAccounts ? 'border-rose-500 ring-1 ring-rose-500' : 'border-fintech-border'
                } rounded-xl px-3 py-2 text-xs text-fintech-text focus:outline-none focus:ring-2 focus:ring-fintech-primary/30 focus:border-fintech-primary transition-all`}
              >
                <option value="little">Little (&lt; 100 DM)</option>
                <option value="moderate">Moderate (100 - 500 DM)</option>
                <option value="quite rich">Quite Rich (500 - 1,000 DM)</option>
                <option value="rich">Rich (&gt;= 1,000 DM)</option>
                <option value="unknown">Unknown (Missing in dataset)</option>
              </select>
              {errors.savingAccounts && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.savingAccounts}</p>
              )}
            </div>

            {/* Checking Account */}
            <div>
              <label className="block text-xs font-semibold text-fintech-text mb-1.5">
                Checking Account Balance *
              </label>
              <select
                value={formData.checkingAccount}
                onChange={(e) => handleInputChange('checkingAccount', e.target.value)}
                className={`w-full bg-fintech-bg border ${
                  errors.checkingAccount ? 'border-rose-500 ring-1 ring-rose-500' : 'border-fintech-border'
                } rounded-xl px-3 py-2 text-xs text-fintech-text focus:outline-none focus:ring-2 focus:ring-fintech-primary/30 focus:border-fintech-primary transition-all`}
              >
                <option value="little">Little (&lt; 0 DM / Overdraft)</option>
                <option value="moderate">Moderate (0 - 200 DM)</option>
                <option value="rich">Rich (&gt;= 200 DM)</option>
                <option value="unknown">Unknown (Missing in dataset)</option>
              </select>
              {errors.checkingAccount && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.checkingAccount}</p>
              )}
            </div>
          </div>

          {/* Stated Purpose Radio Cards */}
          <div className="mt-6 pt-5 border-t border-fintech-borderLight">
            <label className="block text-xs font-semibold text-fintech-text mb-2.5">
              Declared Loan Purpose Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {GERMAN_CREDIT_METADATA.categories.purpose.map((purposeCat) => {
                const isSelected = formData.purpose === purposeCat;
                return (
                  <div
                    key={purposeCat}
                    onClick={() => handleInputChange('purpose', purposeCat)}
                    className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-fintech-primary bg-violet-50 text-fintech-primary shadow-xs ring-1 ring-fintech-primary'
                        : 'border-fintech-border bg-fintech-bg text-fintech-text hover:bg-slate-100'
                    }`}
                  >
                    <span className="capitalize truncate">{purposeCat}</span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 ml-1.5 ${
                        isSelected
                          ? 'border-fintech-primary bg-fintech-primary'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                );
              })}
            </div>
            {errors.purpose && (
              <p className="text-[11px] text-rose-600 mt-2">{errors.purpose}</p>
            )}
          </div>
        </Card>

        {/* Global Error Notice */}
        {errors.form && (
          <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errors.form}</span>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-3 py-1 bg-white hover:bg-rose-100 border border-rose-300 rounded-lg text-rose-700 font-semibold text-xs transition-colors self-start sm:self-auto"
            >
              Retry Analysis
            </button>
          </div>
        )}

        {/* Submission Action Bar */}
        <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-xl border border-fintech-border shadow-xs">
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            disabled={isLoading}
            icon={RotateCcw}
          >
            Reset Form
          </Button>

          <div className="flex items-center gap-3">
            <span className="text-xs text-fintech-muted hidden sm:inline">
              Selected Model: <strong className="text-fintech-text">{activeModel}</strong>
            </span>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isLoading}
              icon={Sparkles}
            >
              Analyze Credit Profile
            </Button>
          </div>
        </div>
      </form>

      {/* Result Modal */}
      <PredictionResultModal
        result={predictionResult}
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        onSaveToLedger={handleSaveToLedger}
        onResetForm={handleReset}
        isSaved={isSaved}
      />
    </div>
  );
}
