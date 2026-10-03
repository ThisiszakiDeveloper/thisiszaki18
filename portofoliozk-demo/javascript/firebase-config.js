const firebaseConfig = {
  apiKey: 'AIzaSyBxEFNIlxoEAcnHSoNVuFn99RUqkOPYxcw',
  authDomain: 'thisiszaki18-fa4c2.firebaseapp.com',
  projectId: 'thisiszaki18-fa4c2',
  storageBucket: 'thisiszaki18-fa4c2.firebasestorage.app',
  messagingSenderId: '1076926966652',
  appId: '1:1076926966652:web:f4661f32f72ba25dbf92f9',
  measurementId: 'G-BMCVGFKK34'
};

export const ADMIN_EMAIL = 'thisiszaki18@gmail.com';

export function isFirebaseConfigured() {
  return Object.values(firebaseConfig).every(function(value) {
    return value && !value.startsWith('REPLACE_');
  });
}

export function isAdminConfigured() {
  return ADMIN_EMAIL && !ADMIN_EMAIL.startsWith('REPLACE_');
}

export async function initializeFirebase() {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase belum dikonfigurasi. Isi javascript/firebase-config.js terlebih dahulu.');
  }

  const version = '12.19.0';
  const [appSdk, authSdk, firestoreSdk, storageSdk] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/' + version + '/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/' + version + '/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/' + version + '/firebase-firestore.js'),
    import('https://www.gstatic.com/firebasejs/' + version + '/firebase-storage.js')
  ]);
  const app = appSdk.initializeApp(firebaseConfig);
  let analytics = null;
  try {
    const analyticsSdk = await import('https://www.gstatic.com/firebasejs/' + version + '/firebase-analytics.js');
    if (await analyticsSdk.isSupported()) analytics = analyticsSdk.getAnalytics(app);
  } catch (error) {
    analytics = null;
  }

  return {
    analytics: analytics,
    auth: authSdk.getAuth(app),
    authSdk: authSdk,
    db: firestoreSdk.getFirestore(app),
    firestoreSdk: firestoreSdk,
    storage: storageSdk.getStorage(app),
    storageSdk: storageSdk
  };
}