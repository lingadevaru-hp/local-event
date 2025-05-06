'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BellRing, Info, Loader2, Trash2, Eye } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import type { WatchListNotification } from '@/types/event'; // Using WatchListNotification as a general notification structure for now

// Mock notifications - replace with actual API call
const MOCK_NOTIFICATIONS: WatchListNotification[] = [
  { 
    id: 'notif1', userId: 'devUser123', eventId: '1', 
    message: 'Kala Utsava Bengaluru is starting in 3 days!', 
    type: 'DATE_NEAR', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), isRead: false 
  },
  { 
    id: 'notif2', userId: 'devUser123', eventId: '3', 
    message: 'Price reduced for Yakshagana Sammelana Udupi! Now ₹40.', 
    type: 'PRICE_REDUCED', createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), isRead: false
  },
  { 
    id: 'notif3', userId: 'devUser123', eventId: 'org_event_1', 
    message: 'New Tech Summit happening in Belagavi district!', 
    // This would be a "DISTRICT_TARGETED" type in a real system
    type: 'LOCATION_UPDATED', // Re-using for simplicity
    createdAt: new Date().toISOString(), isRead: true
  },
  { 
    id: 'notif4', userId: 'devUser123', eventId: '1', 
    message: 'Location updated for Kala Utsava Bengaluru.', 
    type: 'LOCATION_UPDATED', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), isRead: true 
  },
];

async function fetchNotifications(userId: string): Promise<WatchListNotification[]> {
  console.log('Fetching notifications for user:', userId);
  await new Promise(resolve => setTimeout(resolve, 700));
  return MOCK_NOTIFICATIONS.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  console.log('Marking notification as read:', notificationId);
  await new Promise(resolve => setTimeout(resolve, 300));
  // In real app, update backend
  const index = MOCK_NOTIFICATIONS.findIndex(n => n.id === notificationId);
  if (index > -1) MOCK_NOTIFICATIONS[index].isRead = true;
  return true;
}

async function deleteNotification(notificationId: string): Promise<boolean> {
  console.log('Deleting notification:', notificationId);
  await new Promise(resolve => setTimeout(resolve, 300));
  // In real app, update backend
  const index = MOCK_NOTIFICATIONS.findIndex(n => n.id === notificationId);
  if (index > -1) MOCK_NOTIFICATIONS.splice(index, 1);
  return true;
}


export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<WatchListNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock current user ID
  const currentUserId = 'devUser123';

  useEffect(() => {
    if (currentUserId) {
      setIsLoading(true);
      fetchNotifications(currentUserId)
        .then(setNotifications)
        .catch(err => {
          console.error("Failed to load notifications:", err);
          setError("Could not load your notifications. Please try again later.");
        })
        .finally(() => setIsLoading(false));
    } else {
      setError("Please log in to view your notifications.");
      setIsLoading(false);
    }
  }, [currentUserId]);

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const timeSince = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center">
          <BellRing className="mr-3 h-8 w-8" /> Notifications (ಅಧಿಸೂಚನೆಗಳು)
        </h1>
        {/* Optionally: Button to mark all as read */}
      </div>

      {notifications.length === 0 ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>No New Notifications (ಯಾವುದೇ ಹೊಸ ಅಧಿಸೂಚನೆಗಳಿಲ್ಲ)</AlertTitle>
          <AlertDescription>
            You currently have no notifications. We&apos;ll let you know about event updates or new events in your area.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {notifications.map(notif => (
            <Card key={notif.id} className={`bg-card ${!notif.isRead ? 'border-primary border-2 shadow-lg' : 'shadow-sm'}`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <p className={`text-sm ${!notif.isRead ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{notif.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{timeSince(notif.createdAt)}</p>
                    </div>
                    <div className="flex space-x-1">
                        {!notif.isRead && (
                            <Button variant="ghost" size="icon" onClick={() => handleMarkAsRead(notif.id)} title="Mark as read">
                                <Eye className="h-4 w-4 text-primary" />
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(notif.id)} title="Delete notification">
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                </div>
                {notif.eventId && (
                    <>
                    <Separator className="my-2" />
                    <Button variant="link" size="sm" asChild className="px-0 h-auto py-0">
                        <Link href={`/events/${notif.eventId}`} className="text-xs">View Event (ಕಾರ್ಯಕ್ರಮ ನೋಡಿ)</Link>
                    </Button>
                    </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
