# Fling Services

The application that build with Firebase Functions. This is REST API for Fling - A todo list application that you can download on Playstore or Appstore.

### Running locally

1. Please make sure you have a privillege to contribute at this project. Just [send me a message](muhammadfuaditrockz@gmail.com "Fuadit's Email")send me a message to get access to the database account(Firebase).

2. If you have an access to the database, please open [Firebase Account Pannel](https://console.firebase.google.com/project/db-test-adit/overview "Fling Firebase").

3. Open **settings** and choose **Project Settings**. And then choose **Service Account**.

4. Click **Generate new private key** button. It will be download file.json. It contains tokens and keys to give database access permission in the Firebase account from your computer.

5. Change the file name to `key.json`.

6. Move `key.json` to this repository. No problem, it will not be uploaded automatically when pushing to github, because it has been setup in `.gitignore`.

7. Run in your terminal:
```
> export GOOGLE_APPLICATION_CREDENTIALS="path/to/key.json"

> firebase emulators:start

```

> To stop the running server just pres CTRL/CMD + C

