import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SchemeSelection.css';

const lifeCycleFunds = [
  { value: 'B', label: 'B - Balanced Life Cycle' },
  { value: 'A', label: 'A - Auto Moderate' },
  { value: 'L', label: 'L - Auto Conservative' },
  { value: 'H', label: 'H - Auto Aggressive' }
];

function SchemeSelection() {
  const navigate = useNavigate();
  const [schemeChoice, setSchemeChoice] = useState('');
  const [lifeCycleFund, setLifeCycleFund] = useState('B');

  const handleNext = (e) => {
    e.preventDefault();
    localStorage.setItem('schemeSelection', JSON.stringify({
      schemeChoice,
      lifeCycleFund
    }));
    navigate('/nominee-details');
  };

  const handleBack = () => {
    navigate('/bank-tax-details');
  };

  return (
    <div className="screen4-container">
      <div className="screen4-step">
        <div className="screen4-step-text">
          <span>Scheme Selection (Step 4 of 6)</span>
        </div>
      </div>
      <form className="screen4-form">
        <h1>Investment Scheme (Tier 1)</h1>
        <p className="screen4-subtitle">Choose your investment option:</p>
        <div className="screen4-choice-group">
          <label className="screen4-radio">
            <input
              type="radio"
              name="schemeChoice"
              value="auto"
              checked={schemeChoice === 'auto'}
              onChange={() => setSchemeChoice('auto')}
            />
            <span>Auto Choice</span>
          </label>
          <label className="screen4-radio">
            <input
              type="radio"
              name="schemeChoice"
              value="active"
              checked={schemeChoice === 'active'}
              onChange={() => setSchemeChoice('active')}
            />
            <span>Active Choice</span>
          </label>
        </div>
        {schemeChoice === 'auto' && (
          <div className="screen4-auto">
            <div className="screen4-auto-header">Auto Choice</div>
            <label className="screen4-select-label" htmlFor="lifeCycleFund">
              Select Life Cycle Fund:
            </label>
            <select
              id="lifeCycleFund"
              className="screen4-select"
              value={lifeCycleFund}
              onChange={(event) => setLifeCycleFund(event.target.value)}
            >
              {lifeCycleFunds.map((fund) => (
                <option key={fund.value} value={fund.value}>
                  {fund.label}
                </option>
              ))}
            </select>
            <p className="screen4-note">
              This choice will automatically allocate your funds across E, C, G.
            </p>
          </div>
        )}
        {schemeChoice === 'active' && (
          <div className="screen4-active" />
        )}
        <div className="screen4-buttons">
          <button type="button" className="screen4-back" onClick={handleBack}>&lt; Back</button>
          <button type="submit" className="screen4-next" onClick={handleNext}>
            Next: Add Nominees
          </button>
        </div>
      </form>
    </div>
  );
}

export default SchemeSelection;