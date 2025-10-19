# 🚀 Deploy Growzone to TestFlight - Instructions for Deployment Helper

This guide is for someone helping deploy the Growzone app to TestFlight when the main developer's Apple account is blocked.

---

## 📦 What You'll Receive

You should have received:
1. **This entire project folder** (growzone-mobile)
2. **Access credentials** (if needed for backend/Expo account)
3. **This deployment guide**

---

## ✅ Prerequisites You Need

### 1. **Apple Developer Account** (REQUIRED)
- Must be an **active paid account** ($99/year)
- Must have **Admin** or **App Manager** role
- Bundle ID `com.growzone.growzonesocial` must be registered
- Or you can create a new Bundle ID and update the project

### 2. **Expo Account**
- You'll need access to the Expo account: `growzone.inc`
- OR create a new Expo account and update the project
- Project ID: `4d859901-20e9-4392-abbf-6b712137f7a7`

### 3. **Software Installed**
- Node.js (v18 or higher)
- npm or yarn
- EAS CLI (will install in steps below)

---

## 🎯 Deployment Options

You have 3 options:

### **Option A: Cloud Build with EAS (Easiest - No Mac Required)**
✅ Recommended if you don't have a Mac
✅ EAS handles everything in the cloud
✅ Takes 15-30 minutes

### **Option B: Local Build (Requires Mac)**
✅ If you have a Mac with Xcode
✅ More control over the process
✅ Faster for iterations

### **Option C: Transfer to Your Apple Account**
✅ Use your own Apple Developer account
✅ Change Bundle ID to your own
✅ Full control

---

## 🚀 OPTION A: Cloud Build with EAS (Recommended)

### Step 1: Install Dependencies

```bash
# Navigate to the project folder
cd growzone-mobile

# Install Node modules
npm install

# Install EAS CLI globally
npm install -g eas-cli
```

### Step 2: Login to Expo

```bash
# Login with Expo credentials
eas login

# Enter credentials for: growzone.inc
# (Get credentials from the main developer)
```

### Step 3: Configure Apple Credentials

```bash
# Configure Apple Developer credentials
eas build:configure
```

When prompted:
- Select **iOS**
- Choose **"Let EAS handle credentials"** (easiest)
- Enter your **Apple ID** (with valid Developer account)
- Enter your **App-Specific Password**

**How to generate App-Specific Password:**
1. Go to https://appleid.apple.com
2. Sign in with your Apple ID
3. Go to **Security** section
4. Click **Generate Password** under App-Specific Passwords
5. Label it "EAS CLI" and copy the password

### Step 4: Build for TestFlight

```bash
# Build and auto-submit to TestFlight
eas build --platform ios --profile production --auto-submit
```

**What happens next:**
1. ✅ EAS uploads the code to their servers
2. ✅ Builds the iOS app in the cloud (15-30 min)
3. ✅ Signs it with your Apple certificates
4. ✅ Automatically submits to TestFlight
5. ✅ You get an email when it's done

### Step 5: Monitor Build Progress

```bash
# Check build status
eas build:list --platform ios

# View build details
eas build:view [BUILD_ID]
```

Or visit: https://expo.dev/accounts/growzone.inc/projects/growzone/builds

### Step 6: TestFlight Configuration

After the build is uploaded:

1. Go to https://appstoreconnect.apple.com
2. Navigate to **My Apps** > **Growzone**
3. Go to **TestFlight** tab
4. Wait for processing (5-15 minutes)
5. Add **Internal Testers**:
   - TestFlight > Internal Testing
   - Click "+" to add testers
   - Enter email addresses
6. Or add **External Testers** (requires Apple review):
   - TestFlight > External Testing
   - Create a new group
   - Add testers and submit for review

### Step 7: Share TestFlight Link

Once approved, you'll get a public link:
```
https://testflight.apple.com/join/[UNIQUE-CODE]
```

Share this link with testers!

---

## 🖥️ OPTION B: Local Build (Mac Required)

### Step 1: Install Xcode

```bash
# Install Xcode from App Store (if not installed)
# Make sure Xcode Command Line Tools are installed:
xcode-select --install
```

### Step 2: Setup Project

```bash
cd growzone-mobile
npm install

# Generate iOS native project
npx expo prebuild --platform ios
```

### Step 3: Open in Xcode

```bash
# Open the workspace in Xcode
open ios/growzone.xcworkspace
```

### Step 4: Configure Signing in Xcode

1. Select the **growzone** project in the navigator
2. Select the **growzone** target
3. Go to **Signing & Capabilities** tab
4. **Automatically manage signing** (check this)
5. Select your **Team** (Apple Developer account)
6. Bundle Identifier should be: `com.growzone.growzonesocial`

### Step 5: Archive the App

1. In Xcode menu: **Product** > **Destination** > **Any iOS Device**
2. **Product** > **Archive**
3. Wait for the archive to complete (5-10 minutes)
4. **Window** > **Organizer** opens automatically

### Step 6: Distribute to TestFlight

1. In Organizer, select the latest archive
2. Click **Distribute App**
3. Select **TestFlight & App Store**
4. Click **Next** through the options
5. Select your signing certificate
6. Click **Upload**

### Step 7: Wait for Processing

Go to App Store Connect and monitor the processing status.

---

## 🔄 OPTION C: Use Your Own Apple Account

If you want to use your own Bundle ID and Apple account:

### Step 1: Update app.json

```json
{
  "expo": {
    "name": "Growzone",
    "slug": "growzone",
    "ios": {
      "bundleIdentifier": "com.YOURCOMPANY.growzone", // ← Change this
      "buildNumber": "1"
    }
  }
}
```

### Step 2: Register Bundle ID in Apple Developer Portal

1. Go to https://developer.apple.com/account
2. **Certificates, IDs & Profiles** > **Identifiers**
3. Click **+** to create new identifier
4. Select **App IDs** > **Continue**
5. Enter:
   - Description: Growzone
   - Bundle ID: `com.YOURCOMPANY.growzone`
   - Capabilities: Camera, Microphone, Push Notifications
6. Click **Register**

### Step 3: Create App in App Store Connect

1. Go to https://appstoreconnect.apple.com
2. **My Apps** > **+** > **New App**
3. Fill in:
   - Platform: iOS
   - Name: Growzone
   - Language: Portuguese (Brazil) or English
   - Bundle ID: Select your new Bundle ID
   - SKU: growzone-mobile
4. Click **Create**

### Step 4: Update EAS Project (Optional)

```bash
# Create new EAS project
eas build:configure

# This will update eas.json with new project ID
```

### Step 5: Build

```bash
# Build with your credentials
eas build --platform ios --profile production
```

---

## 📋 Release Notes for TestFlight

When you upload to TestFlight, use these release notes:

```
🎉 Growzone v1.0.20 - Stories & Chat Update

✨ New Features:

📸 Stories (Weestory)
• Capture photos and videos
• 24-hour auto-expiring stories
• View counter with viewers list
• Quick reactions (❤️🔥👏😂😮😍)
• Reply system integrated with chat
• Smooth progress bars and transitions
• Works on both mobile and web!

💬 Enhanced Chat
• Real-time messaging via WebSocket
• Typing indicators
• Online/offline status
• Read receipts (✓✓)
• Support for audio, images, replies
• Beautiful UI matching Figma design

🎨 UI/UX Improvements
• Smooth animations throughout
• Visual progress effects
• Refined colors and spacing
• Optimized performance

🐛 Bug Fixes
• VisionCamera compatibility on all platforms
• Memory management improvements
• Navigation fixes
• General optimizations

📱 Tested on:
• iPhone 12 Pro and newer
• iOS 15.1+
• Web browsers (Chrome, Safari, Firefox)
```

---

## 🔍 Checklist Before Building

- [ ] All dependencies installed (`npm install`)
- [ ] No TypeScript errors (`npm run tsc`)
- [ ] App runs locally (`npm run ios` or `npm run web`)
- [ ] Environment variables point to production
- [ ] Version number updated in app.json (currently 1.0.20)
- [ ] Apple Developer account active and paid
- [ ] Bundle ID registered in Apple Developer Portal
- [ ] App created in App Store Connect (if new)

---

## 🆘 Troubleshooting

### "Invalid Bundle Identifier"
```bash
# Check app.json has correct bundleIdentifier
# Must match what's registered in Apple Developer Portal
```

### "Provisioning Profile not found"
```bash
# Clear cache and rebuild
eas build --clear-cache --platform ios
```

### "Apple ID login failed"
```bash
# Make sure you're using an App-Specific Password
# NOT your regular Apple ID password
```

### Build takes too long
```bash
# Check build status
eas build:list

# View logs
eas build:view [BUILD_ID]
```

### TestFlight not showing build
- Wait 10-15 minutes after upload
- Check App Store Connect > Activity
- Build might be in "Processing" status
- Check for any compliance questions that need answering

---

## 📊 Timeline Estimate

| Step | Time |
|------|------|
| Setup & install dependencies | 10-15 min |
| Configure credentials | 5-10 min |
| EAS cloud build | 15-30 min |
| Upload to TestFlight | 5 min |
| Apple processing | 10-15 min |
| **Total** | **45-75 min** |

---

## 🔐 Security Notes

### Credentials to Request:

1. **Expo Account** (if using existing):
   - Username: growzone.inc
   - Password: [REQUEST FROM OWNER]

2. **Apple ID** (your own):
   - Must have valid Apple Developer Program membership
   - Need to generate App-Specific Password

3. **Backend APIs** (already configured):
   - Production API: https://api.growzone.co
   - WebSocket: wss://api.growzone.co
   - Auth API: https://auth.growzone.co

### Don't Share:
- Apple App-Specific Passwords
- EAS build credentials
- Private keys or certificates

---

## 📱 After Successful Deploy

### 1. Notify the Main Developer
Send them:
- TestFlight public link
- Build number
- Any issues encountered
- Screenshots of successful upload

### 2. Add Initial Testers
- Add the main developer as a tester
- Add yourself for verification
- Add 2-3 team members

### 3. Collect Feedback
- Use TestFlight's built-in feedback
- Monitor crashes in App Store Connect
- Create a feedback channel (Slack/Discord)

### 4. Prepare for Next Build
If you need to do future builds:
- EAS credentials are saved
- Next builds will be faster
- Can update version and build again

---

## 🔗 Useful Links

- **EAS Documentation**: https://docs.expo.dev/build/introduction/
- **TestFlight Guide**: https://developer.apple.com/testflight/
- **App Store Connect**: https://appstoreconnect.apple.com
- **Apple Developer**: https://developer.apple.com/account
- **Expo Dashboard**: https://expo.dev/accounts/growzone.inc/projects/growzone

---

## 💡 Quick Command Reference

```bash
# Login
eas login

# Build for iOS (cloud)
eas build --platform ios --profile production

# Build and auto-submit
eas build --platform ios --profile production --auto-submit

# Check build status
eas build:list

# Submit existing build
eas submit --platform ios --latest

# View credentials
eas credentials

# Clear cache if issues
eas build --clear-cache
```

---

## 📞 Support

If you run into issues:

1. **Check EAS Documentation**: https://docs.expo.dev/build/
2. **Expo Discord**: https://chat.expo.dev
3. **Stack Overflow**: Tag with `expo` and `eas`
4. **Contact main developer** for project-specific questions

---

## ✅ Success Criteria

You'll know it worked when:

1. ✅ Build completes without errors
2. ✅ Shows up in App Store Connect > TestFlight
3. ✅ Status changes from "Processing" to "Ready to Test"
4. ✅ You can add testers and they receive invites
5. ✅ App installs and runs on test devices
6. ✅ All features work (Stories, Chat, etc.)

---

**Good luck with the deployment! 🚀**

*This guide was created: October 19, 2025*
*Project: Growzone Mobile v1.0.20*
*Bundle ID: com.growzone.growzonesocial*
