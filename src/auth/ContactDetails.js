import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ContactDetails.css';

const CITIZEN_OPTIONS = [
  { value: 'RI', label: 'Resident Indian' },
  { value: 'NRI', label: 'Non-Resident Indian' },
  { value: 'OCI', label: 'Overseas Citizen of India' }
];

const STATE_OPTIONS = [
  { code: '27', label: 'Maharashtra' },
  { code: '29', label: 'Karnataka' },
  { code: '07', label: 'Delhi (NCT)' },
  { code: '33', label: 'Tamil Nadu' },
  { code: '19', label: 'West Bengal' }
];

const sanitizeDigits = value => value.replace(/\D/g, '');
const sanitizeMobileInput = value => sanitizeDigits(value).slice(0, 14);
const sanitizePincodeInput = value => sanitizeDigits(value).slice(0, 6);

function Contactdetails({ mobile = '+91 98XXXXXX01', email = 'user@example.com', citizenFlag = 'RI' }) {
  const navigate = useNavigate();
  const [selectedCitizenFlag, setSelectedCitizenFlag] = useState(citizenFlag);
  const [personalDtls, setPersonalDtls] = useState({
    mobile: sanitizeMobileInput(String(mobile)),
    email: String(email).trim().slice(0, 80)
  });
  const [contactDtls, setContactDtls] = useState({
    pAddrLine1: '',
    pAddrLine2: '',
    pAddrLine4: '',
    pState: STATE_OPTIONS[0]?.code ?? '',
    pPincode: '',
    pCountry: 'IN'
  });
  const [correspondenceDtls, setCorrespondenceDtls] = useState({
    cAddrLine1: '',
    cAddrLine2: '',
    cAddrLine4: '',
    cState: '',
    cPostalCode: '',
    cCountry: ''
  });
  const [errors, setErrors] = useState({});
  const shouldShowOverseas = selectedCitizenFlag !== 'RI';

  const handleCitizenChange = event => {
    const value = event.target.value;
    setSelectedCitizenFlag(value);
  };

  const handlePersonalChange = event => {
    const { name, value } = event.target;
    if (name === 'mobile') {
      setPersonalDtls(previous => ({ ...previous, mobile: sanitizeMobileInput(value) }));
      return;
    }
    setPersonalDtls(previous => ({ ...previous, email: value.slice(0, 80) }));
  };

  const handleContactChange = event => {
    const { name, value } = event.target;
    if (name === 'pPincode') {
      setContactDtls(previous => ({ ...previous, [name]: sanitizePincodeInput(value) }));
      return;
    }
    setContactDtls(previous => ({ ...previous, [name]: value }));
  };

  const handleCorrespondenceChange = event => {
    const { name, value } = event.target;
    setCorrespondenceDtls(previous => ({ ...previous, [name]: value }));
  };

  const validate = () => {
    const validationErrors = {};
    
    // Mobile validation: Numeric only, 7-14 digits
    const mobileValue = personalDtls.mobile.trim();
    if (!mobileValue || !/^\d{7,14}$/.test(mobileValue)) {
      validationErrors.mobile = 'Mobile number must be between 7 and 14 digits.';
    }
    
    // Email validation: Valid format, max 80 chars
    const trimmedEmail = personalDtls.email.trim();
    if (!trimmedEmail || trimmedEmail.length > 80 || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmedEmail)) {
      validationErrors.email = 'Please enter a valid email address (maximum 80 characters).';
    }
    
    // Address Line 1 validation: Mandatory text field
    if (!contactDtls.pAddrLine1.trim()) {
      validationErrors.pAddrLine1 = 'Address Line 1 is required.';
    }
    
    // City/Town validation: Mandatory text field
    if (!contactDtls.pAddrLine4.trim()) {
      validationErrors.pAddrLine4 = 'City/Town is required.';
    }
    
    // State validation: Mandatory dropdown with state codes
    if (!contactDtls.pState || !STATE_OPTIONS.some(state => state.code === contactDtls.pState)) {
      validationErrors.pState = 'Please select a valid state.';
    }
    
    // Pincode validation: Mandatory 6 digits
    if (!contactDtls.pPincode || !/^\d{6}$/.test(contactDtls.pPincode)) {
      validationErrors.pPincode = 'Pincode must be exactly 6 digits.';
    }
    
    // Country validation: Mandatory, default IN (non-editable)
    if (!contactDtls.pCountry || (selectedCitizenFlag !== 'OCI' && contactDtls.pCountry !== 'IN')) {
      validationErrors.pCountry = 'Country must be IN for resident citizens.';
    }
    return validationErrors;
  };

  const handleSubmit = event => {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    const payload = {
      personalDtls: {
        mobile: personalDtls.mobile,
        email: personalDtls.email.trim()
      },
      contactDtls: {
        pAddrLine1: contactDtls.pAddrLine1.trim(),
        pAddrLine2: contactDtls.pAddrLine2.trim(),
        pAddrLine4: contactDtls.pAddrLine4.trim(),
        pState: contactDtls.pState,
        pPincode: contactDtls.pPincode,
        pCountry:
          selectedCitizenFlag === 'OCI'
            ? contactDtls.pCountry.trim().toUpperCase()
            : 'IN'
      }
    };
    if (shouldShowOverseas) {
      payload.contactDtls.cAddrLine1 = correspondenceDtls.cAddrLine1.trim();
      payload.contactDtls.cAddrLine2 = correspondenceDtls.cAddrLine2.trim();
      payload.contactDtls.cAddrLine4 = correspondenceDtls.cAddrLine4.trim();
      payload.contactDtls.cState = correspondenceDtls.cState.trim();
      payload.contactDtls.cPostalCode = correspondenceDtls.cPostalCode.trim();
      payload.contactDtls.cCountry = correspondenceDtls.cCountry.trim();
    }
    // Save to localStorage
    localStorage.setItem('contactDetails', JSON.stringify(payload));
    
    // Navigate to bank tax details
    navigate('/bank-tax-details');
  };

  const handleBack = () => {
    navigate('/register');
  };

  return (
    <div className="contact-details-wrapper">
      <form className="contact-details" onSubmit={handleSubmit} noValidate>
        <div className="contact-details__top">
          <h2 className="contact-details__step-heading">Registration (Step 2 of 6)</h2>
          <h1>Contact & Address</h1>
        </div>
        <div className="contact-details__top-row">
          <div className="contact-details__field">
            <label>
              <span className="label-text">Mobile <span className="required-asterisk" aria-hidden="true">*</span></span>
              <input
                name="mobile"
                value={personalDtls.mobile}
                onChange={handlePersonalChange}
                inputMode="numeric"
                maxLength={14}
              />
              {errors.mobile && <span className="contact-details__error">{errors.mobile}</span>}
            </label>
          </div>
          <div className="contact-details__field">
            <label>
              <span className="label-text">Email <span className="required-asterisk" aria-hidden="true">*</span></span>
              <input
                name="email"
                value={personalDtls.email}
                onChange={handlePersonalChange}
                type="email"
                maxLength={80}
              />
              {errors.email && <span className="contact-details__error">{errors.email}</span>}
            </label>
          </div>
          <div className="contact-details__field">
            <label>
              <span className="label-text">Citizen Type</span>
              <select value={selectedCitizenFlag} onChange={handleCitizenChange}>
                {CITIZEN_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      <section>
        <h2>Permanent (Indian) Address</h2>
        <div className="contact-details__group">
          <label>
            <span className="label-text">Address Line 1 <span className="required-asterisk" aria-hidden="true">*</span></span>
            <input name="pAddrLine1" value={contactDtls.pAddrLine1} onChange={handleContactChange} />
            {errors.pAddrLine1 && <span className="contact-details__error">{errors.pAddrLine1}</span>}
          </label>
          <label>
            Address Line 2
            <input name="pAddrLine2" value={contactDtls.pAddrLine2} onChange={handleContactChange} />
          </label>
          <label>
            <span className="label-text">City/Town <span className="required-asterisk" aria-hidden="true">*</span></span>
            <input name="pAddrLine4" value={contactDtls.pAddrLine4} onChange={handleContactChange} />
            {errors.pAddrLine4 && <span className="contact-details__error">{errors.pAddrLine4}</span>}
          </label>
          <label>
            <span className="label-text">State <span className="required-asterisk" aria-hidden="true">*</span></span>
            <select name="pState" value={contactDtls.pState} onChange={handleContactChange}>
              <option value="">Select State</option>
              {STATE_OPTIONS.map(state => (
                <option key={state.code} value={state.code}>
                  {state.label}
                </option>
              ))}
            </select>
            {errors.pState && <span className="contact-details__error">{errors.pState}</span>}
          </label>
          <label>
            <span className="label-text">Pincode <span className="required-asterisk" aria-hidden="true">*</span></span>
            <input
              name="pPincode"
              value={contactDtls.pPincode}
              onChange={handleContactChange}
              inputMode="numeric"
              maxLength={6}
            />
            {errors.pPincode && <span className="contact-details__error">{errors.pPincode}</span>}
          </label>
          <label>
            <span className="label-text">Country <span className="required-asterisk" aria-hidden="true">*</span></span>
            <input
              name="pCountry"
              value={contactDtls.pCountry}
              onChange={handleContactChange}
              readOnly={selectedCitizenFlag !== 'OCI'}
            />
            {errors.pCountry && <span className="contact-details__error">{errors.pCountry}</span>}
          </label>
        </div>
      </section>
      {shouldShowOverseas && (
        <section>
          <h2>Correspondence (Overseas) Address</h2>
          <div className="contact-details__group">
            <label>
              Address Line 1
              <input name="cAddrLine1" value={correspondenceDtls.cAddrLine1} onChange={handleCorrespondenceChange} />
            </label>
            <label>
              Address Line 2
              <input name="cAddrLine2" value={correspondenceDtls.cAddrLine2} onChange={handleCorrespondenceChange} />
            </label>
            <label>
              City/Town
              <input name="cAddrLine4" value={correspondenceDtls.cAddrLine4} onChange={handleCorrespondenceChange} />
            </label>
            <label>
              State/Province
              <input name="cState" value={correspondenceDtls.cState} onChange={handleCorrespondenceChange} />
            </label>
            <label>
              Postal Code
              <input name="cPostalCode" value={correspondenceDtls.cPostalCode} onChange={handleCorrespondenceChange} />
            </label>
            <label>
              Country
              <input name="cCountry" value={correspondenceDtls.cCountry} onChange={handleCorrespondenceChange} />
            </label>
          </div>
        </section>
      )}
      <div className="contact-details__footer">
        <button 
          type="button" 
          className="contact-details__back-button contact-details__back-button--footer"
          onClick={handleBack}
        >
          Back
        </button>
        <button type="submit" className="contact-details__next-button">
          Next: Bank Details
        </button>
      </div>
      </form>
    </div>
  );
}

export default Contactdetails;