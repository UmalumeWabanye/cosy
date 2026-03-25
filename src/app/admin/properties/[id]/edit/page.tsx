'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import api from '@/services/api';
import { HiX } from 'react-icons/hi';

const DEFAULT_AMENITIES = [
  'WiFi',
  'Parking',
  'Gym',
  'Laundry',
  'Kitchen',
  'TV Lounge',
  'Garden',
  'Security',
  'DSTV',
  'Water Heater',
];

const UNIVERSITIES = [
  'University of Cape Town',
  'Stellenbosch University',
  'University of the Western Cape',
  'University of Johannesburg',
  'University of Pretoria',
  'Wits University',
  'University of KwaZulu-Natal',
  'North West University',
  'University of Free State',
  'Rhodes University',
];

interface RoomType {
  type: string;
  quantity: string;
  availableQuantity: string;
  pricePerMonth: string;
  description: string;
  leaseDuration: string;
}

interface Property {
  _id: string;
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    postalCode: string;
    university: string;
  };
  pricing: {
    minRent: number;
    maxRent: number;
    deposit: number;
  };
  roomTypes: any[];
  rooms: {
    total: number;
    available: number;
  };
  amenities: string[];
  images: string[];
  nsfasAccreditation: boolean;
  isActive: boolean;
}

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [customRoomTypes, setCustomRoomTypes] = useState<string[]>([
    'Single',
    'Shared/Communal',
    'Double',
    'Studio',
    'Other',
  ]);
  const [newRoomTypeInput, setNewRoomTypeInput] = useState('');
  const [customAmenities, setCustomAmenities] = useState<string[]>([...DEFAULT_AMENITIES]);
  const [newAmenityInput, setNewAmenityInput] = useState('');

  const propertyId = params.id as string;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    postalCode: '',
    university: '',
    minRent: '',
    maxRent: '',
    deposit: '',
    totalRooms: '',
    availableRooms: '',
    roomTypes: [] as RoomType[],
    amenities: [] as string[],
    nsfasAccreditation: false,
    isActive: true,
    images: [] as string[],
  });

  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, user, router]);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoadingData(true);
        const response = await api.get(`/admin/properties/${propertyId}`);
        const property = response.data.data as Property;

        // Extract unique room types from the property's room types
        const roomTypeNames = property.roomTypes
          ?.map((rt: any) => rt.type)
          .filter((type: string, index: number, arr: string[]) => arr.indexOf(type) === index) || [];
        
        if (roomTypeNames.length > 0) {
          setCustomRoomTypes(roomTypeNames);
        }

        // Extract unique amenities and merge with property amenities
        const propertyAmenities = property.amenities || [];
        const allAmenities = Array.from(new Set([...DEFAULT_AMENITIES, ...propertyAmenities]));
        setCustomAmenities(allAmenities);

        setFormData({
          name: property.name,
          description: property.description,
          address: property.location.address,
          city: property.location.city,
          postalCode: property.location.postalCode,
          university: property.location.university,
          minRent: property.pricing.minRent.toString(),
          maxRent: property.pricing.maxRent.toString(),
          deposit: property.pricing.deposit.toString(),
          totalRooms: property.rooms.total.toString(),
          availableRooms: property.rooms.available.toString(),
          roomTypes: property.roomTypes.map((rt: any) => ({
            type: rt.type,
            quantity: rt.quantity.toString(),
            availableQuantity: rt.availableQuantity.toString(),
            pricePerMonth: rt.pricePerMonth.toString(),
            description: rt.description || '',
            leaseDuration: rt.leaseDuration || '',
          })),
          amenities: propertyAmenities,
          nsfasAccreditation: property.nsfasAccreditation,
          isActive: property.isActive,
          images: property.images || [],
        });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load property');
      } finally {
        setLoadingData(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin' && propertyId) {
      fetchProperty();
    }
  }, [isAuthenticated, user, propertyId]);

  if (isLoading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleAmenityChange = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleAddCustomAmenity = () => {
    if (newAmenityInput.trim() && !customAmenities.includes(newAmenityInput.trim())) {
      setCustomAmenities([...customAmenities, newAmenityInput.trim()]);
      setNewAmenityInput('');
    }
  };

  const handleRemoveCustomAmenity = (index: number) => {
    setCustomAmenities((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddCustomRoomType = () => {
    if (newRoomTypeInput.trim() && !customRoomTypes.includes(newRoomTypeInput.trim())) {
      setCustomRoomTypes([...customRoomTypes, newRoomTypeInput.trim()]);
      setNewRoomTypeInput('');
    }
  };

  const handleRemoveCustomRoomType = (index: number) => {
    setCustomRoomTypes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddRoomType = () => {
    setFormData((prev) => ({
      ...prev,
      roomTypes: [
        ...prev.roomTypes,
        {
          type: '',
          quantity: '',
          availableQuantity: '',
          pricePerMonth: '',
          description: '',
          leaseDuration: '',
        },
      ],
    }));
  };

  const handleRemoveRoomType = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      roomTypes: prev.roomTypes.filter((_, i) => i !== index),
    }));
  };

  const handleRoomTypeChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.roomTypes];
      let parsedValue: any = value;
      
      if (['quantity', 'availableQuantity', 'pricePerMonth'].includes(field)) {
        parsedValue = parseInt(value) || 0;
      }
      
      updated[index] = { ...updated[index], [field]: parsedValue };
      return { ...prev, roomTypes: updated };
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const previews = files.map((file) => {
      const reader = new FileReader();
      return new Promise<string>((resolve) => {
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previews).then((results) => {
      setImagePreviews((prev) => [...prev, ...results]);
    });

    setNewImages((prev) => [...prev, ...files]);
  };

  const handleRemoveImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (
        !formData.name ||
        !formData.description ||
        !formData.address ||
        !formData.city ||
        !formData.university ||
        !formData.minRent ||
        !formData.maxRent ||
        !formData.deposit ||
        !formData.totalRooms ||
        formData.availableRooms === ''
      ) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const availableRooms = parseInt(formData.availableRooms);
      const totalRooms = parseInt(formData.totalRooms);

      if (availableRooms > totalRooms) {
        setError('Available rooms cannot exceed total rooms');
        setLoading(false);
        return;
      }

      if (formData.roomTypes.length > 0) {
        for (let rt of formData.roomTypes) {
          if (!rt.type || !rt.quantity || rt.quantity === '0' || !rt.availableQuantity || rt.availableQuantity === '0' || !rt.pricePerMonth || rt.pricePerMonth === '0' || !rt.leaseDuration) {
            setError('Please fill in all room type fields (Type, Quantity, Available, Price, and Lease Duration)');
            setLoading(false);
            return;
          }
        }

        const totalRoomTypesQty = formData.roomTypes.reduce((sum, rt) => sum + parseInt(rt.quantity || '0'), 0);
        if (totalRoomTypesQty !== totalRooms) {
          setError(
            `Total room types quantity (${totalRoomTypesQty}) must equal total rooms (${totalRooms})`
          );
          setLoading(false);
          return;
        }
      }

      const response = await api.put(`/admin/properties/${propertyId}`, {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        university: formData.university,
        minRent: parseInt(formData.minRent),
        maxRent: parseInt(formData.maxRent),
        deposit: parseInt(formData.deposit),
        totalRooms: parseInt(formData.totalRooms),
        availableRooms: parseInt(formData.availableRooms),
        roomTypes: formData.roomTypes.length > 0 ? formData.roomTypes : undefined,
        amenities: formData.amenities,
        nsfasAccreditation: formData.nsfasAccreditation,
        isActive: formData.isActive,
        images: formData.images,
      });

      if (!response.data.success) {
        setError('Failed to update property');
        setLoading(false);
        return;
      }

      if (newImages.length > 0) {
        setUploadingImage(true);
        let uploadedImages: string[] = [];

        for (const file of newImages) {
          const imageFormData = new FormData();
          imageFormData.append('file', file);

          try {
            const uploadResponse = await api.post(
              `/admin/properties/${propertyId}/upload-image`,
              imageFormData,
              {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              }
            );

            if (uploadResponse.data.imageUrl) {
              uploadedImages.push(uploadResponse.data.imageUrl);
            }
          } catch (imgErr: any) {
            console.error('Image upload failed:', imgErr);
          }
        }

        if (uploadedImages.length > 0) {
          const allImages = [...formData.images, ...uploadedImages];
          await api.put(`/admin/properties/${propertyId}`, {
            images: allImages,
          });
        }

        setUploadingImage(false);
      }

      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Cosy Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{user?.name}</span>
            <button
              onClick={() => {
                localStorage.clear();
                router.push('/');
              }}
              className="btn-secondary px-4 py-2 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-8">
        <div className="mb-6">
          <Link href="/admin/dashboard" className="text-primary hover:underline font-semibold">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold mb-8">Edit Property</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="card p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Cosy Student Residence"
                className="input-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your property..."
                rows={4}
                className="input-base"
                required
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Location</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g., 123 Main Street"
                    className="input-base"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g., Cape Town"
                      className="input-base"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      placeholder="e.g., 8000"
                      className="input-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nearby University *
                  </label>
                  <select
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    className="input-base"
                    required
                  >
                    <option value="">Select university</option>
                    {UNIVERSITIES.map((uni) => (
                      <option key={uni} value={uni}>
                        {uni}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Pricing</h3>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Rent (R) *
                  </label>
                  <input
                    type="number"
                    name="minRent"
                    value={formData.minRent}
                    onChange={handleChange}
                    placeholder="e.g., 3000"
                    className="input-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Rent (R) *
                  </label>
                  <input
                    type="number"
                    name="maxRent"
                    value={formData.maxRent}
                    onChange={handleChange}
                    placeholder="e.g., 5000"
                    className="input-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deposit (R) *
                  </label>
                  <input
                    type="number"
                    name="deposit"
                    value={formData.deposit}
                    onChange={handleChange}
                    placeholder="e.g., 5000"
                    className="input-base"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Images</h3>

              {formData.images.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">Existing Images</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Image ${index}`}
                          className="w-full h-24 object-cover rounded border-2 border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <HiX className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {imagePreviews.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">New Images to Upload</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index}`}
                          className="w-full h-24 object-cover rounded border-2 border-blue-300 bg-blue-50"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <HiX className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 mb-2 block">
                    Add More Images
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary file:text-white
                      hover:file:bg-primary/90"
                    disabled={uploadingImage}
                  />
                  <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB each (Optional)</p>
                </label>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Rooms</h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Rooms *
                  </label>
                  <input
                    type="number"
                    name="totalRooms"
                    value={formData.totalRooms}
                    onChange={handleChange}
                    placeholder="e.g., 10"
                    className="input-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Rooms *
                  </label>
                  <input
                    type="number"
                    name="availableRooms"
                    value={formData.availableRooms}
                    onChange={handleChange}
                    placeholder="e.g., 3"
                    className="input-base"
                    required
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-gray-700">Room Type Details (Optional)</h4>
                  <button
                    type="button"
                    onClick={handleAddRoomType}
                    className="text-sm bg-primary text-white px-3 py-1 rounded hover:bg-primary/90"
                  >
                    + Add Room Type
                  </button>
                </div>

                {formData.roomTypes.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Specify room type details to help students find what they need
                  </p>
                ) : (
                  <div className="space-y-4">
                    {formData.roomTypes.map((roomType, index) => (
                      <div key={index} className="bg-white p-4 rounded border border-gray-200">
                        <div className="flex justify-between items-start mb-3">
                          <span className="font-medium text-gray-700">Room Type {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveRoomType(index)}
                            className="text-red-500 hover:text-red-700 text-sm font-semibold"
                          >
                            Remove
                          </button>
                        </div>

                        {index === 0 && (
                          <div className="bg-blue-50 p-3 rounded mb-4 border border-blue-200">
                            <h5 className="font-semibold text-gray-700 mb-3 text-sm">Manage Room Types</h5>
                            <p className="text-xs text-gray-600 mb-3">Add custom room types for your property</p>
                            
                            <div className="flex gap-2 mb-3">
                              <input
                                type="text"
                                value={newRoomTypeInput}
                                onChange={(e) => setNewRoomTypeInput(e.target.value)}
                                placeholder="e.g., Single Deluxe, Double Trio"
                                className="input-base flex-1 text-sm"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddCustomRoomType();
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={handleAddCustomRoomType}
                                className="bg-primary text-white px-3 py-2 rounded hover:bg-primary/90 font-medium text-sm"
                              >
                                Add
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {customRoomTypes.map((type, typeIndex) => (
                                <div
                                  key={typeIndex}
                                  className="bg-white px-2 py-1 rounded border border-gray-300 flex items-center gap-2"
                                >
                                  <span className="text-xs text-gray-700">{type}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveCustomRoomType(typeIndex)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <HiX className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Room Type *
                            </label>
                            <select
                              value={roomType.type}
                              onChange={(e) =>
                                handleRoomTypeChange(index, 'type', e.target.value)
                              }
                              className="input-base text-sm"
                              required
                            >
                              <option value="">Select type</option>
                              {customRoomTypes.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Quantity *
                            </label>
                            <input
                              type="number"
                              value={roomType.quantity}
                              onChange={(e) =>
                                handleRoomTypeChange(index, 'quantity', e.target.value)
                              }
                              placeholder="e.g., 3"
                              className="input-base text-sm"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Available *
                            </label>
                            <input
                              type="number"
                              value={roomType.availableQuantity}
                              onChange={(e) =>
                                handleRoomTypeChange(index, 'availableQuantity', e.target.value)
                              }
                              placeholder="e.g., 1"
                              className="input-base text-sm"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Price/Month (R) *
                            </label>
                            <input
                              type="number"
                              value={roomType.pricePerMonth}
                              onChange={(e) =>
                                handleRoomTypeChange(index, 'pricePerMonth', e.target.value)
                              }
                              placeholder="e.g., 3500"
                              className="input-base text-sm"
                              required
                            />
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={roomType.description}
                            onChange={(e) =>
                              handleRoomTypeChange(index, 'description', e.target.value)
                            }
                            placeholder="e.g., Ensuite bathroom, window view"
                            className="input-base text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Lease Duration *
                          </label>
                          <input
                            type="text"
                            value={roomType.leaseDuration}
                            onChange={(e) =>
                              handleRoomTypeChange(index, 'leaseDuration', e.target.value)
                            }
                            placeholder="e.g., 1 year, Flexible, Semester only"
                            className="input-base text-sm"
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">Enter custom lease duration</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Amenities</h3>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-gray-700 mb-3">Manage Amenities</h4>
                <p className="text-sm text-gray-600 mb-4">Add custom amenities specific to your property</p>
                
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newAmenityInput}
                    onChange={(e) => setNewAmenityInput(e.target.value)}
                    placeholder="e.g., Air Conditioning, Balcony, Pool"
                    className="input-base flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomAmenity();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomAmenity}
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 font-medium"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {customAmenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="bg-white px-3 py-2 rounded border border-gray-300 flex items-center gap-2"
                    >
                      <span className="text-sm text-gray-700">{amenity}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomAmenity(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <HiX className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {customAmenities.map((amenity) => (
                  <label key={amenity} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityChange(amenity)}
                      className="w-4 h-4 text-primary rounded"
                    />
                    <span className="text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t pt-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="nsfasAccreditation"
                  checked={formData.nsfasAccreditation}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="text-gray-700 font-medium">NSFAS Accredited</span>
              </label>
              <p className="text-sm text-gray-500 mt-2">
                Mark if your property is accredited for NSFAS funding
              </p>
            </div>

            <div className="border-t pt-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="text-gray-700 font-medium">Active</span>
              </label>
              <p className="text-sm text-gray-500 mt-2">
                Uncheck to hide this property from search results
              </p>
            </div>

            <div className="border-t pt-6 flex gap-4">
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="flex-1 btn-primary py-3 font-semibold disabled:opacity-50"
              >
                {loading ? 'Saving...' : uploadingImage ? 'Uploading images...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/dashboard')}
                className="flex-1 btn-secondary py-3 font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
