import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { ServiceResponseDTO } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Services() {
  const [services, setServices] = useState<ServiceResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    apiClient.get('/services')
      .then(res => setServices(res.data))
      .catch(err => console.error('Failed to load services', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Available Services</h1>
      
      {loading ? (
        <div className="text-center py-10">Loading services...</div>
      ) : services.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">No services found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
            <Card key={service.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{service.serviceName}</CardTitle>
                <div className="text-2xl font-bold mt-2">${service.price}</div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-muted-foreground text-sm line-clamp-3">
                  {service.description}
                </p>
                <div className="mt-4 text-xs font-medium bg-secondary text-secondary-foreground inline-block px-2 py-1 rounded">
                  Provider ID: {service.providerId}
                </div>
              </CardContent>
              <CardFooter>
                {user ? (
                  <Button className="w-full" asChild>
                    <Link 
                      to="/bookings" 
                      state={{ 
                        serviceId: service.id, 
                        providerId: service.providerId,
                        serviceName: service.serviceName
                      }}
                    >
                      Book Now
                    </Link>
                  </Button>
                ) : (
                  <Button className="w-full" variant="outline" asChild>
                    <Link to="/login">Login to Book</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
