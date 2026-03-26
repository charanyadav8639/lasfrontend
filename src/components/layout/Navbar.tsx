import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Role } from '../../types';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="border-b bg-background">
      <div className="flex h-16 items-center px-4 max-w-7xl mx-auto w-full">
        <Link to="/" className="text-lg font-bold mr-6">
          LocalService
        </Link>
        
        <div className="flex items-center space-x-4 flex-1">
          <Link to="/services" className="text-sm font-medium hover:text-primary">
            Services
          </Link>
          <Link to="/providers" className="text-sm font-medium hover:text-primary">
            Providers
          </Link>
          {user && user.role !== Role.SERVICE_PROVIDER && (
            <Link to="/bookings" className="text-sm font-medium hover:text-primary">
              My Bookings
            </Link>
          )}
          {user?.role === Role.ADMIN && (
            <Link to="/admin" className="text-sm font-medium hover:text-primary">
              Admin
            </Link>
          )}
          {user?.role === Role.SERVICE_PROVIDER && (
            <Link to="/dashboard" className="text-sm font-medium hover:text-primary">
              Dashboard
            </Link>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Hello, {user.name}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
