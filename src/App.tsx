import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  Sparkles, 
  CheckCircle, 
  Flame, 
  Brain, 
  Trash2, 
  Zap, 
  Play, 
  Plus, 
  AlertOctagon, 
  HelpCircle, 
  Clock, 
  BookOpen, 
  Briefcase, 
  User, 
  DollarSign, 
  Users, 
  Image, 
  Send, 
  Compass,
  XCircle,
  Volume2,
  Calendar,
  Layers,
  Sparkle,
  Wind,
  Sun,
  Moon,
  LogOut,
  Terminal
} from 'lucide-react';
import { Task, MicroStep, RealityCheck, CrisisPlan, UserStats } from './types';
import EmergencyServices from './components/EmergencyServices';

// Custom integrations
import { 
  auth, 
  db, 
  signOut, 
  onAuthStateChanged,
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  FirebaseUser
} from './lib/firebase';
import Auth from './components/Auth';
import EntryAnimation from './components/EntryAnimation';
import Logo from './components/Logo';

export default function App() {
  // Authentication & Session States
  const [user, setUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('resqtime_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [userMeta, setUserMeta] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('resqtime_meta');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authLoading, setAuthLoading] = useState(() => {
    try {
      const saved = localStorage.getItem('resqtime_user');
      return !saved;
    } catch {
      return true;
    }
  });
  const [isEntering, setIsEntering] = useState(false);
  
  // Custom Visual Themes (Dark Mode vs Light Mode)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Application states
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<UserStats>({
    total_xp: 350,
    completed_tasks_count: 5,
    critical_tasks_resolved: 2,
    streak_days: 4
  });

  // Loading/Action indicators
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [chaosInput, setChaosInput] = useState('');
  const [parsingChaos, setParsingChaos] = useState(false);
  const [generatingStepsId, setGeneratingStepsId] = useState<string | null>(null);
  
  // Custom single task form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState(30);
  const [newTaskPriority, setNewTaskPriority] = useState<'Critical' | 'Medium' | 'Low'>('Medium');
  const [newTaskCategory, setNewTaskCategory] = useState<'Academic' | 'Work' | 'Personal' | 'Financial' | 'Social'>('Personal');

  // Reality Check Modal
  const [showRealityCheckModal, setShowRealityCheckModal] = useState(false);
  const [rcTargetTask, setRcTargetTask] = useState<Task | null>(null);
  const [rcLoading, setRcLoading] = useState(false);
  const [rcResult, setRcResult] = useState<RealityCheck | null>(null);

  // Crisis Mode Modal
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [crisisLoading, setCrisisLoading] = useState(false);
  const [crisisPlan, setCrisisPlan] = useState<CrisisPlan | null>(null);

  // Accountability Verification Modal
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyTargetTask, setVerifyTargetTask] = useState<Task | null>(null);
  const [verifyImageBase64, setVerifyImageBase64] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<{
    verified: boolean;
    confidence_score: number;
    inspector_feedback: string;
    xp_awarded: number;
  } | null>(null);

  // Behavioral Nudge state
  const [nudgeTask, setNudgeTask] = useState<Task | null>(null);
  const [nudgeTier, setNudgeTier] = useState<'Supportive' | 'Firm Warning' | 'Panic Attack'>('Supportive');
  const [nudgeMessage, setNudgeMessage] = useState('');
  const [loadingNudge, setLoadingNudge] = useState(false);

  // Notification Banner
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  // Audio simulation state for "Panic alert" or breathing chime
  const [chimePlaying, setChimePlaying] = useState(false);

  // Resilient API Fetch Wrapper with user isolation header
  const appFetch = async (url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as any || {}),
    };
    
    // Add current user's UID to partition the local REST fallback database
    const currentUid = user?.uid || (() => {
      try {
        const saved = localStorage.getItem('resqtime_user');
        return saved ? JSON.parse(saved).uid : 'guest-evaluator-123';
      } catch {
        return 'guest-evaluator-123';
      }
    })();
    
    headers['X-User-Id'] = currentUid;
    return fetch(url, { ...options, headers });
  };

  // Safe global sign out
  const handleLogout = async () => {
    localStorage.removeItem('resqtime_user');
    localStorage.removeItem('resqtime_meta');
    setUser(null);
    setUserMeta(null);
    try {
      await signOut(auth);
    } catch (err) {
      console.warn("Firebase Auth signOut failed or not active:", err);
    }
  };

  // Subscribe to Firebase Authentication state change
  useEffect(() => {
    if (user && (user as any).isMock) {
      setAuthLoading(false);
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
          const isGuest = firebaseUser.isAnonymous;
          const displayName = firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Evaluator Guest');
          
          try {
            const res = await appFetch('/api/orchestrate', {
              method: 'POST',
              body: JSON.stringify({
                current_theme: theme,
                action: 'PROCESS_LOGIN',
                payload: {
                  firebase_uid: firebaseUser.uid,
                  provider_id: isGuest ? 'guest' : 'password',
                  email: firebaseUser.email || 'guest@resqtime.io',
                  display_name: displayName
                }
              })
            });
            if (res.ok) {
              const syncData = await res.json();
              setUserMeta(syncData);
            }
          } catch (err) {
            console.error("Auto login process sync error:", err);
          }
        } else {
          setUser(prev => {
            if (prev && (prev as any).isMock) {
              return prev;
            }
            return null;
          });
          setUserMeta(prev => {
            if (prev && prev.user_meta && prev.user_meta.isMock) {
              return prev;
            }
            return null;
          });
        }
        setAuthLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn("Firebase Auth listener initialization bypassed:", err);
      setAuthLoading(false);
    }
  }, [theme]);

  // Sync tasks and stats when user logs in
  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchStats();
    }
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;
    setLoadingTasks(true);
    try {
      const canUseFirestore = auth && auth.currentUser && !(user as any).isMock;
      if (!canUseFirestore) {
        const res = await appFetch('/api/tasks');
        if (res.ok) {
          const data = await res.json();
          setTasks(data);
        }
        return;
      }
      // Load tasks from user's custom Firestore subcollection
      const tasksColRef = collection(db, 'users', user.uid, 'tasks');
      const q = query(tasksColRef);
      const snap = await getDocs(q);
      const loadedTasks: Task[] = [];
      snap.forEach((docSnap) => {
        loadedTasks.push({ id: docSnap.id, ...docSnap.data() } as Task);
      });

      // Seed default assignments if Firestore collection is completely blank
      if (loadedTasks.length === 0) {
        const initialTasks = [
          {
            task_name: "Submit CS201 Final Java Project & Documentation",
            deadline: "2026-06-29 18:00:00",
            estimated_duration_minutes: 180,
            priority: "Critical" as const,
            category: "Academic" as const,
            completed: false,
            micro_steps: [
              { step_number: 1, actionable_instruction: "Open IDE and review final requirements checklist", duration_minutes: 15 },
              { step_number: 2, actionable_instruction: "Write the core routing class and error boundary", duration_minutes: 45 },
              { step_number: 3, actionable_instruction: "Test sample payloads and compile code", duration_minutes: 30 }
            ]
          },
          {
            task_name: "Prepare Slide Deck for Q3 Budget Proposal",
            deadline: "2026-06-30 09:30:00",
            estimated_duration_minutes: 120,
            priority: "Critical" as const,
            category: "Work" as const,
            completed: false
          },
          {
            task_name: "Pay Monthly Electric and Internet Bills",
            deadline: "2026-07-01 12:00:00",
            estimated_duration_minutes: 15,
            priority: "Medium" as const,
            category: "Financial" as const,
            completed: false
          }
        ];

        for (const t of initialTasks) {
          const docRef = doc(tasksColRef);
          const taskObj = { ...t, id: docRef.id };
          await setDoc(docRef, taskObj);
          loadedTasks.push(taskObj);
        }
      }

      setTasks(loadedTasks);
    } catch (err) {
      console.warn("Falling back silently to REST for task list loading", err);
      // Resilient local REST fallback
      const res = await appFetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchStats = async () => {
    if (!user) return;
    try {
      const canUseFirestore = auth && auth.currentUser && !(user as any).isMock;
      if (!canUseFirestore) {
        const res = await appFetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
        return;
      }
      const statsDocRef = doc(db, 'users', user.uid, 'stats', 'userStats');
      const snap = await getDoc(statsDocRef);
      if (snap.exists()) {
        setStats(snap.data() as UserStats);
      } else {
        const initialStats = {
          total_xp: 350,
          completed_tasks_count: 5,
          critical_tasks_resolved: 2,
          streak_days: 4
        };
        await setDoc(statsDocRef, initialStats);
        setStats(initialStats);
      }
    } catch (err) {
      console.warn("Falling back silently to REST for user stats loading", err);
      const res = await appFetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    }
  };

  const updateStatsInDb = async (newStats: Partial<UserStats>) => {
    const updated = { ...stats, ...newStats };
    setStats(updated);
    if (!user) return;
    try {
      const canUseFirestore = auth && auth.currentUser && !(user as any).isMock;
      if (!canUseFirestore) {
        await appFetch('/api/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
        return;
      }
      const statsDocRef = doc(db, 'users', user.uid, 'stats', 'userStats');
      await setDoc(statsDocRef, updated, { merge: true });
    } catch (err) {
      console.warn("Falling back silently to REST for stats write", err);
      await appFetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    }
  };

  // Turn chaotic input text to multiple tasks using server-side Chaos Parser
  const handleChaosParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chaosInput.trim()) return;

    setParsingChaos(true);
    try {
      // Use the master Orchestration Engine or specialized endpoint
      const res = await appFetch('/api/chaos-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: chaosInput,
          current_time: "2026-06-28 13:35:56" // Current metadata reference
        })
      });

      if (res.ok) {
        const result = await res.json();
        if (result && result.tasks && Array.isArray(result.tasks)) {
          const canUseFirestore = auth && auth.currentUser && !(user as any).isMock;
          if (user && canUseFirestore) {
            const tasksColRef = collection(db, 'users', user.uid, 'tasks');
            for (const parsedTask of result.tasks) {
              const docRef = doc(tasksColRef);
              await setDoc(docRef, {
                id: docRef.id,
                task_name: parsedTask.task_name,
                deadline: parsedTask.deadline || "2026-06-29 18:00:00",
                estimated_duration_minutes: parsedTask.estimated_duration_minutes || 60,
                priority: parsedTask.priority || "Medium",
                category: parsedTask.category || "Personal",
                completed: false
              });
            }
          } else {
            // Fallback for local REST fallback
            for (const parsedTask of result.tasks) {
              await appFetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  task_name: parsedTask.task_name,
                  deadline: parsedTask.deadline || "2026-06-29 18:00:00",
                  estimated_duration_minutes: parsedTask.estimated_duration_minutes || 60,
                  priority: parsedTask.priority || "Medium",
                  category: parsedTask.category || "Personal"
                })
              });
            }
          }
          await fetchTasks();
          setChaosInput('');
          showLocalNotification("Chaos Parsed Successfully! Added " + result.tasks.length + " action items.");
        }
      } else {
        showLocalNotification("Parsing Error: Make sure GEMINI_API_KEY is configured in Secrets.");
      }
    } catch (err) {
      console.error(err);
      showLocalNotification("Network error while communicating with Chaos Engine");
    } finally {
      setParsingChaos(false);
    }
  };

  // Add individual task manually
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;

    const deadlineValue = newTaskDeadline 
      ? newTaskDeadline.replace('T', ' ') + ":00" 
      : "2026-06-29 18:00:00";

    try {
      const canUseFirestore = auth && auth.currentUser && !(user as any).isMock;
      if (user && canUseFirestore) {
        const tasksColRef = collection(db, 'users', user.uid, 'tasks');
        const docRef = doc(tasksColRef);
        const newTask = {
          id: docRef.id,
          task_name: newTaskName,
          deadline: deadlineValue,
          estimated_duration_minutes: Number(newTaskDuration),
          priority: newTaskPriority,
          category: newTaskCategory,
          completed: false
        };
        await setDoc(docRef, newTask);
      } else {
        await appFetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task_name: newTaskName,
            deadline: deadlineValue,
            estimated_duration_minutes: Number(newTaskDuration),
            priority: newTaskPriority,
            category: newTaskCategory
          })
        });
      }

      await fetchTasks();
      setNewTaskName('');
      setNewTaskDeadline('');
      setNewTaskDuration(30);
      setShowAddForm(false);
      showLocalNotification("New task locked in.");
    } catch (err) {
      console.warn("Firestore write failed, falling back silently to REST API:", err);
      try {
        await appFetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task_name: newTaskName,
            deadline: deadlineValue,
            estimated_duration_minutes: Number(newTaskDuration),
            priority: newTaskPriority,
            category: newTaskCategory
          })
        });
        await fetchTasks();
        setNewTaskName('');
        setNewTaskDeadline('');
        setNewTaskDuration(30);
        setShowAddForm(false);
        showLocalNotification("New task locked in.");
      } catch (restErr) {
        console.error("REST fallback failed:", restErr);
      }
    }
  };

  // Delete task
  const handleDeleteTask = async (id: string) => {
    try {
      const canUseFirestore = auth && auth.currentUser && !(user as any).isMock;
      if (user && canUseFirestore) {
        await deleteDoc(doc(db, 'users', user.uid, 'tasks', id));
        setTasks(prev => prev.filter(t => t.id !== id));
        showLocalNotification("Task discarded.");
      } else {
        const res = await appFetch(`/api/tasks/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setTasks(prev => prev.filter(t => t.id !== id));
          showLocalNotification("Task discarded.");
        }
      }
    } catch (err) {
      console.warn("Firestore delete failed, falling back silently to REST API:", err);
      try {
        const res = await appFetch(`/api/tasks/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setTasks(prev => prev.filter(t => t.id !== id));
          showLocalNotification("Task discarded.");
        }
      } catch (restErr) {
        console.error("REST fallback delete failed:", restErr);
      }
    }
  };

  // Checkbox completion handler
  const handleToggleComplete = async (task: Task) => {
    const updatedStatus = !task.completed;
    
    // If completing a critical task, require verification screenshot or grant custom immediate points
    if (updatedStatus && task.priority === 'Critical') {
      // Prompt user to upload proof for critical tasks, or complete anyway with warning
      setVerifyTargetTask(task);
      setShowVerifyModal(true);
      return;
    }

    try {
      const canUseFirestore = auth && auth.currentUser && !(user as any).isMock;
      if (user && canUseFirestore) {
        await updateDoc(doc(db, 'users', user.uid, 'tasks', task.id), { completed: updatedStatus });
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: updatedStatus } : t));
      } else {
        const res = await appFetch(`/api/tasks/${task.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: updatedStatus })
        });

        if (res.ok) {
          setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: updatedStatus } : t));
        }
      }

      if (updatedStatus) {
        const xpGained = task.priority === 'Medium' ? 25 : 10;
        const newStats = {
          total_xp: stats.total_xp + xpGained,
          completed_tasks_count: stats.completed_tasks_count + 1
        };
        updateStatsInDb(newStats);
        showLocalNotification(`Task accomplished! Gained +${xpGained} XP.`);
      }
    } catch (err) {
      console.warn("Firestore update failed, falling back silently to REST API:", err);
      try {
        const res = await appFetch(`/api/tasks/${task.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: updatedStatus })
        });

        if (res.ok) {
          setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: updatedStatus } : t));
        }

        if (updatedStatus) {
          const xpGained = task.priority === 'Medium' ? 25 : 10;
          const newStats = {
            total_xp: stats.total_xp + xpGained,
            completed_tasks_count: stats.completed_tasks_count + 1
          };
          updateStatsInDb(newStats);
          showLocalNotification(`Task accomplished! Gained +${xpGained} XP.`);
        }
      } catch (restErr) {
        console.error("REST fallback update failed:", restErr);
      }
    }
  };

  // Trigger Psychological Coach to break a task down into micro-steps
  const handleGenerateMicroSteps = async (task: Task) => {
    if (task.micro_steps && task.micro_steps.length > 0) return; // already exists

    setGeneratingStepsId(task.id);
    try {
      const res = await appFetch('/api/micro-steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_name: task.task_name })
      });

      if (res.ok) {
        const result = await res.json();
        if (result && result.micro_steps) {
          const canUseFirestore = auth && auth.currentUser && !(user as any).isMock;
          if (user && canUseFirestore) {
            try {
              await updateDoc(doc(db, 'users', user.uid, 'tasks', task.id), { micro_steps: result.micro_steps });
              setTasks(prev => prev.map(t => t.id === task.id ? { ...t, micro_steps: result.micro_steps } : t));
              showLocalNotification("Crisis coach formulated micro-steps!");
            } catch (fsErr) {
              console.warn("Firestore micro-steps save failed, falling back silently to REST:", fsErr);
              const dbRes = await appFetch(`/api/tasks/${task.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ micro_steps: result.micro_steps })
              });
              if (dbRes.ok) {
                setTasks(prev => prev.map(t => t.id === task.id ? { ...t, micro_steps: result.micro_steps } : t));
                showLocalNotification("Crisis coach formulated micro-steps!");
              }
            }
          } else {
            // Update task in database
            const dbRes = await appFetch(`/api/tasks/${task.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ micro_steps: result.micro_steps })
            });
            if (dbRes.ok) {
              setTasks(prev => prev.map(t => t.id === task.id ? { ...t, micro_steps: result.micro_steps } : t));
              showLocalNotification("Crisis coach formulated micro-steps!");
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      showLocalNotification("Coach is temporarily busy. Try again.");
    } finally {
      setGeneratingStepsId(null);
    }
  };

  // Trigger Reality Check simulation for skip target
  const handleRunRealityCheck = async (task: Task) => {
    setRcTargetTask(task);
    setShowRealityCheckModal(true);
    setRcLoading(true);
    setRcResult(null);

    try {
      const res = await appFetch('/api/reality-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_to_skip: task.task_name,
          current_tasks: tasks.map(t => ({ task_name: t.task_name, deadline: t.deadline, priority: t.priority }))
        })
      });

      if (res.ok) {
        const result = await res.json();
        setRcResult(result);
        
        // Also save this simulation to the task details for future viewing
        const canUseFirestore = auth && auth.currentUser && !(user as any).isMock;
        if (user && canUseFirestore) {
          try {
            await updateDoc(doc(db, 'users', user.uid, 'tasks', task.id), { reality_check: result });
          } catch (fsErr) {
            console.warn("Firestore reality check save failed, falling back silently to REST:", fsErr);
            await appFetch(`/api/tasks/${task.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reality_check: result })
            });
          }
        } else {
          await appFetch(`/api/tasks/${task.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reality_check: result })
          });
        }

        // Update local tasks
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, reality_check: result } : t));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRcLoading(false);
    }
  };

  // Trigger Tactical Crisis Commander (Panic Mode)
  const triggerPanicMode = async () => {
    setShowCrisisModal(true);
    setCrisisLoading(true);
    setCrisisPlan(null);

    try {
      const res = await appFetch('/api/tactical-crisis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_time: "2026-06-28 13:35:56",
          all_tasks: tasks
        })
      });

      if (res.ok) {
        const result = await res.json();
        setCrisisPlan(result);
        playChime();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCrisisLoading(false);
    }
  };

  // Verify visual proof via Accountability Inspector
  const handleVerifyImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setVerifyImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const submitVerification = async () => {
    if (!verifyTargetTask || !verifyImageBase64) return;

    setVerifying(true);
    setVerificationFeedback(null);

    try {
      const res = await appFetch('/api/verify-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_description: verifyTargetTask.task_name,
          image_base64: verifyImageBase64
        })
      });

      if (res.ok) {
        const result = await res.json();
        setVerificationFeedback(result);

        if (result.verified) {
          // Complete task in DB and award XP
          const canUseFirestore = auth && auth.currentUser && !(user as any).isMock;
          if (user && canUseFirestore) {
            try {
              await updateDoc(doc(db, 'users', user.uid, 'tasks', verifyTargetTask.id), {
                completed: true,
                verification_image: verifyImageBase64,
                xp_awarded: result.xp_awarded
              });
            } catch (fsErr) {
              console.warn("Firestore verify save failed, falling back silently to REST:", fsErr);
              await appFetch(`/api/tasks/${verifyTargetTask.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  completed: true,
                  verification_image: verifyImageBase64,
                  xp_awarded: result.xp_awarded
                })
              });
            }
          } else {
            await appFetch(`/api/tasks/${verifyTargetTask.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                completed: true,
                verification_image: verifyImageBase64,
                xp_awarded: result.xp_awarded
              })
            });
          }

          // Refresh task lists
          setTasks(prev => prev.map(t => t.id === verifyTargetTask.id ? { 
            ...t, 
            completed: true, 
            verification_image: verifyImageBase64,
            xp_awarded: result.xp_awarded
          } : t));

          // Award stats
          const newStats = {
            total_xp: stats.total_xp + result.xp_awarded,
            completed_tasks_count: stats.completed_tasks_count + 1,
            critical_tasks_resolved: verifyTargetTask.priority === 'Critical' 
              ? stats.critical_tasks_resolved + 1 
              : stats.critical_tasks_resolved
          };
          updateStatsInDb(newStats);
        }
      } else {
        showLocalNotification("Failed to analyze image proof. Ensure API key is set.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  // Generate Behavioral Nudge for a task
  const handleGenerateNudge = async (task: Task) => {
    setNudgeTask(task);
    setLoadingNudge(true);
    setNudgeMessage('');

    // Calculate dynamic time remaining text
    const hrs = Math.ceil(task.estimated_duration_minutes / 60) + " hours";

    try {
      const res = await appFetch('/api/behavioral-nudge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_name: task.task_name,
          time_remaining: hrs,
          tier: nudgeTier
        })
      });

      if (res.ok) {
        const text = await res.text();
        setNudgeMessage(text);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNudge(false);
    }
  };

  // Simple toast alert helper
  const showLocalNotification = (msg: string) => {
    setActiveNotification(msg);
    setTimeout(() => setActiveNotification(null), 4500);
  };

  const playChime = () => {
    setChimePlaying(true);
    setTimeout(() => setChimePlaying(false), 3000);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Academic': return <BookOpen className="w-3.5 h-3.5 text-blue-400" />;
      case 'Work': return <Briefcase className="w-3.5 h-3.5 text-orange-400" />;
      case 'Financial': return <DollarSign className="w-3.5 h-3.5 text-green-400" />;
      case 'Social': return <Users className="w-3.5 h-3.5 text-purple-400" />;
      default: return <User className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        theme === 'dark' ? 'bg-[#0b0f19] text-slate-100' : 'bg-slate-50 text-slate-800'
      } font-sans`}>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold tracking-wider font-mono text-cyan-400 uppercase">Synchronizing Sanctuary Config...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Auth 
        onAuthSuccess={(firebaseUser, name) => {
          setUser(firebaseUser);
          setIsEntering(true);
        }} 
        theme={theme} 
        setTheme={setTheme}
      />
    );
  }

  if (isEntering) {
    const displayName = user.displayName || (user.email ? user.email.split('@')[0] : 'Evaluator Guest');
    return (
      <EntryAnimation 
        userName={displayName} 
        theme={theme} 
        onComplete={() => setIsEntering(false)} 
      />
    );
  }

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col selection:bg-red-500/30 font-sans transition-colors duration-300 ${
      isDark ? 'bg-[#0b0f19] text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* Top Calming Header Bar */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-4 py-3.5 shadow-lg transition-colors duration-300 ${
        isDark 
          ? 'bg-[#0c1625]/90 border-teal-500/10' 
          : 'bg-white/95 border-slate-200 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            {/* Custom ResQTime Logo */}
            <div className="relative group shrink-0">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-xl blur-sm opacity-60 group-hover:opacity-100 transition duration-1000"></div>
              <div className="relative bg-slate-900 p-2 rounded-xl text-cyan-300 border border-teal-500/20 shadow-md">
                <Logo size={28} showText={false} theme={theme} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-xl font-bold tracking-tight font-display bg-gradient-to-r ${
                  isDark ? 'from-cyan-300 via-cyan-200 to-indigo-200' : 'from-indigo-600 via-blue-500 to-cyan-500'
                } bg-clip-text text-transparent`}>
                  ResQTime
                </h1>
                <span className={`border text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono ${
                  isDark ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20' : 'bg-indigo-50 text-indigo-600 border-indigo-200'
                }`}>
                  Calm Focus Sanctuary
                </span>
              </div>
              <p className={`text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                Mindful Study Companion & Gentle Support Partner
              </p>
            </div>
          </div>

          {/* Right Area: Stats, Theme toggle & Log out */}
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            {/* User Gamified Stats */}
            <div className={`flex items-center gap-2 border p-1.5 rounded-xl text-xs transition-colors duration-300 ${
              isDark ? 'bg-slate-900/80 border-cyan-500/15' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
            }`}>
              <div className="flex items-center gap-1.5 px-2 border-r border-teal-500/10">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-soothe-pulse" />
                <div>
                  <div className="text-[8px] text-slate-400 font-semibold tracking-wider uppercase">RANK</div>
                  <span className={`font-bold font-display ${isDark ? 'text-amber-300' : 'text-indigo-600'}`}>Level {Math.floor(stats.total_xp / 100) + 1}</span>
                </div>
              </div>
            
              <div className="flex items-center gap-1.5 px-2 border-r border-teal-500/10">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <div>
                  <div className="text-[8px] text-slate-400 font-semibold tracking-wider uppercase">STREAK</div>
                  <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{stats.streak_days} Days</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2 border-r border-teal-500/10">
                <Brain className="w-3.5 h-3.5 text-indigo-400" />
                <div>
                  <div className="text-[8px] text-slate-400 font-semibold tracking-wider uppercase">XP</div>
                  <span className={`font-bold font-mono ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>{stats.total_xp}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <div>
                  <div className="text-[8px] text-slate-400 font-semibold tracking-wider uppercase">RESOLVED</div>
                  <span className={`font-bold ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>{stats.critical_tasks_resolved} Done</span>
                </div>
              </div>
            </div>

            {/* Theme Toggle Button */}
            <button
              id="btn-toggle-theme"
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              className={`p-2.5 rounded-xl border transition-all duration-300 cursor-pointer ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 hover:border-cyan-400/40 text-cyan-400' 
                  : 'bg-white border-slate-200 hover:border-indigo-500 text-indigo-600 shadow-sm'
              }`}
              title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Logout Button */}
            <button
              id="btn-sign-out"
              onClick={handleLogout}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer ${
                isDark 
                  ? 'bg-rose-950/20 border-rose-500/20 text-rose-300 hover:bg-rose-950/40' 
                  : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
              }`}
              title="Sign Out of Sanctuary"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>

          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Toast notifications */}
        {activeNotification && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#0f172a] border border-red-500/30 text-slate-200 px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-up max-w-sm">
            <Sparkle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-xs font-medium">{activeNotification}</span>
          </div>
        )}

        {/* LEFT COLUMN: Input Chaos Parser & Emergency Controls */}
        <section className="lg:col-span-5 space-y-6">
          
          {/* Chaos Parser Section */}
          <div id="chaos-parser-panel" className={`rounded-xl border p-5 transition-all duration-300 ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                <Brain className="w-5 h-5 text-indigo-500" />
                Chaos Brain Dump
              </h2>
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono border ${
                isDark ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' : 'bg-indigo-50 text-indigo-600 border-indigo-200'
              }`}>
                AI Engine Active
              </span>
            </div>

            <p className={`text-xs mb-4 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Don't worry about structuring, dates, or grammar. Stream of consciousness transcript or messy notes — paste it here, we will extract tasks and calculate precise deadlines.
            </p>

            <form onSubmit={handleChaosParse} className="space-y-3">
              <textarea
                value={chaosInput}
                onChange={(e) => setChaosInput(e.target.value)}
                placeholder="Example: I'm completely panicking, I have a Java software project due CS201 class tomorrow evening but my head hurts and I also need to pay electric bill tonight before 11 PM or it gets cut off. Also I have a dentist appointment this Tuesday afternoon..."
                className={`w-full h-32 border rounded-lg p-3 text-xs placeholder:text-slate-400/70 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition font-sans leading-relaxed ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setChaosInput("I have a final essay to write for history class tomorrow morning at 9am, I haven't even started writing, plus I need to file my Q3 budget spreadsheet by Tuesday night. I am totally overwhelmed.")}
                  className={`text-[10px] underline transition cursor-pointer ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Insert Sample Chaos
                </button>
                <button
                  id="btn-parse-chaos"
                  type="submit"
                  disabled={parsingChaos || !chaosInput.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs px-4 py-2 rounded-lg transition duration-150 flex items-center gap-1.5 shadow cursor-pointer"
                >
                  {parsingChaos ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                      Parsing Streams...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Extract & Schedule Tasks
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Calm Sanctuary Controls */}
          <div id="tactical-emergency-panel" className={`rounded-2xl p-6 relative overflow-hidden border transition-all duration-300 ${
            isDark 
              ? 'bg-slate-900/60 border-teal-500/10' 
              : 'bg-white border-teal-500/20 shadow-sm'
          }`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl -z-10 pointer-events-none" />
            
            <div className="flex items-start gap-3">
              <div className="bg-teal-500/10 p-2.5 rounded-xl text-teal-600 shrink-0">
                <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '40s' }} />
              </div>
              <div>
                <h2 className={`text-base font-bold font-display ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>THE CALM TIME OASIS</h2>
                <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Feeling overwhelmed? Let's take a slow breath together. Press below to instantly map out a stress-free, step-by-step path to finish what matters.
                </p>
              </div>
            </div>

            <div className={`mt-4 p-3.5 rounded-xl text-xs leading-relaxed font-sans border ${
              isDark ? 'bg-teal-950/20 border-teal-500/15 text-teal-200/95' : 'bg-teal-50/50 border-teal-200/40 text-teal-800'
            }`}>
              <strong className={isDark ? 'text-teal-300 font-bold' : 'text-teal-700 font-bold'}>MIND PRINCIPLE:</strong> We will prioritize your highest-value tasks first, and defer any non-critical chores to give your mind immediate peace and space.
            </div>

            <button
              id="btn-panic-mode"
              onClick={triggerPanicMode}
              className="w-full mt-4 py-3 bg-gradient-to-r from-teal-500 to-indigo-600 hover:opacity-95 text-white rounded-xl font-bold tracking-wider text-xs uppercase transition duration-200 shadow-lg flex items-center justify-center gap-2 animate-soothe-pulse cursor-pointer"
            >
              <Wind className="w-4 h-4 text-teal-100" />
              ACTIVATE TIME OASIS
            </button>
          </div>

          {/* Mindful Reminder Simulator */}
          <div id="behavioral-nudge-panel" className={`rounded-2xl border p-5 transition-all duration-300 ${
            isDark ? 'bg-[#121f35]/50 border-teal-500/10 shadow-sm' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <h2 className={`text-sm font-bold flex items-center gap-2 mb-3 font-display ${isDark ? 'text-white' : 'text-slate-800'}`}>
              <Compass className="w-4 h-4 text-teal-500" />
              Gentle Support Reminders
            </h2>
            <p className={`text-xs mb-4 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
              Feeling stuck or needing a supportive boost? Choose a reminder tone that fits your current energy level and let our coach offer gentle guidance.
            </p>

            <div className="space-y-3">
              <div>
                <label className={`block text-[11px] font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Target Task for Reminder</label>
                <select
                  id="select-nudge-task"
                  onChange={(e) => {
                    const selected = tasks.find(t => t.id === e.target.value);
                    if (selected) setNudgeTask(selected);
                  }}
                  className={`w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none ${
                    isDark ? 'bg-slate-950 border-teal-500/10 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="">-- Choose an Active Assignment --</option>
                  {tasks.map(t => (
                    <option key={t.id} value={t.id}>{t.task_name} ({t.priority === 'Critical' ? 'Immediate' : t.priority === 'Medium' ? 'Balanced' : 'Flexible'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-[11px] font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Select Reminder Tone</label>
                <div className={`grid grid-cols-3 gap-1.5 p-1 rounded-xl border ${
                  isDark ? 'bg-slate-950 border-teal-500/10' : 'bg-slate-50 border-slate-200'
                }`}>
                  {(['Supportive', 'Firm Warning', 'Panic Attack'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNudgeTier(t)}
                      className={`py-1 text-[10px] font-semibold rounded-lg transition cursor-pointer ${
                        nudgeTier === t 
                          ? 'bg-teal-600 text-white shadow' 
                          : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {t === 'Supportive' ? 'Whisper 🍵' : t === 'Firm Warning' ? 'Coach ⚡' : 'ResQ Push 🔔'}
                    </button>
                  ))}
                </div>
              </div>

              <button
                id="btn-generate-nudge"
                onClick={() => nudgeTask && handleGenerateNudge(nudgeTask)}
                disabled={!nudgeTask || loadingNudge}
                className="w-full py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
              >
                {loadingNudge ? "Formulating Reminder..." : "Generate Supportive Reminder"}
              </button>

              {nudgeMessage && (
                <div className={`border p-3.5 rounded-xl mt-3 text-xs italic font-sans relative leading-relaxed ${
                  isDark ? 'bg-slate-950 border-teal-500/10 text-teal-300' : 'bg-teal-50 border-teal-200/40 text-teal-800'
                }`}>
                  <div className={`absolute -top-1.5 left-3 border text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest font-mono ${
                    isDark ? 'bg-[#121f35] border-teal-500/20 text-teal-300' : 'bg-white border-teal-200 text-teal-700'
                  }`}>
                    COACH'S REMINDER PREVIEW
                  </div>
                  "{nudgeMessage}"
                </div>
              )}
            </div>
          </div>

        </section>

        {/* RIGHT COLUMN: Active Emergency Task List & Micro-Steps */}
        <section className="lg:col-span-7 space-y-6">

          {/* Task Board Header & Creator */}
          <div className={`flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4 ${
            isDark ? 'border-teal-500/10' : 'border-slate-200'
          }`}>
            <div>
              <h2 className={`text-xl font-bold flex items-center gap-2 font-display ${isDark ? 'text-white' : 'text-slate-800'}`}>
                <Layers className="w-5 h-5 text-teal-400" />
                Your Focus Flow
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Explore your active study goals, generate step-by-step guidance, or simulate stress-free compromises.
              </p>
            </div>
            
            <button
              id="btn-show-add-form"
              onClick={() => setShowAddForm(!showAddForm)}
              className={`text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow-sm border ${
                isDark 
                  ? 'bg-[#121f35]/50 hover:bg-[#15223c] border-teal-500/25 text-teal-300' 
                  : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              Add Custom Assignment
            </button>
          </div>

          {/* Optional Add Task Form */}
          {showAddForm && (
            <form onSubmit={handleAddTask} className={`border rounded-2xl p-5 space-y-4 animate-fade-in shadow-lg ${
              isDark ? 'bg-[#121f35]/80 border-teal-500/10' : 'bg-white border-slate-200 shadow-md'
            }`}>
              <h3 className={`text-xs font-bold uppercase tracking-widest font-mono ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>Create A Calming Focus Goal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="md:col-span-2">
                  <label className={`block text-[10px] font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Task Details</label>
                  <input
                    type="text"
                    required
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    placeholder="e.g., Read Chapter 4 and complete java programming lab"
                    className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 transition font-sans ${
                      isDark 
                        ? 'bg-[#09111e] border-teal-500/10 text-white placeholder:text-slate-600 focus:ring-teal-500/30' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-teal-500/20'
                    }`}
                  />
                </div>
                
                <div>
                  <label className={`block text-[10px] font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Target Deadline</label>
                  <input
                    type="datetime-local"
                    value={newTaskDeadline}
                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 transition ${
                      isDark 
                        ? 'bg-[#09111e] border-teal-500/10 text-white focus:ring-teal-500/30' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-teal-500/20'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-[10px] font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Category</label>
                  <select
                    value={newTaskCategory}
                    onChange={(e: any) => setNewTaskCategory(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 transition ${
                      isDark 
                        ? 'bg-[#09111e] border-teal-500/10 text-white focus:ring-teal-500/30' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-teal-500/20'
                    }`}
                  >
                    <option value="Academic">Academic</option>
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                    <option value="Financial">Financial</option>
                    <option value="Social">Social</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-[10px] font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Priority Style</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e: any) => setNewTaskPriority(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 transition ${
                      isDark 
                        ? 'bg-[#09111e] border-teal-500/10 text-white focus:ring-teal-500/30' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-teal-500/20'
                    }`}
                  >
                    <option value="Critical">Immediate Focus (Due &lt; 24h / Soothing rescue)</option>
                    <option value="Medium">Balanced Flow (Due 2-4 days)</option>
                    <option value="Low">Flexible/Routine (Self-paced)</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-[10px] font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Estimated Duration (minutes)</label>
                  <input
                    type="number"
                    value={newTaskDuration}
                    onChange={(e) => setNewTaskDuration(Number(e.target.value))}
                    className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 transition ${
                      isDark 
                        ? 'bg-[#09111e] border-teal-500/10 text-white focus:ring-teal-500/30' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-teal-500/20'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-teal-500/5">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className={`px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                    isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-5 py-2 rounded-xl transition cursor-pointer shadow"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          )}

          {/* Active List Rendering */}
          <div className="space-y-4">
            {loadingTasks ? (
              <div className="text-center py-12 text-xs text-slate-400">
                <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Creating your customized sanctuary lineup...
              </div>
            ) : tasks.length === 0 ? (
              <div className={`text-center py-12 border border-dashed rounded-2xl p-6 ${
                isDark 
                  ? 'bg-[#121f35]/20 border-teal-500/10 text-slate-400' 
                  : 'bg-white border-slate-300 text-slate-500 shadow-sm'
              }`}>
                <Brain className="w-10 h-10 mx-auto opacity-20 text-teal-400 mb-2" />
                <p className={`text-sm font-semibold font-display ${isDark ? 'text-white' : 'text-slate-800'}`}>Your sanctuary is peaceful and clear!</p>
                <p className="text-xs max-w-xs mx-auto mt-1 leading-relaxed">
                  Have messy thoughts or tasks? Dump them in the <strong>Chaos Brain Dump</strong> on the left, and let our engine gently guide your path.
                </p>
              </div>
            ) : (
              tasks.map((task) => {
                const isCritical = task.priority === 'Critical';
                const hasMicroSteps = task.micro_steps && task.micro_steps.length > 0;

                return (
                  <div
                    key={task.id}
                    className={`rounded-2xl p-5 border transition ${
                      isDark 
                        ? isCritical 
                          ? 'bg-[#121f35]/40 hover:bg-[#121f35]/60 border-amber-500/15 shadow-sm' 
                          : 'bg-[#121f35]/40 hover:bg-[#121f35]/60 border-teal-500/5'
                        : isCritical
                          ? 'bg-white hover:bg-slate-50 border-amber-200 shadow-sm'
                          : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
                    }`}
                  >
                    {/* Header Row of Single Task */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <button
                          id={`btn-toggle-complete-${task.id}`}
                          onClick={() => handleToggleComplete(task)}
                          className={`w-5 h-5 rounded-md border mt-0.5 flex items-center justify-center transition shrink-0 cursor-pointer ${
                            task.completed
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                              : isCritical
                              ? 'border-amber-500/30 hover:border-amber-400 bg-amber-500/5'
                              : isDark
                              ? 'border-teal-500/15 hover:border-teal-500/30 bg-[#09111e]'
                              : 'border-slate-300 hover:border-slate-400 bg-slate-100'
                          }`}
                        >
                          {task.completed && <CheckCircle className="w-4 h-4 fill-emerald-500/10" />}
                        </button>
                        
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                              {getCategoryIcon(task.category)}
                              {task.category}
                            </span>
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full font-mono ${
                              isDark
                                ? isCritical 
                                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' 
                                  : task.priority === 'Medium' 
                                  ? 'bg-indigo-500/10 text-indigo-300' 
                                  : 'bg-teal-500/10 text-teal-300'
                                : isCritical
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : task.priority === 'Medium'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : 'bg-teal-100 text-teal-850'
                            }`}>
                              {isCritical ? 'Immediate Focus' : task.priority === 'Medium' ? 'Balanced' : 'Flexible'}
                            </span>
                            {task.completed && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                                isDark ? 'bg-emerald-500/25 text-emerald-300' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                Accomplished {task.xp_awarded ? `(+${task.xp_awarded} XP)` : ''}
                              </span>
                            )}
                          </div>

                          <h3 className={`text-sm font-semibold mt-1.5 leading-relaxed font-display ${task.completed ? 'line-through text-slate-500' : isDark ? 'text-white' : 'text-slate-800'}`}>
                            {task.task_name}
                          </h3>

                          {/* Time Proximity Details */}
                          <div className={`flex flex-wrap items-center gap-4 mt-2.5 text-xs font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              Target Completion: <strong className={isDark ? 'text-teal-300' : 'text-teal-700 font-bold'}>{task.deadline}</strong>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              Duration: <strong className={isDark ? 'text-teal-300' : 'text-teal-700 font-bold'}>{task.estimated_duration_minutes} min</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Action buttons */}
                      <button
                        id={`btn-delete-task-${task.id}`}
                        onClick={() => handleDeleteTask(task.id)}
                        className={`text-slate-500 hover:text-rose-400 p-1.5 rounded-lg transition cursor-pointer ${
                          isDark ? 'hover:bg-[#0a111e]/60' : 'hover:bg-slate-100'
                        }`}
                        title="Delete Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Reality Check Compromise Display (if skip simulated before) */}
                    {task.reality_check && (
                      <div className={`mt-3 border p-3.5 rounded-xl text-xs leading-relaxed ${
                        isDark 
                          ? 'bg-[#0a1824]/80 border-teal-500/15 text-slate-300' 
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}>
                        <span className={`font-bold block mb-1 ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>MIND COMPROMISE: Harm Reduction Plan</span>
                        <p className={isDark ? 'text-slate-350 italic' : 'text-slate-600 italic'}>" {task.reality_check.harm_reduction_compromise} "</p>
                      </div>
                    )}

                    {/* Micro-Steps Section for this task */}
                    <div className="mt-4 pt-4 border-t border-teal-500/5">
                      {hasMicroSteps ? (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-[11px] font-bold flex items-center gap-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              <Brain className="w-3.5 h-3.5 text-teal-400" />
                              Focus Roadmap (Shatter Procrastination)
                            </span>
                            <span className={`text-[10px] font-mono ${isDark ? 'text-teal-300' : 'text-teal-700 font-semibold'}`}>
                              Total: {task.micro_steps?.reduce((acc, step) => acc + step.duration_minutes, 0)}m
                            </span>
                          </div>

                          <div className={`space-y-1.5 p-3.5 rounded-xl border ${
                            isDark ? 'bg-[#09111e]/90 border-teal-500/10' : 'bg-slate-50 border-slate-200'
                          }`}>
                            {task.micro_steps?.map((step) => (
                              <div key={step.step_number} className="flex items-start justify-between gap-2 text-xs">
                                <div className="flex items-start gap-2">
                                  <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center font-mono text-[9px] shrink-0 mt-0.5 border ${
                                    isDark 
                                      ? 'bg-[#152238] text-teal-300 border-teal-500/10' 
                                      : 'bg-teal-50 text-teal-800 border-teal-200'
                                  }`}>
                                    {step.step_number}
                                  </span>
                                  <span className={isDark ? 'text-slate-300 leading-relaxed' : 'text-slate-700 leading-relaxed'}>{step.actionable_instruction}</span>
                                </div>
                                <span className={`font-mono text-[10px] shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                  {step.duration_minutes}m
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl border ${
                          isDark ? 'bg-[#09111e]/40 border-teal-500/10' : 'bg-slate-50 border-slate-200 shadow-2xs'
                        }`}>
                          <div>
                            <span className={`text-xs block font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>Unsure where to start?</span>
                            <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Break this task into easy, effortless micro-steps.</span>
                          </div>
                          
                          <button
                            id={`btn-micro-steps-${task.id}`}
                            onClick={() => handleGenerateMicroSteps(task)}
                            disabled={generatingStepsId === task.id || task.completed}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer border ${
                              isDark 
                                ? 'bg-teal-600/10 hover:bg-teal-600/20 text-teal-300 border-teal-500/20' 
                                : 'bg-teal-55 hover:bg-teal-100 text-teal-800 border-teal-200 shadow-2xs'
                            }`}
                          >
                            {generatingStepsId === task.id ? (
                              <span className="w-3.5 h-3.5 border-2 border-teal-300 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5" />
                            )}
                            Guide Me
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Menu for Active Tasks */}
                    {!task.completed && (
                      <div className="mt-4 flex flex-wrap gap-2 justify-end pt-3 border-t border-teal-500/5">
                        <button
                          id={`btn-verify-proof-${task.id}`}
                          onClick={() => {
                            setVerifyTargetTask(task);
                            setVerifyImageBase64(null);
                            setVerificationFeedback(null);
                            setShowVerifyModal(true);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer border ${
                            isDark 
                              ? 'bg-[#0c1625] hover:bg-[#121f35] text-slate-300 border-teal-500/10' 
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
                          }`}
                        >
                          <Image className="w-3.5 h-3.5 text-teal-400" />
                          Verify Accomplishment
                        </button>

                        <button
                          id={`btn-skip-sim-${task.id}`}
                          onClick={() => handleRunRealityCheck(task)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer border ${
                            isDark 
                              ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/25' 
                              : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                          }`}
                        >
                          <Compass className="w-3.5 h-3.5" />
                          Explore Alternatives
                        </button>
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>

          {/* Emergency support links & crisis templates */}
          <EmergencyServices isDark={isDark} />

        </section>

      </main>

      {/* FOOTER */}
      <footer className={`border-t py-6 px-4 mt-12 text-center text-xs text-slate-400 ${
        isDark ? 'bg-[#09111e] border-teal-500/10' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 font-sans">
          <p>© 2026 ResQTime. Mindfully designed to help students stay cool and focused.</p>
          <div className="flex gap-4">
            <span className="text-teal-400 font-bold text-[10px]">🌿 SANCTUARY ACTIVE: STRESS REDUCED</span>
            <span className="text-slate-400">Secure Study Environment</span>
          </div>
        </div>
      </footer>

      {/* MODAL 1: REALITY CHECK SIMULATION */}
      {showRealityCheckModal && (
        <div className="fixed inset-0 z-50 bg-[#06080f]/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className={`border rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-scale-up ${
            isDark ? 'bg-[#0f172a] border-teal-500/20' : 'bg-white border-slate-200 shadow-xl'
          }`}>
            
            <div className={`p-4.5 flex justify-between items-center border-b ${
              isDark ? 'bg-[#121f35]/50 border-teal-500/10' : 'bg-slate-50 border-slate-200'
            }`}>
              <h3 className={`font-bold flex items-center gap-2 font-display ${isDark ? 'text-teal-300' : 'text-teal-800'}`}>
                <Compass className="w-5 h-5 text-teal-400 animate-spin" style={{ animationDuration: '25s' }} />
                Mindful Alternative Explorer
              </h3>
              <button 
                onClick={() => setShowRealityCheckModal(false)}
                className={`transition cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className={`p-3.5 rounded-xl border text-xs ${
                isDark ? 'bg-[#09111e] border-teal-500/10' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className={`text-[10px] block uppercase font-mono font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>PROPOSED DEFERRAL</span>
                <span className={`text-sm font-semibold font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>{rcTargetTask?.task_name}</span>
              </div>

              {rcLoading ? (
                <div className={`text-center py-8 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  Gently weighing impact and formulating supportive advice...
                </div>
              ) : rcResult ? (
                <div className="space-y-4 text-xs">
                  <div>
                    <span className={`font-bold block mb-1 font-sans ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>IMMEDIATE REALITY IMPACT:</span>
                    <p className={`p-3.5 rounded-xl border leading-relaxed ${
                      isDark ? 'text-slate-300 bg-amber-500/5 border-amber-500/10' : 'text-slate-800 bg-amber-50/60 border-amber-200'
                    }`}>{rcResult.immediate_consequence}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className={`p-3.5 rounded-xl border ${
                      isDark ? 'bg-[#09111e] border-teal-500/10' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <span className={`font-bold block mb-1 font-sans ${isDark ? 'text-teal-300' : 'text-teal-850'}`}>GAINED MENTAL FREEDOM:</span>
                      <p className={isDark ? 'text-slate-300 leading-relaxed' : 'text-slate-700 leading-relaxed'}>{rcResult.downstream_benefit}</p>
                    </div>

                    <div className={`p-3.5 rounded-xl border ${
                      isDark ? 'bg-[#09111e] border-teal-500/10' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <span className={`font-bold block mb-1 font-sans ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>STRESS INTENSITY PROFILE:</span>
                      <span className={`inline-block font-bold mt-1 px-3 py-1 rounded-full text-[10px] font-mono ${
                        isDark
                          ? rcResult.schedule_stress_impact === 'Critical' 
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' 
                            : rcResult.schedule_stress_impact === 'Manageable'
                            ? 'bg-teal-500/10 text-teal-300'
                            : 'bg-emerald-500/10 text-emerald-300'
                          : rcResult.schedule_stress_impact === 'Critical' 
                            ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                            : rcResult.schedule_stress_impact === 'Manageable'
                            ? 'bg-teal-100 text-teal-800 border border-teal-200'
                            : 'bg-emerald-100 text-emerald-850 border border-emerald-200'
                      }`}>
                        {rcResult.schedule_stress_impact === 'Critical' ? 'Immediate Focus Required' : rcResult.schedule_stress_impact}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className={`font-bold block mb-1 font-sans ${isDark ? 'text-teal-300' : 'text-teal-850'}`}>COACH REFLECTION:</span>
                    <p className={`p-3.5 rounded-xl border leading-relaxed italic ${
                      isDark ? 'text-slate-300 bg-teal-950/10 border-teal-500/5' : 'text-slate-700 bg-teal-50 border-teal-100'
                    }`}>"{rcResult.conversational_reality_check}"</p>
                  </div>

                  <div className={`p-4 rounded-xl shadow-inner border ${
                    isDark ? 'bg-[#121f35] border-teal-500/15' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={`font-bold block mb-1.5 flex items-center gap-1.5 font-display text-sm ${
                      isDark ? 'text-teal-300' : 'text-teal-800'
                    }`}>
                      <CheckCircle className="w-4 h-4 text-teal-400" />
                      COZY HARM REDUCTION AGREEMENT:
                    </span>
                    <p className={`leading-relaxed font-medium ${isDark ? 'text-slate-200' : 'text-slate-750'}`}>
                      {rcResult.harm_reduction_compromise}
                    </p>
                  </div>
                </div>
              ) : null}

            </div>

            <div className={`p-4 border-t flex justify-end ${
              isDark ? 'bg-[#09111e] border-teal-500/10' : 'bg-slate-50 border-slate-200'
            }`}>
              <button
                onClick={() => setShowRealityCheckModal(false)}
                className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer shadow-md"
              >
                Understood, Return to Lineup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: PANIC MODE / TACTICAL CRISIS SURVIVAL TIMELINE */}
      {showCrisisModal && (
        <div className="fixed inset-0 z-50 bg-[#06080f]/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className={`border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-up ${
            isDark ? 'bg-[#0f172a] border-teal-500/20' : 'bg-white border-slate-200 shadow-xl'
          }`}>
            
            <div className={`p-4.5 flex justify-between items-center text-white border-b ${
              isDark ? 'bg-gradient-to-r from-[#121f35] to-[#1a2d4b] border-teal-500/10' : 'bg-gradient-to-r from-teal-700 to-indigo-800 border-teal-600'
            }`}>
              <h3 className="font-bold tracking-wider flex items-center gap-2 text-sm font-display uppercase">
                <Wind className="w-5 h-5 text-teal-300 animate-pulse" />
                SOOTHING SANCTUARY TIME PLAN
              </h3>
              <button 
                onClick={() => setShowCrisisModal(false)}
                className="text-slate-300 hover:text-white transition cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {crisisLoading ? (
                <div className={`text-center py-12 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  MIND MEMORY GENTLY TRIAGING... CREATING PEACEFUL STRUCTURE...
                </div>
              ) : crisisPlan ? (
                <div className="space-y-4 text-xs">
                  
                  {/* Assessment */}
                  <div className={`border p-4.5 rounded-xl leading-relaxed ${
                    isDark ? 'bg-[#121f35] border-teal-500/10' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={`font-mono font-bold uppercase block mb-1 ${isDark ? 'text-teal-300' : 'text-teal-800'}`}>🌿 GENTLE MINDSET SHIFT</span>
                    <p className={`text-sm italic font-sans ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      "{crisisPlan.crisis_assessment}"
                    </p>
                  </div>

                  {/* Schedule */}
                  <div>
                    <span className={`font-mono font-bold uppercase block mb-2.5 tracking-wider font-display ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      STEP-BY-STEP CALM PATH
                    </span>
                    <div className="space-y-2.5">
                      {crisisPlan.survival_schedule?.map((item, idx) => (
                        <div key={idx} className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center gap-3.5 transition ${
                          isDark 
                            ? 'bg-[#09111e] border-teal-500/5 hover:border-teal-500/15' 
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}>
                          <div className={`font-mono font-semibold px-3.5 py-1.5 rounded-xl text-center shrink-0 min-w-[130px] border shadow-sm ${
                            isDark 
                              ? 'bg-teal-500/10 text-teal-300 border-teal-500/15' 
                              : 'bg-teal-50 text-teal-800 border-teal-200'
                          }`}>
                            {item.start_time} - {item.end_time}
                          </div>
                          <div className={`font-semibold flex-1 leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            {item.action}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Parting Words */}
                  <div className={`border p-4.5 rounded-xl text-center ${
                    isDark ? 'bg-teal-950/20 border-teal-500/15' : 'bg-teal-50/60 border-teal-200'
                  }`}>
                    <span className={`font-mono font-bold uppercase block mb-1 ${isDark ? 'text-teal-300' : 'text-teal-800'}`}>COACHING ENCOURAGEMENT</span>
                    <p className={`text-sm font-bold font-sans ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {crisisPlan.commander_parting_words}
                    </p>
                  </div>

                </div>
              ) : null}

            </div>

            <div className={`p-4 border-t flex justify-end gap-2 ${
              isDark ? 'bg-[#09111e] border-teal-500/10' : 'bg-slate-50 border-slate-200'
            }`}>
              <button
                onClick={() => {
                  playChime();
                  showLocalNotification("Sanctuary flow activated. Stay calm, take it one step at a time.");
                  setShowCrisisModal(false);
                }}
                className="bg-gradient-to-r from-teal-500 to-indigo-600 hover:opacity-95 text-white font-bold text-xs px-6 py-3 rounded-xl uppercase tracking-wider transition cursor-pointer shadow-md animate-pulse"
              >
                Embrace This Flow
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 3: ACCOUNTABILITY IMAGE VERIFIER */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-[#06080f]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className={`border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up ${
            isDark ? 'bg-[#0f172a] border-teal-500/20' : 'bg-white border-slate-200'
          }`}>
            
            <div className={`p-4.5 flex justify-between items-center border-b ${
              isDark ? 'bg-[#121f35]/50 border-teal-500/10' : 'bg-slate-50 border-slate-200'
            }`}>
              <h3 className={`font-bold flex items-center gap-2 font-display ${isDark ? 'text-white' : 'text-slate-800'}`}>
                <Image className="w-5 h-5 text-teal-400" />
                Visual Accomplishment Inspector
              </h3>
              <button 
                onClick={() => setShowVerifyModal(false)}
                className={`transition cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className={`p-3.5 rounded-xl border text-xs ${
                isDark ? 'bg-[#09111e] border-teal-500/10' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className={`text-[10px] block uppercase font-mono font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>GOAL COMPLETED</span>
                <span className={`text-sm font-semibold font-display ${isDark ? 'text-white' : 'text-slate-800'}`}>{verifyTargetTask?.task_name}</span>
              </div>

              {!verificationFeedback ? (
                <div className="space-y-4">
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Share your awesome progress! Upload a snap of your finished setup, submitted paper, or homework lab. Our visual auditor will review it to award XP!
                  </p>

                  <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition ${
                    isDark ? 'bg-[#09111e] border-teal-500/10 hover:border-teal-500/30' : 'bg-slate-50 border-slate-300 hover:border-slate-400'
                  }`}>
                    <input
                      id="input-proof-file"
                      type="file"
                      accept="image/*"
                      onChange={handleVerifyImageUpload}
                      className="hidden"
                    />
                    
                    {verifyImageBase64 ? (
                      <div className="space-y-3">
                        <img 
                          src={verifyImageBase64} 
                          alt="Verification Preview" 
                          className={`max-h-36 mx-auto rounded-xl border shadow ${isDark ? 'border-teal-500/10' : 'border-slate-200'}`}
                        />
                        <button
                          type="button"
                          onClick={() => setVerifyImageBase64(null)}
                          className="text-[11px] text-rose-400 hover:underline cursor-pointer"
                        >
                          Remove Photo
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="input-proof-file" className="cursor-pointer space-y-2.5 block">
                        <Image className="w-8 h-8 text-teal-500/40 mx-auto" />
                        <span className={`text-xs block hover:underline font-medium ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>Select or Drop visual proof image</span>
                        <span className={`text-[10px] block font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>PNG, JPG, JPEG</span>
                      </label>
                    )}
                  </div>

                  {verifyImageBase64 && (
                    <button
                      id="btn-submit-verify-proof"
                      onClick={submitVerification}
                      disabled={verifying}
                      className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer shadow-md"
                    >
                      {verifying ? "Analyzing progress snap..." : "Submit Progress for Audit"}
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className={`p-4.5 rounded-xl border text-center shadow-inner ${
                    isDark ? 'bg-[#09111e] border-teal-500/10' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={`text-[10px] block uppercase font-mono font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>VERIFICATION PROFILE</span>
                    <span className={`text-lg font-black block mt-1.5 ${verificationFeedback.verified ? 'text-emerald-400' : 'text-amber-500'}`}>
                      {verificationFeedback.verified ? "APPROVED" : "SOFT AUDIT DEFERRED"}
                    </span>
                    <div className={`mt-1 font-mono text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Verification Score: {verificationFeedback.confidence_score}/100
                    </div>
                  </div>

                  <div>
                    <span className={`font-bold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>AUDITOR COMMENTARY:</span>
                    <p className={`p-3.5 rounded-xl border leading-relaxed italic ${
                      isDark ? 'text-slate-300 bg-[#09111e] border-teal-500/5' : 'text-slate-700 bg-slate-50 border-slate-200'
                    }`}>
                      "{verificationFeedback.inspector_feedback}"
                    </p>
                  </div>

                  {verificationFeedback.verified && (
                    <div className={`border p-3.5 rounded-xl text-center shadow-sm ${
                      isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    }`}>
                      <span className="font-bold block text-xs">🎉 +{verificationFeedback.xp_awarded} XP Mindfully Earned!</span>
                    </div>
                  )}
                </div>
              )}

            </div>

            <div className={`p-4 border-t flex justify-end ${
              isDark ? 'bg-[#09111e] border-teal-500/10' : 'bg-slate-50 border-slate-200'
            }`}>
              <button
                onClick={() => setShowVerifyModal(false)}
                className={`border text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer ${
                  isDark 
                    ? 'bg-[#121f35] hover:bg-[#152238] border-teal-500/15 text-slate-300' 
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700 border-slate-300'
                }`}
              >
                Close Panel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
