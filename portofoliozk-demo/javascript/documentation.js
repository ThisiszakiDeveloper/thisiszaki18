import { initializeFirebase, isFirebaseConfigured } from './firebase-config.js';

const grid = document.querySelector('#documentationGrid');
const status = document.querySelector('#documentationStatus');
const profileName = document.querySelector('#profileName');
const profileAvatar = document.querySelector('#profileAvatar');

function addText(parent, tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text;
  parent.append(element);
  return element;
}

function renderEntries(entries) {
  grid.replaceChildren();
  if (!entries.length) {
    status.hidden = false;
    status.textContent = 'Belum ada dokumentasi yang diterbitkan.';
    return;
  }

  status.hidden = true;
  entries.forEach(function(entry) {
    const card = document.createElement('article');
    card.className = 'documentation-card';
    const figure = document.createElement('figure');
    const imageLink = document.createElement('a');
    imageLink.className = 'documentation-image';
    imageLink.href = entry.imageUrl;
    imageLink.target = '_blank';
    imageLink.rel = 'noopener noreferrer';
    imageLink.setAttribute('aria-label', 'Buka foto dokumentasi: ' + entry.title);
    const image = document.createElement('img');
    image.src = entry.imageUrl;
    image.alt = entry.title;
    image.loading = 'lazy';
    imageLink.append(image);
    figure.append(imageLink);
    card.append(figure);

    const copy = document.createElement('div');
    copy.className = 'documentation-copy';
    addText(copy, 'h3', '', entry.title);
    if (entry.description) addText(copy, 'p', '', entry.description);
    if (entry.opinion) addText(copy, 'blockquote', 'documentation-opinion', entry.opinion);
    card.append(copy);
    grid.append(card);
  });
}

if (!isFirebaseConfigured()) {
  status.textContent = 'Galeri dokumentasi akan aktif setelah Firebase dikonfigurasi.';
} else {
  initializeFirebase().then(function(firebase) {
    const firestore = firebase.firestoreSdk;
    const profileRef = firestore.doc(firebase.db, 'siteContent', 'profile');
    firestore.onSnapshot(profileRef, function(snapshot) {
      if (!snapshot.exists()) return;
      const profile = snapshot.data();
      const name = typeof profile.name === 'string' ? profile.name.trim() : '';
      const imageUrl = typeof profile.imageUrl === 'string' ? profile.imageUrl : '';
      if (name && profileName) {
        profileName.textContent = name;
        document.title = name + ' — Portofolio Pribadi';
      }
      if (imageUrl.startsWith('https://firebasestorage.googleapis.com/') && profileAvatar) {
        profileAvatar.src = imageUrl;
        profileAvatar.alt = 'Foto profil ' + (name || 'Zaki');
      }
    }, function() {});

    const collection = firestore.collection(firebase.db, 'documentation');
    const publishedQuery = firestore.query(collection, firestore.where('published', '==', true));
    firestore.onSnapshot(publishedQuery, function(snapshot) {
      const entries = snapshot.docs.map(function(documentSnapshot) {
        return documentSnapshot.data();
      }).sort(function(first, second) {
        return (second.createdAt?.toMillis() || 0) - (first.createdAt?.toMillis() || 0);
      });
      renderEntries(entries);
    }, function() {
      status.hidden = false;
      status.textContent = 'Dokumentasi belum dapat dimuat. Silakan coba lagi nanti.';
    });
  }).catch(function() {
    status.hidden = false;
    status.textContent = 'Dokumentasi belum dapat dimuat. Silakan coba lagi nanti.';
  });
}
