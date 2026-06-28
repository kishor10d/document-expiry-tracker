/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CodeBlueprint {
  fileName: string;
  language: string;
  description: string;
  code: string;
}

export const EXPO_PROJECT_STRUCTURE = `
LifeVault/
├── assets/                     # App icons, splash screens, assets
│   ├── icon.png
│   ├── adaptive-icon.png
│   └── favicon.png
├── src/
│   ├── components/             # Reusable UI elements
│   │   ├── CategoryIcon.tsx    # Category-specific icon component
│   │   ├── DocCard.tsx         # Two-column grid card representation
│   │   └── DatePickerModal.tsx # Expiry date selector
│   ├── data/
│   │   └── mockData.ts         # Initial offline testing records
│   ├── services/
│   │   ├── firebaseConfig.ts   # Firebase client and offline cache init
│   │   └── NotificationManager.ts # Native Expo notification scheduler
│   ├── types/
│   │   └── index.ts            # Type structures and schemas
│   └── views/
│       ├── AuthScreen.tsx      # Email/Password or Anonymous log-in
│       └── DashboardScreen.tsx # Core 2-column list tracking view
├── App.tsx                     # Main Expo Entry Point
├── app.json                    # Expo config (reboot, channels, icons)
├── firestore.rules             # Google Cloud Firestore Security Rules
├── package.json                # Project dependencies
└── tsconfig.json               # TypeScript configurations
`;

export const BLUEPRINTS: CodeBlueprint[] = [
  {
    fileName: "firebaseConfig.ts",
    language: "typescript",
    description: "Configures Firebase JS SDK (v10+) with native client-side offline persistence enabled. This allows immediate cached reads/writes even without network, syncing in the background.",
    code: `import { initializeApp } from 'firebase/app';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  collection,
  doc
} from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyFakeKey_LifeVault_789123",
  authDomain: "lifevault-expiry.firebaseapp.com",
  projectId: "lifevault-expiry",
  storageBucket: "lifevault-expiry.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with client-side offline persistence enabled
// persistentLocalCache is the official standard for Expo/React Native in SDK v10+
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager() // Multi-tab support (works seamlessly on iOS/Android & Web viewports)
  })
});

// Initialize Auth with AsyncStorage persistence to survive app restarts and kills
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export default app;`
  },
  {
    fileName: "firestore.rules",
    language: "javascript",
    description: "Production-grade, Zero-Trust Firestore security rules enforcing owner isolation, strict schema matching (types and limits), ID sanitization, and timestamp immutability.",
    code: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 1. Global Safety Net (Pillar 1: Default Deny)
    match /{document=**} {
      allow read, write: if false;
    }

    // --- PRIMITIVE GLOBAL HELPERS ---
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    function isValidId(id) {
      return id is string 
        && id.size() <= 128 
        && id.matches('^[a-zA-Z0-9_\\\\-]+$');
    }

    function incoming() {
      return request.resource.data;
    }

    function existing() {
      return resource.data;
    }

    // 2. Validation Blueprints (Pillar 2: The Anti-Update-Gap)
    function isValidDocument(data) {
      return data.keys().hasAll(['category', 'title', 'expiryDate', 'alertActive', 'updatedAt', 'userId'])
        && data.keys().size() <= 8
        && data.title is string 
        && data.title.size() > 0 
        && data.title.size() <= 100
        && data.category is string 
        && (data.category == 'VEHICLE' || data.category == 'PERSONAL' || data.category == 'MEDICAL' || data.category == 'FINANCE')
        && data.expiryDate is timestamp
        && data.alertActive is bool
        // 13. Temporal Integrity (Strict Server Timestamp validation)
        && data.updatedAt == request.time
        && data.userId == request.auth.uid
        // Optional Fields validation
        && (!data.keys().hasAny(['referenceNo']) || (data.referenceNo is string && data.referenceNo.size() <= 50))
        && (!data.keys().hasAny(['notes']) || (data.notes is string && data.notes.size() <= 1000));
    }

    // 3. User Document Isolated Matches (Pillar 3: Path Variable Hardening)
    match /users/{userId}/documents/{docId} {
      
      // Allow create only if user owns the root path, and payload matches the schema
      allow create: if isOwner(userId) 
                    && isValidId(docId) 
                    && isValidDocument(incoming());

      // 8. Secure List Queries (The Query Enforcer)
      // Users can only read their own documents - prevents client-side filters bypassing security
      allow read: if isOwner(userId);

      // 4. Tiered Identity Logic & 12. Immortal Fields (userId must remain unchanged)
      allow update: if isOwner(userId) 
                    && isValidId(docId) 
                    && isValidDocument(incoming())
                    && incoming().userId == existing().userId; 

      allow delete: if isOwner(userId);
    }
  }
}`
  },
  {
    fileName: "NotificationManager.ts",
    language: "typescript",
    description: "Production-grade utility service managing document days remaining, urgency color-coding, and scheduling 3-step native reminders. Features iOS 64-notification queue limit optimization.",
    code: `import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export enum DocCategory {
  VEHICLE = 'VEHICLE',
  PERSONAL = 'PERSONAL',
  MEDICAL = 'MEDICAL',
  FINANCE = 'FINANCE'
}

export interface LocalDocument {
  id: string;
  category: DocCategory;
  title: string;
  expiryDate: Date;
  alertActive: boolean;
  referenceNo?: string;
  notes?: string;
}

/**
 * Configure default notification behavior
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationManager {
  
  /**
   * Calculates the days remaining between today and the expiry date
   */
  static getDaysRemaining(expiryDate: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Returns the color code mapping based on days remaining:
   * - Red: < 7 days / Overdue
   * - Yellow: 8-30 days
   * - Green: 31+ days
   */
  static getColorCode(daysRemaining: number): 'red' | 'yellow' | 'green' {
    if (daysRemaining <= 7) return 'red';
    if (daysRemaining <= 30) return 'yellow';
    return 'green';
  }

  /**
   * Cancels any active notification triggers for a specific document
   */
  static async cancelDocumentNotifications(docId: string): Promise<void> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    
    // Filter and cancel notifications linked to this document via trigger ID or custom data
    for (const notification of scheduled) {
      const data = notification.content.data;
      if (data && data.docId === docId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  }

  /**
   * Schedules exactly 3 alerts: 30 days, 15 days, and 1 day before expiration.
   * Optimizes queue so we never exceed iOS 64-notification limit.
   */
  static async scheduleDocumentNotifications(
    doc: LocalDocument
  ): Promise<void> {
    // First cancel any existing notifications for this document to avoid duplicates
    await this.cancelDocumentNotifications(doc.id);

    if (!doc.alertActive) return;

    // Check permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return;

    const expiryTime = new Date(doc.expiryDate).getTime();
    const todayTime = new Date().getTime();

    // The 3 intervals requested (in days before expiration)
    const alertIntervals = [30, 15, 1];
    
    const triggersToSchedule: { daysBefore: number; date: Date }[] = [];

    for (const daysBefore of alertIntervals) {
      const triggerTime = expiryTime - (daysBefore * 24 * 60 * 60 * 1000);
      
      // Schedule only if the trigger date is in the future
      if (triggerTime > todayTime) {
        triggersToSchedule.push({
          daysBefore,
          date: new Date(triggerTime),
        });
      }
    }

    // Smart Optimization Loop (iOS 64-notification queue limit cap)
    await this.optimizeNotificationQueue(triggersToSchedule.length);

    // Schedule the notifications
    for (const trigger of triggersToSchedule) {
      const triggerId = \`\${doc.id}_\${trigger.daysBefore}d\`;
      
      await Notifications.scheduleNotificationAsync({
        identifier: triggerId,
        content: {
          title: 'Document Expiration Alert ⚠️',
          body: \`Your document "\${doc.title}" (\${doc.category}) expires in \${trigger.daysBefore} days!\`,
          sound: Platform.OS === 'android' ? true : undefined,
          data: { 
            docId: doc.id, 
            category: doc.category,
            daysBefore: trigger.daysBefore 
          },
        },
        trigger: {
          date: trigger.date,
        },
      });
    }
  }

  /**
   * Optimizes the active Expo scheduled notification list to ensure we never
   * exceed the iOS hardware/system capacity of 64 scheduled notifications.
   */
  private static async optimizeNotificationQueue(newTriggersCount: number): Promise<void> {
    const activeScheduled = await Notifications.getAllScheduledNotificationsAsync();
    const activeCount = activeScheduled.length;
    
    // Capping at 60 to leave a buffer of 4 for safety
    const LIMIT_CAP = 60;

    if (activeCount + newTriggersCount > LIMIT_CAP) {
      console.warn(\`Notification queue limit warning: Active scheduled is \${activeCount}. Compacting queue...\`);
      
      // Sort notifications by trigger time ascending (earliest first)
      const sorted = [...activeScheduled].sort((a, b) => {
        const triggerA = (a.trigger as any).value || 0;
        const triggerB = (b.trigger as any).value || 0;
        return triggerA - triggerB;
      });

      // Cancel the furthest out notifications to make space for immediate/upcoming events
      const countToRemove = (activeCount + newTriggersCount) - LIMIT_CAP;
      for (let i = 0; i < countToRemove; i++) {
        const indexToRemove = sorted.length - 1 - i; // take from the end (furthest trigger date)
        if (indexToRemove >= 0) {
          await Notifications.cancelScheduledNotificationAsync(sorted[indexToRemove].identifier);
        }
      }
    }
  }
}`
  },
  {
    fileName: "AndroidConfigGuide.md",
    language: "markdown",
    description: "Configuration files and background task setups ensuring notification triggers survive system reboot on Android.",
    code: `# Android System Reboot Resilience & Notifications in Expo

In standard Expo/React Native projects, scheduling local notification triggers is handled by the OS kernel, which ensures scheduled reminders survive when the app is swiped away or closed.

However, to guarantee that notifications are preserved or properly re-synchronized if the device undergoes a **hard system reboot**, you must register a **background listener** or native Android receivers.

### 1. Enable Android Reboot Services in app.json
Add the \`receiveBootCompleted\` permission and configure notification behavior under the \`android\` key of your \`app.json\` configuration:

\`\`\`json
{
  "expo": {
    "name": "LifeVault",
    "slug": "lifevault",
    "android": {
      "permissions": [
        "RECEIVE_BOOT_COMPLETED"
      ],
      "useNextNotificationsApi": true
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#10B981"
        }
      ]
    ]
  }
}
\`\`\`

### 2. Register Background Notification Re-Sync Task
In Expo, you can utilize the \`expo-task-manager\` and \`expo-background-fetch\` modules to register a silent task that fires on boot or periodically to reload Firestore documents from the local cached persistence layer and re-schedule alerts.

Create an entry file e.g., \`src/services/BackgroundSyncService.ts\`:

\`\`\`typescript
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { db } from './firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { NotificationManager } from './NotificationManager';

const BACKGROUND_SYNC_TASK = 'BACKGROUND_SYNC_TASK';

// Define the silent background job
TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    console.log('[Background Service] Re-scheduling alerts on boot/sync event.');
    
    // Read from the persistent local Firestore cache instantly (offline-first)
    const q = query(collection(db, "users", "CURRENT_USER_UID", "documents"));
    const snapshot = await getDocs(q);
    
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const docItem = {
        id: docSnap.id,
        category: data.category,
        title: data.title,
        expiryDate: data.expiryDate.toDate(),
        alertActive: data.alertActive,
        referenceNo: data.referenceNo,
        notes: data.notes
      };
      
      // Reschedule safely (cancels duplicates, optimizes to 64 limit)
      await NotificationManager.scheduleDocumentNotifications(docItem);
    }
    
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background task failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Register task on startup
export async function registerBackgroundSyncTask() {
  const status = await BackgroundFetch.getStatusAsync();
  if (status === BackgroundFetch.BackgroundFetchStatus.Restricted || status === BackgroundFetch.BackgroundFetchStatus.Denied) {
    console.log('Background fetch is disabled or restricted');
    return;
  }
  
  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
  if (!isRegistered) {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
      minimumInterval: 60 * 15, // 15 Minutes
      stopOnTerminate: false,   // Keeps running even if user force-quits the app
      startOnBoot: true,        // CRITICAL: Triggers background execution when phone starts up
    });
  }
}
\`\`\`
`
  }
];
