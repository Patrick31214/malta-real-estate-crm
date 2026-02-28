import { useState, useMemo } from 'react';
import { Calculator, Euro, Percent, Calendar, TrendingDown } from 'lucide-react';
import './MortgageCalculatorPage.css';

function formatEuro(n) {
  return '€' + Number(n).toLocaleString('en-MT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function MortgageCalculatorPage() {
  const [inputs, setInputs] = useState({
    propertyPrice: 350000,
    downPaymentPct: 10,
    interestRate: 3.5,
    loanTermYears: 25,
  });

  const calc = useMemo(() => {
    const price = parseFloat(inputs.propertyPrice) || 0;
    const dpPct = parseFloat(inputs.downPaymentPct) || 0;
    const rate = parseFloat(inputs.interestRate) || 0;
    const years = parseInt(inputs.loanTermYears) || 0;

    const downPayment = (price * dpPct) / 100;
    const principal = price - downPayment;
    const monthlyRate = rate / 100 / 12;
    const numPayments = years * 12;

    let monthlyPayment = 0;
    if (monthlyRate > 0 && numPayments > 0) {
      monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments))
        / (Math.pow(1 + monthlyRate, numPayments) - 1);
    } else if (numPayments > 0) {
      monthlyPayment = principal / numPayments;
    }

    const totalPaid = monthlyPayment * numPayments;
    const totalInterest = totalPaid - principal;

    // Simple amortization for year-by-year schedule (first 10 years)
    const schedule = [];
    let balance = principal;
    for (let y = 1; y <= Math.min(years, 10); y++) {
      let yearlyPrincipal = 0;
      let yearlyInterest = 0;
      for (let m = 0; m < 12; m++) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        yearlyInterest += interestPayment;
        yearlyPrincipal += principalPayment;
        balance = Math.max(0, balance - principalPayment);
      }
      schedule.push({ year: y, principal: yearlyPrincipal, interest: yearlyInterest, balance });
    }

    return { downPayment, principal, monthlyPayment, totalPaid, totalInterest, schedule };
  }, [inputs]);

  const handleChange = (e) => {
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const principalPct = calc.totalPaid > 0 ? (calc.principal / calc.totalPaid * 100) : 0;
  const interestPct = calc.totalPaid > 0 ? (calc.totalInterest / calc.totalPaid * 100) : 0;

  return (
    <div className="mortgage-page">
      <div className="mortgage-header-row">
        <div className="mortgage-title-group">
          <Calculator size={28} strokeWidth={1.75} style={{ color: 'var(--gold-primary)' }} />
          <div>
            <h1>Mortgage Calculator</h1>
            <p className="mortgage-subtitle">Malta property mortgage estimates with typical local rates</p>
          </div>
        </div>
      </div>

      <div className="mortgage-layout">
        {/* Inputs */}
        <div className="card mortgage-inputs">
          <h3>Loan Details</h3>

          <div className="form-group">
            <label><Euro size={13} strokeWidth={2} style={{marginRight:4}} />Property Price (€)</label>
            <input
              className="form-input"
              type="number"
              name="propertyPrice"
              value={inputs.propertyPrice}
              onChange={handleChange}
              min={50000}
              step={5000}
            />
          </div>

          <div className="form-group">
            <label><Percent size={13} strokeWidth={2} style={{marginRight:4}} />Down Payment (%)</label>
            <input
              className="form-input"
              type="number"
              name="downPaymentPct"
              value={inputs.downPaymentPct}
              onChange={handleChange}
              min={5}
              max={90}
              step={1}
            />
            <span className="input-helper">= {formatEuro(calc.downPayment)} upfront</span>
          </div>

          <div className="form-group">
            <label><TrendingDown size={13} strokeWidth={2} style={{marginRight:4}} />Annual Interest Rate (%)</label>
            <input
              className="form-input"
              type="number"
              name="interestRate"
              value={inputs.interestRate}
              onChange={handleChange}
              min={0.1}
              max={15}
              step={0.05}
            />
            <span className="input-helper">Typical Malta rate: 3.0% – 4.5%</span>
          </div>

          <div className="form-group">
            <label><Calendar size={13} strokeWidth={2} style={{marginRight:4}} />Loan Term (years)</label>
            <input
              className="form-input"
              type="number"
              name="loanTermYears"
              value={inputs.loanTermYears}
              onChange={handleChange}
              min={5}
              max={40}
              step={1}
            />
          </div>

          <div className="mortgage-disclaimer">
            <strong>Note:</strong> These are estimates only. Actual rates depend on your bank and credit profile.
            Malta banks typically offer up to 90% LTV for primary residences.
          </div>
        </div>

        {/* Results */}
        <div className="mortgage-results">
          <div className="card mortgage-summary">
            <div className="mortgage-monthly">
              <span className="mortgage-monthly-label">Monthly Payment</span>
              <span className="mortgage-monthly-value">{formatEuro(calc.monthlyPayment)}</span>
            </div>
            <div className="mortgage-summary-grid">
              <div className="mortgage-summary-item">
                <span className="summary-label">Loan Amount</span>
                <span className="summary-value">{formatEuro(calc.principal)}</span>
              </div>
              <div className="mortgage-summary-item">
                <span className="summary-label">Down Payment</span>
                <span className="summary-value">{formatEuro(calc.downPayment)}</span>
              </div>
              <div className="mortgage-summary-item">
                <span className="summary-label">Total Interest</span>
                <span className="summary-value interest">{formatEuro(calc.totalInterest)}</span>
              </div>
              <div className="mortgage-summary-item">
                <span className="summary-label">Total Cost</span>
                <span className="summary-value total">{formatEuro(calc.totalPaid + calc.downPayment)}</span>
              </div>
            </div>

            {/* Visual breakdown bar */}
            <div className="mortgage-breakdown">
              <div className="breakdown-label-row">
                <span className="breakdown-label principal-label">Principal {principalPct.toFixed(0)}%</span>
                <span className="breakdown-label interest-label">Interest {interestPct.toFixed(0)}%</span>
              </div>
              <div className="breakdown-bar">
                <div className="breakdown-fill principal-fill" style={{ width: `${principalPct}%` }} />
                <div className="breakdown-fill interest-fill" style={{ width: `${interestPct}%` }} />
              </div>
            </div>
          </div>

          {/* Amortization table */}
          {calc.schedule.length > 0 && (
            <div className="card mortgage-schedule">
              <h3>Year-by-Year Schedule (first {calc.schedule.length} years)</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th>Principal Paid</th>
                      <th>Interest Paid</th>
                      <th>Remaining Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calc.schedule.map(row => (
                      <tr key={row.year}>
                        <td>{row.year}</td>
                        <td style={{ color: 'var(--green-primary)' }}>{formatEuro(row.principal)}</td>
                        <td style={{ color: 'var(--gold-primary)' }}>{formatEuro(row.interest)}</td>
                        <td>{formatEuro(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MortgageCalculatorPage;
