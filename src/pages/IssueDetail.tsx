import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { issueService, commentService } from '@/integrations/firebase/services';
import { Issue, Comment } from '@/integrations/firebase/types';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, MapPin, Calendar, User, AlertCircle, CheckCircle, Clock, MessageCircle, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function IssueDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchIssueData();
    }
  }, [id]);

  const fetchIssueData = async () => {
    try {
      // Fetch issue details
      const issueData = await issueService.getIssue(id!);
      if (!issueData) {
        toast({
          title: "Issue not found",
          description: "The requested issue could not be found.",
          variant: "destructive",
        });
        navigate('/issues');
        return;
      }

      // Fetch comments
      const commentsData = await commentService.getComments(id!);

      setIssue(issueData);
      setComments(commentsData);
    } catch (error: any) {
      console.error('Error fetching issue:', error);
      toast({
        title: "Error loading issue",
        description: "Failed to load issue details. Please try again.",
        variant: "destructive",
      });
      navigate('/issues');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !newComment.trim() || !id) return;

    setSubmitting(true);
    try {
      await commentService.createComment({
        content: newComment.trim(),
        issueId: id,
        userId: user.uid,
        userName: profile.fullName,
        userRole: profile.role
      });

      setNewComment('');
      fetchIssueData(); // Refresh comments
      
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully.",
      });
    } catch (error: any) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error posting comment",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!user || !issue) return;

    try {
      await issueService.updateIssue(issue.id, { status: newStatus as any });
      setIssue({ ...issue, status: newStatus as 'open' | 'in_progress' | 'resolved' | 'closed' });
      
      toast({
        title: "Status updated",
        description: `Issue status changed to ${newStatus.replace('_', ' ')}.`,
      });
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: "Error updating status",
        description: "Failed to update issue status. Please try again.",
        variant: "destructive",
      });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 border-red-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-muted rounded mb-6"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Issue not found</h2>
          <p className="text-muted-foreground mb-4">
            The issue you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/issues">
            <Button>Back to Issues</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/issues">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Issues
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{issue.title}</h1>
          <p className="text-muted-foreground">
            Reported by {issue.userName} • {formatDistanceToNow(issue.createdAt, { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Issue Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon(issue.status)}
              <CardTitle>Issue Details</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getPriorityColor(issue.priority)}>
                {issue.priority}
              </Badge>
              <Badge className={getStatusColor(issue.status)}>
                {issue.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{issue.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Category</h3>
              <p className="text-muted-foreground">{issue.category}</p>
            </div>
            {issue.location && (
              <div>
                <h3 className="font-semibold mb-2">Location</h3>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  {issue.location}
                </div>
              </div>
            )}
          </div>

          {/* Status Update (Government only) */}
          {profile?.role === 'government' && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Update Status</h3>
              <div className="flex items-center space-x-2">
                <Select value={issue.status} onValueChange={handleStatusUpdate}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Comments ({comments.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Comment Form */}
          {user && (
            <form onSubmit={handleAddComment} className="space-y-4">
              <div>
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={submitting || !newComment.trim()}>
                  {submitting ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      {comment.userRole === 'government' ? (
                        <Shield className="h-4 w-4 text-primary" />
                      ) : (
                        <span className="text-sm font-medium text-primary">
                          {comment.userName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">{comment.userName}</span>
                      {comment.userRole === 'government' && (
                        <Badge variant="outline" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Official
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}