// Dataset Service providing filtered access, aggregations, and distribution calculations
// for the 1,000 German Credit Dataset records

import { GERMAN_CREDIT_RECORDS, GERMAN_CREDIT_METADATA } from '../data/germanCreditData';

export const datasetService = {
  getMetadata() {
    return GERMAN_CREDIT_METADATA;
  },

  getAllRecords() {
    return GERMAN_CREDIT_RECORDS;
  },

  /**
   * Risk Distribution (Low Risk vs High Risk)
   */
  getRiskDistribution(records = GERMAN_CREDIT_RECORDS) {
    let low = 0;
    let high = 0;
    records.forEach(r => {
      if (r.risk === 1 || r.riskLabel === 'High Risk') high++;
      else low++;
    });

    const total = records.length || 1;
    return [
      { name: 'Low Risk (Class 0)', value: low, count: low, percentage: ((low / total) * 100).toFixed(1), fill: '#10B981' },
      { name: 'High Risk (Class 1)', value: high, count: high, percentage: ((high / total) * 100).toFixed(1), fill: '#EF4444' }
    ];
  },

  /**
   * Credit Amount Distribution Brackets
   */
  getCreditAmountDistribution(records = GERMAN_CREDIT_RECORDS) {
    const brackets = [
      { range: '$250 - $1,500', min: 250, max: 1500, count: 0, lowRisk: 0, highRisk: 0 },
      { range: '$1,501 - $2,500', min: 1501, max: 2500, count: 0, lowRisk: 0, highRisk: 0 },
      { range: '$2,501 - $5,000', min: 2501, max: 5000, count: 0, lowRisk: 0, highRisk: 0 },
      { range: '$5,001 - $10,000', min: 5001, max: 10000, count: 0, lowRisk: 0, highRisk: 0 },
      { range: '$10,000+', min: 10001, max: 999999, count: 0, lowRisk: 0, highRisk: 0 },
    ];

    records.forEach(r => {
      const amt = Number(r.creditAmount);
      const b = brackets.find(br => amt >= br.min && amt <= br.max);
      if (b) {
        b.count++;
        if (r.risk === 1 || r.riskLabel === 'High Risk') b.highRisk++;
        else b.lowRisk++;
      }
    });

    return brackets;
  },

  /**
   * Loan Purpose Breakdown
   */
  getPurposeDistribution(records = GERMAN_CREDIT_RECORDS) {
    const purposeMap = {};
    records.forEach(r => {
      const p = r.purpose || 'Other';
      if (!purposeMap[p]) {
        purposeMap[p] = { purpose: p, count: 0, lowRisk: 0, highRisk: 0 };
      }
      purposeMap[p].count++;
      if (r.risk === 1 || r.riskLabel === 'High Risk') purposeMap[p].highRisk++;
      else purposeMap[p].lowRisk++;
    });

    return Object.values(purposeMap).sort((a, b) => b.count - a.count);
  },

  /**
   * Loan Duration Distribution Brackets (in months)
   */
  getDurationDistribution(records = GERMAN_CREDIT_RECORDS) {
    const brackets = [
      { bracket: '4 - 12 mos', min: 4, max: 12, count: 0, lowRisk: 0, highRisk: 0 },
      { bracket: '13 - 24 mos', min: 13, max: 24, count: 0, lowRisk: 0, highRisk: 0 },
      { bracket: '25 - 36 mos', min: 25, max: 36, count: 0, lowRisk: 0, highRisk: 0 },
      { bracket: '37 - 48 mos', min: 37, max: 48, count: 0, lowRisk: 0, highRisk: 0 },
      { bracket: '49 - 72 mos', min: 49, max: 72, count: 0, lowRisk: 0, highRisk: 0 }
    ];

    records.forEach(r => {
      const dur = Number(r.duration);
      const b = brackets.find(br => dur >= br.min && dur <= br.max);
      if (b) {
        b.count++;
        if (r.risk === 1 || r.riskLabel === 'High Risk') b.highRisk++;
        else b.lowRisk++;
      }
    });

    return brackets;
  },

  /**
   * Applicant Age Distribution Brackets
   */
  getAgeDistribution(records = GERMAN_CREDIT_RECORDS) {
    const brackets = [
      { bracket: '19 - 25 yrs', min: 19, max: 25, count: 0, lowRisk: 0, highRisk: 0 },
      { bracket: '26 - 35 yrs', min: 26, max: 35, count: 0, lowRisk: 0, highRisk: 0 },
      { bracket: '36 - 50 yrs', min: 36, max: 50, count: 0, lowRisk: 0, highRisk: 0 },
      { bracket: '51 - 65 yrs', min: 51, max: 65, count: 0, lowRisk: 0, highRisk: 0 },
      { bracket: '66 - 75 yrs', min: 66, max: 100, count: 0, lowRisk: 0, highRisk: 0 }
    ];

    records.forEach(r => {
      const age = Number(r.age);
      const b = brackets.find(br => age >= br.min && age <= br.max);
      if (b) {
        b.count++;
        if (r.risk === 1 || r.riskLabel === 'High Risk') b.highRisk++;
        else b.lowRisk++;
      }
    });

    return brackets;
  },

  /**
   * Missing Values breakdown
   */
  getMissingValuesSummary() {
    return [
      {
        column: 'Saving accounts',
        originalMissing: 183,
        percentage: 18.3,
        notebookImputation: 'Replaced with "unknown"',
        encodedValue: 'Code: 4 (alphabetical unknown)'
      },
      {
        column: 'Checking account',
        originalMissing: 394,
        percentage: 39.4,
        notebookImputation: 'Replaced with "unknown"',
        encodedValue: 'Code: 3 (alphabetical unknown)'
      },
      {
        column: 'Age, Sex, Job, Housing, Credit, Duration, Purpose',
        originalMissing: 0,
        percentage: 0.0,
        notebookImputation: 'No missing values detected',
        encodedValue: 'Standard encoding applied'
      }
    ];
  },

  /**
   * Query, filter, sort, and paginate records
   */
  queryRecords({
    records = GERMAN_CREDIT_RECORDS,
    search = '',
    riskFilter = 'all', // 'all', 'low', 'high'
    purposeFilter = 'all',
    housingFilter = 'all',
    sortBy = 'id',
    sortOrder = 'asc',
    page = 1,
    pageSize = 10
  }) {
    let filtered = [...records];

    // Search query
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(item => {
        return (
          (item.id && item.id.toLowerCase().includes(q)) ||
          (item.purpose && item.purpose.toLowerCase().includes(q)) ||
          (item.sex && item.sex.toLowerCase().includes(q)) ||
          (item.housing && item.housing.toLowerCase().includes(q)) ||
          String(item.age).includes(q) ||
          String(item.creditAmount).includes(q)
        );
      });
    }

    // Risk classification filter
    if (riskFilter === 'low') {
      filtered = filtered.filter(r => r.risk === 0 || r.riskLabel === 'Low Risk');
    } else if (riskFilter === 'high') {
      filtered = filtered.filter(r => r.risk === 1 || r.riskLabel === 'High Risk');
    }

    // Purpose filter
    if (purposeFilter !== 'all') {
      filtered = filtered.filter(r => r.purpose === purposeFilter);
    }

    // Housing filter
    if (housingFilter !== 'all') {
      filtered = filtered.filter(r => r.housing === housingFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'string') {
        const comp = valA.localeCompare(String(valB));
        return sortOrder === 'asc' ? comp : -comp;
      }

      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);

    return {
      items: paginatedItems,
      totalCount,
      totalPages,
      currentPage,
      pageSize
    };
  }
};
