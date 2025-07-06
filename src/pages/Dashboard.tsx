import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { issueService } from '@/integrations/firebase/services';
import { Issue } from '@/integrations/firebase/types';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, User, AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Stats {
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  myIssues: number;
}

export default function Dashboard() {
  const { profile } = useAuth();
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalIssues: 0,
    openIssues: 0,
    resolvedIssues: 0,
    myIssues: 0,
  });
  const [loading, setLoading] = useState(true);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    try {
      // Fetch all issues
      const allIssues = await issueService.getIssues();
      
      // Set recent issues (first 5)
      setRecentIssues(allIssues.slice(0, 5));

      // Calculate stats
      const totalIssues = allIssues.length;
      const openIssues = allIssues.filter(issue => 
        issue.status === 'open' || issue.status === 'in_progress'
      ).length;
      const resolvedIssues = allIssues.filter(issue => 
        issue.status === 'resolved' || issue.status === 'closed'
      ).length;
      const myIssues = profile ? allIssues.filter(issue => 
        issue.userId === profile.userId
      ).length : 0;

      setStats({
        totalIssues,
        openIssues,
        resolvedIssues,
        myIssues,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'resolved': case 'closed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Welcome back, {profile?.fullName}</h1>
          <p className="text-lg text-gray-600">
            Here's what's happening in your community
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div id="stats" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-gradient">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Total Issues</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalIssues}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Open Issues</p>
                <p className="text-3xl font-bold text-red-600">{stats.openIssues}</p>
              </div>
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Resolved</p>
                <p className="text-3xl font-bold text-green-600">{stats.resolvedIssues}</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {profile?.role !== 'government' && (
          <Card className="card-gradient">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">My Issues</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.myIssues}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Issues */}
      <Card id="recent-issues">
        <CardHeader>
          <CardTitle>Recent Issues</CardTitle>
          <CardDescription>
            Latest community issues and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentIssues.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No issues reported yet. Be the first to report an issue!
              </p>
            ) : (
              recentIssues.map((issue) => (
                <div key={issue.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(issue.status)}
                    <div>
                      <h3 className="font-medium">{issue.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        by {issue.userName} • {formatDistanceToNow(issue.createdAt, { addSuffix: true })}
                      </p>
                      {issue.location && (
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {issue.location}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getPriorityColor(issue.priority)}>
                      {issue.priority}
                    </Badge>
                    <Badge variant="outline">
                      {issue.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-6">
            <Link to="/issues">
              <Button variant="outline" className="w-full">
                View All Issues
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}