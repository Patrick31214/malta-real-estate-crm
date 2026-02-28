import { useState } from 'react';
import { Scale, Percent, AlertTriangle, CheckCircle, Info, Receipt, FileText, Lock, Flag } from 'lucide-react';
import { formatEuro } from '../utils/formatCurrency';
import './MaltaCompliancePage.css';

function VATCalculator() {
  const [inputs, setInputs] = useState({
    propertyPrice: 250000,
    buyerType: 'first_time',
    transactionType: 'purchase',
  });

  const handleChange = (e) => setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const price = parseFloat(inputs.propertyPrice) || 0;

  // Malta stamp duty rates (approximate)
  let stampDuty = 0;
  if (inputs.transactionType === 'purchase') {
    if (inputs.buyerType === 'first_time' && price <= 175000) {
      stampDuty = 0;
    } else if (inputs.buyerType === 'first_time') {
      stampDuty = (price - 175000) * 0.05;
    } else {
      stampDuty = price * 0.05;
    }
  }

  // VAT on property (Malta reduced rate for first residential use)
  const vatRate = inputs.buyerType === 'first_time' ? 0.05 : 0.18;
  const vatAmount = inputs.transactionType === 'new_build' ? price * vatRate : 0;

  // Agent commission (approx 5% + 18% VAT on commission)
  const agentCommissionBase = price * 0.05;
  const agentCommissionVAT = agentCommissionBase * 0.18;
  const totalAgentCommission = agentCommissionBase + agentCommissionVAT;

  // Notarial fees (approx 1–2% in Malta)
  const notarialFees = price * 0.015;

  const totalCost = price + stampDuty + vatAmount + totalAgentCommission + notarialFees;

  return (
    <div className="compliance-section">
      <h2><Percent size={20} strokeWidth={1.75} /> VAT &amp; Stamp Duty Calculator</h2>
      <p className="compliance-desc">
        Estimate the total acquisition costs for a Malta property transaction including stamp duty,
        VAT (where applicable), agent commission and notarial fees.
      </p>

      <div className="compliance-layout">
        <div className="card compliance-inputs">
          <div className="form-group">
            <label>Property Price (€)</label>
            <input
              className="form-input"
              type="number"
              name="propertyPrice"
              value={inputs.propertyPrice}
              onChange={handleChange}
              min={10000}
              step={5000}
            />
          </div>
          <div className="form-group">
            <label>Buyer Type</label>
            <select className="form-input" name="buyerType" value={inputs.buyerType} onChange={handleChange}>
              <option value="first_time">First-Time Buyer</option>
              <option value="second_property">Second Property / Investor</option>
            </select>
          </div>
          <div className="form-group">
            <label>Transaction Type</label>
            <select className="form-input" name="transactionType" value={inputs.transactionType} onChange={handleChange}>
              <option value="purchase">Resale Purchase</option>
              <option value="new_build">New Build (VAT applies)</option>
            </select>
          </div>
        </div>

        <div className="card compliance-results">
          <div className="vat-result-row main-price">
            <span>Property Price</span>
            <span>{formatEuro(price)}</span>
          </div>
          <div className="vat-result-row">
            <span>Stamp Duty</span>
            <span className={stampDuty === 0 ? 'zero-cost' : 'cost'}>{formatEuro(stampDuty)}</span>
          </div>
          {inputs.transactionType === 'new_build' && (
            <div className="vat-result-row">
              <span>VAT ({inputs.buyerType === 'first_time' ? '5%' : '18%'})</span>
              <span className="cost">{formatEuro(vatAmount)}</span>
            </div>
          )}
          <div className="vat-result-row">
            <span>Agent Commission (5% + 18% VAT)</span>
            <span className="cost">{formatEuro(totalAgentCommission)}</span>
          </div>
          <div className="vat-result-row">
            <span>Notarial Fees (~1.5%)</span>
            <span className="cost">{formatEuro(notarialFees)}</span>
          </div>
          <div className="vat-result-row total">
            <span><strong>Estimated Total Cost</strong></span>
            <span><strong>{formatEuro(totalCost)}</strong></span>
          </div>
        </div>
      </div>

      <div className="compliance-note">
        <Info size={16} strokeWidth={1.75} />
        <div>
          <strong>Malta Stamp Duty Notes:</strong> First-time buyers are exempt on the first €175,000.
          Standard rate is 5%. New buildings may be subject to 5% VAT for first-time buyers or 18% for investors.
          These are estimates — consult a Malta notary for exact figures.
        </div>
      </div>
    </div>
  );
}

const SAMPLE_AGENTS = [
  { id: 1, name: 'Mario Borg', license: 'EIRA-2024-001', expiry: '2025-06-15', status: 'active' },
  { id: 2, name: 'Anna Camilleri', license: 'EIRA-2023-042', expiry: '2024-12-31', status: 'expired' },
  { id: 3, name: 'Luca Farrugia', license: 'EIRA-2025-018', expiry: '2026-03-20', status: 'active' },
];

function EIRATracker() {
  const today = new Date();

  function getDaysUntilExpiry(dateStr) {
    const expiry = new Date(dateStr);
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="compliance-section">
      <h2><Scale size={20} strokeWidth={1.75} /> EIRA License Tracking</h2>
      <p className="compliance-desc">
        Track agent EIRA (Estate Industry Regulatory Authority) license numbers and expiry dates.
        Agents with licenses expiring within 30 days are highlighted.
      </p>

      <div className="table-container card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Agent Name</th>
              <th>EIRA License</th>
              <th>Expiry Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE_AGENTS.map(agent => {
              const days = getDaysUntilExpiry(agent.expiry);
              const isExpired = days < 0;
              const isExpiringSoon = days >= 0 && days <= 30;
              return (
                <tr key={agent.id}>
                  <td><strong>{agent.name}</strong></td>
                  <td><code className="license-code">{agent.license}</code></td>
                  <td>{agent.expiry}</td>
                  <td>
                    {isExpired ? (
                      <span className="eira-badge expired"><AlertTriangle size={12} /> Expired</span>
                    ) : isExpiringSoon ? (
                      <span className="eira-badge expiring"><AlertTriangle size={12} /> Expires in {days}d</span>
                    ) : (
                      <span className="eira-badge active"><CheckCircle size={12} /> Active</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const AML_CHECKLIST = [
  { id: 'passport', label: 'Valid Passport / National ID', category: 'Identity' },
  { id: 'address', label: 'Proof of Address (utility bill / bank statement, < 3 months)', category: 'Identity' },
  { id: 'funds', label: 'Source of Funds Declaration', category: 'Financial' },
  { id: 'bank', label: 'Bank Reference Letter', category: 'Financial' },
  { id: 'pep', label: 'PEP (Politically Exposed Person) Declaration', category: 'Compliance' },
  { id: 'sanctions', label: 'Sanctions Screening Completed', category: 'Compliance' },
];

function AMLChecklist() {
  const [checked, setChecked] = useState({});

  const toggle = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  const completedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="compliance-section">
      <h2><CheckCircle size={20} strokeWidth={1.75} /> AML / KYC Checklist</h2>
      <p className="compliance-desc">
        Anti-Money Laundering compliance checklist per client/transaction. All items must be
        completed before proceeding with a property transaction in Malta.
      </p>

      <div className="aml-progress">
        <span>{completedCount} / {AML_CHECKLIST.length} completed</span>
        <div className="aml-progress-bar">
          <div
            className="aml-progress-fill"
            style={{ width: `${(completedCount / AML_CHECKLIST.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="card aml-list">
        {['Identity', 'Financial', 'Compliance'].map(cat => (
          <div key={cat} className="aml-category">
            <div className="aml-category-label">{cat}</div>
            {AML_CHECKLIST.filter(item => item.category === cat).map(item => (
              <label key={item.id} className="aml-item">
                <input
                  type="checkbox"
                  checked={!!checked[item.id]}
                  onChange={() => toggle(item.id)}
                  className="aml-checkbox"
                />
                <span className={`aml-item-label${checked[item.id] ? ' checked' : ''}`}>
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MaltaCompliancePage() {
  const [tab, setTab] = useState('vat');

  return (
    <div className="compliance-page">
      <div className="compliance-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <Flag size={26} strokeWidth={1.75} style={{ color: 'var(--gold-primary)' }} />
          <h1>Malta Compliance</h1>
        </div>
        <p>AML/KYC, VAT Calculator, EIRA License Tracking</p>
      </div>

      <div className="compliance-tabs">
        {[
          { id: 'vat', label: 'VAT & Stamp Duty', icon: Receipt },
          { id: 'eira', label: 'EIRA Licenses', icon: FileText },
          { id: 'aml', label: 'AML / KYC', icon: Lock },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              className={`compliance-tab${tab === t.id ? ' active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <Icon size={14} strokeWidth={1.75} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'vat' && <VATCalculator />}
      {tab === 'eira' && <EIRATracker />}
      {tab === 'aml' && <AMLChecklist />}
    </div>
  );
}

export default MaltaCompliancePage;
