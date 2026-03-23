'use client';
import React, { useState } from 'react';
import api from '@/services/api';

const AccommodationRequestForm = ({ propertyId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', idNumber: '', studentNumber: '', contactNumber: '',
    alternativeContact: '', qualification: '', academicYear: '1', institution: '', 
    campus: '', funder: 'Self-funded', fundingDetails: '', moveInDate: '', 
    leaseDuration: 'Yearly', emergencyContactName: '', emergencyContactRelation: '',
    emergencyContactNumber: '', emergencyContactAddress: '', message: '', 
    agreedToTerms: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!formData.firstName || !formData.lastName || !formData.idNumber || 
          !formData.studentNumber || !formData.contactNumber || !formData.institution || 
          !formData.moveInDate || !formData.emergencyContactName || 
          !formData.emergencyContactRelation || !formData.emergencyContactNumber) {
        setError('Please fill all required fields');
        setLoading(false);
        return;
      }
      if (!formData.agreedToTerms) {
        setError('You must agree to the terms');
        setLoading(false);
        return;
      }
      const token = localStorage.getItem('token');
      const res = await api.post('/requests', { propertyId, ...formData }, 
        { headers: { Authorization: 'Bearer ' + token } });
      if (res.data.success) { 
        setSuccess(true); 
        if (onSuccess) onSuccess(); 
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-green-600">Application Submitted!</h2>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      {error && <div className="mb-6 p-4 bg-red-50 border rounded text-red-600">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="text-xl font-semibold">Personal Information</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} className="border rounded px-3 py-2" required />
          <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} className="border rounded px-3 py-2" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input type="text" name="idNumber" placeholder="ID Number" value={formData.idNumber} onChange={handleChange} className="border rounded px-3 py-2" required />
          <input type="text" name="studentNumber" placeholder="Student Number" value={formData.studentNumber} onChange={handleChange} className="border rounded px-3 py-2" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input type="tel" name="contactNumber" placeholder="Contact Number" value={formData.contactNumber} onChange={handleChange} className="border rounded px-3 py-2" required />
          <input type="tel" name="alternativeContact" placeholder="Alternative Contact" value={formData.alternativeContact} onChange={handleChange} className="border rounded px-3 py-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input type="text" name="qualification" placeholder="Qualification" value={formData.qualification} onChange={handleChange} className="border rounded px-3 py-2" />
          <select name="academicYear" value={formData.academicYear} onChange={handleChange} className="border rounded px-3 py-2">
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
            <option value="5">Year 5</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <select name="institution" value={formData.institution} onChange={handleChange} className="border rounded px-3 py-2" required>
            <option value="">Select Institution</option>
            <option value="UCT">UCT</option>
            <option value="Wits">Wits</option>
            <option value="UP">UP</option>
            <option value="Stellenbosch">Stellenbosch</option>
          </select>
          <input type="text" name="campus" placeholder="Campus" value={formData.campus} onChange={handleChange} className="border rounded px-3 py-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <select name="funder" value={formData.funder} onChange={handleChange} className="border rounded px-3 py-2">
            <option value="NSFAS">NSFAS</option>
            <option value="Self-funded">Self-funded</option>
            <option value="Bursary">Bursary</option>
            <option value="Sponsor">Sponsor</option>
          </select>
          <input type="text" name="fundingDetails" placeholder="Funding Details" value={formData.fundingDetails} onChange={handleChange} className="border rounded px-3 py-2" />
        </div>

        <h3 className="text-xl font-semibold">Emergency Contact</h3>
        
        <input type="text" name="emergencyContactName" placeholder="Emergency Contact Name" value={formData.emergencyContactName} onChange={handleChange} className="w-full border rounded px-3 py-2" required />

        <div className="grid grid-cols-2 gap-4">
          <input type="text" name="emergencyContactRelation" placeholder="Relation" value={formData.emergencyContactRelation} onChange={handleChange} className="border rounded px-3 py-2" required />
          <input type="tel" name="emergencyContactNumber" placeholder="Emergency Number" value={formData.emergencyContactNumber} onChange={handleChange} className="border rounded px-3 py-2" required />
        </div>

        <input type="text" name="emergencyContactAddress" placeholder="Emergency Contact Address" value={formData.emergencyContactAddress} onChange={handleChange} className="w-full border rounded px-3 py-2" />

        <h3 className="text-xl font-semibold">Accommodation Details</h3>

        <div className="grid grid-cols-2 gap-4">
          <input type="date" name="moveInDate" value={formData.moveInDate} onChange={handleChange} className="border rounded px-3 py-2" required />
          <select name="leaseDuration" value={formData.leaseDuration} onChange={handleChange} className="border rounded px-3 py-2">
            <option value="Semester">Semester</option>
            <option value="Yearly">Yearly</option>
          </select>
        </div>

        <textarea name="message" placeholder="Additional Message" value={formData.message} onChange={handleChange} rows="4" className="w-full border rounded px-3 py-2"></textarea>

        <label className="flex items-center">
          <input type="checkbox" name="agreedToTerms" checked={formData.agreedToTerms} onChange={handleChange} className="mr-3" required />
          <span className="text-sm">I agree that all information is true and accurate</span>
        </label>

        <button type="submit" disabled={loading} className="w-full px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
};

export default AccommodationRequestForm;