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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  Search,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Video,
  FileText,
  Users,
  Settings,
  Shield,
  Globe,
} from 'lucide-react';

interface HelpSupportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'How do I report a community issue?',
    answer: 'To report an issue, navigate to the "Report Issue" section, fill out the form with details about the problem, add photos if available, and submit. Your report will be reviewed and assigned to the appropriate department.',
    category: 'Issues',
  },
  {
    id: '2',
    question: 'How can I participate in community polls?',
    answer: 'You can participate in polls by visiting the Community Hub and clicking on any active poll. Simply select your preferred option and submit your vote. You can change your vote within 15 minutes of voting.',
    category: 'Community',
  },
  {
    id: '3',
    question: 'What are the different membership tiers?',
    answer: 'We offer three membership tiers: Basic (free), Pro (₹499/month), and Premium (₹1,249/month). Each tier offers different features and capabilities for community engagement.',
    category: 'Membership',
  },
  {
    id: '4',
    question: 'How do I update my profile information?',
    answer: 'Click on your profile avatar in the header, select "Edit Profile", and you can update your name, profile picture, and other personal information.',
    category: 'Account',
  },
  {
    id: '5',
    question: 'Can I create community events?',
    answer: 'Yes! Pro and Premium members can create community events. Navigate to the Community Hub, go to the Events tab, and click "Create Event" to set up a new community gathering.',
    category: 'Events',
  },
  {
    id: '6',
    question: 'How do I contact support?',
    answer: 'You can contact support through this help center, by email at support@cityconnect.com, or by calling our support line at +91-1800-CITY-HELP.',
    category: 'Support',
  },
];

const mockTickets: SupportTicket[] = [
  {
    id: '1',
    subject: 'Issue with profile picture upload',
    description: 'I\'m unable to upload my profile picture. The upload button is not responding.',
    status: 'resolved',
    priority: 'medium',
    createdAt: '2024-01-10',
  },
  {
    id: '2',
    subject: 'Poll creation not working',
    description: 'When I try to create a new poll, the form doesn\'t submit properly.',
    status: 'in-progress',
    priority: 'high',
    createdAt: '2024-01-12',
  },
];

export default function HelpSupportModal({ open, onOpenChange }: HelpSupportModalProps) {
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'tickets'>('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'Issues', 'Community', 'Membership', 'Account', 'Events', 'Support'];

  const filteredFaq = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-yellow-100 text-yellow-800">Open</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <HelpCircle className="h-6 w-6" />
            Help & Support
          </DialogTitle>
          <DialogDescription>
            Find answers to common questions and get help when you need it
          </DialogDescription>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex space-x-1 border-b">
          {[
            { id: 'faq', label: 'FAQ', icon: BookOpen },
            { id: 'contact', label: 'Contact Support', icon: MessageCircle },
            { id: 'tickets', label: 'My Tickets', icon: FileText },
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search FAQ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex space-x-2 overflow-x-auto">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="whitespace-nowrap"
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* FAQ List */}
            <div className="space-y-3">
              {filteredFaq.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <HelpCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No FAQ items found</p>
                </div>
              ) : (
                filteredFaq.map((item) => (
                  <Card key={item.id} className="card-modern">
                    <CardContent className="p-4">
                      <button
                        className="w-full text-left"
                        onClick={() => setExpandedFaq(expandedFaq === item.id ? null : item.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.question}</h4>
                            <p className="text-sm text-gray-500 mt-1">{item.category}</p>
                          </div>
                          {expandedFaq === item.id ? (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </button>
                      
                      {expandedFaq === item.id && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-gray-700">{item.answer}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Contact Support Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            {/* Contact Methods */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="card-modern text-center">
                <CardContent className="p-6">
                  <Mail className="h-8 w-8 mx-auto mb-3 text-blue-500" />
                  <h3 className="font-semibold mb-2">Email Support</h3>
                  <p className="text-sm text-gray-600 mb-3">Get help via email</p>
                  <Button variant="outline" size="sm">
                    support@cityconnect.com
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="card-modern text-center">
                <CardContent className="p-6">
                  <Phone className="h-8 w-8 mx-auto mb-3 text-green-500" />
                  <h3 className="font-semibold mb-2">Phone Support</h3>
                  <p className="text-sm text-gray-600 mb-3">Call us directly</p>
                  <Button variant="outline" size="sm">
                    +91-1800-CITY-HELP
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="card-modern text-center">
                <CardContent className="p-6">
                  <MessageCircle className="h-8 w-8 mx-auto mb-3 text-purple-500" />
                  <h3 className="font-semibold mb-2">Live Chat</h3>
                  <p className="text-sm text-gray-600 mb-3">Chat with support</p>
                  <Button variant="outline" size="sm">
                    Start Chat
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical Issue</SelectItem>
                        <SelectItem value="billing">Billing Question</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="general">General Inquiry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Describe your issue or question..."
                    rows={4}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button className="btn-primary">
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* My Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Support Tickets</h3>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                New Ticket
              </Button>
            </div>
            
            <div className="space-y-3">
              {mockTickets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No support tickets found</p>
                </div>
              ) : (
                mockTickets.map((ticket) => (
                  <Card key={ticket.id} className="card-modern">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{ticket.subject}</h4>
                          <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                          <p className="text-xs text-gray-500 mt-2">Created: {ticket.createdAt}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getPriorityBadge(ticket.priority)}
                          {getStatusBadge(ticket.status)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
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