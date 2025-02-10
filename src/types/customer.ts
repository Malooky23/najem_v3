export interface Business {
  businessCustomerId: string;
  businessName: string;
  isTaxRegistered: boolean;
  taxNumber: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface Individual {
  individualCustomerId: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  personalID: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface Customer {
  customerId: string;
  customerNumber: number;
  customerType: 'BUSINESS' | 'INDIVIDUAL';
  notes: string | null;
  country: string;
  createdAt: Date;
  updatedAt: Date | null;
  individual: Individual | null;
  business: Business | null;
}
