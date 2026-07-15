import React, { useState, useEffect } from 'react';
import { User } from '../lib/firebase';
import { db, collection, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, query, where, getDocs } from '../lib/firebase';
import { Users, UserPlus, Trophy, Flame, Clock, Award, CheckCircle, Search, Sparkles, Trash2, ChevronRight } from 'lucide-react';
import { StudySession } from '../types';

interface FriendsSectionProps {
  currentUser: User | null;
  sessions: StudySession[];
  onOpenAuth: () => void;
}

interface FriendProfile {
  uid: string;
  displayName: string;
  email: string;
  totalStudyMinutes: number;
  streak: number;
  photoURL?: string;
}

export const FriendsSection: React.FC<FriendsSectionProps> = ({ currentUser, sessions, onOpenAuth }) => {
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<FriendProfile | null>(null);
  const [friendEmailInput, setFriendEmailInput] = useState('');
  const [searchStatus, setSearchStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Calculate my total minutes
  const myTotalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  // Sync user profile to Firestore when logged in and sessions change
  useEffect(() => {
    if (!currentUser) return;
    const syncProfile = async () => {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, {
          uid: currentUser.uid,
          displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Study Student',
          email: currentUser.email,
          totalStudyMinutes: myTotalMinutes,
          photoURL: currentUser.photoURL || '',
          lastActive: Date.now()
        }, { merge: true });
      } catch (err) {
        console.error('Error syncing profile:', err);
      }
    };
    syncProfile();
  }, [currentUser, myTotalMinutes]);

  // Load friends
  useEffect(() => {
    if (!currentUser) return;
    const fetchFriends = async () => {
      setLoading(true);
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          const friendIds: string[] = data.friends || [];
          
          if (friendIds.length > 0) {
            const friendProfiles: FriendProfile[] = [];
            for (const fId of friendIds) {
              const fSnap = await getDoc(doc(db, 'users', fId));
              if (fSnap.exists()) {
                const fData = fSnap.data();
                friendProfiles.push({
                  uid: fData.uid,
                  displayName: fData.displayName || 'Friend',
                  email: fData.email || '',
                  totalStudyMinutes: fData.totalStudyMinutes || 0,
                  streak: fData.streak || 5,
                  photoURL: fData.photoURL
                });
              }
            }
            setFriends(friendProfiles);
          } else {
            // Add some sample mock friends if no friends added yet, for great out-of-the-box experience
            const sampleFriends: FriendProfile[] = [
              { uid: 'mock-1', displayName: 'Dr. Sarah Jenkins', email: 'sarah@med.edu', totalStudyMinutes: 2840, streak: 14 },
              { uid: 'mock-2', displayName: 'Alex Chen (Resident)', email: 'alex@med.edu', totalStudyMinutes: 2150, streak: 9 },
              { uid: 'mock-3', displayName: 'Priya Sharma', email: 'priya@med.edu', totalStudyMinutes: 1920, streak: 6 },
            ];
            setFriends(sampleFriends);
            setSelectedFriend(sampleFriends[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching friends:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, [currentUser]);

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!friendEmailInput.trim()) return;

    setSearchStatus(null);
    try {
      // Search user by email in Firestore
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', friendEmailInput.trim().toLowerCase()));
      const querySnap = await getDocs(q);

      if (querySnap.empty) {
        setSearchStatus({ type: 'error', message: 'No student found with this email address.' });
        return;
      }

      const friendDoc = querySnap.docs[0];
      const friendData = friendDoc.data();

      if (friendData.uid === currentUser.uid) {
        setSearchStatus({ type: 'error', message: "You cannot add yourself as a friend!" });
        return;
      }

      // Add to user's friends list
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        friends: arrayUnion(friendData.uid)
      });

      const newFriend: FriendProfile = {
        uid: friendData.uid,
        displayName: friendData.displayName,
        email: friendData.email,
        totalStudyMinutes: friendData.totalStudyMinutes || 0,
        streak: friendData.streak || 3,
        photoURL: friendData.photoURL
      };

      setFriends(prev => [
        ...prev.filter(f => f.uid !== friendData.uid),
        newFriend
      ]);
      setSelectedFriend(newFriend);

      setFriendEmailInput('');
      setSearchStatus({ type: 'success', message: `Successfully added ${friendData.displayName} to your study circle!` });
    } catch (err: any) {
      setSearchStatus({ type: 'error', message: err.message || 'Failed to add friend' });
    }
  };

  // Combine currentUser and friends for leaderboard
  const leaderboard = [
    {
      uid: currentUser?.uid || 'me',
      displayName: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'You (Me)',
      totalStudyMinutes: myTotalMinutes,
      isMe: true,
      streak: 7
    },
    ...friends.map(f => ({ ...f, isMe: false }))
  ].sort((a, b) => b.totalStudyMinutes - a.totalStudyMinutes);

  const handleRemoveFriend = async (friendId: string) => {
    if (!currentUser) {
      setFriends(prev => prev.filter(f => f.uid !== friendId));
      return;
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        friends: arrayRemove(friendId)
      });
      setFriends(prev => prev.filter(f => f.uid !== friendId));
      if (selectedFriend?.uid === friendId) {
        setSelectedFriend(null);
      }
    } catch (err) {
      console.error('Error removing friend:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Users className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Study Friends & Leaderboard</h1>
            </div>
            <p className="text-slate-400 text-sm max-w-xl">
              Connect with fellow students, compare study hours, and stay motivated together in your academic journey.
            </p>
          </div>

          {!currentUser ? (
            <button
              onClick={onOpenAuth}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-2xl transition shadow-lg shadow-indigo-600/30 cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Sign In / Sync Across Devices
            </button>
          ) : (
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl px-5 py-3 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                {currentUser.email?.[0].toUpperCase() || 'U'}
              </div>
              <div>
                <div className="text-xs text-slate-400">Signed in as</div>
                <div className="text-sm font-semibold text-white truncate max-w-[200px]">{currentUser.email}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Friend Input Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-white">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-indigo-400" />
          Add Study Friend by Email
        </h3>

        <form onSubmit={handleAddFriend} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
            <input
              type="email"
              placeholder="Enter friend's email address (e.g. friend@med.edu)"
              value={friendEmailInput}
              onChange={e => setFriendEmailInput(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-3 rounded-xl transition flex items-center justify-center space-x-2 shrink-0 shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Friend</span>
          </button>
        </form>

        {searchStatus && (
          <div className={`mt-3 p-3 rounded-xl text-xs flex items-center gap-2 ${searchStatus.type === 'success' ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/20 border border-rose-500/30 text-rose-300'}`}>
            {searchStatus.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : null}
            <span>{searchStatus.message}</span>
          </div>
        )}
      </div>

      {/* Leaderboard Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Study Leaderboard</h3>
              <p className="text-xs text-slate-400">Ranked by total study time</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {leaderboard.map((user, idx) => {
            const hours = (user.totalStudyMinutes / 60).toFixed(1);
            const rank = idx + 1;
            const isSelected = selectedFriend?.uid === user.uid;
            return (
              <div
                key={user.uid}
                className={`flex items-center justify-between p-4 rounded-2xl border transition cursor-pointer ${
                  user.isMe
                    ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-950/50'
                    : isSelected
                    ? 'bg-indigo-900/70 border-indigo-500/60 shadow-lg shadow-indigo-950/20'
                    : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800'
                }`}
                onClick={() => !user.isMe && setSelectedFriend(user as FriendProfile)}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                    rank === 1 ? 'bg-amber-500 text-slate-950' : rank === 2 ? 'bg-slate-300 text-slate-950' : rank === 3 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    #{rank}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-white">{user.displayName}</span>
                      {user.isMe && (
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold border border-indigo-500/30">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-amber-400">
                        <Flame className="w-3.5 h-3.5" />
                        {user.streak || 5} day streak
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex items-center gap-3">
                  <div>
                    <div className="text-base font-bold text-indigo-300">{hours} hrs</div>
                    <div className="text-[11px] text-slate-500">{user.totalStudyMinutes} mins total</div>
                  </div>
                  {!user.isMe && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFriend(user.uid);
                      }}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/15 text-rose-300 hover:bg-rose-500/20 text-[11px] font-semibold transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedFriend && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold">Friend Profile</h3>
              <p className="text-sm text-slate-400">Tap a friend to view their detailed study profile.</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedFriend(null)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950/40 border border-slate-800 rounded-3xl p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 text-lg font-bold">
                  {selectedFriend.displayName.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{selectedFriend.displayName}</div>
                  <div className="text-xs text-slate-400">{selectedFriend.email}</div>
                </div>
              </div>
              <div className="mt-5 space-y-3 text-sm text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Study Hours</span>
                  <span className="font-semibold text-white">{(selectedFriend.totalStudyMinutes / 60).toFixed(1)}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Current Streak</span>
                  <span className="font-semibold text-white">{selectedFriend.streak} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Profile Status</span>
                  <span className="font-semibold text-emerald-300">Active</span>
                </div>
              </div>
            </div>
            <div className="md:col-span-2 bg-slate-950/40 border border-slate-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between text-slate-400 text-xs uppercase tracking-wide">
                <span>Study highlight</span>
                <span className="text-slate-500">Leaderboard details</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4">
                  <div className="text-xs text-slate-400">Total Minutes</div>
                  <div className="text-2xl font-bold text-indigo-300">{selectedFriend.totalStudyMinutes}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4">
                  <div className="text-xs text-slate-400">Study Tier</div>
                  <div className="text-2xl font-bold text-amber-300">{selectedFriend.totalStudyMinutes > 2400 ? 'Elite' : selectedFriend.totalStudyMinutes > 1200 ? 'Rising' : 'Active'}</div>
                </div>
              </div>
              <div className="text-sm text-slate-300">
                This profile section helps you compare study patterns and stay motivated with a quick peer summary.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
