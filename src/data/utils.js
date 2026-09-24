/**
 * Utility functions for Utsav Vargani
 */

// Convert numbers to Indian Rupees in Words format
export function numberToWordsIndian(num) {
  if (num === null || num === undefined || isNaN(num) || num === 0) {
    return 'Zero Rupees Only';
  }

  const amount = Math.floor(Math.abs(num));
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
                'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertChunk(n) {
    let str = '';
    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      str += ones[n] + ' ';
    }
    return str.trim();
  }

  let result = '';

  const crore = Math.floor(amount / 10000000);
  let rem = amount % 10000000;

  const lakh = Math.floor(rem / 100000);
  rem %= 100000;

  const thousand = Math.floor(rem / 1000);
  rem %= 1000;

  const hundred = rem;

  if (crore > 0) {
    result += convertChunk(crore) + ' Crore ';
  }
  if (lakh > 0) {
    result += convertChunk(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    result += convertChunk(thousand) + ' Thousand ';
  }
  if (hundred > 0) {
    result += convertChunk(hundred);
  }

  result = result.trim();
  return result ? `${result} Rupees Only` : 'Zero Rupees Only';
}

// Format numbers as Indian Currency format (e.g. ₹1,24,500)
export function formatINR(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Calculate days difference from today
export function getDaysDifference(dateString) {
  if (!dateString) return null;
  const targetDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Format Date string nicely
export function formatDate(dateString) {
  if (!dateString) return '';
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-IN', options);
}

// Year-Wise Receipt Number Generator
export function generateNextReceiptNo(receipts = [], settings = {}, targetYear = null) {
  const selectedYear = targetYear || settings.year || new Date().getFullYear().toString();
  
  // Year-specific configuration lookup
  const yearConfigs = settings.yearConfigs || {};
  const yearCfg = yearConfigs[selectedYear] || {};

  const prefix = yearCfg.prefix || (settings.receiptPrefix ? settings.receiptPrefix.replace(/\d{4}/, selectedYear) : `VR-${selectedYear}-`);
  const startNo = Number(yearCfg.startingReceiptNo) || Number(settings.startingReceiptNo) || 1001;

  // Count receipts created for the target festival year or prefix
  const yearReceipts = receipts.filter(r => {
    if (!r.receiptNo) return false;
    return (
      r.receiptNo.startsWith(prefix) ||
      (r.date && r.date.startsWith(selectedYear)) ||
      r.receiptNo.includes(selectedYear)
    );
  });

  const nextSeq = startNo + yearReceipts.length;
  return `${prefix}${String(nextSeq).padStart(4, '0')}`;
}
