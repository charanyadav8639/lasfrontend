import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { ServiceProviderResponseDTO } from '../types';
import { MapPin, Phone, Star, ChevronDown, ChevronUp, Briefcase, Users, Calendar } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

export function Providers() {
  const [providers, setProviders] = useState<ServiceProviderResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedProviders, setExpandedProviders] = useState<Record<number, boolean>>({});
  const navigate = useNavigate();

  const toggleProvider = (id: number) => {
    setExpandedProviders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleBookService = (providerId: number, serviceId: number) => {
    navigate('/bookings', { state: { providerId, serviceId } });
  };

  useEffect(() => {
    setLoading(true);
    apiClient.get(`/service-providers${searchTerm ? `?location=${searchTerm}` : ''}`)
      .then(res => setProviders(res.data))
      .catch(err => console.error('Failed to load providers', err))
      .finally(() => setLoading(false));
  }, [searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Featured Professionals</h1>
        <div className="w-full md:w-72">
          <Input 
            placeholder="Search by location..." 
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-10">Loading providers...</div>
      ) : providers.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">No providers found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map(provider => (
            <Card key={provider.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-bold">{provider.name}</CardTitle>
                    <div className="flex items-center text-sm text-yellow-500 font-medium mt-1">
                      <Star className="w-4 h-4 mr-1 fill-current" /> 4.8 (120 reviews)
                    </div>
                  </div>
                  {provider.availability ? (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Available</span>
                  ) : (
                     <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Busy</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                    {provider.location}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                     <Phone className="w-4 h-4 mr-2" />
                     {provider.phone}
                  </div>
                </div>

                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    className="w-full flex justify-between items-center h-10 px-4 py-2 text-sm font-medium transition-colors"
                    onClick={() => toggleProvider(provider.id)}
                  >
                    <span className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-2" />
                      {provider.services?.length || 0} Services
                    </span>
                    {expandedProviders[provider.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>

                {expandedProviders[provider.id] && (
                  <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-top-2">
                    {provider.services && provider.services.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center">
                          <Briefcase className="w-3 h-3 mr-1" /> Available Services
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {provider.services.map(service => (
                            <div key={service.id} className="p-3 bg-secondary/30 rounded-xl border border-foreground/5 text-sm flex justify-between items-center group/service hover:border-primary/30 transition-colors">
                              <div className="flex-1">
                                <span className="font-bold text-foreground">{service.serviceName}</span>
                                <p className="text-xs text-muted-foreground line-clamp-1">{service.description}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="font-bold text-primary">${service.price}</span>
                                <Button 
                                  size="sm" 
                                  className="h-8 gap-1.5 px-3 opacity-0 group-hover/service:opacity-100 transition-opacity"
                                  onClick={() => handleBookService(provider.id, service.id)}
                                >
                                  <Calendar className="w-3.5 h-3.5" />
                                  Book
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {provider.workers && provider.workers.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center">
                          <Users className="w-3 h-3 mr-1" /> Our Experts
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {provider.workers.map(worker => (
                            <div key={worker.id} className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full flex items-center">
                              {worker.name} {worker.specialization && `(${worker.specialization})`}
                              {!worker.available && <span className="ml-1 text-[10px] opacity-70">(Unavailable)</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
