import React from 'react';
import {
  Info,
  ShieldAlert,
  Rocket,
  Award
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';

export function AboutProject() {
  const pipelineSteps = [
    {
      num: '01',
      title: 'Dataset Acquisition',
      desc: 'German Credit Data (1,000 records × 10 attributes) containing demographic & banking features.'
    },
    {
      num: '02',
      title: 'Data Cleaning',
      desc: 'Fill missing values in Saving accounts (183) & Checking account (394) with "unknown". Drop Unnamed: 0.'
    },
    {
      num: '03',
      title: 'Target Construction',
      desc: 'Experimental binary target Risk synthesized as (Credit amount > median $2,320).'
    },
    {
      num: '04',
      title: 'Categorical Encoding',
      desc: 'Scikit-Learn LabelEncoder applied to Sex, Housing, Saving accounts, Checking account, and Purpose.'
    },
    {
      num: '05',
      title: 'Train/Test Split',
      desc: '80% Training set (800 records) and 20% Test set (200 records) with random_state=42.'
    },
    {
      num: '06',
      title: 'Feature Scaling',
      desc: 'StandardScaler fitted onto X_train and applied to transform X_train and X_test identically.'
    },
    {
      num: '07',
      title: 'Model Training',
      desc: 'Four classifiers trained: Logistic Regression, Decision Tree, Random Forest, and SVM.'
    },
    {
      num: '08',
      title: 'Evaluation & Interface',
      desc: 'Evaluated accuracy scores, confusion matrix, and deployed to this interactive React frontend.'
    }
  ];

  const models = [
    {
      name: 'Random Forest Classifier',
      acc: '100% (Reported)',
      desc: 'Ensemble of 100 decision trees utilizing bagging. Achieved 100% test accuracy due to learning the Credit amount median split.',
      badge: 'Target Leakage Artifact'
    },
    {
      name: 'Decision Tree Classifier',
      acc: '100% (Reported)',
      desc: 'Single CART tree. Learned the single root-node decision threshold on Credit amount > 2320.0.',
      badge: 'Target Leakage Artifact'
    },
    {
      name: 'Logistic Regression',
      acc: '98% (Reported)',
      desc: 'Linear probability model optimizing log-odds. Slight variance on borderline credit values near $2,320.',
      badge: 'Linear Baseline'
    },
    {
      name: 'Support Vector Machine (SVM)',
      acc: '94% (Reported)',
      desc: 'RBF kernel maximum-margin classifier. Soft margin permits slight overlap on boundary applicants.',
      badge: 'Non-linear Kernel'
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-violet-100 text-fintech-primary">
              <Info className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-fintech-primary">
              College Project Documentation
            </span>
          </div>
          <h2 className="text-2xl font-bold text-fintech-text tracking-tight mt-1">
            Credit Risk Prediction Using Machine Learning
          </h2>
          <p className="text-xs text-fintech-muted mt-0.5">
            Comprehensive system documentation, end-to-end ML pipeline, architecture, and validation analysis.
          </p>
        </div>

        <Badge variant="primary" size="md">
          Academic Edition v1.0.0
        </Badge>
      </div>

      {/* Academic Disclaimer Callout */}
      <div className="p-5 bg-gradient-to-r from-violet-50 to-blue-50 rounded-2xl border border-violet-100 flex items-start gap-4 shadow-xs">
        <Award className="w-6 h-6 text-fintech-primary flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-fintech-text">
            Objective & Educational Motivation
          </h4>
          <p className="text-xs text-fintech-muted leading-relaxed">
            The objective of this project is to explore how machine learning classification algorithms (Logistic Regression, Decision Trees, Random Forests, and SVMs) can be trained on structured consumer credit data and deployed into a responsive, accessible fintech underwriting dashboard.
          </p>
          <p className="text-xs text-fintech-muted leading-relaxed font-medium">
            <strong>Important Operational Notice:</strong> This software is an educational prototype. It is not approved or calibrated for live commercial bank underwriting decisions.
          </p>
        </div>
      </div>

      {/* End-to-End Pipeline Workflow Cards */}
      <Card
        title="Machine Learning Pipeline Architecture"
        subtitle="Step-by-step data processing flow from raw CSV to client dashboard"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {pipelineSteps.map((step) => (
            <div
              key={step.num}
              className="p-4 rounded-xl border border-fintech-border bg-fintech-bg/50 space-y-2 relative group hover:border-fintech-primary transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-fintech-primary">
                  {step.num}
                </span>
                <span className="w-2 h-2 rounded-full bg-violet-300 group-hover:bg-fintech-primary transition-colors" />
              </div>
              <h5 className="text-xs font-bold text-fintech-text">{step.title}</h5>
              <p className="text-[11px] text-fintech-muted leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Trained Models Overview */}
      <Card
        title="Classifiers Trained in Google Colab"
        subtitle="Algorithmic principles and reported accuracy benchmarks"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {models.map((m) => (
            <div
              key={m.name}
              className="p-4 rounded-xl border border-fintech-border bg-white space-y-2 hover:shadow-xs transition-shadow"
            >
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-bold text-fintech-text">{m.name}</h5>
                <Badge variant={m.badge.includes('Leakage') ? 'warning' : 'primary'} size="sm">
                  {m.badge}
                </Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-fintech-muted">Reported Test Accuracy:</span>
                <span className="text-base font-extrabold text-fintech-primary">{m.acc}</span>
              </div>
              <p className="text-xs text-fintech-muted leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Target Leakage & Scientific Integrity Deep Dive */}
      <div className="p-5 bg-amber-50 rounded-2xl border border-amber-300 space-y-3">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <h4 className="text-sm font-bold text-amber-950">
              Why Decision Trees Achieved 100% Accuracy: The Target Leakage Explanation
            </h4>
            <p className="text-xs text-amber-900 leading-relaxed">
              In supervised learning, <em>target leakage</em> occurs when an input feature used during prediction directly contains or derives the target label. Because the notebook constructed <code className="bg-amber-200/80 px-1 py-0.5 rounded font-mono font-semibold text-amber-950">df["Risk"] = (df["Credit amount"] &gt; median)</code>, the feature <strong className="text-amber-950">Credit amount</strong> perfectly predicts the target with a single mathematical inequality.
            </p>
            <p className="text-xs text-amber-900 leading-relaxed">
              Highlighting this phenomenon in your project presentation demonstrates strong critical thinking, data science rigor, and engineering honesty.
            </p>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <Card title="Technology Stack & Frontend Frameworks">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-fintech-bg rounded-xl border border-fintech-border">
            <span className="text-fintech-muted block text-[11px]">Frontend Core</span>
            <span className="font-bold text-fintech-text mt-0.5 block">React 19 + Vite</span>
          </div>

          <div className="p-3 bg-fintech-bg rounded-xl border border-fintech-border">
            <span className="text-fintech-muted block text-[11px]">Design System</span>
            <span className="font-bold text-fintech-text mt-0.5 block">Tailwind CSS</span>
          </div>

          <div className="p-3 bg-fintech-bg rounded-xl border border-fintech-border">
            <span className="text-fintech-muted block text-[11px]">Visualizations</span>
            <span className="font-bold text-fintech-text mt-0.5 block">Recharts Responsive</span>
          </div>

          <div className="p-3 bg-fintech-bg rounded-xl border border-fintech-border">
            <span className="text-fintech-muted block text-[11px]">Iconography</span>
            <span className="font-bold text-fintech-text mt-0.5 block">Lucide React</span>
          </div>
        </div>
      </Card>

      {/* Future Roadmap */}
      <Card
        title="Recommended Roadmap for Real-World Deployment"
        subtitle="Upgrades required before deploying in a commercial banking environment"
      >
        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-3 p-3 bg-fintech-bg rounded-xl border border-fintech-border">
            <Rocket className="w-4 h-4 text-fintech-primary flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-fintech-text block">1. Genuine Default Target Integration</strong>
              <p className="text-fintech-muted mt-0.5">
                Utilize the authentic German Credit ground-truth target (Good credit vs Bad credit: 700 Good / 300 Bad) to predict real default propensity.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-fintech-bg rounded-xl border border-fintech-border">
            <Rocket className="w-4 h-4 text-fintech-primary flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-fintech-text block">2. Probability Calibration & Threshold Tuning</strong>
              <p className="text-fintech-muted mt-0.5">
                Calibrate probabilities using Platt Scaling or Isotonic Regression, optimizing approval thresholds against lending risk-tolerance curves.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-fintech-bg rounded-xl border border-fintech-border">
            <Rocket className="w-4 h-4 text-fintech-primary flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-fintech-text block">3. Explainable AI (SHAP & LIME)</strong>
              <p className="text-fintech-muted mt-0.5">
                Produce feature attribution water-fall plots explaining why an individual applicant was approved or denied to satisfy adverse action regulatory requirements.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
