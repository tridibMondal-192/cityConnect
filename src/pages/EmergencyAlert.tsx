import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { communityService, realtimeService } from '@/integrations/firebase/services';
import type { EmergencyAlert } from '@/integrations/firebase/types';
import { toast } from '@/hooks/use-toast';
import { AlertTriangle, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function EmergencyAlert() {
  const { profile } = useAuth();
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up real-time listener for emergency alerts
    const unsubscribe = realtimeService.onEmergencyAlertsChange((alerts) => {
      setAlerts(alerts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handlePost = async () => {
    if (!title.trim() || !message.trim() || !profile) return;

    try {
      await communityService.createEmergencyAlert({
        title: title.trim(),
        message: message.trim(),
        userId: profile.userId
      });
      
      setTitle('');
      setMessage('');
      
      toast({
        title: 'Emergency alert posted',
        description: 'Your alert has been successfully posted.',
      });
    } catch (error) {
      console.error('Error posting emergency alert:', error);
      toast({
        title: 'Error',
        description: 'Failed to post emergency alert. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-red-600">Emergency Alerts</h1>
            <p className="text-muted-foreground">
              Important announcements from government officials
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-red-600">Emergency Alerts</h1>
          <p className="text-muted-foreground">
            Important announcements from government officials
          </p>
        </div>
      </div>

      {profile?.role === 'government' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>Post New Emergency Alert</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                placeholder="Alert title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-red-200 focus:border-red-500"
              />
            </div>
            <div>
              <Textarea
                placeholder="Emergency message details..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="border-red-200 focus:border-red-500"
              />
            </div>
            <Button
              onClick={handlePost}
              disabled={!title.trim() || !message.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Post Emergency Alert
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {alerts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No emergency alerts</h3>
              <p className="text-muted-foreground">
                There are currently no active emergency alerts.
              </p>
            </CardContent>
          </Card>
        ) : (
          alerts.map((alert) => (
            <Card key={alert.id} className="border-l-4 border-l-red-600">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-red-700">{alert.title}</h3>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(alert.createdAt, { addSuffix: true })}
                  </span>
                </div>
                <p className="text-muted-foreground mb-3">{alert.message}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Posted by government official
                  </span>
                  <div className="flex items-center space-x-1 text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">EMERGENCY</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {!profile && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              Please sign in to view emergency alerts
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 