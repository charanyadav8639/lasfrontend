import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { apiClient } from '../api/client';
import { BookingResponseDTO, ServiceProviderResponseDTO, ServiceResponseDTO, BookingStatus, ProviderType, ServiceWorkerResponseDTO } from '../types';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { MapPin, Calendar, Users } from 'lucide-react';

export function Bookings() {
  const { user } = useAuth();
  const location = useLocation();
  const state = location.state as { providerId?: number; serviceId?: number; serviceName?: string } | null;

  const [bookings, setBookings] = useState<BookingResponseDTO[]>([]);
  const [providers, setProviders] = useState<ServiceProviderResponseDTO[]>([]);
  const [services, setServices] = useState<ServiceResponseDTO[]>([]);
  const [workers, setWorkers] = useState<ServiceWorkerResponseDTO[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [selectedProvider, setSelectedProvider] = useState(state?.providerId?.toString() || '');
  const [selectedService, setSelectedService] = useState(state?.serviceId?.toString() || '');
  const [selectedWorker, setSelectedWorker] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [address, setAddress] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [locationSearch, setLocationSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [provRes, bookRes] = await Promise.all([
        apiClient.get('/service-providers'),
        apiClient.get('/bookings')
      ]);
      setProviders(provRes.data);
      setBookings(bookRes.data);
    } catch (e) {
      console.error('Failed to load data', e);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadServicesForProvider = async (providerId: string) => {
    if (!providerId) {
      setServices([]);
      return;
    }
    try {
      const res = await apiClient.get(`/services?providerId=${providerId}`);
      setServices(res.data);
    } catch (e) {
      console.error('Failed to load services', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedProvider) {
      loadServicesForProvider(selectedProvider);
      const p = providers.find(provider => provider.id.toString() === selectedProvider);
      if (p?.providerType === ProviderType.COMPANY) {
        loadWorkers(parseInt(selectedProvider));
      } else {
        setWorkers([]);
        setSelectedWorker('');
      }
    } else {
      setServices([]);
      setWorkers([]);
      setSelectedWorker('');
    }
    if (!state?.serviceId) {
      setSelectedService('');
    } else {
      setSelectedService(state.serviceId.toString());
    }
  }, [selectedProvider, providers, state?.serviceId]);

  const loadWorkers = async (companyId: number) => {
    try {
      const res = await apiClient.get(`/service-workers?companyId=${companyId}`);
      setWorkers(res.data);
    } catch (e) {
      console.error('Failed to load workers', e);
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setCreating(true);
    setError('');

    try {
      await apiClient.post('/bookings', {
        userId: user.id,
        providerId: parseInt(selectedProvider),
        serviceId: parseInt(selectedService),
        workerId: selectedWorker ? parseInt(selectedWorker) : null,
        bookingDate,
        address,
        issueDescription,
        status: BookingStatus.PENDING
      });
      await loadData();
      // Reset form
      setSelectedProvider('');
      setSelectedService('');
      setSelectedWorker('');
      setBookingDate('');
      setAddress('');
      setIssueDescription('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setCreating(false);
    }
  };

  const statusColor: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  const userBookings = bookings.filter(b => b.userId === user?.id);

  if (!user) {
    return <div className="p-8 text-center text-muted-foreground">Please log in to view and manage bookings.</div>;
  }

  const selectedProviderObj = providers.find(p => p.id.toString() === selectedProvider);
  const isCompany = selectedProviderObj?.providerType === ProviderType.COMPANY;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* List of bookings */}
      <div className="lg:col-span-2">
        <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">Loading...</div>
        ) : userBookings.length === 0 ? (
          <div className="text-muted-foreground p-8 border rounded-lg border-dashed text-center">
            You don't have any bookings yet. Fill the form to book a service.
          </div>
        ) : (
          <div className="space-y-4">
            {userBookings.map(booking => (
              <Card key={booking.id}>
                <CardHeader>
                  <CardTitle className="text-lg flex justify-between items-center">
                    <span>Booking #{booking.id}</span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[booking.status] || 'bg-secondary text-secondary-foreground'}`}>
                      {booking.status}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2 text-muted-foreground">
                  <div className="text-foreground font-semibold mb-1">
                    {booking.serviceName}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(booking.bookingDate).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {booking.address}
                  </div>
                  {booking.workerName && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Assigned Worker: <span className="text-foreground font-medium">{booking.workerName}</span>
                    </div>
                  )}
                  {booking.issueDescription && (
                    <div className="mt-4 p-3 bg-secondary/30 rounded-lg border border-foreground/5 italic text-xs">
                      <span className="font-bold block not-italic mb-1 uppercase tracking-widest text-[10px] opacity-70">Issue Reported:</span>
                      "{booking.issueDescription}"
                    </div>
                  )}
                  <div className="pt-2 text-[10px] uppercase tracking-wider opacity-50">
                    Provider ID: {booking.providerId}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Booking Form */}
      <div>
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle>Schedule a Service</CardTitle>
          </CardHeader>
          <form onSubmit={handleCreateBooking}>
            <CardContent className="space-y-4">
              {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Service Provider</label>
                <select 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={selectedProvider}
                  onChange={e => setSelectedProvider(e.target.value)}
                  required
                >
                  <option value="" disabled>Select Provider</option>
                  {Array.from(new Set(providers.map(p => p.name)))
                    .map(name => providers.find(p => p.name === name))
                    .filter(p => p !== undefined)
                    .filter(p => !locationSearch || p!.location.toLowerCase().includes(locationSearch.toLowerCase()))
                    .map(p => <option key={p!.id} value={p!.id}>{p!.name} at {p!.location}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Filter Provider by Location</label>
                <Input 
                  placeholder="e.g. Springfield"
                  value={locationSearch}
                  onChange={e => setLocationSearch(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Service</label>
                <select 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={selectedService}
                  onChange={e => setSelectedService(e.target.value)}
                  required
                >
                  <option value="" disabled>Select Service</option>
                  {services
                    .map(s => <option key={s.id} value={s.id}>{s.serviceName} (${s.price})</option>)}
                </select>
              </div>

              {isCompany && workers.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Worker (Optional)</label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={selectedWorker}
                    onChange={e => setSelectedWorker(e.target.value)}
                  >
                    <option value="">Any Available Worker</option>
                    {workers.filter(w => w.available).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Your Address</label>
                <Input 
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. 12 Main St, Springfield"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Describe the issue</label>
                <textarea 
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="e.g. My sink is leaking from the drain pipe..."
                  value={issueDescription}
                  onChange={e => setIssueDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date & Time</label>
                <Input 
                  type="datetime-local" 
                  value={bookingDate}
                  onChange={e => setBookingDate(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <div className="p-6 pt-0">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={creating || !selectedProvider || !selectedService || !bookingDate || !address}
              >
                {creating ? "Submitting..." : "Confirm Booking"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
