// Presets, notification events, and demo metadata

export const APPLICANT_PRESETS = [
  {
    id: 'colab-sample',
    title: 'Colab Notebook Sample (Cell 24)',
    subtitle: 'High Risk (> $2,320 median)',
    data: {
      age: 35,
      sex: 'male',
      job: 2,
      housing: 'own',
      savingAccounts: 'quite rich',
      checkingAccount: 'moderate',
      creditAmount: 5000,
      duration: 24,
      purpose: 'education'
    },
    notes: 'The exact test sample from Cell 24 of your Google Colab notebook.'
  },
  {
    id: 'low-risk-electronics',
    title: 'Low-Risk Consumer Loan',
    subtitle: 'Low Risk (<= $2,320 median)',
    data: {
      age: 42,
      sex: 'female',
      job: 2,
      housing: 'own',
      savingAccounts: 'rich',
      checkingAccount: 'rich',
      creditAmount: 1250,
      duration: 12,
      purpose: 'radio/TV'
    },
    notes: 'Modest loan amount with strong savings and checking balance.'
  },
  {
    id: 'young-car-loan',
    title: 'Young Applicant Car Loan',
    subtitle: 'High Risk (> $2,320 median)',
    data: {
      age: 23,
      sex: 'male',
      job: 1,
      housing: 'rent',
      savingAccounts: 'little',
      checkingAccount: 'little',
      creditAmount: 3800,
      duration: 36,
      purpose: 'car'
    },
    notes: 'Longer duration with entry-level job and higher credit requirement.'
  },
  {
    id: 'senior-repairs',
    title: 'Senior Citizen Home Repair',
    subtitle: 'Low Risk (<= $2,320 median)',
    data: {
      age: 65,
      sex: 'female',
      job: 3,
      housing: 'own',
      savingAccounts: 'moderate',
      checkingAccount: 'moderate',
      creditAmount: 2100,
      duration: 18,
      purpose: 'repairs'
    },
    notes: 'Sub-median credit amount with home ownership.'
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Experimental Model Active',
    message: 'Current risk predictions use the median Credit Amount ($2,320) demo target from the notebook.',
    time: 'Just now',
    type: 'warning',
    read: false
  },
  {
    id: 'notif-2',
    title: 'German Credit Dataset Loaded',
    message: '1,000 benchmark records successfully initialized in explorer and dashboard analytics.',
    time: '5 min ago',
    type: 'info',
    read: false
  },
  {
    id: 'notif-3',
    title: 'Backend Integration Ready',
    message: 'Running in frontend client mode. Connect a FastAPI or Flask endpoint in Settings.',
    time: '1 hour ago',
    type: 'info',
    read: true
  }
];

export const CURRENT_USER = {
  name: 'Lead Risk Analyst',
  role: 'Fintech Credit Specialist',
  avatar: 'CR',
  department: 'Credit Underwriting & Machine Learning'
};
