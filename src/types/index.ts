export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SERVICE_PROVIDER = 'SERVICE_PROVIDER'
}

export enum ProviderType {
  INDIVIDUAL = 'INDIVIDUAL',
  COMPANY = 'COMPANY'
}

export enum ServiceType {
  ELECTRICIAN = 'ELECTRICIAN',
  PLUMBER = 'PLUMBER',
  CLEANER = 'CLEANER',
  TECHNICIAN = 'TECHNICIAN',
  CARPENTER = 'CARPENTER'
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface UserResponseDTO {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface ServiceProviderResponseDTO {
  id: number;
  name: string;
  serviceType: ServiceType;
  providerType: ProviderType;
  location: string;
  phone: string;
  availability: boolean;
  ownerId: number;
  services?: ServiceResponseDTO[];
  workers?: ServiceWorkerResponseDTO[];
}

export interface ServiceWorkerResponseDTO {
  id: number;
  name: string;
  phone: string;
  specialization: string;
  available: boolean;
  companyId: number;
}

export interface ServiceResponseDTO {
  id: number;
  serviceName: string;
  description: string;
  category: ServiceType;
  price: number;
  providerId: number;
}

export interface BookingResponseDTO {
  id: number;
  userId: number;
  providerId: number;
  serviceId: number;
  workerId?: number;
  serviceName: string;
  workerName?: string;
  bookingDate: string;
  address: string;
  issueDescription?: string;
  status: BookingStatus;
}

export interface BookingRequestDTO {
  userId: number;
  providerId: number;
  serviceId: number;
  workerId?: number;
  bookingDate: string;
  address: string;
  issueDescription?: string;
  status?: BookingStatus;
}
