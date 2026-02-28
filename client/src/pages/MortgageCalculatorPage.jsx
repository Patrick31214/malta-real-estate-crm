import { useState, useMemo } from 'react';
import { Calculator, Euro, Percent, Calendar, TrendingDown, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatEuro } from '../utils/formatCurrency';
import './MortgageCalculatorPage.css';

function MortgageCalculatorPage() {
  const [activeTab, setActiveTab] = useState('mortgage');
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

  const [investInputs, setInvestInputs] = useState({
    purchasePrice: 350000,
    rentalIncome: 1800,
    monthlyExpenses: 400,
    appreciationRate: 3,
    years: 10,
  });

  const investCalc = useMemo(() => {
    const price = parseFloat(investInputs.purchasePrice) || 0;
    const rent = parseFloat(investInputs.rentalIncome) || 0;
    const expenses = parseFloat(investInputs.monthlyExpenses) || 0;
    const appRate = parseFloat(investInputs.appreciationRate) / 100 || 0;
    const yrs = parseInt(investInputs.years) || 10;

    const annualRent = rent * 12;
    const annualExpenses = expenses * 12;
    const netIncome = annualRent - annualExpenses;
    const grossYield = price > 0 ? (annualRent / price) * 100 : 0;
    const netYield = price > 0 ? (netIncome / price) * 100 : 0;
    const roi = price > 0 ? (netIncome / price) * 100 : 0;
    const capRate = roi;
    const breakEven = netIncome > 0 ? price / netIncome : 0;

    const projections = Array.from({ length: yrs }, (_, i) => {
      const year = i + 1;
      const propValue = price * Math.pow(1 + appRate, year);
      const cumulativeRent = netIncome * year;
      return { year, propValue: Math.round(propValue / 1000), cumulativeRent: Math.round(cumulativeRent / 1000) };
    });

    return { annualRent, netIncome, grossYield, netYield, capRate, breakEven, projections };
  }, [investInputs]);

  const handleInvestChange = (e) => {
    setInvestInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="mortgage-page">
      <div className="mortgage-header-row">
        <div className="mortgage-title-group">
          <Calculator size={28} strokeWidth={1.75} style={{ color: 'var(--gold-primary)' }} />
          <div>
            <h1>Property Calculators</h1>
            <p className="mortgage-subtitle">Mortgage &amp; Investment calculations for Malta real estate</p>
          </div>
        </div>
      </div>

      <div className="mortgage-tabs">
        <button
          className={`mortgage-tab${activeTab === 'mortgage' ? ' active' : ''}`}
          onClick={() => setActiveTab('mortgage')}
        >
          <Calculator size={15} strokeWidth={1.75} /> Mortgage
        </button>
        <button
          className={`mortgage-tab${activeTab === 'investment' ? ' active' : ''}`}
          onClick={() => setActiveTab('investment')}
        >
          <TrendingUp size={15} strokeWidth={1.75} /> Investment
        </button>
      </div>

      {activeTab === 'investment' ? (
        <div className="mortgage-layout">
          <div className="card mortgage-inputs">
            <h3>Investment Details</h3>
            <div className="form-group">
              <label><Euro size={13} />Purchase Price (€)</label>
              <input className="form-input" type="number" name="purchasePrice" value={investInputs.purchasePrice} onChange={handleInvestChange} min={50000} step={5000} />
            </div>
            <div className="form-group">
              <label>Monthly Rental Income (€)</label>
              <input className="form-input" type="number" name="rentalIncome" value={investInputs.rentalIncome} onChange={handleInvestChange} min={0} step={50} />
            </div>
            <div className="form-group">
              <label>Monthly Expenses (€)</label>
              <input className="form-input" type="number" name="monthlyExpenses" value={investInputs.monthlyExpenses} onChange={handleInvestChange} min={0} step={50} />
            </div>
            <div className="form-group">
              <label><Percent size={13} />Annual Appreciation Rate (%)</label>
              <input className="form-input" type="number" name="appreciationRate" value={investInputs.appreciationRate} onChange={handleInvestChange} min={0} max={20} step={0.5} />
              <span className="input-helper">Malta average: 2% – 5% per year</span>
            </div>
            <div className="form-group">
              <label><Calendar size={13} />Projection Years</label>
              <input className="form-input" type="number" name="years" value={investInputs.years} onChange={handleInvestChange} min={1} max={30} step={1} />
            </div>
          </div>

          <div className="mortgage-results">
            <div className="card mortgage-summary">
              <div className="mortgage-monthly">
                <span className="mortgage-monthly-label">Gross Rental Yield</span>
                <span className="mortgage-monthly-value">{investCalc.grossYield.toFixed(2)}%</span>
              </div>
              <div className="mortgage-summary-grid">
                <div className="mortgage-summary-item">
                  <span className="summary-label">Net Yield</span>
                  <span className="summary-value">{investCalc.netYield.toFixed(2)}%</span>
                </div>
                <div className="mortgage-summary-item">
                  <span className="summary-label">Cap Rate</span>
                  <span className="summary-value">{investCalc.capRate.toFixed(2)}%</span>
                </div>
                <div className="mortgage-summary-item">
                  <span className="summary-label">Annual Net Income</span>
                  <span className="summary-value interest">€{Number(investCalc.netIncome).toLocaleString()}</span>
                </div>
                <div className="mortgage-summary-item">
                  <span className="summary-label">Break-even (years)</span>
                  <span className="summary-value total">{investCalc.breakEven > 0 ? investCalc.breakEven.toFixed(1) : '—'}</span>
                </div>
              </div>
            </div>

            {investCalc.projections.length > 0 && (
              <div className="card">
                <h3 style={{ marginBottom: 16, fontSize: 15, fontWeight: 700 }}>
                  {investInputs.years}-Year Property Value Projection
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={investCalc.projections} margin={{ top: 4, right: 8, bottom: 4, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} label={{ value: 'Year', position: 'insideBottomRight', offset: 0, fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} unit="k" />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: 8, fontSize: 12 }}
                      formatter={(v, n) => [`€${v}k`, n === 'propValue' ? 'Property Value' : 'Cumulative Net Rent']}
                    />
                    <Bar dataKey="propValue" fill="#D4AF37" name="propValue" radius={[4,4,0,0]} />
                    <Bar dataKey="cumulativeRent" fill="#1DB954" name="cumulativeRent" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
}

export default MortgageCalculatorPage;
