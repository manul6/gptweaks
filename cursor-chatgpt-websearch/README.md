# chatgpt web search auto-selector

firefox extension that automatically selects "web search" for every new chatgpt conversation.

## 🚀 installation & testing

### option 1: manual installation (recommended)

1. **install firefox** (if not already installed):
   - download from: https://www.mozilla.org/en-US/firefox/new/
   - make sure to get the 64-bit version

2. **load the extension**:
   - open firefox
   - go to `about:debugging#/runtime/this-firefox`
   - click "load temporary add-on"
   - select the built `.zip` file: `web-ext-artifacts/cursor_chatgpt_web-search_default-0.1.0.zip`

3. **test functionality**:
   - navigate to `https://chatgpt.com/` or `https://chat.openai.com/`
   - start a new conversation
   - **the extension should automatically click tools → web search**

### option 2: automated testing (requires firefox installation)

```bash
npm run dev         # opens firefox with temporary profile + extension
npm run dev-profile # opens firefox with YOUR MAIN PROFILE + extension  
```

**important**: `dev-profile` loads the extension into your actual firefox profile with all your bookmarks, passwords, and settings.

### option 3: chrome testing (alternative)

the extension also works in chrome:
1. go to `chrome://extensions/`
2. enable "developer mode"
3. click "load unpacked" 
4. select the project folder (not the zip)

## 🔧 development

```bash
npm run lint   # check code quality
npm run build  # create distribution package
```

## 📁 project structure

```
cursor-chatgpt-websearch/
├── manifest.json          # extension configuration
├── content.js             # chatgpt page interaction
├── background.js          # tab event handling
└── web-ext-artifacts/     # built packages
    └── cursor_chatgpt_web-search_default-0.1.0.zip
```

## 🛠️ how it works

1. **background script** detects chatgpt page loads
2. **content script** waits for tools button (`#system-hint-button`)
3. **automatically clicks** tools → "web search" menu item
4. **handles spa navigation** within chatgpt

## 🐛 troubleshooting

### firefox not found error
if you see `spawn firefox.exe ENOENT`:
- install firefox from mozilla.org
- or use manual installation method above

### extension not working
- check browser console for errors
- verify chatgpt hasn't changed ui selectors
- try refreshing the page

## 📋 browser compatibility

- ✅ firefox (manifest v3)
- ✅ chrome (with minor api differences)
- ❌ safari (different extension system)