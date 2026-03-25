'use client';
import React, { useState } from 'react';
import api from '@/services/api';

const AccommodationRequestForm = ({ propertyId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', idNumber: '', studentNumber: '', 
    contactNumber: '', qualification: '', academicYear: '1', institution: '', 
    campus: '', funder: 'NSFAS', moveInDate: '', leaseDuration: 'monthly', 
    emergencyContactName: '', emergencyContactRelation: '', emergencyContactNumber: '', 
    message: '', agreedToTerms: false
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
      // Validate required fields
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
      const payload = {
        propertyId: propertyId,
        moveInDate: formData.moveInDate,
        leaseDuration: formData.leaseDuration,
        fundingType: formData.funder,
        message: formData.message
      };
      
      console.log('Sending payload:', payload);
      console.log('Token:', token ? 'Present' : 'Missing');
      
      const res = await api.post('/requests', payload, 
        { headers: { Authorization: 'Bearer ' + token } });
      
      console.log('Response:', res.data);
      
      if (res.data.success) { 
        setSuccess(true); 
        if (onSuccess) onSuccess(res.data.data); 
      }
    } catch (err) {
      console.error('Full error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || err.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="card p-8 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-green-600">Application Submitted!</h2>
        <p className="text-gray-600 mt-2">Your accommodation request has been sent to the property owner.</p>
      </div>
    );
  }

  return (
    <div className="card p-8">
      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">Personal Information</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <input type="text" name="firstName" placeholder="First Name *" value={formData.firstName} onChange={handleChange} className="input-base" required />
          <input type="text" name="lastName" placeholder="Last Name *" value={formData.lastName} onChange={handleChange} className="input-base" required />
        </div>

        <div>
          <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className="w-full input-base" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input type="text" name="idNumber" placeholder="ID Number *" value={formData.idNumber} onChange={handleChange} className="input-base" required />
          <input type="text" name="studentNumber" placeholder="Student Number *" value={formData.studentNumber} onChange={handleChange} className="input-base" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input type="tel" name="contactNumber" placeholder="Contact Number *" value={formData.contactNumber} onChange={handleChange} className="input-base" required />
          <input type="text" name="qualification" placeholder="Qualification" value={formData.qualification} onChange={handleChange} className="input-base" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <select name="academicYear" value={formData.academicYear} onChange={handleChange} className="input-base">
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
            <option value="5">Year 5+</option>
          </select>
          <select name="institution" value={formData.institution} onChange={handleChange} className="input-base" required>
            <option value="">Select Institution *</option>
            <option value="UCT">UCT</option>
            <option value="Wits">Wits</option>
            <option value="UP">UP</option>
            <option value="Stellenbosch">Stellenbosch</option>
            <option value="UJ">UJ</option>
          </select>
        </div>

        <div>
          <input type="text" name="campus" placeholder="Campus" value={formData.campus} onChange={handleChange} className="w-full input-base" />
        </div>

        <h3 className="text-xl font-semibold text-gray-800 mt-8">Funding Information</h3>

        <select name="funder" value={formData.funder} onChange={handleChange} className="w-full input-base">
          <option value="NSFAS">NSFAS</option>
          <option value="private">Private</option>
          <option value="self-funded">Self-funded</option>
          <option value="Bursary">Bursary</option>
        </select>

        <h3 className="text-xl font-semibold text-gray-800 mt-8">Emergency Contact</h3>
        
        <input type="text" name="emergencyContactName" placeholder="Emergency Contact Name *" value={formData.emergencyContactName} onChange={handleChange} className="w-full input-base" required />

        <div className="grid grid-cols-2 gap-4">
          <input type="text" name="emergencyContactRelation" placeholder="Relation *" value={formData.emergencyContactRelation} onChange={handleChange} className="input-base" required />
          <input type="tel" name="emergencyContactNumber" placeholder="Contact Number *" value={formData.emergencyContactNumber} onChange={handleChange} className="input-base" required />
        </div>

        <h3 className="text-xl font-semibold text-gray-800 mt-8">Accommodation Preferences</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Move-in Date *</label>
            <input type="date" name="moveInDate" value={formData.moveInDate} onChange={handleChange} className="input-base w-full" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lease Duration *</label>
            <select name="leaseDuration" value={formData.leaseDuration} onChange={handleChange} className="input-base w-full" required>
              <option value="monthly">Monthly</option>
              <option value="semester">Semester</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Additional Message</label>
          <textarea name="message" placeholder="Any additional information?" value={formData.message} onChange={handleChange} rows="4" className="w-full input-base"></textarea>
        </div>

        <label className="flex items-center">
          <input type="checkbox" name="agreedToTerms" checked={formData.agreedToTerms} onChange={handleChange} className="mr-3" required />
          <span className="text-sm text-gray-700">I agree that all information provided is true and accurate</span>
        </label>

        <button type="submit" disabled={loading} className="w-full btn-primary py-3 font-semibold mt-6">
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
};

export default AccommodationRequestForm;
