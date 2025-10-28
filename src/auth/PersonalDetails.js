import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import '../styles/PersonalDetails.css';

const PersonalDetails = ({ onNext, formData = {}, setFormData = () => {} }) => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    defaultValues: formData.personalDtls || {}
  });

  const [gender, setGender] = useState(formData.personalDtls?.gender || 'M');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const stepData = { ...data, gender };

      // Save to localStorage
      localStorage.setItem('personalDetails', JSON.stringify(stepData));

      // Update parent state
      setFormData(prev => ({
        ...prev,
        personalDtls: stepData
      }));

      // Navigate to contact details
      navigate('/contact-details');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load saved data from localStorage
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('personalDetails');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        Object.keys(parsedData).forEach(key => {
          if (parsedData[key] !== undefined && parsedData[key] !== null) {
            let valueToSet = parsedData[key];
            if (key === 'dob' && valueToSet && !valueToSet.includes('-')) {
              // Convert old format (DD MM YYYY) to YYYY-MM-DD
              const parts = valueToSet.split(' ');
              if (parts.length === 3) {
                const [day, month, year] = parts.map(Number);
                valueToSet = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              }
            }
            setValue(key, valueToSet, { shouldValidate: true });
            if (key === 'gender') {
              setGender(parsedData[key]);
            }
          }
        });
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, [setValue]);

  // -------------------------------
  // DOB Validation for date picker (YYYY-MM-DD format)
  // -------------------------------
  const dobValidation = {
    required: 'Date of Birth is required',
    validate: {
      validDate: (value) => {
        if (!value) return 'Date of Birth is required';

        const [year, month, day] = value.split('-').map(Number);
        const date = new Date(year, month - 1, day);

        if (isNaN(date.getTime())) return 'Please enter a valid date';

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date > today) return 'Date of birth cannot be in the future';

        const minAgeDate = new Date(today);
        minAgeDate.setFullYear(today.getFullYear() - 18);
        if (date > minAgeDate) return 'You must be at least 18 years old';

        return true;
      },
    },
  };

  // Dynamically set max date to today
  const today = new Date().toISOString().split('T')[0];

  // -------------------------------
  // PAN auto-format
  // -------------------------------
  const handlePanInput = (e) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    const formatted = value.split('').filter((char, i) => {
      if (i < 5) return /[A-Z]/.test(char);
      if (i < 9) return /\d/.test(char);
      return i === 9 && /[A-Z]/.test(char);
    }).join('');
    e.target.value = formatted;
    setValue('pan', formatted, { shouldValidate: true });
  };

  // -------------------------------
  // Validations for other fields
  // -------------------------------
  const titleValidation = {
    required: 'Title is required',
    validate: value =>
      ['Shri', 'Smt', 'Kum'].includes(value) || 'Please select a valid title'
  };

  const firstNameOptions = {
    required: 'First Name is required',
    pattern: {
      value: /^[A-Za-z\s]+$/,
      message: 'Please enter a valid name (letters and spaces only)'
    },
    maxLength: { value: 90, message: 'Maximum 90 characters allowed' }
  };

  const middleNameOptions = {
    pattern: { value: /^[A-Za-z\s]*$/, message: 'Please enter a valid name' },
    maxLength: { value: 90, message: 'Maximum 90 characters allowed' }
  };

  const lastNameOptions = {
    pattern: { value: /^[A-Za-z\s]*$/, message: 'Please enter a valid name' },
    maxLength: { value: 90, message: 'Maximum 90 characters allowed' }
  };

  const genderValidation = {
    required: 'Gender is required',
    validate: {
      validGender: value => ['M', 'F', 'T'].includes(value) || 'Please select a valid gender'
    }
  };

  const fathersNameOptions = {
    pattern: {
      value: /^[A-Za-z\s]*$/,
      message: 'Please enter a valid name (letters and spaces only)'
    },
    maxLength: { value: 90, message: 'Maximum 90 characters allowed' },
    validate: (value, formValues) => {
      const motherName = formValues.mothersFirstName;
      if (!value?.trim() && !motherName?.trim()) {
        return "Father's First Name is required if Mother's First Name is blank";
      }
      return true;
    }
  };

  const mothersNameOptions = {
    pattern: {
      value: /^[A-Za-z\s]*$/,
      message: 'Please enter a valid name (letters and spaces only)'
    },
    maxLength: { value: 90, message: 'Maximum 90 characters allowed' },
    validate: (value, formValues) => {
      const fatherName = formValues.fathersFirstName;
      if (!value?.trim() && !fatherName?.trim()) {
        return "Mother's First Name is required if Father's First Name is blank";
      }
      return true;
    }
  };

  const panValidation = {
    required: 'PAN is required',
    pattern: {
      value: /^[A-Z]{5}\d{4}[A-Z]{1}$/,
      message: 'Must be 5 letters + 4 digits + 1 letter'
    }
  };
  return (
    <div className='form-container'>
      <div className='form-header'>
        <h2>Registration (Step 1 of 6)</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='registration-form'>
        {/* Name Row */}
        <div className='form-row'>
          <div className='form-group title-group'>
            <label>Title <span className='required'>*</span></label>
            <select
              className={`form-control ${errors.title ? 'error' : ''}`}
              {...register('title', titleValidation)}
            >
              <option value=''>Select Title</option>
              <option value='Shri'>Shri</option>
              <option value='Smt'>Smt</option>
              <option value='Kum'>Kumari</option>
            </select>
            {errors.title && <span className='error-message'>{errors.title.message}</span>}
          </div>

          <div className='form-group'>
            <label>First Name <span className='required'>*</span></label>
            <input
              type='text'
              className={`form-control ${errors.firstName ? 'error' : ''}`}
              {...register('firstName', firstNameOptions)}
            />
            {errors.firstName && <span className='error-message'>{errors.firstName.message}</span>}
          </div>

          <div className='form-group'>
            <label>Middle Name</label>
            <input
              type='text'
              className={`form-control ${errors.middleName ? 'error' : ''}`}
              {...register('middleName', middleNameOptions)}
            />
            {errors.middleName && <span className='error-message'>{errors.middleName.message}</span>}
          </div>

          <div className='form-group'>
            <label>Last Name</label>
            <input
              type='text'
              className={`form-control ${errors.lastName ? 'error' : ''}`}
              {...register('lastName', lastNameOptions)}
            />
            {errors.lastName && <span className='error-message'>{errors.lastName.message}</span>}
          </div>
        </div>

        {/* DOB and Gender */}
        <div className='form-row'>
          <div className='form-group'>
            <label>Date of Birth <span className='required'>*</span></label>
            <input
              type='date'
              className={`form-control ${errors.dob ? 'error' : ''}`}
              max={today}
              {...register('dob', dobValidation)}
            />
            {errors.dob && <span className='error-message'>{errors.dob.message}</span>}
          </div>

          <div className='form-group'>
            <label>Gender <span className='required'>*</span></label>
            <select
              className={`form-control ${errors.gender ? 'error' : ''}`}
              value={gender}
              onChange={(e) => {
                const value = e.target.value;
                setGender(value);
                setValue('gender', value, { shouldValidate: true });
              }}
              {...register('gender', genderValidation)}
            >
              <option value=''>Select Gender</option>
              <option value='M'>M</option>
              <option value='F'>F</option>
              <option value='T'>T</option>
            </select>
            {errors.gender && <span className='error-message'>{errors.gender.message}</span>}
          </div>
        </div>

        {/* Parents' Names */}
        <div className='form-row'>
          <div className='form-group'>
            <label>Father's First Name</label>
            <input
              type='text'
              className={`form-control ${errors.fathersFirstName ? 'error' : ''}`}
              {...register('fathersFirstName', fathersNameOptions)}
            />
            {errors.fathersFirstName && <span className='error-message'>{errors.fathersFirstName.message}</span>}
          </div>

          <div className='form-group'>
            <label>Mother's First Name</label>
            <input
              type='text'
              className={`form-control ${errors.mothersFirstName ? 'error' : ''}`}
              {...register('mothersFirstName', mothersNameOptions)}
            />
            {errors.mothersFirstName && <span className='error-message'>{errors.mothersFirstName.message}</span>}
          </div>
        </div>

        {/* PAN Row */}
        <div className='form-row'>
          <div className='form-group'>
            <label>PAN Number <span className='required'>*</span></label>
            <div className='pan-input-container'>
              <input
                type='text'
                className={`form-control ${errors.pan ? 'error' : ''}`}
                placeholder='Enter PAN (e.g., ABCDE1234F)'
                onInput={handlePanInput}
                {...register('pan', panValidation)}
              />
              {errors.pan && <span className='error-message'>{errors.pan.message}</span>}
              <input type='hidden' value={formData.form60Flag || 'N'} {...register('form60Flag')} />
            </div>
          </div>
        </div>

        {/* Next Button */}
        <div className='form-actions'>
          <button type='submit' className='btn btn-primary' disabled={isSubmitting}>
            Next
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonalDetails;

