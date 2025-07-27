import React, { useState } from 'react';
import { useAuth } from './AuthContext';

const formContainerStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000,
  padding: '20px',
};

const formStyle = {
  background: 'linear-gradient(135deg, #18181b 0%, #111 100%)',
  borderRadius: '16px',
  padding: '32px',
  maxWidth: '600px',
  width: '100%',
  maxHeight: '90vh',
  overflowY: 'auto',
  border: '2px solid #b91c1c',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
};

const stepIndicatorStyle = {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '24px',
  gap: '8px',
};

const stepDotStyle = (isActive, isCompleted) => ({
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  backgroundColor: isCompleted ? '#10b981' : isActive ? '#b91c1c' : '#374151',
  transition: 'all 0.3s ease',
});

const sectionStyle = {
  marginBottom: '24px',
};

const sectionTitleStyle = {
  color: '#ef4444',
  fontSize: '1.1rem',
  fontWeight: '700',
  marginBottom: '16px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const fieldGroupStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '16px',
  marginBottom: '16px',
};

const fieldStyle = {
  display: 'flex',
  flexDirection: 'column',
};

const labelStyle = {
  color: '#fff',
  fontSize: '0.9rem',
  fontWeight: '600',
  marginBottom: '6px',
};

const inputStyle = {
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #374151',
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  color: '#fff',
  fontSize: '0.9rem',
  transition: 'all 0.2s ease',
};

const textareaStyle = {
  ...inputStyle,
  minHeight: '80px',
  resize: 'vertical',
};

const buttonGroupStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '32px',
  gap: '16px',
};

const buttonStyle = (isPrimary = false) => ({
  padding: '12px 24px',
  borderRadius: '8px',
  border: 'none',
  fontSize: '0.9rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  background: isPrimary 
    ? 'linear-gradient(90deg, #b91c1c 0%, #ef4444 100%)'
    : 'rgba(255, 255, 255, 0.1)',
  color: isPrimary ? '#fff' : '#9ca3af',
  border: isPrimary ? 'none' : '1px solid #374151',
});

const ClaimProfileForm = ({ player, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal
    name: player?.name || '',
    nationality: '',
    yearOfBirth: '',
    height: '',
    weight: '',
    position: player?.position || '',
    
    // Academic
    gpa: '',
    creditHours: '',
    finances: '',
    available: '',
    
    // Athletic
    currentSchool: player?.team || '',
    divisionTransferringFrom: player?.league || '',
    yearsOfEligibilityLeft: '',
    individualAwards: '',
    collegeAccolades: '',
    
    // Contact
    emailAddress: '',
    highlights: '',
    fullGameLink: '',
    whyPlayerIsTransferring: '',
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // This will be handled by the parent component
    onComplete(formData);
  };

  const renderStep1 = () => (
    <>
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Personal Information</h3>
        <div style={fieldGroupStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              style={inputStyle}
              required
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Nationality</label>
            <input
              type="text"
              value={formData.nationality}
              onChange={(e) => updateField('nationality', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Year of Birth</label>
            <input
              type="number"
              value={formData.yearOfBirth}
              onChange={(e) => updateField('yearOfBirth', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Height</label>
            <input
              type="text"
              value={formData.height}
              onChange={(e) => updateField('height', e.target.value)}
              style={inputStyle}
              placeholder="e.g., 6'2&quot;"
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Weight (lbs)</label>
            <input
              type="number"
              value={formData.weight}
              onChange={(e) => updateField('weight', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Position *</label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => updateField('position', e.target.value)}
              style={inputStyle}
              required
            />
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Academic Information</h3>
        <div style={fieldGroupStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>GPA</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="4"
              value={formData.gpa}
              onChange={(e) => updateField('gpa', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Credit Hours Taken</label>
            <input
              type="number"
              value={formData.creditHours}
              onChange={(e) => updateField('creditHours', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Finances</label>
            <input
              type="text"
              value={formData.finances}
              onChange={(e) => updateField('finances', e.target.value)}
              style={inputStyle}
              placeholder="e.g., Need-based, Merit-based"
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Available</label>
            <input
              type="text"
              value={formData.available}
              onChange={(e) => updateField('available', e.target.value)}
              style={inputStyle}
              placeholder="e.g., Fall 2024, Spring 2025"
            />
          </div>
        </div>
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Athletic Information</h3>
        <div style={fieldGroupStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Current School *</label>
            <input
              type="text"
              value={formData.currentSchool}
              onChange={(e) => updateField('currentSchool', e.target.value)}
              style={inputStyle}
              required
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Division Transferring From *</label>
            <select
              value={formData.divisionTransferringFrom}
              onChange={(e) => updateField('divisionTransferringFrom', e.target.value)}
              style={inputStyle}
              required
            >
              <option value="">Select Division</option>
              <option value="NJCAA Division 1">NJCAA Division 1</option>
              <option value="NJCAA Division 2">NJCAA Division 2</option>
              <option value="NJCAA Division 3">NJCAA Division 3</option>
              <option value="NCAA Division 1">NCAA Division 1</option>
              <option value="NCAA Division 2">NCAA Division 2</option>
              <option value="NCAA Division 3">NCAA Division 3</option>
              <option value="NAIA">NAIA</option>
              <option value="CCCAA">CCCAA</option>
              <option value="NWAC">NWAC</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Years of Eligibility Left</label>
            <input
              type="text"
              value={formData.yearsOfEligibilityLeft}
              onChange={(e) => updateField('yearsOfEligibilityLeft', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Individual Awards</label>
            <textarea
              value={formData.individualAwards}
              onChange={(e) => updateField('individualAwards', e.target.value)}
              style={textareaStyle}
              placeholder="List any individual awards or honors..."
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>College Accolades</label>
            <textarea
              value={formData.collegeAccolades}
              onChange={(e) => updateField('collegeAccolades', e.target.value)}
              style={textareaStyle}
              placeholder="List any college accolades or achievements..."
            />
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Contact & Media</h3>
        <div style={fieldGroupStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Email Address *</label>
            <input
              type="email"
              value={formData.emailAddress}
              onChange={(e) => updateField('emailAddress', e.target.value)}
              style={inputStyle}
              required
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Highlights Link</label>
            <input
              type="url"
              value={formData.highlights}
              onChange={(e) => updateField('highlights', e.target.value)}
              style={inputStyle}
              placeholder="YouTube, Hudl, or other highlight video link"
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Full Game Link</label>
            <input
              type="url"
              value={formData.fullGameLink}
              onChange={(e) => updateField('fullGameLink', e.target.value)}
              style={inputStyle}
              placeholder="Link to full game footage"
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Profile Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  // Convert to base64 for storage
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    updateField('profilePhoto', e.target.result);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              style={{
                ...inputStyle,
                padding: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                border: '2px dashed #374151',
                cursor: 'pointer'
              }}
            />
            <small style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
              Upload a professional headshot or action photo (JPG, PNG)
            </small>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Why Are You Transferring?</label>
            <textarea
              value={formData.whyPlayerIsTransferring}
              onChange={(e) => updateField('whyPlayerIsTransferring', e.target.value)}
              style={textareaStyle}
              placeholder="Explain your reasons for transferring..."
            />
          </div>
        </div>
      </div>
    </>
  );

  const renderStep3 = () => (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎯</div>
      <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '16px' }}>
        Ready to Claim Your Profile?
      </h3>
      <p style={{ color: '#9ca3af', marginBottom: '32px', lineHeight: '1.6' }}>
        You're about to claim your profile and create your player account. 
        This will make your profile visible to coaches and allow you to manage your information.
      </p>
      <div style={{ background: 'rgba(185, 28, 28, 0.1)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
        <p style={{ color: '#ef4444', fontSize: '0.9rem', margin: 0 }}>
          <strong>Note:</strong> You'll need to create an account to complete the claim process.
        </p>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
  };

  return (
    <div style={formContainerStyle} onClick={onClose}>
      <div style={formStyle} onClick={(e) => e.stopPropagation()}>
        <div style={stepIndicatorStyle}>
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              style={stepDotStyle(currentStep === step, currentStep > step)}
            />
          ))}
        </div>

        {renderCurrentStep()}

        <div style={buttonGroupStyle}>
          {currentStep > 1 && (
            <button onClick={prevStep} style={buttonStyle(false)}>
              Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          {currentStep < 3 ? (
            <button onClick={nextStep} style={buttonStyle(true)}>
              Next
            </button>
          ) : (
            <button onClick={handleSubmit} style={buttonStyle(true)}>
              Claim Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClaimProfileForm; 