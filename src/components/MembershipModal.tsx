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
  Crown,
  Shield,
  User,
  Check,
  Star,
  Zap,
  Globe,
  MessageCircle,
  BarChart3,
  Calendar,
  Bell,
  CreditCard,
  ArrowRight,
  X,
} from 'lucide-react';

interface MembershipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTier?: 'basic' | 'pro' | 'premium';
}

interface MembershipTier {
  id: 'basic' | 'pro' | 'premium';
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  features: string[];
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  popular?: boolean;
  discount?: string;
}

const membershipTiers: MembershipTier[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for getting started with community engagement',
    price: 'Free',
    features: [
      'Report community issues',
      'View and comment on issues',
      'Basic community chat access',
      'Receive notifications',
      'Access to public polls',
      'Basic profile customization'
    ],
    icon: User,
    color: 'bg-gray-500',
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Enhanced features for active community members',
    price: '₹499',
    originalPrice: '₹999',
    discount: '50% OFF',
    features: [
      'Everything in Basic',
      'Create community polls',
      'Advanced analytics dashboard',
      'Priority issue support',
      'Custom notification preferences',
      'Extended chat history',
      'Event creation and management',
      'Advanced profile features',
      'Community insights reports'
    ],
    icon: Shield,
    color: 'bg-blue-500',
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Ultimate community engagement experience',
    price: '₹1,249',
    originalPrice: '₹2,499',
    discount: '50% OFF',
    features: [
      'Everything in Pro',
      'Unlimited polls and surveys',
      'Advanced community analytics',
      'Priority customer support',
      'Custom branding options',
      'API access for integrations',
      'Advanced reporting tools',
      'Community leadership tools',
      'Exclusive premium features',
      'Dedicated account manager',
      'Custom integrations',
      'Advanced security features'
    ],
    icon: Crown,
    color: 'bg-yellow-500',
  },
];

export default function MembershipModal({ open, onOpenChange, currentTier = 'basic' }: MembershipModalProps) {
  const [selectedTier, setSelectedTier] = useState<MembershipTier['id']>(currentTier);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const currentTierData = membershipTiers.find(tier => tier.id === currentTier);
  const selectedTierData = membershipTiers.find(tier => tier.id === selectedTier);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    
    // Simulate upgrade process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsUpgrading(false);
    onOpenChange(false);
    
    // In a real app, you would handle the payment and subscription here
    console.log(`Upgrading to ${selectedTier} tier`);
  };

  const getTierIcon = (tier: MembershipTier) => {
    const IconComponent = tier.icon;
    return <IconComponent className={`h-6 w-6 text-white`} />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="text-center">
          <DialogTitle className="text-3xl font-bold gradient-text">
            Choose Your Membership Plan
          </DialogTitle>
          <DialogDescription className="text-lg text-gray-600">
            Unlock powerful features to enhance your community engagement experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          {/* Current Plan Status */}
          {currentTierData && (
            <Card className="card-gradient border-2 border-blue-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${currentTierData.color} rounded-xl flex items-center justify-center`}>
                      {getTierIcon(currentTierData)}
                    </div>
                    <div>
                      <CardTitle className="text-xl">Current Plan: {currentTierData.name}</CardTitle>
                      <CardDescription>{currentTierData.description}</CardDescription>
                    </div>
                  </div>
                  <Badge className="badge-modern">
                    Active
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          )}

          {/* Membership Tiers */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {membershipTiers.map((tier) => (
                              <Card 
                key={tier.id}
                className={`card-modern transition-all duration-300 cursor-pointer flex flex-col h-full ${
                  selectedTier === tier.id 
                    ? 'ring-2 ring-blue-500 scale-105' 
                    : 'hover:scale-102'
                } ${tier.popular ? 'border-2 border-blue-500' : ''}`}
                onClick={() => setSelectedTier(tier.id)}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-3 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`w-16 h-16 ${tier.color} rounded-xl flex items-center justify-center`}>
                      {getTierIcon(tier)}
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                  <CardDescription className="text-gray-600">{tier.description}</CardDescription>
                  
                  <div className="mt-4">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-3xl font-bold text-gray-900">{tier.price}</span>
                      {tier.originalPrice && (
                        <span className="text-lg text-gray-500 line-through">{tier.originalPrice}</span>
                      )}
                      {tier.discount && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          {tier.discount}
                        </Badge>
                      )}
                    </div>
                    {tier.price !== 'Free' && (
                      <p className="text-sm text-gray-500 mt-1">per month</p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 flex-grow">
                  <div className="space-y-3">
                    {tier.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Plan Details */}
          {selectedTierData && selectedTier !== currentTier && (
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="text-xl">Upgrade to {selectedTierData.name}</CardTitle>
                <CardDescription>
                  You're about to upgrade from {currentTierData?.name} to {selectedTierData.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <span className="font-medium">New Price:</span>
                    <span className="text-xl font-bold text-blue-600">{selectedTierData.price}/month</span>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">What you'll get:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedTierData.features
                        .filter(feature => !currentTierData?.features.includes(feature))
                        .map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            <span>{feature}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-8 py-3"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            
            {selectedTier !== currentTier ? (
              <Button
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className="btn-primary px-8 py-3"
              >
                {isUpgrading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Upgrading...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Upgrade to {selectedTierData?.name}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                disabled
                className="bg-gray-300 text-gray-500 px-8 py-3 cursor-not-allowed"
              >
                Current Plan
              </Button>
            )}
          </div>

          {/* Additional Info */}
          <div className="text-center space-y-4">
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
              <div className="flex items-center justify-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>Access from anywhere</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 