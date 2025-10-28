import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/UploadDocuments.css';

const UploadDocument = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    photoFileData: '',
    signatureFileData: '',
    subscriberDeclaration: false,
  });

  const [errors, setErrors] = useState({});
  const [fileInfo, setFileInfo] = useState({
    photo: null,
    signature: null,
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const validateFile = (file, fieldName) => {
    const validationErrors = {};

    if (!file) {
      validationErrors[fieldName] = `${fieldName === 'photo' ? 'Photograph' : 'Signature'} is required`;
      return validationErrors;
    }

    if (file.type !== 'image/jpeg') {
      validationErrors[fieldName] = 'Only JPEG files are allowed';
      return validationErrors;
    }

    const fileSizeKB = file.size / 1024;
    // Update file size validation to accept up to 1MB
    if (fileSizeKB < 4 || fileSizeKB > 1024) {
      validationErrors[fieldName] = `File size must be between 4 KB - 1 MB (current: ${fileSizeKB.toFixed(2)} KB)`;
      return validationErrors;
    }

    return validationErrors;
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    const validationErrors = validateFile(file, fieldName);

    if (Object.keys(validationErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...validationErrors }));
      return;
    }

    // Create a new FileReader instance
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const base64String = reader.result.split(',')[1];
        
        // Update form data with base64 string
        const dataFieldName = fieldName === 'photo' ? 'photoFileData' : 'signatureFileData';
        setFormData(prev => ({
          ...prev,
          [dataFieldName]: base64String
        }));

        // Update file info for UI
        setFileInfo(prev => ({
          ...prev,
          [fieldName]: {
            name: file.name,
            size: (file.size / 1024).toFixed(2),
            type: file.type
          }
        }));

        // Clear any previous errors
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });

      } catch (error) {
        console.error('Error processing file:', error);
        setErrors(prev => ({
          ...prev,
          [fieldName]: 'Error processing file. Please try again.'
        }));
      }
    };

    reader.onerror = () => {
      setErrors(prev => ({
        ...prev,
        [fieldName]: 'Error reading file. Please try again.'
      }));
    };

    // Read the file as Data URL
    reader.readAsDataURL(file);
  };

  const handleCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      subscriberDeclaration: isChecked,
    }));
  };

  const validateForm = () => {
    const validationErrors = {};

    if (!formData.photoFileData) {
      validationErrors.photo = 'Photograph is required';
    }

    if (!formData.signatureFileData) {
      validationErrors.signature = 'Signature is required';
    }

    if (!formData.subscriberDeclaration) {
      validationErrors.declaration = 'You must agree to the declaration';
    }

    return validationErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      // Prepare data for storage
      const dataToSubmit = {
        photoSignatureDtls: {
          photoFileData: formData.photoFileData,
          signatureFileData: formData.signatureFileData,
        },
        personalDtls: {
          subscriberDeclaration: formData.subscriberDeclaration ? 'Y' : 'N',
        }
      };

      // Save to localStorage
      localStorage.setItem('uploadDocuments', JSON.stringify(dataToSubmit));
      
      // Show success modal
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error saving data:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Error saving data. Please try again.'
      }));
    }
  };

  const handleBack = () => {
    navigate('/nominee-details');
  };

  const handleSuccessModalClose = () => {
    // Clear all localStorage data
    localStorage.clear();
    // Navigate to register with fresh start
    navigate('/personal-details');
  };

  return (
    <>
      <div className="photo-signature-container">
        <form onSubmit={handleSubmit} className="registration-form">
          <div className="registration-header">
            <h1>Registration (Step 6 of 6)</h1>
          </div>
          <h2>Upload Photo & Signature</h2>

          <div className="upload-sections-wrapper">
            <div className="form-section file-upload-section">
              <label className="section-label">Upload your Photograph:</label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="photo-input"
                  accept="image/jpeg"
                  onChange={(e) => handleFileChange(e, 'photo')}
                  className="file-input"
                />
                <label htmlFor="photo-input" className="file-upload-button">
                  <span className="icon">+</span>
                  Upload Photo
                </label>
              </div>
              <p className="file-info">(JPEG, 4 KB - 1 MB)</p>
              {fileInfo.photo && (
                <p className="file-status">
                  ✓ {fileInfo.photo.name} ({fileInfo.photo.size} KB)
                </p>
              )}
              {errors.photo && <p className="error-message">{errors.photo}</p>}
            </div>

            <div className="form-section file-upload-section">
              <label className="section-label">Upload your Signature:</label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="signature-input"
                  accept="image/jpeg"
                  onChange={(e) => handleFileChange(e, 'signature')}
                  className="file-input"
                />
                <label htmlFor="signature-input" className="file-upload-button">
                  <span className="icon">+</span>
                  Upload Signature
                </label>
              </div>
              <p className="file-info">(JPEG, 4 KB - 1 MB)</p>
              {fileInfo.signature && (
                <p className="file-status">
                  ✓ {fileInfo.signature.name} ({fileInfo.signature.size} KB)
                </p>
              )}
              {errors.signature && <p className="error-message">{errors.signature}</p>}
            </div>
          </div>

          <div className="form-section checkbox-section">
            <label htmlFor="declaration-checkbox" className="checkbox-label">
              <input
                type="checkbox"
                id="declaration-checkbox"
                checked={formData.subscriberDeclaration}
                onChange={handleCheckboxChange}
                className="checkbox-input"
              />
              <span className="checkbox-text">
                I hereby declare that the information provided is true and accurate.
              </span>
            </label>
            {errors.declaration && (
              <p className="error-message">{errors.declaration}</p>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="button-secondary" onClick={handleBack}>
              Back
            </button>
            <button type="submit" className="button-primary">
              Submit Application
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal success-modal">
            <div className="success-icon">✓</div>
            <h2>Registration Successful!</h2>
            <p>Your application has been submitted successfully.</p>
            <button className="modal-button" onClick={handleSuccessModalClose}>
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default UploadDocument;