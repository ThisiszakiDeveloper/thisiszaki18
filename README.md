# Zaki Portfolio Demo

This directory is a standalone copy of the portfolio, including its Firebase-backed documentation gallery and private admin page.

## GitHub Pages

1. Create a GitHub repository named `demo`.
2. Upload the **contents of this directory** to the repository root, so `index.html` is at the top level.
3. In the repository, open **Settings → Pages** and choose **Deploy from a branch**, branch `main`, folder `/ (root)`.
4. The homepage will be available at `https://YOUR-USERNAME.github.io/demo/`; GitHub Pages serves `index.html` automatically, so that filename is not shown in the URL.

Other HTML pages retain their `.html` path unless the hosting platform is configured for clean URLs. JavaScript files remain downloadable by visitors; never store passwords or service-account credentials in them.

## Firebase

Review `FIREBASE_SETUP.md` before enabling the admin. Firebase Authentication and deployed Firestore/Storage Rules protect admin actions; an unlisted URL alone is not access control. Add the published GitHub Pages origin to Firebase Authentication's authorized domains if needed.
