'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import api from '@/services/api';
import { MdLocationOn, MdAccessTime } from 'react-icons/md';
import { HiCheck, HiX } from 'react-icons/hi';

interface Request {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    university: string;
  };
  propertyId: {
    _id: string;
    name: string;
    images: string[];
    location: {
      address: string;
      city: string;
    };
    pricing: {
      minRent: number;
      maxRent: number;
      deposit: number;
    };
  };
  moveInDate: string;
  leaseDuration: string;
  fundingType: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function AdminRequestsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, user, router]);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await api.get('/requests', { params });
      setRequests(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      setActionLoading(true);
      await api.patch(`/requests/${requestId}`, { status: 'approved' });
      setRequests(requests.map(r => r._id === requestId ? { ...r, status: 'approved' } : r));
      setShowModal(false);
      setSelectedRequest(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      setActionLoading(true);
      await api.patch(`/requests/${requestId}`, { status: 'rejected' });
      setRequests(requests.map(r => r._id === requestId ? { ...r, status: 'rejected' } : r));
      setShowModal(false);
      setSelectedRequest(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject request');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-2">
            <HiCheck className="w-4 h-4 text-green-700" />
            <span>Approved</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-2">
            <HiX className="w-4 h-4 text-red-700" />
            <span>Rejected</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-2">
            <MdAccessTime className="w-4 h-4 text-yellow-700" />
            <span>Pending</span>
          </span>
        );
    }
  };

  const filteredRequests = statusFilter === 'all' 
    ? requests 
    : requests.filter(r => r.status === statusFilter);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="container py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Student Housing Requests</h1>
            <p className="text-gray-600 text-sm mt-1">Review and manage student accommodation requests</p>
          </div>
          <Link href="/admin/dashboard" className="btn-secondary px-4 py-2 font-semibold">
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="container py-8">
        {/* Filter Tabs */}
        <div className="mb-8 flex gap-3 border-b border-gray-200 pb-4">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === filter
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
              {filter === 'pending' && (
                <span className="ml-2 bg-white text-primary rounded-full px-2 py-1 text-xs font-bold">
                  {requests.filter(r => r.status === 'pending').length}
                </span>
              )}
              {filter === 'approved' && (
                <span className="ml-2 bg-white text-primary rounded-full px-2 py-1 text-xs font-bold">
                  {requests.filter(r => r.status === 'approved').length}
                </span>
              )}
              {filter === 'rejected' && (
                <span className="ml-2 bg-white text-primary rounded-full px-2 py-1 text-xs font-bold">
                  {requests.filter(r => r.status === 'rejected').length}
                </span>
              )}
              {filter === 'all' && (
                <span className="ml-2 bg-white text-primary rounded-full px-2 py-1 text-xs font-bold">
                  {requests.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
            <p className="text-gray-600 mt-4">Loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600 text-lg mb-2">No requests found</p>
            <p className="text-gray-500 text-sm">
              {statusFilter === 'all' 
                ? 'There are no accommodation requests yet.' 
                : `No ${statusFilter} requests at this time.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request._id}
                className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
                  {/* Property Image */}
                  <div className="md:col-span-1">
                    {request.propertyId.images && request.propertyId.images.length > 0 ? (
                      <img
                        src={request.propertyId.images[0]}
                        alt={request.propertyId.name}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Property Details */}
                  <div className="md:col-span-2">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      {request.propertyId.name}
                    </h3>

                    <p className="text-gray-600 text-sm mb-3 flex items-center gap-2">
                      <MdLocationOn className="w-4 h-4 text-primary" />
                      <span>{request.propertyId.location.address}, {request.propertyId.location.city}</span>
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                      <div>
                        <p className="text-gray-600">Monthly Rent</p>
                        <p className="font-semibold text-gray-800">
                          R{request.propertyId.pricing.minRent.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Move-in Date</p>
                        <p className="font-semibold text-gray-800">
                          {new Date(request.moveInDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Lease Duration</p>
                        <p className="font-semibold text-gray-800 capitalize">
                          {request.leaseDuration}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Funding Type</p>
                        <p className="font-semibold text-gray-800 capitalize">
                          {request.fundingType}
                        </p>
                      </div>
                    </div>

                    {/* Student Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                      <p className="text-blue-900 font-semibold">{request.userId.name}</p>
                      <p className="text-blue-700">{request.userId.email}</p>
                      <p className="text-blue-600 text-xs">{request.userId.university}</p>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="md:col-span-1 flex flex-col gap-3">
                    {/* Status Badge */}
                    <div className={`border rounded-lg p-3 text-center ${getStatusColor(request.status)}`}>
                      <p className="font-semibold text-sm">{getStatusBadge(request.status)}</p>
                      <p className="text-xs mt-1">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowModal(true);
                          }}
                          className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 font-semibold py-2 px-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                        >
                          <HiCheck className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            handleReject(request._id);
                          }}
                          className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 px-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                        >
                          <HiX className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}

                    {request.status !== 'pending' && (
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowModal(true);
                        }}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded-lg transition-colors text-sm"
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Request Details</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedRequest(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Property Info */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">Property Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <p><span className="font-semibold text-gray-700">Property:</span> {selectedRequest.propertyId.name}</p>
                  <p><span className="font-semibold text-gray-700">Location:</span> {selectedRequest.propertyId.location.address}, {selectedRequest.propertyId.location.city}</p>
                  <p><span className="font-semibold text-gray-700">Price Range:</span> R{selectedRequest.propertyId.pricing.minRent.toLocaleString()} - R{selectedRequest.propertyId.pricing.maxRent.toLocaleString()}</p>
                </div>
              </div>

              {/* Student Info */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">Student Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <p><span className="font-semibold text-gray-700">Name:</span> {selectedRequest.userId.name}</p>
                  <p><span className="font-semibold text-gray-700">Email:</span> {selectedRequest.userId.email}</p>
                  <p><span className="font-semibold text-gray-700">University:</span> {selectedRequest.userId.university}</p>
                </div>
              </div>

              {/* Request Details */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">Request Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <p><span className="font-semibold text-gray-700">Move-in Date:</span> {new Date(selectedRequest.moveInDate).toLocaleDateString()}</p>
                  <p><span className="font-semibold text-gray-700">Lease Duration:</span> {selectedRequest.leaseDuration}</p>
                  <p><span className="font-semibold text-gray-700">Funding Type:</span> {selectedRequest.fundingType}</p>
                  <p><span className="font-semibold text-gray-700">Status:</span> <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(selectedRequest.status)}`}>{getStatusBadge(selectedRequest.status)}</span></p>
                </div>
              </div>

              {/* Message */}
              {selectedRequest.message && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Student Message</h3>
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{selectedRequest.message}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            {selectedRequest.status === 'pending' && (
              <div className="sticky bottom-0 bg-white border-t p-6 flex gap-3">
                <button
                  onClick={() => handleApprove(selectedRequest._id)}
                  disabled={actionLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {actionLoading ? 'Processing...' : (<><HiCheck className="w-5 h-5" /> <span>Approve Request</span></>)}
                </button>
                <button
                  onClick={() => handleReject(selectedRequest._id)}
                  disabled={actionLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {actionLoading ? 'Processing...' : (<><HiX className="w-5 h-5" /> <span>Reject Request</span></>)}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedRequest(null);
                  }}
                  disabled={actionLoading}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:opacity-50 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
