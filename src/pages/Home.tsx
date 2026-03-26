import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ShieldCheck, Users, Wrench } from 'lucide-react';

export function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative flex-1 py-24 flex flex-col justify-center items-center px-4 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            Find the Best <span className="text-gradient">Local Services</span> Instantly
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Connect with trusted professionals for all your home and business needs. 
            Vetted experts, transparent pricing, and seamless booking.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button size="lg" className="rounded-full px-8 h-12 text-base shadow-lg shadow-primary/20 hover:scale-105 transition-transform" asChild>
              <Link to="/services">Explore Services</Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base glass hover:bg-white/10" asChild>
              <Link to="/providers">Find Providers</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">Why Choose LocalService?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">We provide the most reliable platform for local service discovery and management.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="glass border-none hover:translate-y-[-8px] transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 p-4 rounded-2xl mb-4 w-16 h-16 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Trusted Professionals</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              Every service provider is vetted and background-checked for your peace of mind.
            </CardContent>
          </Card>
          
          <Card className="glass border-none hover:translate-y-[-8px] transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 p-4 rounded-2xl mb-4 w-16 h-16 flex items-center justify-center">
                <Wrench className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Wide Range of Services</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              From minor repairs to major renovations, find the right expert for any job.
            </CardContent>
          </Card>
          
          <Card className="glass border-none hover:translate-y-[-8px] transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 p-4 rounded-2xl mb-4 w-16 h-16 flex items-center justify-center">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Community Driven</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              Read reviews and ratings from other community members before booking.
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
