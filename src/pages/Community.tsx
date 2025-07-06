import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { communityService, realtimeService } from '@/integrations/firebase/services';
import { 
  CommunityChat, 
  CommunityPoll, 
  CommunityPollVote, 
  CommunitySurvey, 
  CommunitySurveyResponse, 
  CommunityEvent, 
  CommunityEventSignup 
} from '@/integrations/firebase/types';
import { toast } from '@/hooks/use-toast';
import { 
  Send, 
  MessageCircle, 
  Users, 
  Calendar, 
  BarChart3, 
  Plus, 
  Vote, 
  CheckCircle, 
  Clock,
  MapPin,
  UserPlus,
  UserCheck
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

export default function Community() {
  const { user, profile } = useAuth();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };
  
  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<CommunityChat[]>([]);
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Polls state
  const [polls, setPolls] = useState<CommunityPoll[]>([]);
  const [pollVotes, setPollVotes] = useState<Record<string, CommunityPollVote[]>>({});
  const [userVotes, setUserVotes] = useState<Record<string, CommunityPollVote>>({});
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [newPoll, setNewPoll] = useState({ question: '', options: ['', ''] });
  
  // Surveys state
  const [surveys, setSurveys] = useState<CommunitySurvey[]>([]);
  const [surveyResponses, setSurveyResponses] = useState<Record<string, CommunitySurveyResponse[]>>({});
  const [showCreateSurvey, setShowCreateSurvey] = useState(false);
  const [newSurvey, setNewSurvey] = useState({ title: '', questions: [''] });
  const [showSurveyResponse, setShowSurveyResponse] = useState<string | null>(null);
  const [surveyAnswers, setSurveyAnswers] = useState<string[]>([]);
  
  // Events state
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [eventSignups, setEventSignups] = useState<Record<string, CommunityEventSignup[]>>({});
  const [userEventSignups, setUserEventSignups] = useState<Record<string, CommunityEventSignup>>({});
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ name: '', date: '', description: '' });
  
  const [loading, setLoading] = useState(true);
  const [voteCountdowns, setVoteCountdowns] = useState<Record<string, { minutes: number; seconds: number }>>({});

  useEffect(() => {
    // Set up real-time listeners
    const unsubscribers = [
      realtimeService.onChatMessagesChange((messages) => {
        setChatMessages(messages);
      }),
      realtimeService.onPollsChange((polls) => {
        setPolls(polls);
      }),
      realtimeService.onSurveysChange((surveys) => {
        setSurveys(surveys);
      }),
      realtimeService.onEventsChange((events) => {
        setEvents(events);
      })
    ];

    // Load initial data
    const loadData = async () => {
      try {
        if (user) {
          // Load poll votes and user votes
          const votesPromises = polls.map(poll => 
            communityService.getPollVotes(poll.id)
          );
          const votesResults = await Promise.all(votesPromises);
          const votesMap: Record<string, CommunityPollVote[]> = {};
          const userVotesMap: Record<string, CommunityPollVote> = {};
          
          polls.forEach((poll, index) => {
            votesMap[poll.id] = votesResults[index];
            const userVote = votesResults[index].find(vote => vote.userId === user.uid);
            if (userVote) {
              userVotesMap[poll.id] = userVote;
            }
          });
          
          setPollVotes(votesMap);
          setUserVotes(userVotesMap);

          // Load survey responses
          const surveyResponsesPromises = surveys.map(survey =>
            communityService.getSurveyResponses(survey.id)
          );
          const surveyResponsesResults = await Promise.all(surveyResponsesPromises);
          const surveyResponsesMap: Record<string, CommunitySurveyResponse[]> = {};
          
          surveys.forEach((survey, index) => {
            surveyResponsesMap[survey.id] = surveyResponsesResults[index];
          });
          
          setSurveyResponses(surveyResponsesMap);

          // Load event signups
          const eventSignupsPromises = events.map(event =>
            communityService.getEventSignups(event.id)
          );
          const eventSignupsResults = await Promise.all(eventSignupsPromises);
          const eventSignupsMap: Record<string, CommunityEventSignup[]> = {};
          const userEventSignupsMap: Record<string, CommunityEventSignup> = {};
          
          events.forEach((event, index) => {
            eventSignupsMap[event.id] = eventSignupsResults[index];
            const userSignup = eventSignupsResults[index].find(signup => signup.userId === user.uid);
            if (userSignup) {
              userEventSignupsMap[event.id] = userSignup;
            }
          });
          
          setEventSignups(eventSignupsMap);
          setUserEventSignups(userEventSignupsMap);
        }
      } catch (error) {
        console.error('Error loading community data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [user, polls, surveys, events]);

  // Real-time poll votes tracking
  useEffect(() => {
    if (!user || polls.length === 0) return;

    const voteUnsubscribers = polls.map(poll => 
      realtimeService.onPollVotesChange(poll.id, (votes) => {
        setPollVotes(prev => ({
          ...prev,
          [poll.id]: votes
        }));
        
        // Update user votes
        const userVote = votes.find(vote => vote.userId === user.uid);
        setUserVotes(prev => ({
          ...prev,
          [poll.id]: userVote || null
        }));
      })
    );

    return () => {
      voteUnsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [polls, user]);

  // Real-time survey responses tracking
  useEffect(() => {
    if (!user || surveys.length === 0) return;

    const responseUnsubscribers = surveys.map(survey => 
      realtimeService.onSurveyResponsesChange(survey.id, (responses) => {
        setSurveyResponses(prev => ({
          ...prev,
          [survey.id]: responses
        }));
      })
    );

    return () => {
      responseUnsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [surveys, user]);

  // Real-time event signups tracking
  useEffect(() => {
    if (!user || events.length === 0) return;

    const signupUnsubscribers = events.map(event => 
      realtimeService.onEventSignupsChange(event.id, (signups) => {
        setEventSignups(prev => ({
          ...prev,
          [event.id]: signups
        }));
        
        // Update user signups
        const userSignup = signups.find(signup => signup.userId === user.uid);
        setUserEventSignups(prev => ({
          ...prev,
          [event.id]: userSignup || null
        }));
      })
    );

    return () => {
      signupUnsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [events, user]);

  // Countdown timer for vote changes
  useEffect(() => {
    const interval = setInterval(() => {
      const newCountdowns: Record<string, { minutes: number; seconds: number }> = {};
      
      Object.entries(userVotes).forEach(([pollId, vote]) => {
        if (vote) {
          const remainingTime = getRemainingTimeToChangeVote(vote);
          if (remainingTime) {
            newCountdowns[pollId] = remainingTime;
          }
        }
      });
      
      setVoteCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [userVotes]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !user || sendingMessage) return;

    setSendingMessage(true);
    try {
      const userName = profile?.fullName || user.displayName || 'Anonymous';
      await communityService.createChatMessage({
        content: chatInput.trim(),
        userId: user.uid,
        userName: userName
      });
      setChatInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSendingMessage(false);
    }
  };

  // Poll handlers
  const handleCreatePoll = async () => {
    if (!user || !newPoll.question.trim() || newPoll.options.some(opt => !opt.trim())) return;
    
    try {
      await communityService.createPoll({
        question: newPoll.question.trim(),
        options: newPoll.options.filter(opt => opt.trim()),
        createdBy: user.uid
      });
      setNewPoll({ question: '', options: ['', ''] });
      setShowCreatePoll(false);
      toast({
        title: 'Poll created successfully',
        description: 'Your poll is now live!',
      });
    } catch (error) {
      console.error('Error creating poll:', error);
      toast({
        title: 'Error',
        description: 'Failed to create poll. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleVoteInPoll = async (pollId: string, optionIndex: number) => {
    if (!user) return;
    
    try {
      // Optimistically update the UI
      const optimisticVote: CommunityPollVote = {
        id: 'temp-' + Date.now(),
        pollId,
        userId: user.uid,
        optionIndex,
        createdAt: new Date()
      };
      
      setUserVotes(prev => ({
        ...prev,
        [pollId]: optimisticVote
      }));
      
      await communityService.voteInPoll({
        pollId,
        userId: user.uid,
        optionIndex
      });
      
      toast({
        title: 'Vote recorded',
        description: 'Your vote has been recorded! You can change it within 15 minutes.',
      });
    } catch (error) {
      console.error('Error voting in poll:', error);
      
      // Revert optimistic update on error
      setUserVotes(prev => {
        const newVotes = { ...prev };
        delete newVotes[pollId];
        return newVotes;
      });
      
      const errorMessage = error instanceof Error && error.message.includes('15 minutes') 
        ? 'Vote cannot be changed after 15 minutes'
        : 'Failed to record vote. Please try again.';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const addPollOption = () => {
    setNewPoll(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removePollOption = (index: number) => {
    if (newPoll.options.length <= 2) return;
    setNewPoll(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const updatePollOption = (index: number, value: string) => {
    setNewPoll(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  // Survey handlers
  const handleCreateSurvey = async () => {
    if (!user || !newSurvey.title.trim() || newSurvey.questions.some(q => !q.trim())) return;
    
    try {
      await communityService.createSurvey({
        title: newSurvey.title.trim(),
        questions: newSurvey.questions.filter(q => q.trim()),
        createdBy: user.uid
      });
      setNewSurvey({ title: '', questions: [''] });
      setShowCreateSurvey(false);
      toast({
        title: 'Survey created successfully',
        description: 'Your survey is now live!',
      });
    } catch (error) {
      console.error('Error creating survey:', error);
      toast({
        title: 'Error',
        description: 'Failed to create survey. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitSurveyResponse = async (surveyId: string) => {
    if (!user || surveyAnswers.some(answer => !answer.trim())) return;
    
    try {
      await communityService.submitSurveyResponse({
        surveyId,
        userId: user.uid,
        answers: surveyAnswers
      });
      setSurveyAnswers([]);
      setShowSurveyResponse(null);
      toast({
        title: 'Response submitted',
        description: 'Thank you for your response!',
      });
    } catch (error) {
      console.error('Error submitting survey response:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit response. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const addSurveyQuestion = () => {
    setNewSurvey(prev => ({
      ...prev,
      questions: [...prev.questions, '']
    }));
  };

  const removeSurveyQuestion = (index: number) => {
    if (newSurvey.questions.length <= 1) return;
    setNewSurvey(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const updateSurveyQuestion = (index: number, value: string) => {
    setNewSurvey(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => i === index ? value : q)
    }));
  };

  const startSurveyResponse = (survey: CommunitySurvey) => {
    setSurveyAnswers(new Array(survey.questions.length).fill(''));
    setShowSurveyResponse(survey.id);
  };

  // Event handlers
  const handleCreateEvent = async () => {
    if (!user || !newEvent.name.trim() || !newEvent.date || !newEvent.description.trim()) return;
    
    try {
      await communityService.createEvent({
        name: newEvent.name.trim(),
        date: new Date(newEvent.date),
        description: newEvent.description.trim(),
        createdBy: user.uid
      });
      setNewEvent({ name: '', date: '', description: '' });
      setShowCreateEvent(false);
      toast({
        title: 'Event created successfully',
        description: 'Your event is now live!',
      });
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: 'Error',
        description: 'Failed to create event. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSignupForEvent = async (eventId: string) => {
    if (!user) return;
    
    try {
      await communityService.signupForEvent({
        eventId,
        userId: user.uid
      });
      toast({
        title: 'Successfully signed up',
        description: 'You are now registered for this event!',
      });
    } catch (error) {
      console.error('Error signing up for event:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign up for event. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Helper functions
  const getPollResults = (pollId: string) => {
    const votes = pollVotes[pollId] || [];
    const poll = polls.find(p => p.id === pollId);
    if (!poll) return [];
    
    return poll.options.map((option, index) => {
      const optionVotes = votes.filter(vote => vote.optionIndex === index);
      const percentage = votes.length > 0 ? (optionVotes.length / votes.length) * 100 : 0;
      return {
        option,
        votes: optionVotes.length,
        percentage
      };
    });
  };

  const getUserVoteForPoll = (pollId: string) => {
    return userVotes[pollId];
  };

  const isUserSignedUpForEvent = (eventId: string) => {
    return !!userEventSignups[eventId];
  };

  // Helper function to check if user can change their vote (within 15 minutes)
  const canChangeVote = (vote: CommunityPollVote) => {
    const voteTime = new Date(vote.createdAt);
    const currentTime = new Date();
    const timeDifference = currentTime.getTime() - voteTime.getTime();
    const fifteenMinutes = 15 * 60 * 1000; // 15 minutes in milliseconds
    return timeDifference <= fifteenMinutes;
  };

  // Helper function to get remaining time to change vote
  const getRemainingTimeToChangeVote = (vote: CommunityPollVote) => {
    const voteTime = new Date(vote.createdAt);
    const currentTime = new Date();
    const timeDifference = currentTime.getTime() - voteTime.getTime();
    const fifteenMinutes = 15 * 60 * 1000;
    const remainingTime = fifteenMinutes - timeDifference;
    
    if (remainingTime <= 0) return null;
    
    const minutes = Math.floor(remainingTime / (60 * 1000));
    const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);
    
    return { minutes, seconds };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Community Hub</h1>
            <p className="text-muted-foreground">
              Connect with your neighbors and stay informed
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
          <h1 className="text-2xl font-bold">Community Hub</h1>
          <p className="text-muted-foreground">
            Connect with your neighbors and stay informed
          </p>
        </div>
      </div>

      <Tabs defaultValue="chat" className="space-y-6" onValueChange={(value) => {
        // Smooth scroll to the top of the content when switching tabs
        setTimeout(() => {
          const tabsContent = document.querySelector('[data-state="active"]');
          if (tabsContent) {
            tabsContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat" className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4" />
            <span>Chat</span>
          </TabsTrigger>
          <TabsTrigger value="polls" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Polls</span>
          </TabsTrigger>
          <TabsTrigger value="surveys" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Surveys</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Events</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Community Chat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-96 overflow-y-auto border rounded-lg p-4 space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  chatMessages.map((message) => {
                    const isCurrentUser = user && message.userId === user.uid;
                    return (
                      <div key={message.id} className={`flex items-start space-x-3 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                          }`}>
                            <span className="text-sm font-medium">
                              {message.userName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className={`flex-1 min-w-0 ${isCurrentUser ? 'text-right' : ''}`}>
                          <div className={`flex items-center space-x-2 mb-1 ${isCurrentUser ? 'justify-end' : ''}`}>
                            <span className="font-medium text-sm">{message.userName}</span>
                            <span className="text-xs text-muted-foreground">
                              {message.createdAt && message.createdAt instanceof Date && !isNaN(message.createdAt.getTime())
                                ? formatDistanceToNow(message.createdAt, { addSuffix: true })
                                : 'Just now'
                              }
                            </span>
                          </div>
                          <div className={`inline-block p-3 rounded-lg ${
                            isCurrentUser 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={user ? "Type your message..." : "Sign in to chat..."}
                  disabled={!user || sendingMessage}
                />
                <Button type="submit" disabled={!chatInput.trim() || !user || sendingMessage}>
                  {sendingMessage ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
              {!user && (
                <p className="text-sm text-muted-foreground text-center">
                  Please sign in to participate in the chat
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="polls" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Community Polls</h2>
              <p className="text-muted-foreground">Vote on important community decisions</p>
            </div>
            {user && (
              <Dialog open={showCreatePoll} onOpenChange={setShowCreatePoll}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Poll
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Poll</DialogTitle>
                    <DialogDescription>
                      Create a poll to gather community opinions
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="poll-question">Question</Label>
                      <Input
                        id="poll-question"
                        value={newPoll.question}
                        onChange={(e) => setNewPoll(prev => ({ ...prev, question: e.target.value }))}
                        placeholder="What would you like to ask?"
                      />
                    </div>
                    <div>
                      <Label>Options</Label>
                      <div className="space-y-2">
                        {newPoll.options.map((option, index) => (
                          <div key={index} className="flex space-x-2">
                            <Input
                              value={option}
                              onChange={(e) => updatePollOption(index, e.target.value)}
                              placeholder={`Option ${index + 1}`}
                            />
                            {newPoll.options.length > 2 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removePollOption(index)}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addPollOption}
                        >
                          Add Option
                        </Button>
                      </div>
                    </div>
                    <Button onClick={handleCreatePoll} className="w-full">
                      Create Poll
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {polls.length === 0 ? (
            <Card>
              <CardContent className="text-center text-muted-foreground py-8">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>No polls yet. {user ? 'Create the first poll!' : 'Sign in to create polls!'}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {polls.map((poll) => {
                const results = getPollResults(poll.id);
                const userVote = getUserVoteForPoll(poll.id);
                const totalVotes = results.reduce((sum, result) => sum + result.votes, 0);
                const canChange = userVote ? canChangeVote(userVote) : false;
                const countdown = voteCountdowns[poll.id];
                
                return (
                  <Card key={poll.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{poll.question}</CardTitle>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Vote className="h-4 w-4" />
                        <span><strong>{totalVotes}</strong> total votes</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(poll.createdAt, { addSuffix: true })}</span>
                        {user && (
                          <>
                            <span>•</span>
                            <span>{userVote ? 'You voted' : 'You can vote'}</span>
                          </>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {results.map((result, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {result.option}: {result.votes} votes ({result.percentage.toFixed(1)}%)
                          </Badge>
                        ))}
                      </div>
                      {userVote && (
                        <div className="text-sm text-muted-foreground">
                          {canChange ? (
                            <div className="flex items-center gap-2">
                              <span>You can change your vote for:</span>
                              <span className="font-mono text-primary">
                                {countdown ? `${countdown.minutes}:${countdown.seconds.toString().padStart(2, '0')}` : '0:00'}
                              </span>
                            </div>
                          ) : (
                            <span>Your vote is locked</span>
                          )}
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {user && (!userVote || canChange) ? (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground mb-3">
                            {userVote ? 'Click an option to change your vote:' : 'Click an option to cast your vote:'}
                          </p>
                          {poll.options.map((option, index) => {
                            const votes = pollVotes[poll.id]?.filter(v => v.optionIndex === index) || [];
                            const totalVotes = pollVotes[poll.id]?.length || 0;
                            const percentage = totalVotes > 0 ? Math.round((votes.length / totalVotes) * 100) : 0;
                            
                            return (
                              <Button
                                key={index}
                                variant={userVote && userVote.optionIndex === index ? "default" : "outline"}
                                className={`w-full justify-between ${
                                  userVote && userVote.optionIndex === index 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'hover:bg-primary/5'
                                }`}
                                onClick={() => handleVoteInPoll(poll.id, index)}
                              >
                                <div className="flex items-center">
                                  <Vote className="h-4 w-4 mr-2" />
                                  <span>{option}</span>
                                  {userVote && userVote.optionIndex === index && (
                                    <CheckCircle className="h-4 w-4 ml-2" />
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {votes.length} votes
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    ({percentage}%)
                                  </span>
                                </div>
                              </Button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                            <span>Voting Results</span>
                            {userVote && (
                              <span className="flex items-center space-x-1">
                                <CheckCircle className="h-3 w-3 text-primary" />
                                <span>{canChange ? 'You voted (can change)' : 'You voted (locked)'}</span>
                              </span>
                            )}
                          </div>
                          {results.map((result, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{result.option}</span>
                                <div className="flex items-center space-x-2">
                                  {userVote && userVote.optionIndex === index && (
                                    <CheckCircle className="h-4 w-4 text-primary" />
                                  )}
                                  <Badge variant="secondary" className="text-xs">
                                    {result.votes} votes
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    ({result.percentage.toFixed(1)}%)
                                  </span>
                                </div>
                              </div>
                              <Progress value={result.percentage} className="h-2" />
                            </div>
                          ))}
                          {user && userVote && (
                            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm text-muted-foreground">
                                You voted for: <span className="font-medium">{poll.options[userVote.optionIndex]}</span>
                                {canChange && (
                                  <span className="ml-2 text-primary">
                                    (Changeable for {countdown ? `${countdown.minutes}:${countdown.seconds.toString().padStart(2, '0')}` : '0:00'})
                                  </span>
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="surveys" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Community Surveys</h2>
              <p className="text-muted-foreground">Share your thoughts and feedback</p>
            </div>
            {user && (
              <Dialog open={showCreateSurvey} onOpenChange={setShowCreateSurvey}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Survey
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Survey</DialogTitle>
                    <DialogDescription>
                      Create a survey to gather detailed community feedback
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="survey-title">Survey Title</Label>
                      <Input
                        id="survey-title"
                        value={newSurvey.title}
                        onChange={(e) => setNewSurvey(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="What is this survey about?"
                      />
                    </div>
                    <div>
                      <Label>Questions</Label>
                      <div className="space-y-2">
                        {newSurvey.questions.map((question, index) => (
                          <div key={index} className="flex space-x-2">
                            <Input
                              value={question}
                              onChange={(e) => updateSurveyQuestion(index, e.target.value)}
                              placeholder={`Question ${index + 1}`}
                            />
                            {newSurvey.questions.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeSurveyQuestion(index)}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addSurveyQuestion}
                        >
                          Add Question
                        </Button>
                      </div>
                    </div>
                    <Button onClick={handleCreateSurvey} className="w-full">
                      Create Survey
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {surveys.length === 0 ? (
            <Card>
              <CardContent className="text-center text-muted-foreground py-8">
                <Users className="h-12 w-12 mx-auto mb-4" />
                <p>No surveys yet. {user ? 'Create the first survey!' : 'Sign in to create surveys!'}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {surveys.map((survey) => {
                const responses = surveyResponses[survey.id] || [];
                const hasUserResponded = user && responses.some(response => response.userId === user.uid);
                
                return (
                  <Card key={survey.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{survey.title}</CardTitle>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{responses.length} responses</span>
                        <span>•</span>
                        <span>{survey.questions.length} questions</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(survey.createdAt, { addSuffix: true })}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {survey.questions.map((question, index) => (
                          <div key={index} className="text-sm">
                            <span className="font-medium">{index + 1}.</span> {question}
                          </div>
                        ))}
                      </div>
                      {user && !hasUserResponded ? (
                        <Button onClick={() => startSurveyResponse(survey)}>
                          Take Survey
                        </Button>
                      ) : (
                        <Badge variant="secondary">
                          {hasUserResponded ? 'Completed' : 'Sign in to participate'}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Survey Response Dialog */}
          <Dialog open={!!showSurveyResponse} onOpenChange={() => setShowSurveyResponse(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Survey Response</DialogTitle>
                <DialogDescription>
                  Please answer all questions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {showSurveyResponse && surveys.find(s => s.id === showSurveyResponse)?.questions.map((question, index) => (
                  <div key={index}>
                    <Label className="text-sm font-medium">
                      {index + 1}. {question}
                    </Label>
                    <Textarea
                      value={surveyAnswers[index] || ''}
                      onChange={(e) => {
                        const newAnswers = [...surveyAnswers];
                        newAnswers[index] = e.target.value;
                        setSurveyAnswers(newAnswers);
                      }}
                      placeholder="Your answer..."
                      rows={3}
                    />
                  </div>
                ))}
                <Button 
                  onClick={() => showSurveyResponse && handleSubmitSurveyResponse(showSurveyResponse)}
                  className="w-full"
                >
                  Submit Response
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Community Events</h2>
              <p className="text-muted-foreground">Join and organize community events</p>
            </div>
            {user && (
              <Dialog open={showCreateEvent} onOpenChange={setShowCreateEvent}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                    <DialogDescription>
                      Create an event to bring the community together
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="event-name">Event Name</Label>
                      <Input
                        id="event-name"
                        value={newEvent.name}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="What's the event called?"
                      />
                    </div>
                    <div>
                      <Label htmlFor="event-date">Event Date & Time</Label>
                      <Input
                        id="event-date"
                        type="datetime-local"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="event-description">Description</Label>
                      <Textarea
                        id="event-description"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Tell us about the event..."
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleCreateEvent} className="w-full">
                      Create Event
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {events.length === 0 ? (
            <Card>
              <CardContent className="text-center text-muted-foreground py-8">
                <Calendar className="h-12 w-12 mx-auto mb-4" />
                <p>No events yet. {user ? 'Create the first event!' : 'Sign in to create events!'}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {events.map((event) => {
                const signups = eventSignups[event.id] || [];
                const isSignedUp = isUserSignedUpForEvent(event.id);
                const isPastEvent = new Date(event.date) < new Date();
                
                return (
                  <Card key={event.id} className={isPastEvent ? 'opacity-60' : ''}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{event.name}</CardTitle>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-2">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(event.date), 'PPP p')}</span>
                            <span>•</span>
                            <Users className="h-4 w-4" />
                            <span>{signups.length} attending</span>
                            {isPastEvent && (
                              <>
                                <span>•</span>
                                <Badge variant="secondary">Past Event</Badge>
                              </>
                            )}
                          </div>
                        </div>
                        {isSignedUp && (
                          <Badge variant="default" className="flex items-center space-x-1">
                            <UserCheck className="h-3 w-3" />
                            <span>Registered</span>
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      {user && !isPastEvent && (
                        <Button
                          onClick={() => handleSignupForEvent(event.id)}
                          disabled={isSignedUp}
                          variant={isSignedUp ? "secondary" : "default"}
                          className="w-full"
                        >
                          {isSignedUp ? (
                            <>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Already Registered
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Register for Event
                            </>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 