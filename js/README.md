The JavaScript for this project rests in 4 subdirectories:

- `app/` - Contains the main application code.
- `lib/` - Contains third-party libraries.
- `content/` - Contains content scripts that are injected into web pages on Steam to add functionality. The `manifest.json` file in the root of the project specifies which pages these scripts are injected into (see the [`content_scripts`](https://developer.chrome.com/docs/extensions/reference/manifest/content-scripts) field).
- `views/` - Contains code for the various views within the extension, and the popup.