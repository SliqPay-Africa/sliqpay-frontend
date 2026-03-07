# Environment Variables Setup Guide

## 📋 Required Environment Variables

SliqPay Frontend requires the following environment variables to function correctly:

### 1. Backend API
```bash
NEXT_PUBLIC_BACKEND_URL=https://sliqpay-backend.vercel.app/api/v1
```
- **Purpose**: Connects frontend to the backend API
- **Where to get**: Your deployed backend URL (currently on Vercel)
- **Local dev**: Use `http://localhost:4000/api/v1` for local backend

### 2. Magic Link Authentication
```bash
NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY=pk_live_XXXXXXXXXXXXXXXX
```
- **Purpose**: Enables passwordless authentication and wallet creation
- **Where to get**: [Magic Dashboard](https://dashboard.magic.link)
- **REQUIRED**: Application won't work without this

### 3. WalletConnect Project ID
```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```
- **Purpose**: Enables Web3 wallet connections
- **Where to get**: [WalletConnect Cloud](https://cloud.walletconnect.com)
- **REQUIRED**: Web3 features won't work without this

### 4. Ethereum RPC (Optional)
```bash
NEXT_PUBLIC_ETHEREUM_RPC=https://eth.llamarpc.com
```
- **Purpose**: Custom Ethereum RPC endpoint
- **Default**: Uses `https://eth.llamarpc.com` if not set
- **Optional**: Can override with your preferred RPC provider

---

## 🚀 Setup Instructions

### Local Development

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local` with your actual values:**
   ```bash
   nano .env.local  # or use your preferred editor
   ```

3. **Restart your dev server:**
   ```bash
   npm run dev
   ```

### Vercel Deployment

You need to set these environment variables in your Vercel project:

#### Option 1: Via Vercel Dashboard (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your `sliqpay-frontend` project
3. Navigate to **Settings** → **Environment Variables**
4. Add each variable:
   - Name: `NEXT_PUBLIC_BACKEND_URL`
   - Value: `https://sliqpay-backend.vercel.app/api/v1`
   - Environments: ✅ Production, ✅ Preview, ✅ Development
5. Repeat for all other variables
6. **Redeploy** your application

#### Option 2: Via Vercel CLI
```bash
# Add backend URL
echo "https://sliqpay-backend.vercel.app/api/v1" | vercel env add NEXT_PUBLIC_BACKEND_URL production

# Add Magic key
echo "pk_live_YOUR_KEY" | vercel env add NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY production

# Add WalletConnect ID
echo "your_project_id" | vercel env add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID production

# Redeploy
vercel --prod
```

---

## ✅ Verification

### Check if variables are loaded:
1. **Build locally:**
   ```bash
   npm run build
   ```
   You should see:
   ```
   🚀 API_BASE: https://sliqpay-backend.vercel.app/api/v1
   ```

2. **Check in browser console (deployed site):**
   - Open DevTools Console
   - You should see the API_BASE log pointing to production backend
   - If you see `http://localhost:4000`, the environment variables aren't loaded

### Common Issues:

❌ **"API_BASE: http://localhost:4000" in production**
- Environment variable not set in Vercel
- Solution: Add `NEXT_PUBLIC_BACKEND_URL` to Vercel project settings

❌ **"Magic not initialized" error**
- Missing or invalid Magic API key
- Solution: Get key from Magic Dashboard and add to environment variables

❌ **Wallet connection fails**
- Missing WalletConnect Project ID
- Solution: Create project at WalletConnect Cloud and add ID to environment variables

---

## 🔒 Security Notes

- ✅ `.env.local` is already in `.gitignore` - never commit it!
- ✅ All variables prefixed with `NEXT_PUBLIC_` are exposed to the browser (this is intentional)
- ✅ Never put secret keys (like private keys or server secrets) in `NEXT_PUBLIC_` variables
- ✅ Backend secrets belong in the backend `.env` file only

---

## 📝 Current Configuration

**Production Backend:** https://sliqpay-backend.vercel.app
**Frontend Domain:** https://sliqpay-frontend.vercel.app

**Status:**
- ✅ Backend URL configured
- ⏳ Magic key needs to be added (placeholder)
- ⏳ WalletConnect ID needs to be added (placeholder)

---

## 🛠 Next Steps

1. **Get your Magic API key:**
   - Sign up at https://magic.link
   - Create a new app
   - Copy your publishable key (starts with `pk_live_`)

2. **Get your WalletConnect Project ID:**
   - Sign up at https://cloud.walletconnect.com
   - Create a new project
   - Copy your Project ID

3. **Update environment variables:**
   - Update `.env.local` for local development
   - Update Vercel environment variables for production

4. **Test the deployment:**
   - Visit https://sliqpay-frontend.vercel.app
   - Try logging in with Magic Link
   - Verify API calls go to production backend
