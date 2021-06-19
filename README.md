# Fast Effect Talky App

To get started, you will first need to edit `public/index.html` to set your API key.

See the section marked `IMPORTANT SETUP`, and change the placeholder `YOUR_API_KEY` to be the API key you were provided.

You can retrieve your API key by visiting [https://accounts.simplewebrtc.com](https://accounts.simplewebrtc.com).

## Running

1. `npm install`
2. Edit `public/index.html` as described above.
3. `npm start`
4. Go to [https://localhost:8080/](https://localhost:8080)


## Deploying to Static/Shared Hosting

1. `npm install`
2. Edit `public/index.html` as described above.
3. `npm run build`
4. Copy the contents of the `./dist` folder to your hosting location.
5. Ensure your hosting location is served via HTTPS.


## App Options

The app can be easily configured with a few options. The only *required* option is the `root`.

```javascript
SimpleWebRTC.run({
  root: document.getElementById('root'), // required
  roomName: params.get('room'),
  configUrl: 'https://api.simplewebrtc.com/config/guest/YOUR_API_PUBLIC_KEY',
  openToPublic: true,
  allowShareScreen: false,
  allowWalkieTalkieMode: false,
});
```
