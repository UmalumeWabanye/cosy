'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LandlordLayout from '@/components/landlord/LandlordLayout';
import api from '@/services/api';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

const ROOM_TYPES = ['Single', 'Sharing', 'Ensuite', 'Bachelor'];
const TRANSPORT_MODES = [
  { value: 'private', label: 'Private transport provided by residence' },
  { value: 'campus_route', label: 'Located on campus shuttle route' },
  { value: 'both', label: 'Both private and campus-route support' },
];

type TransportScheduleForm = {
  routeName: string;
  pickupFromResidence: string;
  departureToCampus: string;
  returnPickupFromCampus: string;
  arrivalAtResidence: string;
  days: string;
};

const createEmptySchedule = (): TransportScheduleForm => ({
  routeName: '',
  pickupFromResidence: '',
  departureToCampus: '',
  returnPickupFromCampus: '',
  arrivalAtResidence: '',
  days: '',
});

export default function NewLandlordPropertyPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    propertyName: '',
    city: '',
    address: '',
    universityNearby: '',
    price: '',
    roomType: 'Single',
    totalRooms: '',
    availableRooms: '',
    description: '',
    distanceFromCampus: '',
    amenities: '',
    utilities: '',
    rules: '',
    nsfasAccredited: false,
    isAvailable: true,
    paymentStatus: 'not_applicable',
    contractStatus: 'not_applicable',
    communicationChannel: 'WhatsApp',
    transportationEnabled: false,
    transportationMode: 'private',
    transportationProviderName: '',
    transportationContact: '',
    transportationNotes: '',
  });
  const [transportSchedules, setTransportSchedules] = useState<TransportScheduleForm[]>([]);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'landlord')) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, user, router]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.propertyName || !form.city || !form.address || !form.universityNearby || !form.price || !form.roomType) {
      setError('Please fill all required fields.');
      return;
    }
    if (form.totalRooms === '' || form.availableRooms === '') {
      setError('Please enter the total rooms and available rooms.');
      return;
    }
    if (Number(form.availableRooms) > Number(form.totalRooms)) {
      setError('Available rooms cannot exceed total rooms.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.post('/properties', {
        propertyName: form.propertyName,
        city: form.city,
        address: form.address,
        universityNearby: form.universityNearby,
        price: Number(form.price),
        roomType: form.roomType,
        totalRooms: Number(form.totalRooms),
        availableRooms: Number(form.availableRooms),
        description: form.description || undefined,
        distanceFromCampus: form.distanceFromCampus ? Number(form.distanceFromCampus) : undefined,
        amenities: form.amenities
          ? form.amenities.split(',').map((item) => item.trim()).filter(Boolean)
          : [],
        utilities: form.utilities
          ? form.utilities.split(',').map((item) => item.trim()).filter(Boolean)
          : [],
        rules: form.rules
          ? form.rules.split('\n').map((item) => item.trim()).filter(Boolean)
          : [],
        paymentStatus: form.paymentStatus,
        contractStatus: form.contractStatus,
        communicationChannel: form.communicationChannel,
        nsfasAccredited: form.nsfasAccredited,
        isAvailable: form.isAvailable,
        transportation: form.transportationEnabled
          ? {
              enabled: true,
              mode: form.transportationMode,
              providerName: form.transportationProviderName.trim(),
              contact: form.transportationContact.trim(),
              notes: form.transportationNotes.trim(),
              schedules: transportSchedules
                .map((schedule) => ({
                  routeName: schedule.routeName.trim(),
                  pickupFromResidence: schedule.pickupFromResidence.trim(),
                  departureToCampus: schedule.departureToCampus.trim(),
                  returnPickupFromCampus: schedule.returnPickupFromCampus.trim(),
                  arrivalAtResidence: schedule.arrivalAtResidence.trim(),
                  days: schedule.days
                    .split(',')
                    .map((day) => day.trim())
                    .filter(Boolean),
                }))
                .filter((schedule) =>
                  schedule.routeName ||
                  schedule.pickupFromResidence ||
                  schedule.departureToCampus ||
                  schedule.returnPickupFromCampus ||
                  schedule.arrivalAtResidence ||
                  schedule.days.length
                ),
            }
          : { enabled: false, mode: 'none', providerName: '', contact: '', notes: '', schedules: [] },
      });
      router.push('/landlord/properties');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return null;

  return (
    <LandlordLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 3, gap: 1.5 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Add Property</Typography>
          <Typography variant="body2" color="text.secondary">This listing is owned by your landlord account only.</Typography>
        </Box>
        <Button variant="outlined" onClick={() => router.push('/landlord/properties')} sx={{ textTransform: 'none' }}>Cancel</Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 3, maxWidth: 860 }} component="form" onSubmit={submit}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stack sx={{ gap: 2 }}>
          <TextField label="Property Name" required value={form.propertyName} onChange={(e) => setForm((prev) => ({ ...prev, propertyName: e.target.value }))} />
          <TextField label="Address" required value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} />
          <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 2 }}>
            <TextField label="City" required fullWidth value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} />
              <TextField label="Nearby University / College" required fullWidth value={form.universityNearby} onChange={(e) => setForm((prev) => ({ ...prev, universityNearby: e.target.value }))} />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 2 }}>
            <TextField label="Price (ZAR)" type="number" required fullWidth value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} />
            <TextField label="Room Type" select required fullWidth value={form.roomType} onChange={(e) => setForm((prev) => ({ ...prev, roomType: e.target.value }))}>
              {ROOM_TYPES.map((roomType) => <MenuItem key={roomType} value={roomType}>{roomType}</MenuItem>)}
            </TextField>
          </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 2 }}>
              <TextField label="Total Rooms" type="number" required fullWidth value={form.totalRooms} onChange={(e) => setForm((prev) => ({ ...prev, totalRooms: e.target.value }))} />
              <TextField label="Available Rooms" type="number" required fullWidth value={form.availableRooms} onChange={(e) => setForm((prev) => ({ ...prev, availableRooms: e.target.value }))} />
            </Stack>

          <TextField label="Distance From Campus (km)" type="number" value={form.distanceFromCampus} onChange={(e) => setForm((prev) => ({ ...prev, distanceFromCampus: e.target.value }))} />
          <TextField label="Amenities (comma separated)" value={form.amenities} onChange={(e) => setForm((prev) => ({ ...prev, amenities: e.target.value }))} />
            <TextField label="Utilities Included (comma separated)" value={form.utilities} onChange={(e) => setForm((prev) => ({ ...prev, utilities: e.target.value }))} />
            <TextField label="House Rules" multiline rows={3} placeholder="One rule per line" value={form.rules} onChange={(e) => setForm((prev) => ({ ...prev, rules: e.target.value }))} />
          <TextField label="Description" multiline rows={4} value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />

            <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 2 }}>
              <TextField select fullWidth label="Payment Status" value={form.paymentStatus} onChange={(e) => setForm((prev) => ({ ...prev, paymentStatus: e.target.value }))}>
                <MenuItem value="not_applicable">Not applicable</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="due">Due</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
              </TextField>
              <TextField select fullWidth label="Contract Status" value={form.contractStatus} onChange={(e) => setForm((prev) => ({ ...prev, contractStatus: e.target.value }))}>
                <MenuItem value="not_applicable">Not applicable</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="sent">Sent</MenuItem>
                <MenuItem value="signed">Signed</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
              </TextField>
            </Stack>

            <TextField label="Communication Channel" helperText="e.g. WhatsApp, email, SMS, in-app chat" value={form.communicationChannel} onChange={(e) => setForm((prev) => ({ ...prev, communicationChannel: e.target.value }))} />

            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Transportation Setup</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Configure private residence transport or campus-route schedules visible to students.
              </Typography>

              <FormControlLabel
                control={<Checkbox checked={form.transportationEnabled} onChange={(e) => setForm((prev) => ({ ...prev, transportationEnabled: e.target.checked }))} />}
                label="This property has transportation support"
              />

              {form.transportationEnabled && (
                <Stack sx={{ gap: 1.5, mt: 1.5 }}>
                  <TextField
                    select
                    label="Transport Type"
                    value={form.transportationMode}
                    onChange={(e) => setForm((prev) => ({ ...prev, transportationMode: e.target.value }))}
                  >
                    {TRANSPORT_MODES.map((mode) => <MenuItem key={mode.value} value={mode.value}>{mode.label}</MenuItem>)}
                  </TextField>
                  <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1.5 }}>
                    <TextField label="Provider Name" fullWidth value={form.transportationProviderName} onChange={(e) => setForm((prev) => ({ ...prev, transportationProviderName: e.target.value }))} />
                    <TextField label="Transport Contact" fullWidth value={form.transportationContact} onChange={(e) => setForm((prev) => ({ ...prev, transportationContact: e.target.value }))} />
                  </Stack>
                  <TextField label="Transport Notes" multiline rows={2} placeholder="Optional notes for students" value={form.transportationNotes} onChange={(e) => setForm((prev) => ({ ...prev, transportationNotes: e.target.value }))} />

                  <Stack sx={{ gap: 1 }}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Route Schedules</Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setTransportSchedules((prev) => [...prev, createEmptySchedule()])}
                        sx={{ textTransform: 'none' }}
                      >
                        Add Route
                      </Button>
                    </Stack>

                    {transportSchedules.length === 0 ? (
                      <Typography variant="caption" color="text.secondary">No schedules yet. Add a route to show pickup/return times to students.</Typography>
                    ) : transportSchedules.map((schedule, index) => (
                      <Paper key={index} variant="outlined" sx={{ p: 1.5 }}>
                        <Stack sx={{ gap: 1 }}>
                          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>Route {index + 1}</Typography>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => setTransportSchedules((prev) => prev.filter((_, idx) => idx !== index))}
                              sx={{ textTransform: 'none', minWidth: 0, px: 1 }}
                            >
                              Remove
                            </Button>
                          </Stack>
                          <TextField
                            label="Route Name"
                            size="small"
                            value={schedule.routeName}
                            onChange={(e) => setTransportSchedules((prev) => prev.map((item, idx) => idx === index ? { ...item, routeName: e.target.value } : item))}
                          />
                          <TextField
                            label="Pickup From Residence"
                            size="small"
                            value={schedule.pickupFromResidence}
                            onChange={(e) => setTransportSchedules((prev) => prev.map((item, idx) => idx === index ? { ...item, pickupFromResidence: e.target.value } : item))}
                          />
                          <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1 }}>
                            <TextField
                              label="Departure To Campus (e.g. 07:00)"
                              size="small"
                              fullWidth
                              value={schedule.departureToCampus}
                              onChange={(e) => setTransportSchedules((prev) => prev.map((item, idx) => idx === index ? { ...item, departureToCampus: e.target.value } : item))}
                            />
                            <TextField
                              label="Campus Pickup Return (e.g. 17:00)"
                              size="small"
                              fullWidth
                              value={schedule.returnPickupFromCampus}
                              onChange={(e) => setTransportSchedules((prev) => prev.map((item, idx) => idx === index ? { ...item, returnPickupFromCampus: e.target.value } : item))}
                            />
                          </Stack>
                          <TextField
                            label="Arrival Back at Residence"
                            size="small"
                            value={schedule.arrivalAtResidence}
                            onChange={(e) => setTransportSchedules((prev) => prev.map((item, idx) => idx === index ? { ...item, arrivalAtResidence: e.target.value } : item))}
                          />
                          <TextField
                            label="Operating Days"
                            size="small"
                            placeholder="Mon, Tue, Wed, Thu, Fri"
                            value={schedule.days}
                            onChange={(e) => setTransportSchedules((prev) => prev.map((item, idx) => idx === index ? { ...item, days: e.target.value } : item))}
                          />
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </Stack>
              )}
            </Paper>

          <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 2 }}>
            <FormControlLabel control={<Checkbox checked={form.nsfasAccredited} onChange={(e) => setForm((prev) => ({ ...prev, nsfasAccredited: e.target.checked }))} />} label="NSFAS Accredited" />
            <FormControlLabel control={<Checkbox checked={form.isAvailable} onChange={(e) => setForm((prev) => ({ ...prev, isAvailable: e.target.checked }))} />} label="Available" />
          </Stack>

          <Stack direction="row" sx={{ justifyContent: 'flex-end', gap: 1.25 }}>
            <Button variant="outlined" onClick={() => router.push('/landlord/properties')} sx={{ textTransform: 'none' }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading} sx={{ textTransform: 'none', fontWeight: 700 }}>
              {loading ? <CircularProgress size={18} /> : 'Create Property'}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
    </LandlordLayout>
  );
}
