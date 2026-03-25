'use client';
import React, { useState } from 'react';
import axios from 'axios';

const OpalStyleAccommodationForm = ({ propertyId, onSuccess }) => {
  const [activeSection, setActiveSection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    surname: '',
    dateOfBirth: '',
    idNumber: '',
    email: '',
    cellPhone: '',
    studentNumber: '',
    institution: '',
    qualification: '',
    yearOfStudy: '',
    kinName: '',
    kinRelationship: '',
    kinPhone: '',
    funder: '',
    declaration: false,
    termsAccepted: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/requests', {
        propertyId,
        firstName: formData.firstName,
        lastName: formData.surname,
        idNumber: formData.idNumber,
        studentNumber: formData.studentNumber,
        contactNumber: formData.cellPhone,
        qualification: formData.qualification,
        academicYear: parseInt(formData.yearOfStudy) || 1,
        institution: formData.institution,
        funder: formData.funder,
        emergencyContactName: formData.kinName,
        emergencyContactRelation: formData.kinRelationship,
        emergencyContactNumber: formData.kinPhone,
        agreedToTerms: formData.termsAccepted
      }, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess(true);
      if (onSuccess) onSuccess(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return <div className="text-center p-8"><h2 className="text-2xl font-bold text-green-600">Success</h2></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2">Accommodation Application</h1>
        {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}
        
        <div className="mb-6 flex gap-2">
          {[1, 2, 3, 4, 5, 6].map(s => (
            <button key={s} onClick={() => setActiveSection(s)} className={`px-3 py-2 rounded ${activeSection === s ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>{s}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {activeSection === 1 && <div><h2 className="text-xl font-bold mb-4">Personal Details</h2>
            <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} className="w-full mb-2 p-2 border rounded" required />
            <input type="text" name="surname" placeholder="Surname" value={formData.surname} onChange={handleChange} className="w-full mb-2 p-2 border rounded" required />
            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full mb-2 p-2 border rounded" required />
            <input type="text" name="idNumber" placeholder="ID Number" value={formData.idNumber} onChange={handleChange} className="w-full mb-2 p-2 border rounded" required />
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full mb-2 p-2 border rounded" required />
            <input type="tel" name="cellPhone" placeholder="Cell Phone" value={formData.cellPhone} onChange={handleChange} className="w-full mb-2 p-2 border rounded" required />
          </div>}

          {activeSection === 2 && <div><h2 className="text-xl font-bold mb-4">Academic Details</h2>
            <input type="text" name="studentNumber" placeholder="Student Number" value={formData.studentNumber} onChange={handleChange} className="w-full mb-2 p-2 border rounded" required />
            <select name="institution" value={formData.institution} onChange={handleChange} className="w-full mb-2 p-2 border rounded" required>
              <option>Select Institution</option>
              <option>University of Cape Town</option>
              <option>University of Witwatersrand</option>
              <option>Stellenbosch University</option>
            </select>
            <select name="qualification" value={formData.qualification} onChange={handleChange} className="w-full mb-2 p-2 border rounded" required>
              <option>Select Qualification</option>
              <option>Undergraduate</option>
              <option>Postgraduate</option>
            </select>
            <select name="yearOfStudy" value={formData.yearOfStudy} onChange={handleChange} className="w-full mb-2 p-2 border rounded" required>
              <option>Select Year</option>
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
            </select>
          </div>}

          {activeSection === 3 && <div><h2 className="text-xl font-bold mb-4">Room Preference</h2>
            <select name="roomType" value={formData.roomType} onChange={handleChange} className="w-full mb-2 p-2 border rounded">
              <option>Select Room Type</option>
              <option>Single</option>
              <option>Double</option>
              <option>Shared</option>
            </select>
          </div>}

          {activeSection === 4 && <div><h2 className="text-xl font-bold mb-4">Guardian</h2>
            <input type="text" name="kinName" placeholder="Guardian Name" value={formData.kinName} onChange={handleChange} className="w-full mb-2 p-2 border rounded" required />
            <input type="text" name="kinRelationship" placeholder="Relationship" value={formData.kinRelationship} onChange={handleChange} className="w-full mb-2 p-2 border rounded" required />
            <input type="tel" name="kinPhone" placeholder="Guardian Phone" value={formData.kinPhone} onChange={handleChange} className="w-full mb-2 p-2 border rounded" required />
          </div>}

          {activeSection === 5 && <div><h2 className="text-xl font-bold mb-4">Funding</h2>
            <select name="funder" value={formData.funder} onChange={handleChange} className="w-full mb-2 p-2 border rounded" required>
              <option>Select Funder</option>
              <option>NSFAS</option>
              <option>Self-Funded</option>
              <option>Sponsor</option>
            </select>
          </div>}

          {activeSection === 6 && <div><h2 className="text-xl font-bold mb-4">Declarations</h2>
            <label className="flex items-center mb-4">
              <input type="checkbox" name="declaration" checked={formData.declaration} onChange={handleChange} required className="mr-2" />
              <span>I declare the information is accurate</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" name="termsAccepted" checked={formData.termsAccepted} onChange={handleChange} required className="mr-2" />
              <span>I agree to terms and conditions</span>
            </label>
          </div>}

          <div className="flex justify-between mt-8">
            <button type="button" onClick={() => setActiveSection(Math.max(1, activeSection - 1))} disabled={activeSection === 1} className="px-4 py-2 bg-gray-400 text-white rounded disabled:opacity-50">Previous</button>
            <span>Section {activeSection}/6</span>
            {activeSection < 6 ? (
              <button type="button" onClick={() => setActiveSection(activeSection + 1)} className="px-4 py-2 bg-blue-600 text-white rounded">Next</button>
            ) : (
              <button type="submit" disabled={loading || !formData.declaration || !formData.termsAccepted} className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50">{loading ? 'Submitting' : 'Submit'}</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default OpalStyleAccommodationForm;