// Utility to export array of objects to CSV download

export function exportToCsv(data, filename = 'credit_risk_applications.csv') {
  if (!data || !data.length) return;

  const headers = [
    'Application ID',
    'Age',
    'Sex',
    'Job Code',
    'Housing',
    'Saving Accounts',
    'Checking Account',
    'Credit Amount',
    'Duration (Months)',
    'Purpose',
    'Risk Classification',
    'Risk Code',
    'Assessment Date',
    'Data Source'
  ];

  const rows = data.map(item => [
    item.id || '',
    item.age ?? '',
    item.sex || '',
    item.job ?? '',
    item.housing || '',
    item.savingAccounts || item.savingAccountsRaw || 'unknown',
    item.checkingAccount || item.checkingAccountRaw || 'unknown',
    item.creditAmount ?? '',
    item.duration ?? '',
    `"${(item.purpose || '').replace(/"/g, '""')}"`,
    item.riskLabel || (item.risk === 1 ? 'High Risk' : 'Low Risk'),
    item.risk ?? (item.riskLabel === 'High Risk' ? 1 : 0),
    item.dateAssessed || '',
    item.isDemo ? 'Demo Benchmark Data' : 'Live Assessment'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
