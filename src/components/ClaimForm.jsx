import React, { useState } from 'react';

function ClaimForm({ user, onLogout }) {
  // ===== STATE DECLARATIONS =====
  const [formData, setFormData] = useState({
    // Page 2 fields - Patient & Doctor Information
    patientNameEnglish: '',
    patientNameChinese: '',
    patientIdNumber: '',
    provisionalDiagnosis: '',
    healthcareProvider: '',
    estimatedStayDays: '',
    wardClass: 'Standard',
    treatmentSurgery: '',
    attendingDoctor: '',
    
    // Page 2 - Estimated Charges (Minimum and Maximum)
    currency: 'HKD',
    roomChargesMin: '',
    roomChargesMax: '',
    mealChargesMin: '',
    mealChargesMax: '',
    doctorVisitFeeMin: '',
    doctorVisitFeeMax: '',
    surgeonFeeMin: '',
    surgeonFeeMax: '',
    anesthetistFeeMin: '',
    anesthetistFeeMax: '',
    operatingTheatreMin: '',
    operatingTheatreMax: '',
    diagnosticImagingMin: '',
    diagnosticImagingMax: '',
    diagnosticImagingBodyParts: '',
    miscellaneousMin: '',
    miscellaneousMax: '',
    
    // Policy Information
    policyNumber: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ===== HANDLE CHANGE =====
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ===== CALCULATE TOTAL =====
  const calculateTotal = (minOrMax) => {
    const fields = [
      'roomCharges',
      'mealCharges',
      'doctorVisitFee',
      'surgeonFee',
      'anesthetistFee',
      'operatingTheatre',
      'diagnosticImaging',
      'miscellaneous'
    ];
    
    return fields.reduce((sum, field) => {
      const value = parseFloat(formData[`${field}${minOrMax}`]) || 0;
      return sum + value;
    }, 0);
  };

  // ===== HANDLE SUBMIT =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const claimData = {
      ...formData,
      userEmail: user.email,
      totalEstimatedMin: calculateTotal('Min'),
      totalEstimatedMax: calculateTotal('Max'),
      submittedAt: new Date().toISOString(),
      claimType: 'Medical',
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(claimData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit claim');
      }

      if (data.success) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          // Reset form
          setFormData({
            patientNameEnglish: '',
            patientNameChinese: '',
            patientIdNumber: '',
            provisionalDiagnosis: '',
            healthcareProvider: '',
            estimatedStayDays: '',
            wardClass: 'Standard',
            treatmentSurgery: '',
            attendingDoctor: '',
            currency: 'HKD',
            roomChargesMin: '',
            roomChargesMax: '',
            mealChargesMin: '',
            mealChargesMax: '',
            doctorVisitFeeMin: '',
            doctorVisitFeeMax: '',
            surgeonFeeMin: '',
            surgeonFeeMax: '',
            anesthetistFeeMin: '',
            anesthetistFeeMax: '',
            operatingTheatreMin: '',
            operatingTheatreMax: '',
            diagnosticImagingMin: '',
            diagnosticImagingMax: '',
            diagnosticImagingBodyParts: '',
            miscellaneousMin: '',
            miscellaneousMax: '',
            policyNumber: '',
          });
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting claim:', error);
      alert(error.message || 'Failed to submit claim. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ===== SUCCESS VIEW =====
  if (submitted) {
    return (
      <div style={styles.successContainer}>
        <h2 style={styles.successIcon}>✓</h2>
        <h2>Claimable Amount Estimate Submitted!</h2>
        <p>Your request has been received. You will receive the estimated results within 3 working days.</p>
        <p style={styles.note}>Reference: For VHIS claimable amount estimate</p>
        <button onClick={() => setSubmitted(false)} style={styles.button}>
          Submit Another Request
        </button>
      </div>
    );
  }

  // ===== MAIN FORM =====
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>可賠償金額估算申請書</h2>
          <p style={styles.subtitle}>Claimable Amount Estimate Application</p>
        </div>
        <div style={styles.userInfo}>
          <span>Welcome, {user.email}</span>
          <button onClick={onLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Policy Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Policy Information / 保單資料</h3>
          <div style={styles.inputGroup}>
            <label>Policy Number / 保單號碼 *</label>
            <input
              type="text"
              name="policyNumber"
              value={formData.policyNumber}
              onChange={handleChange}
              style={styles.input}
              placeholder="e.g., 000090001234"
              required
            />
          </div>
        </div>

        {/* Patient Information Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Patient Information / 病人資料</h3>
          <div style={styles.row}>
            <div style={styles.halfGroup}>
              <label>Patient Name (English) / 病人姓名 (英文) *</label>
              <input
                type="text"
                name="patientNameEnglish"
                value={formData.patientNameEnglish}
                onChange={handleChange}
                style={styles.input}
                placeholder="e.g., CHAN Tai Man"
                required
              />
            </div>
            <div style={styles.halfGroup}>
              <label>Patient Name (Chinese) / 病人姓名 (中文)</label>
              <input
                type="text"
                name="patientNameChinese"
                value={formData.patientNameChinese}
                onChange={handleChange}
                style={styles.input}
                placeholder="e.g., 陳大文"
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label>Patient's Identity Document Number / 病人之身份證明文件號碼 *</label>
            <input
              type="text"
              name="patientIdNumber"
              value={formData.patientIdNumber}
              onChange={handleChange}
              style={styles.input}
              placeholder="e.g., A123456(7)"
              required
            />
          </div>
        </div>

        {/* Medical Information Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Medical Information / 醫療資料</h3>
          
          <div style={styles.inputGroup}>
            <label>Provisional Diagnosis / 初步診斷 *</label>
            <input
              type="text"
              name="provisionalDiagnosis"
              value={formData.provisionalDiagnosis}
              onChange={handleChange}
              style={styles.input}
              placeholder="e.g., Acute appendicitis"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label>Healthcare Services Provider / 醫療服務提供者名稱 *</label>
            <input
              type="text"
              name="healthcareProvider"
              value={formData.healthcareProvider}
              onChange={handleChange}
              style={styles.input}
              placeholder="e.g., Hong Kong Sanatorium & Hospital"
              required
            />
          </div>

          <div style={styles.row}>
            <div style={styles.halfGroup}>
              <label>Estimated Length of Stay / 預計住院時間 (Days)</label>
              <input
                type="number"
                name="estimatedStayDays"
                value={formData.estimatedStayDays}
                onChange={handleChange}
                style={styles.input}
                placeholder="e.g., 3"
                min="0"
              />
            </div>
            <div style={styles.halfGroup}>
              <label>Class of Ward / 病房級別</label>
              <select
                name="wardClass"
                value={formData.wardClass}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="Standard">Standard</option>
                <option value="Semi-Private">Semi-Private</option>
                <option value="Private">Private</option>
                <option value="Deluxe">Deluxe</option>
              </select>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label>Treatment / Surgical Operation / 治療 / 手術 *</label>
            <input
              type="text"
              name="treatmentSurgery"
              value={formData.treatmentSurgery}
              onChange={handleChange}
              style={styles.input}
              placeholder="e.g., Appendectomy"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label>Attending Doctor / 主診醫生 *</label>
            <input
              type="text"
              name="attendingDoctor"
              value={formData.attendingDoctor}
              onChange={handleChange}
              style={styles.input}
              placeholder="e.g., Dr. CHAN Wai Man"
              required
            />
          </div>
        </div>

        {/* Estimated Charges Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            Estimated Charges / 醫療服務提供者費用估算
          </h3>

          <div style={styles.inputGroup}>
            <label>Currency / 貨幣</label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="HKD">HKD</option>
              <option value="USD">USD</option>
              <option value="CNY">CNY</option>
            </select>
          </div>

          <div style={styles.tableHeader}>
            <div style={styles.tableRow}>
              <span style={styles.tableCellDescription}>Description / 項目</span>
              <span style={styles.tableCellMin}>Min / 最低</span>
              <span style={styles.tableCellMax}>Max / 最高</span>
            </div>
          </div>

          {/* Charge items */}
          {[
            { key: 'roomCharges', label: 'Room Charges / 病房費用' },
            { key: 'mealCharges', label: 'Meal Charges / 膳食費用' },
            { key: 'doctorVisitFee', label: "Attending Doctor's Visit Fee / 主診醫生巡房費" },
            { key: 'surgeonFee', label: "Surgeon's Fee / 外科醫生費" },
            { key: 'anesthetistFee', label: "Anesthetist's Fee / 麻醉科醫生費" },
            { key: 'operatingTheatre', label: 'Operating Theatre Charges / 手術室費' },
            { key: 'diagnosticImaging', label: 'Diagnostic Imaging Tests / 診斷成像檢測' },
            { key: 'miscellaneous', label: 'Miscellaneous Charges / 雜項開支' },
          ].map((item) => (
            <div key={item.key} style={styles.chargeRow}>
              <div style={styles.chargeLabel}>{item.label}</div>
              <input
                type="number"
                name={`${item.key}Min`}
                value={formData[`${item.key}Min`]}
                onChange={handleChange}
                style={styles.chargeInputMin}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              <input
                type="number"
                name={`${item.key}Max`}
                value={formData[`${item.key}Max`]}
                onChange={handleChange}
                style={styles.chargeInputMax}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          ))}

          {/* Diagnostic Imaging Body Parts */}
          <div style={styles.inputGroup}>
            <label>Diagnostic Imaging - Body Parts / 身體部位</label>
            <input
              type="text"
              name="diagnosticImagingBodyParts"
              value={formData.diagnosticImagingBodyParts}
              onChange={handleChange}
              style={styles.input}
              placeholder="e.g., Chest, Abdomen"
            />
          </div>

          {/* Total Row */}
          <div style={styles.totalRow}>
            <div style={styles.totalLabel}>Total / 總計</div>
            <div style={styles.totalMin}>
              {calculateTotal('Min').toFixed(2)}
            </div>
            <div style={styles.totalMax}>
              {calculateTotal('Max').toFixed(2)}
            </div>
          </div>
        </div>

        <button type="submit" style={styles.submitButton} disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit Claimable Amount Estimate / 提交可賠償金額估算申請'}
        </button>
      </form>
    </div>
  );
}

// ===== STYLES =====
const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '2px solid #1a73e8',
  },
  title: {
    color: '#1a73e8',
    margin: 0,
    fontSize: '24px',
  },
  subtitle: {
    color: '#666',
    margin: '5px 0 0 0',
    fontSize: '14px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  logoutButton: {
    padding: '8px 20px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  form: {
    background: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  section: {
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid #eee',
  },
  sectionTitle: {
    color: '#333',
    marginBottom: '20px',
    fontSize: '18px',
    fontWeight: '600',
  },
  row: {
    display: 'flex',
    gap: '20px',
    marginBottom: '15px',
  },
  halfGroup: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: '15px',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
    marginTop: '5px',
  },
  tableHeader: {
    background: '#f5f5f5',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '10px',
  },
  tableRow: {
    display: 'flex',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  tableCellDescription: {
    flex: '2',
  },
  tableCellMin: {
    flex: '1',
    textAlign: 'right',
    paddingRight: '10px',
  },
  tableCellMax: {
    flex: '1',
    textAlign: 'right',
  },
  chargeRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
    padding: '5px 0',
  },
  chargeLabel: {
    flex: '2',
    fontSize: '14px',
    color: '#333',
  },
  chargeInputMin: {
    flex: '1',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    marginRight: '10px',
    width: '100px',
  },
  chargeInputMax: {
    flex: '1',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    width: '100px',
  },
  totalRow: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '15px',
    padding: '15px',
    background: '#e8f0fe',
    borderRadius: '4px',
    fontWeight: 'bold',
  },
  totalLabel: {
    flex: '2',
    fontSize: '16px',
    color: '#1a73e8',
  },
  totalMin: {
    flex: '1',
    textAlign: 'right',
    paddingRight: '10px',
    fontSize: '16px',
    color: '#1a73e8',
  },
  totalMax: {
    flex: '1',
    textAlign: 'right',
    fontSize: '16px',
    color: '#1a73e8',
  },
  submitButton: {
    width: '100%',
    padding: '15px',
    background: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '10px',
    fontWeight: '600',
  },
  successContainer: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    maxWidth: '500px',
    margin: '100px auto',
  },
  successIcon: {
    color: '#28a745',
    fontSize: '48px',
    margin: 0,
  },
  note: {
    color: '#666',
    fontSize: '14px',
    fontStyle: 'italic',
  },
  button: {
    padding: '12px 30px',
    background: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '10px',
  },
};

export default ClaimForm;