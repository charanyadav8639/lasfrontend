import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ServiceProviderResponseDTO, Role, ServiceType, ProviderType, BookingResponseDTO, BookingStatus, ServiceWorkerResponseDTO, ServiceResponseDTO } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { MapPin, Calendar, CircleCheck, CircleX, Users, UserPlus, Trash2, Phone } from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();

  // Provider selection/creation
  const [providers, setProviders] = useState<ServiceProviderResponseDTO[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');

  // Form state (Provider)
  const [newProviderName, setNewProviderName] = useState(user?.name || '');
  const [newProviderType, setNewProviderType] = useState<ServiceType>(ServiceType.PLUMBER);
  const [newProviderCategoryType, setNewProviderCategoryType] = useState<ProviderType>(ProviderType.INDIVIDUAL);
  const [newProviderLocation, setNewProviderLocation] = useState('');
  const [newProviderPhone, setNewProviderPhone] = useState('');
  const [creatingProvider, setCreatingProvider] = useState(false);

  // Service form
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceCategory, setServiceCategory] = useState<ServiceType>(ServiceType.PLUMBER);
  const [servicePrice, setServicePrice] = useState('');
  const [creatingService, setCreatingService] = useState(false);

  // Worker form
  const [workerName, setWorkerName] = useState('');
  const [workerPhone, setWorkerPhone] = useState('');
  const [workerSpecialization, setWorkerSpecialization] = useState('');
  const [creatingWorker, setCreatingWorker] = useState(false);
  const [workers, setWorkers] = useState<ServiceWorkerResponseDTO[]>([]);

  const [message, setMessage] = useState('');

  // Incoming bookings for this provider
  const [bookings, setBookings] = useState<BookingResponseDTO[]>([]);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Managed services for selected provider
  const [providerServices, setProviderServices] = useState<ServiceResponseDTO[]>([]);

  useEffect(() => {
    loadProviders();
    loadBookings();
  }, []);

  useEffect(() => {
    if (selectedProviderId) {
      loadWorkers(parseInt(selectedProviderId));
      loadProviderServices(parseInt(selectedProviderId));
    } else {
      setWorkers([]);
      setProviderServices([]);
    }
  }, [selectedProviderId]);

  const loadProviders = async () => {
    if (!user) return;
    try {
      const res = await apiClient.get(`/service-providers/my?ownerId=${user.id}`);
      setProviders(res.data);
      if (res.data.length > 0) {
        setSelectedProviderId(res.data[0].id.toString());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadWorkers = async (companyId: number) => {
    try {
      const res = await apiClient.get(`/service-workers?companyId=${companyId}`);
      setWorkers(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadProviderServices = async (providerId: number) => {
    try {
      const res = await apiClient.get(`/services?providerId=${providerId}`);
      setProviderServices(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadBookings = async () => {
    try {
      const res = await apiClient.get('/bookings');
      setBookings(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingProvider(true);
    setMessage('');
    try {
      const res = await apiClient.post('/service-providers', {
        name: newProviderName,
        serviceType: newProviderType,
        providerType: newProviderCategoryType,
        location: newProviderLocation,
        phone: newProviderPhone,
        ownerId: user?.id,
        availability: true
      });
      await loadProviders();
      setSelectedProviderId(res.data.id.toString());
      setMessage('Provider profile created successfully!');
    } catch (e: any) {
      setMessage(e.response?.data?.message || 'Failed to create provider profile');
    } finally {
      setCreatingProvider(false);
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingService(true);
    setMessage('');
    try {
      await apiClient.post('/services', {
        serviceName,
        description: serviceDescription,
        category: serviceCategory,
        price: parseFloat(servicePrice),
        providerId: parseInt(selectedProviderId)
      });
      setMessage('Service added successfully!');
      setServiceName('');
      setServiceDescription('');
      setServicePrice('');
    } catch (e: any) {
      setMessage(e.response?.data?.message || 'Failed to add service');
    } finally {
      setCreatingService(false);
      if (selectedProviderId) loadProviderServices(parseInt(selectedProviderId));
    }
  };

  const handleDeleteService = async (serviceId: number) => {
    if (!window.confirm('Are you sure you want to delete this service listing?')) return;
    try {
      await apiClient.delete(`/services/${serviceId}?userId=${user?.id}`);
      setProviderServices(prev => prev.filter(s => s.id !== serviceId));
      setMessage('Service deleted successfully!');
    } catch (e: any) {
      setMessage(e.response?.data?.message || 'Failed to delete service');
    }
  };

  const handleDeleteProvider = async (id: number) => {
    if (!window.confirm('WARNING: Deleting your profile will remove all associated services, workers, and bookings. Are you sure?')) return;
    try {
      await apiClient.delete(`/service-providers/${id}?userId=${user?.id}`);
      setMessage('Provider profile deleted successfully!');
      setSelectedProviderId('');
      loadProviders();
    } catch (e: any) {
      setMessage(e.response?.data?.message || 'Failed to delete provider profile');
    }
  };

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingWorker(true);
    setMessage('');
    try {
      await apiClient.post('/service-workers', {
        name: workerName,
        phone: workerPhone,
        specialization: workerSpecialization,
        companyId: parseInt(selectedProviderId)
      });
      setMessage('Worker added successfully!');
      setWorkerName('');
      setWorkerPhone('');
      setWorkerSpecialization('');
      loadWorkers(parseInt(selectedProviderId));
    } catch (e: any) {
      setMessage(e.response?.data?.message || 'Failed to add worker');
    } finally {
      setCreatingWorker(false);
    }
  };

  const handleDeleteWorker = async (workerId: number) => {
    if (!window.confirm('Are you sure you want to delete this worker?')) return;
    try {
      await apiClient.delete(`/service-workers/${workerId}?userId=${user?.id}`);
      setWorkers(prev => prev.filter(w => w.id !== workerId));
      setMessage('Worker deleted successfully!');
    } catch (e: any) {
      setMessage(e.response?.data?.message || 'Failed to delete worker');
    }
  };

  const handleUpdateStatus = async (bookingId: number, status: BookingStatus) => {
    setUpdatingId(bookingId);
    setMessage('');
    try {
      const res = await apiClient.patch(`/bookings/${bookingId}/status`, { status });
      setBookings(prev => prev.map(b => b.id === bookingId ? res.data : b));
      setMessage(`Booking ${status.toLowerCase()} successfully!`);
    } catch (e: any) {
      console.error('Failed to update booking status', e);
      setMessage(e.response?.data?.message || `Failed to ${status.toLowerCase()} booking.`);
    } finally {
      setUpdatingId(null);
    }
  };

  if (user?.role !== Role.SERVICE_PROVIDER) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        You must be logged in as a Service Provider to view this page.
      </div>
    );
  }

  const selectedProvider = providers.find(p => p.id.toString() === selectedProviderId);
  const isCompany = selectedProvider?.providerType === ProviderType.COMPANY;
  
  const providerIdNum = selectedProviderId ? parseInt(selectedProviderId) : null;
  const incomingBookings = bookings.filter(b => b.providerId === providerIdNum);
  const pendingBookings = incomingBookings.filter(b => b.status === BookingStatus.PENDING);
  const otherBookings = incomingBookings.filter(b => b.status !== BookingStatus.PENDING);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <h1 className="text-3xl font-bold">Provider Dashboard</h1>

      {message && (
        <div className="p-4 bg-primary/10 text-primary font-medium rounded-md">{message}</div>
      )}

      {/* Profile + Service + Worker creation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>1. Your Provider Profile</CardTitle>
            <CardDescription>Select your profile or create a new one.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Existing Profile</label>
              <div className="flex gap-2">
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={selectedProviderId}
                  onChange={e => setSelectedProviderId(e.target.value)}
                >
                  <option value="">-- Create New Profile --</option>
                  {providers.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.serviceType}) [{p.providerType}]</option>
                  ))}
                </select>
                {selectedProviderId && (
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteProvider(parseInt(selectedProviderId))}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {!selectedProviderId && (
              <form onSubmit={handleCreateProvider} className="space-y-4 pt-4 border-t border-dashed">
                <h4 className="font-semibold text-sm">Create New Profile</h4>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Business Name</label>
                  <Input required value={newProviderName} onChange={e => setNewProviderName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Service Category</label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={newProviderType}
                      onChange={e => setNewProviderType(e.target.value as ServiceType)}
                    >
                      {Object.values(ServiceType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={newProviderCategoryType}
                      onChange={e => setNewProviderCategoryType(e.target.value as ProviderType)}
                    >
                      {Object.values(ProviderType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Input required value={newProviderLocation} onChange={e => setNewProviderLocation(e.target.value)} placeholder="City, Area" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input required value={newProviderPhone} onChange={e => setNewProviderPhone(e.target.value)} />
                </div>
                <Button type="submit" disabled={creatingProvider} variant="secondary" className="w-full">
                  {creatingProvider ? 'Creating...' : 'Create Profile'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className={!selectedProviderId ? 'opacity-50 pointer-events-none' : ''}>
            <CardHeader>
              <CardTitle>2. Add a Service Listing</CardTitle>
              <CardDescription>Add a specific service customers can book.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateService} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Service Name</label>
                  <Input required value={serviceName} onChange={e => setServiceName(e.target.value)} placeholder="e.g. AC Repair" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input required value={serviceDescription} onChange={e => setServiceDescription(e.target.value)} placeholder="Details of the service..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Service Category</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={serviceCategory}
                    onChange={e => setServiceCategory(e.target.value as ServiceType)}
                  >
                    {Object.values(ServiceType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price ($)</label>
                  <Input type="number" step="0.01" required value={servicePrice} onChange={e => setServicePrice(e.target.value)} placeholder="50.00" />
                </div>
                <Button type="submit" disabled={creatingService} className="w-full">
                  {creatingService ? 'Adding...' : 'Add Service'}
                </Button>
              </form>

              {providerServices.length > 0 && (
                <div className="mt-8 pt-6 border-t font-sans">
                  <h4 className="text-sm font-semibold mb-3">Existing Service Listings</h4>
                  <div className="space-y-3">
                    {providerServices.map(s => (
                      <div key={s.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border">
                        <div>
                          <p className="font-semibold text-sm">{s.serviceName}</p>
                          <p className="text-xs text-muted-foreground">{s.category} • ${s.price}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteService(s.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {isCompany && (
            <Card className={!selectedProviderId ? 'opacity-50 pointer-events-none' : ''}>
              <CardHeader>
                <CardTitle>3. Manage Service Workers</CardTitle>
                <CardDescription>Add workers who can be assigned to jobs.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleCreateWorker} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Worker Name</label>
                    <Input required value={workerName} onChange={e => setWorkerName(e.target.value)} placeholder="e.g. John Doe" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone</label>
                      <Input value={workerPhone} onChange={e => setWorkerPhone(e.target.value)} placeholder="555-0199" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Specialization</label>
                      <Input value={workerSpecialization} onChange={e => setWorkerSpecialization(e.target.value)} placeholder="e.g. Master Plumber" />
                    </div>
                  </div>
                  <Button type="submit" disabled={creatingWorker} variant="outline" className="w-full">
                    <UserPlus className="w-4 h-4 mr-2" />
                    {creatingWorker ? 'Adding...' : 'Add Worker'}
                  </Button>
                </form>

                {workers.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-semibold mb-2">Our Workers</h4>
                    <div className="space-y-2">
                      {workers.map(w => (
                        <div key={w.id} className="flex items-center justify-between text-sm p-2 bg-secondary rounded">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{w.name} {w.specialization && `(${w.specialization})`}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {!w.available && <span className="text-xs text-red-500 mr-2">Unavailable</span>}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteWorker(w.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Incoming Booking Requests */}
      {selectedProviderId && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Booking Requests</h2>

          {pendingBookings.length === 0 ? (
            <div className="border border-dashed rounded-lg p-8 text-center text-muted-foreground">
              No pending booking requests.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {pendingBookings.map(booking => (
                <Card key={booking.id} className="border-yellow-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex justify-between items-center">
                      <span>Booking #{booking.id}</span>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-800">
                        PENDING
                      </span>
                    </CardTitle>
                    <CardDescription className="text-foreground font-semibold">
                      {booking.serviceName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(booking.bookingDate).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium text-foreground">{booking.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span className="font-medium text-foreground">{booking.customerMobileNumber || 'Not provided'}</span>
                    </div>
                    {booking.workerName && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Requested Worker: <span className="text-foreground font-medium">{booking.workerName}</span>
                      </div>
                    )}
                    <div className="mt-4 p-3 bg-secondary/40 rounded-xl border border-primary/20 italic text-xs shadow-inner">
                      <span className="font-bold block not-italic mb-1 uppercase tracking-widest text-[10px] text-primary">Customer Reported Issue:</span>
                      {booking.issueDescription ? (
                        <span className="text-foreground">"{booking.issueDescription}"</span>
                      ) : (
                        <span className="text-muted-foreground opacity-50">No description provided.</span>
                      )}
                    </div>
                    <div className="flex gap-2 pt-3">
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        disabled={updatingId === booking.id}
                        onClick={() => handleUpdateStatus(booking.id, BookingStatus.CONFIRMED)}
                      >
                        <CircleCheck className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        disabled={updatingId === booking.id}
                        onClick={() => handleUpdateStatus(booking.id, BookingStatus.CANCELLED)}
                      >
                        <CircleX className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Handled bookings history */}
          {otherBookings.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-muted-foreground">Booking History</h3>
              <div className="space-y-3">
                {otherBookings.map(booking => (
                  <div key={booking.id} className="flex items-center justify-between border rounded-lg px-4 py-3 text-sm">
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span className="font-medium text-foreground">#{booking.id}</span>
                      <span className="font-medium text-foreground">{booking.serviceName}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{booking.address}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{booking.customerMobileNumber || 'N/A'}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(booking.bookingDate).toLocaleDateString()}</span>
                      {booking.workerName && (
                        <span className="flex items-center gap-1 text-xs bg-secondary px-2 py-0.5 rounded text-secondary-foreground">
                          <Users className="w-3 h-3" />
                          {booking.workerName}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-xs italic truncate max-w-md">
                      <span className="font-bold not-italic text-[10px] opacity-70 mr-1">Issue:</span>
                      {booking.issueDescription ? (
                        <span className="text-muted-foreground">"{booking.issueDescription}"</span>
                      ) : (
                        <span className="text-muted-foreground opacity-40">None</span>
                      )}
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      booking.status === BookingStatus.CONFIRMED ? 'bg-green-100 text-green-800' :
                      booking.status === BookingStatus.COMPLETED ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
