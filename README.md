# Thoroughly Modified SimpleWebRTC App (based on Talky demo)

This was made for the [complice.co](https://complice.co) coworking rooms. This repo is used for testing & building but isn't particularly suitable to be used directly.

To get started, you will first need to edit `public/index.html` to set your API key.

See the section marked `IMPORTANT SETUP`, and change the placeholder `YOUR_API_KEY` to be the API key you were provided.

You can retrieve your API key by visiting [https://accounts.simplewebrtc.com](https://accounts.simplewebrtc.com).

## Running

1. `npm install`
2. Apply changes to @andyet/simplewebrtc (below)
3. Edit `public/index.html` as described above.
4. `npm start`
5. Go to [https://localhost:8080/](https://localhost:8080)

### Changes to base library

Rather than properly fork the base library, given how we're using this, at present we're just making a couple small changes after running `npm install`.

**in `adjustVideoCaptureResolution`**

Move the code from `const newConstraints = {};` to this loop `for (const video of localMedia) {` *into* the loop, then replace

```javascript
if (video.screenCapture) {
    continue;
}
```

with

```javascript
if (video.screenCapture) {
    newConstraints.height = { ideal: Math.floor(width*(9/16)) };
}
```

...to force screenCaptures to be ALSO scaled (for privacy reasons - these screenshares are so people can broadly see what you're up to, not for pair-programming or presenting) and to set their aspect ratio to 16:9 rather than whatever you want the webcams set to.

Some other interesting possibilities

```javascript
newConstraints.height = { min: width * 0.5, max: width * 1.5 };
newConstraints.height = { min: height * 0.5, max: height * 1.5 };
newConstraints.height = { ideal: Math.floor(width/(1920/1080)) };
```

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
