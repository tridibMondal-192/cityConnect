import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import MembershipModal from './MembershipModal';
import BillingModal from './BillingModal';
import SettingsModal from './SettingsModal';
import NotificationsModal from './NotificationsModal';
import HelpSupportModal from './HelpSupportModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { uploadImageToImageKit, getOptimizedImageUrl } from '@/integrations/imagekit/config';
import { toast } from '@/hooks/use-toast';
import {
  User,
  Settings,
  LogOut,
  Crown,
  CreditCard,
  Camera,
  Edit,
  Shield,
  Bell,
  HelpCircle,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

interface ProfileAvatarProps {
  className?: string;
}

export default function ProfileAvatar({ className }: ProfileAvatarProps) {
  const { user, profile, signOut, updateProfile } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isHelpSupportOpen, setIsHelpSupportOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newFullName, setNewFullName] = useState(profile?.fullName || '');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user || !profile) {
    return null;
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileName = `profile_${user.uid}_${Date.now()}`;
      const imageUrl = await uploadImageToImageKit(file, fileName);
      
      await updateProfile({
        avatarUrl: imageUrl,
      });

      toast({
        title: 'Profile updated',
        description: 'Your profile picture has been updated successfully!',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!newFullName.trim()) {
      toast({
        title: 'Invalid name',
        description: 'Please enter a valid name.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateProfile({
        fullName: newFullName.trim(),
      });

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully!',
      });
      setIsProfileOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getMembershipStatus = () => {
    // Mock membership status - in real app, this would come from user data
    const membershipTypes = [
      { type: 'premium', label: 'Premium Member', icon: Crown, color: 'bg-yellow-500' },
      { type: 'pro', label: 'Pro Member', icon: Shield, color: 'bg-blue-500' },
      { type: 'basic', label: 'Basic Member', icon: User, color: 'bg-gray-500' },
    ];
    
    // Mock: randomly assign membership for demo
    const randomIndex = Math.floor(Math.random() * membershipTypes.length);
    return membershipTypes[randomIndex];
  };

  const membership = getMembershipStatus();

  // Update newFullName when profile changes
  useEffect(() => {
    setNewFullName(profile?.fullName || '');
  }, [profile?.fullName]);

  return (
    <div className={className}>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className={`relative h-10 w-10 rounded-full p-0 transition-all duration-300 group ${
              isDropdownOpen 
                ? 'bg-blue-50 ring-2 ring-blue-200 scale-105' 
                : 'hover:bg-gray-100 hover:scale-105'
            }`}
          >
            <Avatar className="h-10 w-10 transition-transform duration-300 group-hover:scale-110">
              <AvatarImage 
                src={profile.avatarUrl ? getOptimizedImageUrl(profile.avatarUrl, { width: 80, height: 80 }) : undefined} 
                alt={profile.fullName}
                className="transition-all duration-300"
              />
              <AvatarFallback className="bg-gradient-primary text-white font-semibold transition-all duration-300">
                {getInitials(profile.fullName)}
              </AvatarFallback>
            </Avatar>
            {membership.type !== 'basic' && (
              <div className={`absolute -top-1 -right-1 w-4 h-4 ${membership.color} rounded-full border-2 border-white transition-all duration-300 ${
                isDropdownOpen ? 'scale-125' : 'scale-100'
              }`}>
                {membership.type === 'premium' && (
                  <Sparkles className="h-2 w-2 text-white animate-pulse" />
                )}
              </div>
            )}
            <ChevronDown className={`absolute -bottom-1 -right-1 h-3 w-3 text-gray-400 transition-all duration-300 ${
              isDropdownOpen ? 'rotate-180 scale-110' : 'rotate-0 scale-100'
            }`} />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          className="w-80 p-0 border-0 shadow-2xl bg-white/95 backdrop-blur-md rounded-2xl" 
          align="end" 
          forceMount
          sideOffset={8}
        >
          <DropdownMenuLabel className="font-normal p-6 pb-4">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12 ring-2 ring-blue-100 transition-all duration-300 hover:ring-blue-200">
                  <AvatarImage 
                    src={profile.avatarUrl ? getOptimizedImageUrl(profile.avatarUrl, { width: 96, height: 96 }) : undefined} 
                    alt={profile.fullName}
                    className="transition-all duration-300"
                  />
                  <AvatarFallback className="bg-gradient-primary text-white font-semibold text-lg transition-all duration-300">
                    {getInitials(profile.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium leading-none text-gray-900">{profile.fullName}</p>
                  <p className="text-xs leading-none text-gray-500 mt-1">{user.email}</p>
                  <div className="flex items-center mt-2">
                    <Badge className={`${membership.color} text-white text-xs px-2 py-1 transition-all duration-300 hover:scale-105`}>
                      <membership.icon className="h-3 w-3 mr-1" />
                      {membership.label}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator className="bg-gray-100" />
          
          <DropdownMenuItem 
            asChild
            onMouseEnter={() => setHoveredItem('profile')}
            onMouseLeave={() => setHoveredItem(null)}
            className="px-4 py-3 mx-2 my-1 rounded-xl transition-all duration-300 hover:bg-blue-50 hover:scale-105"
          >
            <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
              <DialogTrigger asChild>
                <button className="flex w-full items-center justify-start text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-300">
                  <Edit className={`mr-3 h-4 w-4 transition-all duration-300 ${
                    hoveredItem === 'profile' ? 'text-blue-600 scale-110' : 'text-gray-500'
                  }`} />
                  Edit Profile
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md border-0 shadow-2xl bg-white/95 backdrop-blur-md rounded-2xl">
                <DialogHeader className="pb-4">
                  <DialogTitle className="text-xl font-bold text-gray-900">Edit Profile</DialogTitle>
                  <DialogDescription className="text-gray-600">
                    Update your profile information and picture.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20 ring-4 ring-blue-100 transition-all duration-300 hover:ring-blue-200">
                      <AvatarImage 
                        src={profile.avatarUrl ? getOptimizedImageUrl(profile.avatarUrl, { width: 160, height: 160 }) : undefined} 
                        alt={profile.fullName}
                        className="transition-all duration-300"
                      />
                      <AvatarFallback className="bg-gradient-primary text-white font-semibold text-xl transition-all duration-300">
                        {getInitials(profile.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center space-x-2 transition-all duration-300 hover:bg-blue-50 hover:border-blue-300 hover:scale-105"
                      >
                        <Camera className="h-4 w-4" />
                        <span>{isUploading ? 'Uploading...' : 'Change Photo'}</span>
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <p className="text-xs text-gray-500">
                        JPG, PNG or GIF. Max 5MB.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name</Label>
                    <Input
                      id="fullName"
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsProfileOpen(false)}
                      className="transition-all duration-300 hover:bg-gray-50 hover:scale-105"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleProfileUpdate} 
                      className="btn-primary transition-all duration-300 hover:scale-105"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => setIsMembershipOpen(true)}
            onMouseEnter={() => setHoveredItem('membership')}
            onMouseLeave={() => setHoveredItem(null)}
            className="px-4 py-3 mx-2 my-1 rounded-xl transition-all duration-300 hover:bg-yellow-50 hover:scale-105"
          >
            <div className="flex w-full items-center justify-start">
              <Crown className={`mr-3 h-4 w-4 transition-all duration-300 ${
                hoveredItem === 'membership' ? 'text-yellow-600 scale-110' : 'text-gray-500'
              }`} />
              <span className="text-sm font-medium text-gray-700 hover:text-yellow-600 transition-colors duration-300">
                Membership
              </span>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => setIsBillingOpen(true)}
            onMouseEnter={() => setHoveredItem('billing')}
            onMouseLeave={() => setHoveredItem(null)}
            className="px-4 py-3 mx-2 my-1 rounded-xl transition-all duration-300 hover:bg-green-50 hover:scale-105"
          >
            <div className="flex w-full items-center justify-start">
              <CreditCard className={`mr-3 h-4 w-4 transition-all duration-300 ${
                hoveredItem === 'billing' ? 'text-green-600 scale-110' : 'text-gray-500'
              }`} />
              <span className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors duration-300">
                Billing & Subscription
              </span>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => setIsSettingsOpen(true)}
            onMouseEnter={() => setHoveredItem('settings')}
            onMouseLeave={() => setHoveredItem(null)}
            className="px-4 py-3 mx-2 my-1 rounded-xl transition-all duration-300 hover:bg-purple-50 hover:scale-105"
          >
            <div className="flex w-full items-center justify-start">
              <Settings className={`mr-3 h-4 w-4 transition-all duration-300 ${
                hoveredItem === 'settings' ? 'text-purple-600 scale-110' : 'text-gray-500'
              }`} />
              <span className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors duration-300">
                Settings
              </span>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => setIsNotificationsOpen(true)}
            onMouseEnter={() => setHoveredItem('notifications')}
            onMouseLeave={() => setHoveredItem(null)}
            className="px-4 py-3 mx-2 my-1 rounded-xl transition-all duration-300 hover:bg-orange-50 hover:scale-105"
          >
            <div className="flex w-full items-center justify-start">
              <Bell className={`mr-3 h-4 w-4 transition-all duration-300 ${
                hoveredItem === 'notifications' ? 'text-orange-600 scale-110' : 'text-gray-500'
              }`} />
              <span className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors duration-300">
                Notifications
              </span>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => setIsHelpSupportOpen(true)}
            onMouseEnter={() => setHoveredItem('help')}
            onMouseLeave={() => setHoveredItem(null)}
            className="px-4 py-3 mx-2 my-1 rounded-xl transition-all duration-300 hover:bg-indigo-50 hover:scale-105"
          >
            <div className="flex w-full items-center justify-start">
              <HelpCircle className={`mr-3 h-4 w-4 transition-all duration-300 ${
                hoveredItem === 'help' ? 'text-indigo-600 scale-110' : 'text-gray-500'
              }`} />
              <span className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors duration-300">
                Help & Support
              </span>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-gray-100" />
          
          <DropdownMenuItem 
            onClick={signOut}
            onMouseEnter={() => setHoveredItem('signout')}
            onMouseLeave={() => setHoveredItem(null)}
            className="px-4 py-3 mx-2 my-1 rounded-xl transition-all duration-300 hover:bg-red-50 hover:scale-105"
          >
            <div className="flex w-full items-center justify-start">
              <LogOut className={`mr-3 h-4 w-4 transition-all duration-300 ${
                hoveredItem === 'signout' ? 'text-red-600 scale-110' : 'text-red-500'
              }`} />
              <span className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors duration-300">
                Sign Out
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Membership Modal */}
      <MembershipModal
        open={isMembershipOpen}
        onOpenChange={setIsMembershipOpen}
        currentTier={membership.type as 'basic' | 'pro' | 'premium'}
      />

      {/* Billing Modal */}
      <BillingModal
        open={isBillingOpen}
        onOpenChange={setIsBillingOpen}
      />

      {/* Settings Modal */}
      <SettingsModal
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        open={isNotificationsOpen}
        onOpenChange={setIsNotificationsOpen}
      />

      {/* Help & Support Modal */}
      <HelpSupportModal
        open={isHelpSupportOpen}
        onOpenChange={setIsHelpSupportOpen}
      />
    </div>
  );
} 