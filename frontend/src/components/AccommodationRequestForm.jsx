'use client';
import React, { useState } from 'react';
import api from '@/services/api';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const AccommodationRequestForm = ({ propertyId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fileErrors, setFileErrors] = useState({});

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    idNumber: '',
    studentNumber: '',
    contactNumber: '',
    qualification: '',
    alternativeContact: '',
    // Next of Kin
    nextOfKinName: '',
    nextOfKinRelation: '',
    nextOfKinContact: '',
    nextOfKinAddress: '',
    // Academic & Residence
    academicYear: '1',
    funder: 'Self-funded',
    institution: '',
    campus: '',
    applicationYear: new Date().getFullYear().toString(),
    // Accommodation Preferences
    moveInDate: '',
    leaseDuration: 'Yearly',
    roomType: '',
    budgetMin: '',
    budgetMax: '',
    message: '',
    // Agreement
    agreedToTerms: false,
  });

  const [files, setFiles] = useState({
    idDocument: null,
    proofOfRegistration: null,
    academicResults: null,
    proofOfFunding: null,
    nextOfKinId: null,
    nextOfKinProofOfAddress: null,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    const file = selectedFiles[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setFileErrors((prev) => ({ ...prev, [name]: 'File exceeds 5MB limit' }));
      e.target.value = '';
      return;
    }

    setFileErrors((prev) => ({ ...prev, [name]: '' }));
    setFiles((prev) => ({ ...prev, [name]: file }));
  };

  const validate = () => {
    const required = [
      'firstName', 'lastName', 'email', 'idNumber', 'studentNumber',
      'contactNumber', 'institution', 'moveInDate',
      'nextOfKinName', 'nextOfKinRelation', 'nextOfKinContact',
    ];
    for (const field of required) {
      if (!formData[field]) return `Please fill in all required fields (${field.replace(/([A-Z])/g, ' $1').toLowerCase()})`;
    }
    if (!formData.agreedToTerms) return 'You must agree to the terms and conditions';
    const anyFileError = Object.values(fileErrors).find(Boolean);
    if (anyFileError) return anyFileError;
    return null;
  };

  const mapFundingType = (funder) => {
    const map = { 'NSFAS': 'NSFAS', 'Self-funded': 'self-funded', 'Bursary': 'private', 'Sponsor': 'private' };
    return map[funder] || 'self-funded';
  };

  const mapLeaseDuration = (duration) => {
    const map = { 'Semester': 'semester', 'Yearly': 'yearly', 'Monthly': 'monthly' };
    return map[duration] || 'yearly';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const hasFiles = Object.values(files).some(Boolean);

      let res;
      if (hasFiles) {
        const formDataPayload = new FormData();
        formDataPayload.append('propertyId', propertyId);
        formDataPayload.append('moveInDate', formData.moveInDate);
        formDataPayload.append('leaseDuration', mapLeaseDuration(formData.leaseDuration));
        formDataPayload.append('fundingType', mapFundingType(formData.funder));
        formDataPayload.append('message', formData.message);
        formDataPayload.append('applicantInfo', JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          idNumber: formData.idNumber,
          studentNumber: formData.studentNumber,
          contactNumber: formData.contactNumber,
          qualification: formData.qualification,
          alternativeContact: formData.alternativeContact,
          academicYear: formData.academicYear,
          institution: formData.institution,
          campus: formData.campus,
          applicationYear: formData.applicationYear,
          roomType: formData.roomType,
          budgetMin: formData.budgetMin,
          budgetMax: formData.budgetMax,
        }));
        formDataPayload.append('nextOfKin', JSON.stringify({
          name: formData.nextOfKinName,
          relation: formData.nextOfKinRelation,
          contact: formData.nextOfKinContact,
          address: formData.nextOfKinAddress,
        }));
        Object.entries(files).forEach(([key, file]) => {
          if (file) formDataPayload.append(key, file);
        });
        res = await api.post('/requests', formDataPayload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await api.post('/requests', {
          propertyId,
          moveInDate: formData.moveInDate,
          leaseDuration: mapLeaseDuration(formData.leaseDuration),
          fundingType: mapFundingType(formData.funder),
          message: formData.message,
          applicantInfo: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            idNumber: formData.idNumber,
            studentNumber: formData.studentNumber,
            contactNumber: formData.contactNumber,
            qualification: formData.qualification,
            alternativeContact: formData.alternativeContact,
            academicYear: formData.academicYear,
            institution: formData.institution,
            campus: formData.campus,
            applicationYear: formData.applicationYear,
            roomType: formData.roomType,
            budgetMin: formData.budgetMin,
            budgetMax: formData.budgetMax,
          },
          nextOfKin: {
            name: formData.nextOfKinName,
            relation: formData.nextOfKinRelation,
            contact: formData.nextOfKinContact,
            address: formData.nextOfKinAddress,
          },
        });
      }

      if (res.data.success) {
        setSuccess(true);
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-green-600 mb-2">Application Submitted!</h2>
        <p className="text-gray-600">Your accommodation request has been sent successfully. You will be notified when the owner responds.</p>
      </div>
    );
  }

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
  const sectionHeadingClass = 'text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4';
  const fileInputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100';

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-sm">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <section>
          <h3 className={sectionHeadingClass}>Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First Name *</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className={inputClass} placeholder="First Name" required />
            </div>
            <div>
              <label className={labelClass}>Last Name *</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className={inputClass} placeholder="Last Name" required />
            </div>
            <div>
              <label className={labelClass}>Email Address *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="Email Address" required />
            </div>
            <div>
              <label className={labelClass}>ID Number *</label>
              <input type="text" name="idNumber" value={formData.idNumber} onChange={handleChange} className={inputClass} placeholder="ID Number" required />
            </div>
            <div>
              <label className={labelClass}>Student Number *</label>
              <input type="text" name="studentNumber" value={formData.studentNumber} onChange={handleChange} className={inputClass} placeholder="Student Number" required />
            </div>
            <div>
              <label className={labelClass}>Contact Number *</label>
              <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} className={inputClass} placeholder="Contact Number" required />
            </div>
            <div>
              <label className={labelClass}>Qualification (What you&apos;re studying)</label>
              <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} className={inputClass} placeholder="e.g. BSc Computer Science" />
            </div>
            <div>
              <label className={labelClass}>Alternative Contact Number</label>
              <input type="tel" name="alternativeContact" value={formData.alternativeContact} onChange={handleChange} className={inputClass} placeholder="Alternative Contact Number" />
            </div>
          </div>
        </section>

        {/* Next of Kin Information */}
        <section>
          <h3 className={sectionHeadingClass}>Next of Kin Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Next of Kin Name *</label>
              <input type="text" name="nextOfKinName" value={formData.nextOfKinName} onChange={handleChange} className={inputClass} placeholder="Full Name" required />
            </div>
            <div>
              <label className={labelClass}>Relation *</label>
              <input type="text" name="nextOfKinRelation" value={formData.nextOfKinRelation} onChange={handleChange} className={inputClass} placeholder="e.g. Parent, Sibling" required />
            </div>
            <div>
              <label className={labelClass}>Next of Kin Contact Number *</label>
              <input type="tel" name="nextOfKinContact" value={formData.nextOfKinContact} onChange={handleChange} className={inputClass} placeholder="Contact Number" required />
            </div>
            <div>
              <label className={labelClass}>Next of Kin Address</label>
              <input type="text" name="nextOfKinAddress" value={formData.nextOfKinAddress} onChange={handleChange} className={inputClass} placeholder="Physical Address" />
            </div>
          </div>
        </section>

        {/* Academic & Residence Information */}
        <section>
          <h3 className={sectionHeadingClass}>Academic &amp; Residence Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Academic Year</label>
              <select name="academicYear" value={formData.academicYear} onChange={handleChange} className={inputClass}>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
                <option value="5">Year 5</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Funder</label>
              <select name="funder" value={formData.funder} onChange={handleChange} className={inputClass}>
                <option value="NSFAS">NSFAS</option>
                <option value="Self-funded">Self-funded</option>
                <option value="Bursary">Bursary</option>
                <option value="Sponsor">Sponsor</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Institution *</label>
              <select name="institution" value={formData.institution} onChange={handleChange} className={inputClass} required>
                <option value="">Select Institution</option>
                <option value="UCT">UCT</option>
                <option value="Wits">Wits</option>
                <option value="UP">UP</option>
                <option value="Stellenbosch">Stellenbosch</option>
                <option value="UJ">UJ</option>
                <option value="UKZN">UKZN</option>
                <option value="UNISA">UNISA</option>
                <option value="NWU">NWU</option>
                <option value="Rhodes">Rhodes</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Campus</label>
              <input type="text" name="campus" value={formData.campus} onChange={handleChange} className={inputClass} placeholder="e.g. Main Campus, Medical Campus" />
            </div>
            <div>
              <label className={labelClass}>Application Year</label>
              <input type="number" name="applicationYear" value={formData.applicationYear} onChange={handleChange} className={inputClass} placeholder="e.g. 2025" min="2020" max="2030" />
            </div>
          </div>
        </section>

        {/* Document Uploads */}
        <section>
          <h3 className={sectionHeadingClass}>Document Uploads <span className="text-sm font-normal text-gray-500">(Max 5MB per file)</span></h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: 'idDocument', label: 'ID Document' },
              { name: 'proofOfRegistration', label: 'Proof of Registration' },
              { name: 'academicResults', label: 'Academic Results' },
              { name: 'proofOfFunding', label: 'Proof of Funding' },
              { name: 'nextOfKinId', label: 'Next of Kin ID' },
              { name: 'nextOfKinProofOfAddress', label: 'Next of Kin Proof of Address' },
            ].map(({ name, label }) => (
              <div key={name}>
                <label className={labelClass}>{label}</label>
                <input
                  type="file"
                  name={name}
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className={fileInputClass}
                />
                {fileErrors[name] && (
                  <p className="text-red-500 text-xs mt-1">{fileErrors[name]}</p>
                )}
                {files[name] && !fileErrors[name] && (
                  <p className="text-green-600 text-xs mt-1">✓ {files[name].name}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Accommodation Preferences */}
        <section>
          <h3 className={sectionHeadingClass}>Accommodation Preferences</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Move-in Date *</label>
              <input type="date" name="moveInDate" value={formData.moveInDate} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Lease Duration</label>
              <select name="leaseDuration" value={formData.leaseDuration} onChange={handleChange} className={inputClass}>
                <option value="Monthly">Monthly</option>
                <option value="Semester">Semester</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Preferred Room Type</label>
              <input type="text" name="roomType" value={formData.roomType} onChange={handleChange} className={inputClass} placeholder="e.g. Single, Shared, En-suite" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>Budget Min (R)</label>
                <input type="number" name="budgetMin" value={formData.budgetMin} onChange={handleChange} className={inputClass} placeholder="Min" min="0" />
              </div>
              <div>
                <label className={labelClass}>Budget Max (R)</label>
                <input type="number" name="budgetMax" value={formData.budgetMax} onChange={handleChange} className={inputClass} placeholder="Max" min="0" />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <label className={labelClass}>Special Requirements / Additional Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className={inputClass}
              placeholder="Any special requirements, questions, or additional information..."
            />
          </div>
        </section>

        {/* Agreement */}
        <section>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="agreedToTerms"
              checked={formData.agreedToTerms}
              onChange={handleChange}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              required
            />
            <span className="text-sm text-gray-700">
              I confirm that all information provided is true and accurate. I agree to the terms and conditions of the accommodation application process.
            </span>
          </label>
        </section>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Submitting Application...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
};

export default AccommodationRequestForm;
