
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BellRing, Info, Loader2, Trash2, Eye, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import type { WatchListNotification } from '@/types/event';
// import { useAuth } from '@/contexts/authContext'; // Removed, use Clerk
import { useUser as useClerkUser } from '@clerk/nextjs'; // Added Clerk's useUser
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, Timestamp, orderBy } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';


async function fetchNotificationsFromFirestore(userId: string): Promise<WatchListNotification[]> {
  if (!firestore) {
    console.error("Firestore not initialized");
    return [];
  }
  console.log('Fetching notifications for user from Firestore:', userId);
  try {
    const notificationsColRef = collection(firestore, `users/${userId}/notifications`);
    const q = query(notificationsColRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const fetchedNotifications: WatchListNotification[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as Omit<WatchListNotification, 'id' | 'createdAt'> & { createdAt: Timestamp };
      fetchedNotifications.push({ 
        ...data, 
        id: docSnap.id,
        createdAt: data.createdAt.toDate().toISOString() // Convert Timestamp to ISO string
      });
    });
    return fetchedNotifications;
  } catch (error) {
    console.error("Error fetching notifications from Firestore:", error);
    throw error; // Rethrow to be caught by caller
  }
}

async function markNotificationAsReadInFirestore(notificationId: string, userId: string): Promise<boolean> {
   if (!firestore) return false;
   console.log('Marking notification as read in Firestore:', notificationId, 'for user:', userId);
   try {
    const notifDocRef = doc(firestore, `users/${userId}/notifications`, notificationId);
    await updateDoc(notifDocRef, { isRead: true });
    return true;
   } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
   }
}

async function deleteNotificationFromFirestore(notificationId: string, userId: string): Promise<boolean> {
  if (!firestore) return false;
  console.log('Deleting notification from Firestore:', notificationId, 'for user:', userId);
  try {
    const notifDocRef = doc(firestore, `users/${userId}/notifications`, notificationId);
    await deleteDoc(notifDocRef);
    return true;
  } catch (error) {
    console.error("Error deleting notification:", error);
    return false;
  }
}


export default function NotificationsPage() {
  // const { currentUser, loading: authLoading } = useAuth(); // Removed
  const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useClerkUser();
  const router = useRouter();

  const [notifications, setNotifications] = useState<WatchListNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (clerkLoaded && !isSignedIn) {
      router.push('/sign-in?redirect_url=/notifications'); // Redirect to Clerk sign-in
    } else if (clerkLoaded && isSignedIn && clerkUser) {
      setIsLoading(true);
      fetchNotificationsFromFirestore(clerkUser.id) 
        .then(setNotifications)
        .catch(err => {
          console.error("Failed to load notifications:", err);
          setError("Could not load your notifications. Please try again later.");
        })
        .finally(() => setIsLoading(false));
    } else if (clerkLoaded && !isSignedIn) {
        setIsLoading(false); // Not signed in, stop loading
    }
  }, [clerkUser, clerkLoaded, isSignedIn, router]);

  const handleMarkAsRead = async (id: string) => {
    if (!clerkUser) return;
    const success = await markNotificationAsReadInFirestore(id, clerkUser.id); 
    if (success) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    }
  };

  const handleDelete = async (id: string) => {
    if (!clerkUser) return;
    const success = await deleteNotificationFromFirestore(id, clerkUser.id); 
    if (success) {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
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

  if (!clerkLoaded || isLoading) { 
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading notifications...</p>
      </div>
    );
  }
  
  if (clerkLoaded && !isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="outline" asChild className="mb-6">
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
        </Button>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Login Required</AlertTitle>
          <AlertDescription>
            Please <Link href="/sign-in?redirect_url=/notifications" className="underline text-primary">log in</Link> to view your notifications.
          </AlertDescription>
        </Alert>
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
        <Button variant="outline" asChild className="mt-4">
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center">
          <BellRing className="mr-3 h-8 w-8" /> Notifications
        </h1>
        <Button variant="outline" asChild>
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
        </Button>
      </div>

      {notifications.length === 0 ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>No New Notifications</AlertTitle>
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
                        <Link href={`/events/${notif.eventId}`} className="text-xs">View Event</Link>
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
