import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Trash2, Users, Briefcase, MapPin, Search, Shield, AlertTriangle, Calendar } from 'lucide-react';
import { ServiceProviderResponseDTO, BookingResponseDTO } from '../types';
import { useAuth } from '../context/AuthContext';

export function AdminDashboard() {
  const [providers, setProviders] = useState<ServiceProviderResponseDTO[]>([]);
  const [bookings, setBookings] = useState<BookingResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'providers' | 'bookings'>('providers');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [provRes, bookRes] = await Promise.all([
        axios.get('/api/service-providers'),
        axios.get('/api/bookings')
      ]);
      setProviders(provRes.data);
      setBookings(bookRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProvider = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this provider and ALL associated data (services, workers, bookings)?')) {
      return;
    }
    try {
      await axios.delete(`/api/service-providers/${id}?isAdmin=true`);
      setProviders(providers.filter(p => p.id !== id));
      setBookings(bookings.filter(b => b.providerId !== id));
    } catch (error) {
      console.error('Error deleting provider:', error);
      alert('Failed to delete provider');
    }
  };

  const handleDeleteBooking = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) {
      return;
    }
    try {
      await axios.delete(`/api/bookings/${id}?isAdmin=true`);
      setBookings(bookings.filter(b => b.id !== id));
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Failed to delete booking');
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <style>
        {`
          .admin-header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; padding: 2rem; border-radius: 1rem; margin-bottom: 2rem; }
          .stat-card { transition: transform 0.2s; }
          .stat-card:hover { transform: translateY(-5px); }
          .text-gradient { background: linear-gradient(to right, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.1); }
          .admin-card { border-left-width: 4px; border-left-color: #ef4444; }
          .tab-btn { padding: 0.5rem 1.5rem; border-radius: 0.5rem; font-weight: 600; transition: all 0.2s; }
          .tab-btn.active { background-color: var(--primary); color: white; }
          .tab-btn:not(.active) { color: var(--muted-foreground); }
          .tab-btn:not(.active):hover { background-color: var(--secondary); }
        `}
      </style>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <Shield className="w-10 h-10 text-primary" />
            Admin Command Center
          </h1>
          <p className="text-muted-foreground mt-2">Oversee all platforms data, providers, and bookings.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-secondary/30 p-2 rounded-xl border">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider font-bold opacity-70">Privileged access</div>
            <div className="text-sm font-semibold">{user?.name} (Administrator)</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card className="bg-primary/5 border-primary/20 stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Total Providers</p>
                <h3 className="text-3xl font-bold mt-1">{providers.length}</h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/5 border-blue-500/20 stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Total Bookings</p>
                <h3 className="text-3xl font-bold mt-1 text-blue-600">{bookings.length}</h3>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 mb-8 bg-secondary/20 p-1 rounded-lg w-fit">
        <button 
          className={`tab-btn ${activeTab === 'providers' ? 'active' : ''}`}
          onClick={() => setActiveTab('providers')}
        >
          Providers
        </button>
        <button 
          className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          Bookings
        </button>
      </div>

      {activeTab === 'providers' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-primary" />
              Manage Service Providers
            </h2>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Filter by name or location..." 
                className="pl-9 bg-secondary/20 border-none h-10 rounded-full"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => <div key={i} className="h-48 bg-secondary/20 animate-pulse rounded-2xl border" />)}
            </div>
          ) : providers.length === 0 ? (
            <Card className="border-dashed py-20 text-center">
              <CardContent>
                <div className="bg-secondary/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold">No data found</h3>
                <p className="text-muted-foreground mt-2">There are no service providers currently registered.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map(provider => (
                <Card key={provider.id} className="admin-card overflow-hidden group hover:shadow-xl transition-all duration-300 border-none bg-secondary/10">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-[10px] uppercase tracking-widest font-bold text-primary mb-1">ID: #{provider.id}</div>
                        <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">{provider.name}</CardTitle>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="rounded-full h-10 w-10 shadow-lg shadow-destructive/20 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteProvider(provider.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 pb-4 border-b border-foreground/5">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold opacity-50">Location</p>
                        <div className="flex items-center text-sm">
                          <MapPin className="w-3 h-3 mr-1 text-primary" />
                          {provider.location}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold opacity-50">Type</p>
                        <div className="text-sm font-semibold">{provider.providerType}</div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center bg-secondary/30 p-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">{provider.services?.length || 0} Services</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">{provider.workers?.length || 0} Workers</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              Manage All Bookings
            </h2>
          </div>

          <div className="bg-secondary/10 rounded-xl overflow-hidden border">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-secondary/30 border-b">
                  <th className="p-4 font-bold text-xs uppercase tracking-wider">ID</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider">Service</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider">Provider</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider">Date</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider">Status</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking.id} className="border-b hover:bg-secondary/5 transition-colors">
                    <td className="p-4 text-sm font-medium">#{booking.id}</td>
                    <td className="p-4 text-sm">{booking.serviceName}</td>
                    <td className="p-4 text-sm font-medium">ID: {booking.providerId}</td>
                    <td className="p-4 text-sm">{new Date(booking.bookingDate).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${
                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteBooking(booking.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
