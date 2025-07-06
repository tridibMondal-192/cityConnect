import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  CreditCard,
  Download,
  Calendar,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Shield,
} from 'lucide-react';

interface BillingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BillingHistory {
  id: string;
  date: string;
  amount: string;
  description: string;
  status: 'paid' | 'pending' | 'failed';
  invoiceUrl?: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking';
  name: string;
  last4?: string;
  isDefault: boolean;
  expiryDate?: string;
}

const mockBillingHistory: BillingHistory[] = [
  {
    id: '1',
    date: '2024-01-15',
    amount: '₹499',
    description: 'Pro Plan - Monthly',
    status: 'paid',
    invoiceUrl: '#',
  },
  {
    id: '2',
    date: '2024-01-01',
    amount: '₹499',
    description: 'Pro Plan - Monthly',
    status: 'paid',
    invoiceUrl: '#',
  },
  {
    id: '3',
    date: '2023-12-15',
    amount: '₹499',
    description: 'Pro Plan - Monthly',
    status: 'paid',
    invoiceUrl: '#',
  },
  {
    id: '4',
    date: '2023-12-01',
    amount: '₹999',
    description: 'Pro Plan - Monthly (Original Price)',
    status: 'paid',
    invoiceUrl: '#',
  },
];

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'card',
    name: 'HDFC Credit Card',
    last4: '1234',
    isDefault: true,
    expiryDate: '12/25',
  },
  {
    id: '2',
    type: 'upi',
    name: 'UPI ID: user@paytm',
    isDefault: false,
  },
];

export default function BillingModal({ open, onOpenChange }: BillingModalProps) {
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'payment-methods'>('overview');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return null;
    }
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'card':
        return <CreditCard className="h-5 w-5" />;
      case 'upi':
        return <div className="w-5 h-5 bg-purple-500 rounded flex items-center justify-center text-white text-xs font-bold">UPI</div>;
      case 'netbanking':
        return <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">NB</div>;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Billing & Subscription</DialogTitle>
          <DialogDescription>
            Manage your subscription, payment methods, and billing history
          </DialogDescription>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex space-x-1 border-b">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'history', label: 'Billing History' },
            { id: 'payment-methods', label: 'Payment Methods' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Current Plan */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Pro Plan</h3>
                    <p className="text-gray-600">₹499/month</p>
                    <p className="text-sm text-gray-500">Next billing: January 15, 2024</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Usage Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="card-modern">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">This Month</p>
                      <p className="text-2xl font-bold">₹499</p>
                    </div>
                    <CreditCard className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="card-modern">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Spent</p>
                      <p className="text-2xl font-bold">₹2,496</p>
                    </div>
                    <Calendar className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="card-modern">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Invoices</p>
                      <p className="text-2xl font-bold">4</p>
                    </div>
                    <Download className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Billing History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Billing History</h3>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
            </div>
            
            <div className="space-y-3">
              {mockBillingHistory.map((item) => (
                <Card key={item.id} className="card-modern">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(item.status)}
                        <div>
                          <p className="font-medium">{item.description}</p>
                          <p className="text-sm text-gray-500">{item.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="font-bold">{item.amount}</span>
                        {getStatusBadge(item.status)}
                        {item.invoiceUrl && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Payment Methods Tab */}
        {activeTab === 'payment-methods' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Payment Methods</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </div>
            
            <div className="space-y-4">
              {mockPaymentMethods.map((method) => (
                <Card key={method.id} className="card-modern">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getPaymentMethodIcon(method.type)}
                        <div>
                          <p className="font-medium">{method.name}</p>
                          {method.last4 && (
                            <p className="text-sm text-gray-500">
                              {showCardNumber ? `**** **** **** ${method.last4}` : '•••• •••• •••• ••••'}
                            </p>
                          )}
                          {method.expiryDate && (
                            <p className="text-sm text-gray-500">Expires {method.expiryDate}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {method.isDefault && (
                          <Badge className="bg-blue-100 text-blue-800">Default</Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCardNumber(!showCardNumber)}
                        >
                          {showCardNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 