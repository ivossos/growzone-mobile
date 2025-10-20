# 🧪 Testing Guide - Growzone Mobile

**Quick guide to test the app with mock or real users**

---

## 🌐 Access the App

### Option 1: Public URL (Share with anyone)
```
https://3b052a6cc8e1.ngrok-free.app
```

### Option 2: Local Development
```
http://localhost:8081
```

---

## 🚀 Quick Start (Mock User)

### 1. Open the App
Use either the public ngrok URL or localhost URL above

### 2. Click "Conectar-se" (Sign In)

### 3. Use Mock Credentials
```
Email ou Username: test@growzone.co
Senha: Test123!
```

### 4. You're In!
- ✅ Instant login
- ✅ No backend required
- ✅ Full app access
- ✅ Mock feed with sample posts

---

## 👥 Available Mock Users

### User 1: Test User (Default)
```
Email: test@growzone.co
Username: testuser
Password: Test123!
Name: Você
```

### User 2: Developer
```
Email: dev@growzone.co
Username: devuser
Password: Test123!
Name: devuser
```

### User 3: Regular User
```
Email: user@growzone.co
Username: regularuser
Password: Test123!
Name: regularuser
```

### User 4: Premium User
```
Email: premium@growzone.co
Username: premiumuser
Password: Test123!
Name: premiumuser
```

---

## 🎯 What to Test with Mock Users

### ✅ Home Feed
1. View 2 sample posts
2. See user avatars and names
3. Check like counts and comments
4. Test post interactions
5. Verify timestamps display

### ✅ Chat Features
1. Go to Chat tab
2. Open existing conversations
3. Send text messages
4. Try media upload (camera/gallery)
5. Test emoji picker
6. Record voice messages
7. See typing indicators

### ✅ Stories (Weestory)
1. Go to Stories
2. Test web camera
3. Capture photo
4. Record video
5. View stories
6. See progress bars
7. Test reactions
8. Add replies

### ✅ Navigation
1. Open drawer menu
2. Navigate between tabs
3. Access profile
4. Test all menu items

### ✅ UI Components
1. Check header customization
2. Test bottom navigation
3. Verify modals/sheets
4. Test forms and inputs

---

## 🔐 Create Real User Account

If you need to test with real backend:

### 1. Go to Sign Up
```
http://localhost:8081/sign-up
```

### 2. Fill in Details
- Nome completo
- Email
- Nome de usuário
- Senha (min 6 caracteres)

### 3. Verify Email (if required)
- Check your email
- Click verification link

### 4. Complete Onboarding
- Select category
- Add profile info

---

## 🐛 Known Limitations with Mock Users

### Mock Users CAN:
- ✅ Login instantly
- ✅ Navigate the app
- ✅ See UI components
- ✅ View mock feed posts
- ✅ Test offline features
- ✅ Access all screens and menus

### Mock Users CANNOT:
- ❌ Make real API calls (data won't persist)
- ❌ Create new posts (will fail to save)
- ❌ Like/comment on posts (won't persist)
- ❌ Receive real push notifications
- ❌ Upload files to server (files are mocked)
- ❌ Interact with real users
- ❌ Test WebSocket real-time features

---

## 🔄 Switch Between Users

### Logout
1. Open drawer menu
2. Click "Encerrar sessão"
3. Login with different credentials

### Quick Switch
1. Clear browser storage (F12 → Application → Clear Storage)
2. Refresh page
3. Login again

---

## 📊 Testing Checklist

### Mock User Testing (Offline)
- [ ] Login with mock credentials
- [ ] View home feed (2 sample posts)
- [ ] Check post UI (avatars, likes, comments)
- [ ] Navigate all tabs
- [ ] Open chat conversations
- [ ] Send messages
- [ ] Try media picker
- [ ] Test emoji picker
- [ ] Record voice message
- [ ] View stories
- [ ] Create story (web camera)
- [ ] Test reactions
- [ ] Open drawer menu
- [ ] Test profile screen
- [ ] Logout

### Real User Testing (Backend)
- [ ] Sign up new account
- [ ] Verify email
- [ ] Complete onboarding
- [ ] Set username
- [ ] Select category
- [ ] Upload profile picture
- [ ] Send real message
- [ ] Create real story
- [ ] Test push notifications
- [ ] Test real-time updates

---

## 🔍 Debug Mode

### View Console Logs
1. Open DevTools (F12)
2. Go to Console tab
3. Look for:
   - `⚠️ DEV MODE: Mock authentication successful`
   - `⚠️ DEV MODE: Mock user detected`

### Check Mock User ID
Mock users have IDs starting with `mock-`:
```
mock-testuser
mock-devuser
mock-regularuser
mock-premiumuser
```

---

## 💡 Tips

### Fastest Testing
Use mock users - instant login, no setup

### Most Realistic Testing
Create real account - tests full backend integration

### Testing Both
1. Use mock user for UI/UX testing
2. Use real user for API/backend testing
3. Compare behaviors

---

## ❓ Troubleshooting

### Mock Login Not Working?
- Check you're in development mode (NODE_ENV=development)
- Clear browser cache
- Check console for errors

### Real Login Not Working?
- Verify backend is running
- Check network tab in DevTools
- Confirm credentials are correct
- Check email verification status

### Redirect Loops?
- Should be fixed now
- Clear browser storage
- Hard refresh (Cmd+Shift+R or Ctrl+F5)

---

## 🚀 Ready to Test!

**Quick Path:**
1. Open https://3b052a6cc8e1.ngrok-free.app (or http://localhost:8081)
2. Login: test@growzone.co / Test123!
3. Explore the app!

**What's New:**
- ✅ Mock feed with 2 sample posts
- ✅ No more "Erro ao carregar dados"
- ✅ All safety checks in place
- ✅ Public ngrok URL for sharing

**Questions?**
- See TEST_CREDENTIALS.md for more details
- See MOCK_AUTH_FIX.md for technical docs
- See TESTING_READY.md for full checklist

---

**Last Updated:** 20 de Outubro, 2025
