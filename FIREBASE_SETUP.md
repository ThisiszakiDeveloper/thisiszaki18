# Penyiapan Firebase

Konfigurasi Web app untuk project `thisiszaki18-fa4c2` sudah dimasukkan ke `javascript/firebase-config.js`. Nilai Web config dan API key Firebase memang dipakai di browser; jangan masukkan password atau service-account key ke file frontend.

1. Di Firebase Console, aktifkan Authentication dengan provider Email/Password, lalu buat akun admin sendiri. Halaman admin tidak menyediakan pendaftaran akun.
2. Buat Firestore Database dan aktifkan Firebase Storage.
3. Pastikan email admin `thisiszaki18@gmail.com` di `javascript/firebase-config.js`, `firestore.rules`, dan `storage.rules` sama dengan akun yang dibuat di Firebase Authentication.
4. Pastikan project `thisiszaki18-fa4c2` yang terpilih di Firebase CLI, lalu deploy rules:

   ```sh
   firebase deploy --only firestore:rules,storage
   ```

5. Tambahkan domain website ke daftar Authorized domains Firebase Authentication jika diperlukan. Buka website melalui HTTP/HTTPS, lalu login di `pages/hkfjwdwndsawad127718131/admin.html`.

Hanya dokumentasi terbit yang bisa dibaca dari portofolio publik. Profil publik disimpan di `siteContent/profile`; pengunjung dapat membaca nama dan URL foto, sedangkan hanya admin yang bisa mengubahnya. Hanya email yang diizinkan Rules yang bisa menulis/menghapus dokumentasi dan mengunggah foto. Foto profil serta foto/deskripsi dokumentasi yang diterbitkan bersifat publik, jadi jangan unggah materi privat. URL admin yang tidak dicantumkan di menu hanya menyamarkan lokasinya; Firebase Authentication dan Rules yang memberi kontrol akses.