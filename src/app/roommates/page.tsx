'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import StudentLayout from '@/components/student/StudentLayout';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import MessageRoundedIcon from '@mui/icons-material/MessageRounded';

interface Match {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  university?: string;
  course?: string;
  yearOfStudy?: string;
  fundingType?: string;
  isVerified?: boolean;
  profileComplete?: boolean;
  matchScore: number;
}

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', '6th Year', 'Postgrad'];
const FUNDING = ['NSFAS', 'Private', 'Self-funded'];

export default function RoommatesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [fundingType, setFundingType] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/');
  }, [isLoading, isAuthenticated, router]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (yearOfStudy) params.set('yearOfStudy', yearOfStudy);
      if (fundingType) params.set('fundingType', fundingType);
      const res = await api.get(`/student/roommates?${params.toString()}`);
      setMatches(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load roommate matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const topTier = useMemo(() => matches.filter((m) => m.matchScore >= 60), [matches]);

  const startConversation = async (match: Match) => {
    try {
      const created = await api.post('/messages', { recipientId: match._id });
      const conversationId = created?.data?.data?._id;
      if (conversationId) router.push(`/messages?conversationId=${conversationId}`);
    } catch {
      setError('Could not start conversation. Please try again.');
    }
  };

  return (
    <StudentLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Stack sx={{ flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 2, gap: 1.5 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Roommate Matching</Typography>
            <Typography variant="body2" color="text.secondary">Find compatible students by university, course and funding profile.</Typography>
          </Box>
          <Chip label={`${matches.length} matches`} color="primary" variant="outlined" />
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper variant="outlined" sx={{ p: 2, mb: 2.5, borderRadius: 2.5 }}>
          <Stack sx={{ flexDirection: { xs: 'column', md: 'row' }, gap: 1.5 }}>
            <TextField
              size="small"
              label="Search"
              placeholder="Name, university, course"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
            />
            <TextField
              size="small"
              select
              label="Year"
              value={yearOfStudy}
              onChange={(e) => setYearOfStudy(e.target.value)}
              sx={{ minWidth: { md: 180 } }}
            >
              <MenuItem value="">All</MenuItem>
              {YEARS.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
            </TextField>
            <TextField
              size="small"
              select
              label="Funding"
              value={fundingType}
              onChange={(e) => setFundingType(e.target.value)}
              sx={{ minWidth: { md: 180 } }}
            >
              <MenuItem value="">All</MenuItem>
              {FUNDING.map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
            </TextField>
            <Button variant="contained" onClick={fetchMatches} sx={{ textTransform: 'none', minWidth: { md: 120 } }}>Apply</Button>
          </Stack>
        </Paper>

        {topTier.length > 0 && (
          <Alert severity="success" icon={<CheckCircleRoundedIcon />} sx={{ mb: 2 }}>
            {topTier.length} high-compatibility matches found (60%+).
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
        ) : matches.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderRadius: 2.5 }}>
            <Typography sx={{ fontWeight: 600, mb: 0.5 }}>No roommate matches yet</Typography>
            <Typography variant="body2" color="text.secondary">Try broader filters and run matching again.</Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 2 }}>
            {matches.map((m) => (
              <Paper key={m._id} variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
                <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
                  <Stack direction="row" sx={{ gap: 1.25, minWidth: 0 }}>
                    <Avatar src={m.avatar || undefined} sx={{ width: 44, height: 44 }}>
                      {(m.name || 'S')[0]?.toUpperCase()}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                        <Typography sx={{ fontWeight: 700 }} noWrap>{m.name}</Typography>
                        {m.isVerified && <Chip size="small" color="success" label="Verified" />}
                      </Stack>
                      <Typography variant="caption" color="text.secondary" noWrap>{m.email}</Typography>
                      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                        <SchoolRoundedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                        <Typography variant="caption" color="text.secondary" noWrap>{m.university || 'University not set'}</Typography>
                      </Stack>
                    </Box>
                  </Stack>
                  <Chip label={`${m.matchScore}%`} color={m.matchScore >= 60 ? 'success' : 'default'} variant={m.matchScore >= 60 ? 'filled' : 'outlined'} />
                </Stack>

                <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap', my: 1.5 }}>
                  {m.course && <Chip size="small" label={m.course} variant="outlined" />}
                  {m.yearOfStudy && <Chip size="small" label={m.yearOfStudy} variant="outlined" />}
                  {m.fundingType && <Chip size="small" label={m.fundingType} variant="outlined" />}
                </Stack>

                <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
                  <Button size="small" startIcon={<MessageRoundedIcon />} onClick={() => startConversation(m)} sx={{ textTransform: 'none', fontWeight: 600 }}>
                    Message
                  </Button>
                </Stack>
              </Paper>
            ))}
          </Box>
        )}
      </Box>
    </StudentLayout>
  );
}
