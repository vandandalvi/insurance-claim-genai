# 🚀 ClaimSense Deployment Guide

This guide will help you deploy your ClaimSense project to production.

## 📋 Prerequisites

- GitHub account
- Google Gemini API key
- Render account (free tier available)
- Vercel account (free tier available)

## 🎯 Deployment Options

### Option 1: Render (All-in-one) - RECOMMENDED
Deploy both frontend and backend on Render using the `render.yaml` file.

### Option 2: Vercel + Render
Deploy frontend on Vercel and backend on Render.

## 🚀 Option 1: Render All-in-one Deployment

### Step 1: Prepare Your Repository

1. **Push your code to GitHub** (if not already done)
2. **Ensure your repository is public** (for free Render tier)

### Step 2: Deploy on Render

1. **Go to [Render.com](https://render.com)** and sign up/login
2. **Click "New +" → "Blueprint"**
3. **Connect your GitHub repository**
4. **Select the repository** containing your ClaimSense project
5. **Render will automatically detect the `render.yaml` file**

### Step 3: Configure Environment Variables

Before deploying, you need to set up your Gemini API key:

1. **In the Render dashboard**, go to your service
2. **Click "Environment" tab**
3. **Add the following environment variable:**
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your actual Gemini API key

### Step 4: Deploy

1. **Click "Create Blueprint Instance"**
2. **Render will automatically create 3 services:**
   - `claimsense-backend` (Main API)
   - `claimsense-chatbot` (Chatbot API)
   - `claimsense-frontend` (React frontend)

3. **Wait for deployment to complete** (usually 5-10 minutes)

### Step 5: Access Your Application

- **Frontend**: `https://claimsense-frontend.onrender.com`
- **Backend API**: `https://claimsense-backend.onrender.com`
- **Chatbot API**: `https://claimsense-chatbot.onrender.com`

## 🚀 Option 2: Vercel + Render Deployment

### Step 1: Deploy Backend to Render

1. **Go to [Render.com](https://render.com)** and sign up/login
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Name**: `claimsense-backend`
   - **Root Directory**: `genai-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`

5. **Add Environment Variables:**
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your actual Gemini API key

6. **Click "Create Web Service"**

### Step 2: Deploy Chatbot to Render

1. **Click "New +" → "Web Service"**
2. **Connect the same GitHub repository**
3. **Configure the service:**
   - **Name**: `claimsense-chatbot`
   - **Root Directory**: `genai-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python appi.py`

4. **Add Environment Variables:**
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your actual Gemini API key

5. **Click "Create Web Service"**

### Step 3: Deploy Frontend to Vercel

1. **Go to [Vercel.com](https://vercel.com)** and sign up/login
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Configure the project:**
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Add Environment Variables:**
   - **Key**: `VITE_API_URL`
   - **Value**: Your Render backend URL (e.g., `https://claimsense-backend.onrender.com`)
   - **Key**: `VITE_CHAT_URL`
   - **Value**: Your Render chatbot URL (e.g., `https://claimsense-chatbot.onrender.com`)

6. **Click "Deploy"**

## 🔧 Environment Variables

### Backend Environment Variables
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
FLASK_ENV=production
PYTHON_VERSION=3.11.7
```

### Frontend Environment Variables
```env
VITE_API_URL=https://your-backend-url.onrender.com
VITE_CHAT_URL=https://your-chatbot-url.onrender.com
```

## 🧪 Testing Your Deployment

1. **Visit your frontend URL**
2. **Use demo accounts:**
   - Mobile: `9028833979` or `9123456780`
   - OTP: `2222`
3. **Test the complete flow:**
   - Upload a document
   - Verify Aadhar
   - Chat with AI assistant
   - Submit claim

## 🔍 Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Ensure your Gemini API key is valid
   - Check environment variables are set correctly
   - Verify the key has proper permissions

2. **CORS Errors**
   - Backend is already configured with CORS
   - If issues persist, check the CORS configuration in `app.py`

3. **Build Failures**
   - Check the build logs in Render/Vercel
   - Ensure all dependencies are in `requirements.txt`
   - Verify Python version compatibility

4. **Frontend Not Loading**
   - Check if the build completed successfully
   - Verify environment variables are set
   - Check browser console for errors

### Debug Commands

```bash
# Check if backend is running
curl https://your-backend-url.onrender.com

# Check if chatbot is running
curl https://your-chatbot-url.onrender.com

# Test API endpoint
curl -X POST https://your-backend-url.onrender.com/upload
```

## 📊 Monitoring

### Render Dashboard
- Monitor service health
- View logs
- Check resource usage
- Set up alerts

### Vercel Dashboard
- Monitor frontend performance
- View analytics
- Check deployment status

## 🔄 Updating Your Application

### Automatic Updates
- Both Render and Vercel support automatic deployments
- Push changes to your GitHub repository
- Deployments will trigger automatically

### Manual Updates
1. **Make your changes locally**
2. **Test thoroughly**
3. **Push to GitHub**
4. **Monitor deployment logs**

## 🎉 Success!

Your ClaimSense application is now live and ready for users!

### Live URLs
- **Frontend**: Your Vercel/Render frontend URL
- **Backend API**: Your Render backend URL
- **Chatbot API**: Your Render chatbot URL

### Next Steps
1. **Test all features thoroughly**
2. **Set up monitoring and alerts**
3. **Configure custom domain (optional)**
4. **Set up SSL certificates (automatic on Render/Vercel)**

---

**Need help?** Check the troubleshooting section or contact support! 