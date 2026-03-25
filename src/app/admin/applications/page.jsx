'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, [filterStatus]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const statusParam = filterStatus !== 'all' ? filterStatus : '';
      
      const response = await axios.get('/api/requests', {
        params: { status: statusParam },
        headers: { Authorization: `Bearer ${token}` }
      });

      setApplications(response.data.data);
    } catch (err) {
      setError('Failed to fetch applications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.patch(`/api/requests/${requestId}/status`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setApplications(applications.map(app => 
        app._id === requestId ? { ...app, status: newStatus } : app
      ));
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Accommodation Applications</h1>
          <p className="text-gray-600">Review and manage student accommodation requests</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-600 text-red-700 rounded">
            <p>{error}</p>
          </div>
        )}

        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <label className="font-semibold text-gray-700">Filter by Status:</label>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="ml-4 px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Applications</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {applications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No applications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Student</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Institution</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Applied</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app._id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {app.firstName} {app.lastName}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{app.userId?.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{app.institution}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                          className="px-2 py-1 text-sm border border-gray-300 rounded"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approve</option>
                          <option value="rejected">Reject</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedApp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="p-6 border-b sticky top-0 bg-white flex justify-between items-center">
                <h2 className="text-2xl font-bold">Application Details</h2>
                <button onClick={() => setSelectedApp(null)} className="text-2xl">×</button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-sm text-gray-500">First Name</p><p className="font-semibold">{selectedApp.firstName}</p></div>
                  <div><p className="text-sm text-gray-500">Surname</p><p className="font-semibold">{selectedApp.lastName}</p></div>
                  <div><p className="text-sm text-gray-500">ID Number</p><p className="font-semibold">{selectedApp.idNumber}</p></div>
                  <div><p className="text-sm text-gray-500">Student Number</p><p className="font-semibold">{selectedApp.studentNumber}</p></div>
                  <div><p className="text-sm text-gray-500">Institution</p><p className="font-semibold">{selectedApp.institution}</p></div>
                  <div><p className="text-sm text-gray-500">Contact</p><p className="font-semibold">{selectedApp.contactNumber}</p></div>
                  <div><p className="text-sm text-gray-500">Email</p><p className="font-semibold text-blue-600">{selectedApp.userId?.email}</p></div>
                  <div><p className="text-sm text-gray-500">Funder</p><p className="font-semibold">{selectedApp.funder}</p></div>
                  <div className="col-span-2"><p className="text-sm text-gray-500">Status</p><span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedApp.status)}`}>{selectedApp.status}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
