import { ADMIN_EMAIL, initializeFirebase, isAdminConfigured, isFirebaseConfigured } from '../../javascript/firebase-config.js';

const globalStatus = document.querySelector('#globalStatus');
const loginPanel = document.querySelector('#loginPanel');
const profilePanel = document.querySelector('#profilePanel');
const managerPanel = document.querySelector('#managerPanel');
const documentsPanel = document.querySelector('#documentsPanel');
const loginForm = document.querySelector('#loginForm');
const loginButton = document.querySelector('#loginButton');
const loginStatus = document.querySelector('#loginStatus');
const uploadStatus = document.querySelector('#uploadStatus');
const documentationForm = document.querySelector('#documentationForm');
const publishButton = document.querySelector('#publishButton');
const documentsList = document.querySelector('#documentsList');
const imageInput = document.querySelector('#docImage');
const imagePreview = document.querySelector('#imagePreview');
const logoutButton = document.querySelector('#logoutButton');
const profileForm = document.querySelector('#profileForm');
const profileNameInput = document.querySelector('#profileNameInput');
const profileImageInput = document.querySelector('#profileImageInput');
const profilePreview = document.querySelector('#profilePreview');
const profileStatus = document.querySelector('#profileStatus');
const saveProfileButton = document.querySelector('#saveProfileButton');

let firebase;
let previewUrl;
let profilePreviewUrl;
let savedProfile = { name: 'Zaki', imageUrl: '', imagePath: '' };

function setStatus(element, message, type) {
  element.textContent = message;
  if (element === globalStatus) {
    element.classList.toggle('error', type === 'error');
    element.classList.toggle('success', type === 'success');
  }
}

function authErrorMessage(error) {
  if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
    return 'Email atau password tidak sesuai.';
  }
  if (error.code === 'auth/too-many-requests') return 'Terlalu banyak percobaan. Coba lagi nanti.';
  if (error.code === 'auth/network-request-failed') return 'Koneksi Firebase gagal. Periksa internet dan konfigurasi domain Firebase.';
  return 'Login gagal. Periksa pengaturan Firebase Authentication.';
}

function addTextElement(parent, tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text;
  parent.append(element);
  return element;
}

function renderDocuments(entries) {
  documentsList.replaceChildren();
  if (!entries.length) {
    addTextElement(documentsList, 'p', 'empty', 'Belum ada dokumentasi. Tambahkan dokumentasi pertama melalui form di atas.');
    return;
  }

  entries.forEach(function(entry) {
    const item = document.createElement('article');
    item.className = 'doc-item';
    const image = document.createElement('img');
    image.src = entry.imageUrl;
    image.alt = entry.title;
    image.loading = 'lazy';
    item.append(image);

    const copy = document.createElement('div');
    copy.className = 'doc-copy';
    addTextElement(copy, 'h3', '', entry.title);
    addTextElement(copy, 'p', '', entry.description || 'Tanpa deskripsi.');
    addTextElement(copy, 'p', 'opinion', entry.opinion || 'Tanpa opini.');
    item.append(copy);

    const removeButton = addTextElement(item, 'button', 'button danger', 'Hapus');
    removeButton.type = 'button';
    removeButton.addEventListener('click', function() {
      removeDocument(entry, removeButton);
    });
    documentsList.append(item);
  });
}

async function loadDocuments() {
  documentsList.replaceChildren();
  addTextElement(documentsList, 'p', 'empty', 'Memuat dokumentasi…');
  try {
    const firestore = firebase.firestoreSdk;
    const snapshot = await firestore.getDocs(firestore.collection(firebase.db, 'documentation'));
    const entries = snapshot.docs.map(function(documentSnapshot) {
      return { id: documentSnapshot.id, ...documentSnapshot.data() };
    }).sort(function(first, second) {
      return (second.createdAt?.toMillis() || 0) - (first.createdAt?.toMillis() || 0);
    });
    renderDocuments(entries);
  } catch (error) {
    renderDocuments([]);
    setStatus(globalStatus, 'Dokumentasi gagal dimuat. Periksa Firestore Rules dan koneksi Firebase.', 'error');
  }
}

async function loadProfile() {
  try {
    const firestore = firebase.firestoreSdk;
    const profileRef = firestore.doc(firebase.db, 'siteContent', 'profile');
    const snapshot = await firestore.getDoc(profileRef);
    savedProfile = snapshot.exists()
      ? { name: 'Zaki', imageUrl: '', imagePath: '', ...snapshot.data() }
      : { name: 'Zaki', imageUrl: '', imagePath: '' };
    profileNameInput.value = savedProfile.name;
    profilePreview.src = savedProfile.imageUrl || '../../images/profile-placeholder.jpg';
    profilePreview.alt = 'Foto profil ' + savedProfile.name;
    setStatus(profileStatus, snapshot.exists() ? 'Profil tersimpan.' : 'Belum ada profil tersimpan.');
  } catch (error) {
    setStatus(profileStatus, 'Profil gagal dimuat. Periksa Firestore Rules dan koneksi Firebase.');
  }
}

profileImageInput.addEventListener('change', function() {
  if (profilePreviewUrl) URL.revokeObjectURL(profilePreviewUrl);
  profilePreviewUrl = '';
  const file = profileImageInput.files[0];
  if (!file) {
    profilePreview.src = savedProfile.imageUrl || '../../images/profile-placeholder.jpg';
    return;
  }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) {
    profileImageInput.value = '';
    setStatus(profileStatus, 'Pilih JPG, PNG, atau WEBP berukuran maksimal 8 MB.');
    return;
  }
  profilePreviewUrl = URL.createObjectURL(file);
  profilePreview.src = profilePreviewUrl;
  setStatus(profileStatus, 'Foto profil siap disimpan.');
});

profileForm.addEventListener('submit', async function(event) {
  event.preventDefault();
  if (!firebase) return;
  const name = profileNameInput.value.trim();
  const file = profileImageInput.files[0];
  if (!name || name.length > 80) {
    setStatus(profileStatus, 'Nama wajib diisi dan maksimal 80 karakter.');
    return;
  }
  if (file && (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024)) {
    setStatus(profileStatus, 'Pilih JPG, PNG, atau WEBP berukuran maksimal 8 MB.');
    return;
  }

  saveProfileButton.disabled = true;
  let uploadedImagePath = '';
  try {
    const storage = firebase.storageSdk;
    const firestore = firebase.firestoreSdk;
    let imageUrl = savedProfile.imageUrl;
    let imagePath = savedProfile.imagePath;
    if (file) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      imagePath = 'profile/' + firebase.auth.currentUser.uid + '/' + Date.now() + '-' + safeName;
      uploadedImagePath = imagePath;
      setStatus(profileStatus, 'Mengunggah foto profil…');
      const imageRef = storage.ref(firebase.storage, imagePath);
      await storage.uploadBytes(imageRef, file, { contentType: file.type });
      imageUrl = await storage.getDownloadURL(imageRef);
    }

    await firestore.setDoc(firestore.doc(firebase.db, 'siteContent', 'profile'), {
      name: name,
      imageUrl: imageUrl,
      imagePath: imagePath,
      updatedAt: firestore.serverTimestamp()
    });

    const previousImagePath = savedProfile.imagePath;
    savedProfile = { name: name, imageUrl: imageUrl, imagePath: imagePath };
    profilePreview.src = imageUrl || '../../images/profile-placeholder.jpg';
    profilePreview.alt = 'Foto profil ' + name;
    profileImageInput.value = '';
    if (profilePreviewUrl) URL.revokeObjectURL(profilePreviewUrl);
    profilePreviewUrl = '';
    uploadedImagePath = '';
    setStatus(profileStatus, 'Profil berhasil disimpan.');

    if (file && previousImagePath && previousImagePath !== imagePath) {
      try {
        await storage.deleteObject(storage.ref(firebase.storage, previousImagePath));
      } catch (error) {
        setStatus(profileStatus, 'Profil tersimpan. Foto lama belum berhasil dibersihkan.');
      }
    }
  } catch (error) {
    if (uploadedImagePath) {
      try {
        await firebase.storageSdk.deleteObject(firebase.storageSdk.ref(firebase.storage, uploadedImagePath));
      } catch (cleanupError) {
        uploadedImagePath = '';
      }
    }
    setStatus(profileStatus, 'Profil gagal disimpan. Periksa Firebase Rules dan koneksi.');
  } finally {
    saveProfileButton.disabled = false;
  }
});

async function removeDocument(entry, button) {
  if (!window.confirm('Hapus dokumentasi “' + entry.title + '”?')) return;
  button.disabled = true;
  try {
    const firestore = firebase.firestoreSdk;
    const storage = firebase.storageSdk;
    await storage.deleteObject(storage.ref(firebase.storage, entry.imagePath));
    await firestore.deleteDoc(firestore.doc(firebase.db, 'documentation', entry.id));
    setStatus(globalStatus, 'Dokumentasi berhasil dihapus.', 'success');
    await loadDocuments();
  } catch (error) {
    button.disabled = false;
    setStatus(globalStatus, 'Dokumentasi gagal dihapus. Periksa Firebase Rules dan coba lagi.', 'error');
  }
}

imageInput.addEventListener('change', function() {
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = '';
  const file = imageInput.files[0];
  if (!file) {
    imagePreview.classList.remove('visible');
    imagePreview.removeAttribute('src');
    return;
  }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) {
    imageInput.value = '';
    imagePreview.classList.remove('visible');
    setStatus(uploadStatus, 'Pilih JPG, PNG, atau WEBP berukuran maksimal 8 MB.');
    return;
  }
  previewUrl = URL.createObjectURL(file);
  imagePreview.src = previewUrl;
  imagePreview.classList.add('visible');
  setStatus(uploadStatus, 'Foto siap diunggah.');
});

loginForm.addEventListener('submit', async function(event) {
  event.preventDefault();
  if (!firebase) return;
  const email = loginForm.elements.email.value.trim().toLowerCase();
  const password = loginForm.elements.password.value;
  if (email !== ADMIN_EMAIL.toLowerCase()) {
    setStatus(loginStatus, 'Email ini bukan akun administrator yang diizinkan.');
    return;
  }
  loginButton.disabled = true;
  setStatus(loginStatus, 'Memeriksa akun…');
  try {
    await firebase.authSdk.signInWithEmailAndPassword(firebase.auth, email, password);
    loginForm.elements.password.value = '';
  } catch (error) {
    setStatus(loginStatus, authErrorMessage(error));
    loginButton.disabled = false;
  }
});

logoutButton.addEventListener('click', async function() {
  if (firebase) await firebase.authSdk.signOut(firebase.auth);
});

documentationForm.addEventListener('submit', async function(event) {
  event.preventDefault();
  if (!firebase) return;
  const file = imageInput.files[0];
  const title = documentationForm.elements.title.value.trim();
  if (!file || !title) {
    setStatus(uploadStatus, 'Judul dan foto dokumentasi wajib diisi.');
    return;
  }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) {
    setStatus(uploadStatus, 'Pilih JPG, PNG, atau WEBP berukuran maksimal 8 MB.');
    return;
  }

  publishButton.disabled = true;
  setStatus(uploadStatus, 'Mengunggah foto…');
  try {
    const storage = firebase.storageSdk;
    const firestore = firebase.firestoreSdk;
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const imagePath = 'documentation/' + firebase.auth.currentUser.uid + '/' + Date.now() + '-' + safeName;
    const uploadTask = storage.uploadBytesResumable(storage.ref(firebase.storage, imagePath), file, { contentType: file.type });
    await new Promise(function(resolve, reject) {
      uploadTask.on('state_changed', function(snapshot) {
        const percent = Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 100);
        setStatus(uploadStatus, 'Mengunggah foto… ' + percent + '%');
      }, reject, resolve);
    });
    const imageUrl = await storage.getDownloadURL(uploadTask.snapshot.ref);
    await firestore.addDoc(firestore.collection(firebase.db, 'documentation'), {
      title: title,
      description: documentationForm.elements.description.value.trim(),
      opinion: documentationForm.elements.opinion.value.trim(),
      imageUrl: imageUrl,
      imagePath: imagePath,
      published: true,
      createdAt: firestore.serverTimestamp(),
      updatedAt: firestore.serverTimestamp()
    });
    documentationForm.reset();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = '';
    imagePreview.removeAttribute('src');
    imagePreview.classList.remove('visible');
    setStatus(uploadStatus, 'Dokumentasi berhasil diterbitkan.', 'success');
    await loadDocuments();
  } catch (error) {
    setStatus(uploadStatus, 'Upload gagal. Periksa koneksi Firebase, ukuran file, dan Storage/Firestore Rules.');
  } finally {
    publishButton.disabled = false;
  }
});

if (!isFirebaseConfigured()) {
  loginButton.disabled = true;
  setStatus(globalStatus, 'Firebase belum disiapkan. Isi konfigurasi Web app di javascript/firebase-config.js terlebih dahulu.', 'error');
} else if (!isAdminConfigured()) {
  loginButton.disabled = true;
  setStatus(globalStatus, 'Email admin belum disiapkan di javascript/firebase-config.js dan Firebase Rules.', 'error');
} else {
  initializeFirebase().then(function(services) {
    firebase = services;
    loginButton.disabled = false;
    setStatus(globalStatus, 'Firebase siap. Masuk dengan akun admin yang dibuat di Firebase Console.', 'success');
    services.authSdk.onAuthStateChanged(firebase.auth, async function(user) {
      if (!user) {
        loginPanel.hidden = false;
        profilePanel.hidden = true;
        managerPanel.hidden = true;
        documentsPanel.hidden = true;
        loginButton.disabled = false;
        return;
      }
      if ((user.email || '').toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        await services.authSdk.signOut(firebase.auth);
        setStatus(loginStatus, 'Akun ini tidak memiliki akses admin.');
        return;
      }
      loginPanel.hidden = true;
      profilePanel.hidden = false;
      managerPanel.hidden = false;
      documentsPanel.hidden = false;
      setStatus(globalStatus, 'Login sebagai ' + user.email + '.', 'success');
      await loadProfile();
      await loadDocuments();
    });
  }).catch(function(error) {
    loginButton.disabled = true;
    setStatus(globalStatus, error.message || 'Firebase gagal dimuat. Periksa koneksi dan konfigurasi.', 'error');
  });
}
