import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
import {
  LineChart as ChartIcon,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { GERMAN_CREDIT_METADATA } from '../data/germanCreditData';
import { formatPercent } from '../utils/formatters';

export function ModelAnalytics() {
  const [selectedModelKey, setSelectedModelKey] = useState('randomForest');

  const modelsData = [
    { key: 'randomForest', name: 'Random Forest', accuracy: 1.00, displayAcc: '100%', fill: '#6C4CF1', status: 'Artifact (Target Leakage)' },
    { key: 'decisionTree', name: 'Decision Tree', accuracy: 1.00, displayAcc: '100%', fill: '#8B5CF6', status: 'Artifact (Target Leakage)' },
    { key: 'logisticRegression', name: 'Logistic Regression', accuracy: 0.98, displayAcc: '98%', fill: '#4285F4', status: 'Reported in Notebook' },
    { key: 'svm', name: 'SVM (RBF Kernel)', accuracy: 0.94, displayAcc: '94%', fill: '#10B981', status: 'Reported in Notebook' },
  ];

  const reportedModels = GERMAN_CREDIT_METADATA.reportedModelMetrics;
  const currentModel = reportedModels[selectedModelKey] || reportedModels.randomForest;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-violet-100 text-fintech-primary">
              <ChartIcon className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-fintech-primary">
              Notebook Benchmarks & Verification
            </span>
          </div>
          <h2 className="text-2xl font-bold text-fintech-text tracking-tight mt-1">
            Model Analytics & Evaluation
          </h2>
          <p className="text-xs text-fintech-muted mt-0.5">
            Compare reported test accuracy values, confusion matrices, and review the target leakage analysis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
            Notebook Test Split: 200 Samples (80/20)
          </span>
        </div>
      </div>

      {/* Prominent Educational Target Leakage Warning Box */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-2xl border-2 border-amber-300 shadow-sm space-y-3">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldAlert className="w-6 h-6 text-amber-800" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-amber-950">
                Critical Investigation: Why Decision Tree and Random Forest Report 100% Accuracy
              </h3>
              <span className="text-xs font-bold uppercase bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                Target Leakage Phenomenon
              </span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              In Cell 10 of the Google Colab notebook, the classification target was synthesized using the dataset median of <code className="bg-amber-200/80 px-1 py-0.5 rounded font-mono font-semibold">Credit amount</code>:
            </p>
            <div className="bg-white/80 p-2.5 rounded-lg border border-amber-300 font-mono text-xs text-slate-800 select-all">
              df["Risk"] = (df["Credit amount"] &gt; df["Credit amount"].median()).astype(int)
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              Because <strong className="text-amber-950">Credit amount</strong> was simultaneously retained as an input feature in <code className="bg-amber-200/80 px-1 py-0.5 rounded font-mono font-semibold">X</code>, the Decision Tree and Random Forest models trivialized the problem by simply learning a single binary split at <code className="bg-amber-200/80 px-1 py-0.5 rounded font-mono font-semibold">Credit amount &gt; 2320.0</code>. 
            </p>
            <p className="text-xs text-amber-900 leading-relaxed">
              <strong>Academic Integrity Notice:</strong> These results demonstrate flawless mathematical fit to the synthesized rule, but they <span className="underline decoration-amber-600 font-semibold">do not constitute proof of real-world credit default prediction performance</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Accuracy Comparison Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card
            title="Notebook Reported Accuracy Comparison"
            subtitle="Accuracies achieved on the 200-sample test set (train_test_split test_size=0.2, random_state=42)"
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modelsData} margin={{ top: 20, right: 20, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F7" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#182033', fontWeight: 500 }} tickLine={false} axisLine={{ stroke: '#E8EAF2' }} />
                  <YAxis domain={[0.8, 1.05]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tick={{ fontSize: 11, fill: '#778198' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-white p-3 rounded-xl border border-fintech-border shadow-modal text-xs space-y-1">
                            <p className="font-bold text-fintech-text">{item.name}</p>
                            <p className="text-fintech-primary font-semibold">Accuracy: {item.displayAcc}</p>
                            <p className="text-fintech-muted text-[11px]">{item.status}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                    {modelsData.map((entry) => (
                      <Cell
                        key={entry.key}
                        fill={entry.key === selectedModelKey ? '#5035C9' : entry.fill}
                        cursor="pointer"
                        onClick={() => setSelectedModelKey(entry.key)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-3 border-t border-fintech-borderLight flex flex-wrap items-center justify-between text-xs text-fintech-muted">
              <span>Click any bar or tab below to inspect detailed evaluation metrics.</span>
              <span className="font-mono text-fintech-text">Evaluation Metric: Scikit-Learn accuracy_score</span>
            </div>
          </Card>
        </div>

        {/* Training & Preprocessing Specs */}
        <div className="lg:col-span-1 space-y-4">
          <Card
            title="Experimentation Pipeline"
            subtitle="Parameters configured in the Colab notebook"
          >
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-fintech-bg rounded-xl border border-fintech-border">
                <span className="text-fintech-muted block text-[11px]">Dataset Split Ratio</span>
                <span className="font-bold text-fintech-text text-sm mt-0.5 block">
                  80% Train (800) / 20% Test (200)
                </span>
                <span className="text-[10px] text-fintech-subtle mt-1 block">
                  sklearn.model_selection.train_test_split(test_size=0.2, random_state=42)
                </span>
              </div>

              <div className="p-3 bg-fintech-bg rounded-xl border border-fintech-border">
                <span className="text-fintech-muted block text-[11px]">Feature Transformation</span>
                <span className="font-bold text-fintech-text text-sm mt-0.5 block">
                  StandardScaler + LabelEncoder
                </span>
                <span className="text-[10px] text-fintech-subtle mt-1 block">
                  Scaler fitted on X_train, transformed onto X_test
                </span>
              </div>

              <div className="p-3 bg-fintech-bg rounded-xl border border-fintech-border">
                <span className="text-fintech-muted block text-[11px]">Evaluated Target Definition</span>
                <span className="font-bold text-fintech-text text-sm mt-0.5 block">
                  Binary: Credit Amount &gt; $2,320
                </span>
                <span className="text-[10px] text-amber-700 mt-1 block">
                  Median of Credit Amount column (German Credit Dataset)
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Model Selection Tabs & Detailed Metric Inspection */}
      <Card
        title="Model Deep-Dive & Evaluation Inspection"
        subtitle="Select a classifier to inspect its verified metrics and confusion matrix"
      >
        {/* Model Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-fintech-borderLight">
          {modelsData.map((m) => (
            <button
              key={m.key}
              onClick={() => setSelectedModelKey(m.key)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                selectedModelKey === m.key
                  ? 'bg-fintech-primary text-white shadow-sm'
                  : 'bg-fintech-bg text-fintech-muted hover:text-fintech-text border border-fintech-border'
              }`}
            >
              {m.name} ({m.displayAcc})
            </button>
          ))}
        </div>

        {/* Selected Model Content */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50/80 rounded-xl border border-fintech-border">
            <div>
              <h4 className="text-base font-bold text-fintech-text flex items-center gap-2">
                {currentModel.name}
                <Badge variant="primary" size="sm">
                  {currentModel.status}
                </Badge>
              </h4>
              <p className="text-xs text-fintech-muted mt-1 leading-relaxed">
                {currentModel.description}
              </p>
            </div>
            <div className="text-right sm:border-l sm:border-fintech-border sm:pl-6">
              <span className="text-[11px] text-fintech-muted uppercase tracking-wider block">Reported Accuracy</span>
              <span className="text-3xl font-extrabold text-fintech-primary tracking-tight">
                {formatPercent(currentModel.accuracy, 0)}
              </span>
            </div>
          </div>

          {/* Conditional Display: Confusion Matrix and Classification Report */}
          {currentModel.confusionMatrix ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Confusion Matrix Heatmap */}
              <div className="p-5 bg-white rounded-xl border border-fintech-border space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-fintech-text">
                    Reported Confusion Matrix (Test Set N=200)
                  </h5>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    From Notebook Cell 21
                  </span>
                </div>

                <div className="pt-2">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div></div>
                    <div className="font-semibold text-fintech-muted pb-1">Pred: Low (0)</div>
                    <div className="font-semibold text-fintech-muted pb-1">Pred: High (1)</div>

                    <div className="font-semibold text-fintech-muted self-center text-left">
                      Actual: Low (0)
                    </div>
                    <div className="p-4 rounded-xl bg-violet-600 text-white font-extrabold text-lg shadow-xs">
                      106
                      <span className="block text-[10px] font-normal opacity-90">True Neg (TN)</span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-100 text-fintech-muted font-bold text-lg border border-fintech-border">
                      0
                      <span className="block text-[10px] font-normal">False Pos (FP)</span>
                    </div>

                    <div className="font-semibold text-fintech-muted self-center text-left">
                      Actual: High (1)
                    </div>
                    <div className="p-4 rounded-xl bg-slate-100 text-fintech-muted font-bold text-lg border border-fintech-border">
                      0
                      <span className="block text-[10px] font-normal">False Neg (FN)</span>
                    </div>
                    <div className="p-4 rounded-xl bg-violet-600 text-white font-extrabold text-lg shadow-xs">
                      94
                      <span className="block text-[10px] font-normal opacity-90">True Pos (TP)</span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-fintech-muted pt-2 border-t border-fintech-borderLight leading-relaxed">
                  Total test support: 106 actual Low-Risk applicants, 94 actual High-Risk applicants. Zero misclassifications due to direct credit threshold replication.
                </p>
              </div>

              {/* Classification Report Table */}
              <div className="p-5 bg-white rounded-xl border border-fintech-border space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-fintech-text">
                    Classification Report Metrics
                  </h5>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    From Notebook Cell 20
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-fintech-border text-fintech-muted">
                        <th className="py-2">Class</th>
                        <th className="py-2 text-right">Precision</th>
                        <th className="py-2 text-right">Recall</th>
                        <th className="py-2 text-right">F1-Score</th>
                        <th className="py-2 text-right">Support</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-fintech-borderLight font-mono">
                      <tr>
                        <td className="py-2 font-sans font-semibold text-emerald-700">Class 0 (Low)</td>
                        <td className="py-2 text-right font-bold text-fintech-text">1.00</td>
                        <td className="py-2 text-right font-bold text-fintech-text">1.00</td>
                        <td className="py-2 text-right font-bold text-fintech-text">1.00</td>
                        <td className="py-2 text-right text-fintech-muted">106</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-sans font-semibold text-rose-700">Class 1 (High)</td>
                        <td className="py-2 text-right font-bold text-fintech-text">1.00</td>
                        <td className="py-2 text-right font-bold text-fintech-text">1.00</td>
                        <td className="py-2 text-right font-bold text-fintech-text">1.00</td>
                        <td className="py-2 text-right text-fintech-muted">94</td>
                      </tr>
                      <tr className="bg-slate-50/80 font-bold font-sans">
                        <td className="py-2 text-fintech-text">Macro Average</td>
                        <td className="py-2 text-right font-mono">1.00</td>
                        <td className="py-2 text-right font-mono">1.00</td>
                        <td className="py-2 text-right font-mono">1.00</td>
                        <td className="py-2 text-right font-mono text-fintech-muted">200</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-[11px] text-fintech-muted pt-2 border-t border-fintech-borderLight leading-relaxed">
                  Metrics correspond to the 20% test partition evaluated in Scikit-Learn.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-fintech-border text-center space-y-2">
              <HelpCircle className="w-8 h-8 text-fintech-muted mx-auto" />
              <h5 className="text-sm font-semibold text-fintech-text">
                Full Confusion Matrix Not Computed in Original Notebook
              </h5>
              <p className="text-xs text-fintech-muted max-w-lg mx-auto leading-relaxed">
                The Colab notebook executed <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-slate-800">accuracy_score</code> for {currentModel.name} ({formatPercent(currentModel.accuracy, 0)}), but did not generate a classification report or confusion matrix for this specific model. In compliance with strict engineering integrity, we do not invent uncalculated values.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
