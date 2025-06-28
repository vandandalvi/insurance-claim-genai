# 🚀 Vercel + Render Deployment Guide

This guide will help you deploy ClaimSense using Vercel for frontend and Render for backend.

## 📋 Prerequisites

- GitHub repository: `vandandalvi/insurance-claim-genai`
- Google Gemini API key
- Render account (free tier available)
- Vercel account (free tier available)

## 🎯 Deployment Architecture

- **Frontend**: Vercel (React + Vite)
- **Backend API**: Render (Flask)
- **Chatbot API**: Render (Flask)

## 🚀 Step 1: Deploy Backend to Render

### 1.1 Create Backend Service

1. **Go to [Render.com](https://render.com)** and sign up/login
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**: `vandandalvi/insurance-claim-genai`
4. **Configure the service:**

   **Basic Settings:**
   - **Name**: `claimsense-backend`
   - **Root Directory**: `genai-backend`
   - **Environment**: `Python 3`
   - **Region**: Choose closest to your users
   - **Branch**: `main`

   **Build & Deploy:**
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`

5. **Click "Create Web Service"**

### 1.2 Configure Environment Variables

1. **In the Render dashboard**, go to your `claimsense-backend` service
2. **Click "Environment" tab**
3. **Add the following environment variable:**
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your actual Gemini API key
4. **Click "Save Changes"**

### 1.3 Wait for Deployment

- **Deployment time**: 5-10 minutes
- **You'll get a URL like**: `https://claimsense-backend.onrender.com`

## 🚀 Step 2: Deploy Chatbot to Render

### 2.1 Create Chatbot Service

1. **Click "New +" → "Web Service"** (again)
2. **Connect the same GitHub repository**: `vandandalvi/insurance-claim-genai`
3. **Configure the service:**

   **Basic Settings:**
   - **Name**: `claimsense-chatbot`
   - **Root Directory**: `genai-backend`
   - **Environment**: `Python 3`
   - **Region**: Same as backend
   - **Branch**: `main`

   **Build & Deploy:**
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python appi.py`

4. **Click "Create Web Service"**

### 2.2 Configure Environment Variables

1. **In the Render dashboard**, go to your `claimsense-chatbot` service
2. **Click "Environment" tab**
3. **Add the following environment variable:**
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your actual Gemini API key
4. **Click "Save Changes"**

### 2.3 Wait for Deployment

- **Deployment time**: 5-10 minutes
- **You'll get a URL like**: `https://claimsense-chatbot.onrender.com`

## 🚀 Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Project

1. **Go to [Vercel.com](https://vercel.com)** and sign up/login
2. **Click "New Project"**
3. **Import your GitHub repository**: `vandandalvi/insurance-claim-genai`
4. **Configure the project:**

   **Project Settings:**
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3.2 Configure Environment Variables

1. **In the Vercel dashboard**, go to your project settings
2. **Click "Environment Variables"**
3. **Add the following environment variables:**

   **Production Environment:**
   - **Key**: `VITE_API_URL`
   - **Value**: `https://claimsense-backend.onrender.com`
   - **Environment**: Production

   - **Key**: `VITE_CHAT_URL`
   - **Value**: `https://claimsense-chatbot.onrender.com`
   - **Environment**: Production

   **Preview Environment:**
   - **Key**: `VITE_API_URL`
   - **Value**: `https://claimsense-backend.onrender.com`
   - **Environment**: Preview

   - **Key**: `VITE_CHAT_URL`
   - **Value**: `https://claimsense-chatbot.onrender.com`
   - **Environment**: Preview

4. **Click "Save"**

### 3.3 Deploy

1. **Click "Deploy"**
2. **Wait for deployment to complete** (2-5 minutes)
3. **You'll get a URL like**: `https://your-project-name.vercel.app`

## 🧪 Testing Your Deployment

### 3.1 Test Backend APIs

```bash
# Test main backend
curl https://claimsense-backend.onrender.com

# Test chatbot
curl https://claimsense-chatbot.onrender.com
```

### 3.2 Test Frontend

1. **Visit your Vercel frontend URL**
2. **Use demo accounts:**
   - Mobile: `9028833979` or `9123456780`
   - OTP: `2222`
3. **Test the complete flow:**
   - Upload a document
   - Verify Aadhar
   - Chat with AI assistant
   - Submit claim

## 🔧 Environment Variables Summary

### Render Backend Environment Variables
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
FLASK_ENV=production
PYTHON_VERSION=3.11.7
```

### Render Chatbot Environment Variables
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
FLASK_ENV=production
PYTHON_VERSION=3.11.7
```

### Vercel Frontend Environment Variables
```env
VITE_API_URL=https://claimsense-backend.onrender.com
VITE_CHAT_URL=https://claimsense-chatbot.onrender.com
```

## 🔍 Troubleshooting

### Common Issues

1. **Backend Not Responding**
   - Check Render logs for errors
   - Verify environment variables are set
   - Ensure `GEMINI_API_KEY` is valid

2. **Frontend Can't Connect to Backend**
   - Verify `VITE_API_URL` and `VITE_CHAT_URL` are correct
   - Check CORS settings in backend
   - Test backend URLs directly

3. **Build Failures**
   - Check build logs in Vercel/Render
   - Verify all dependencies are installed
   - Check for syntax errors

### Debug Commands

```bash
# Test backend health
curl https://claimsense-backend.onrender.com

# Test chatbot health
curl https://claimsense-chatbot.onrender.com

# Test API endpoint
curl -X POST https://claimsense-backend.onrender.com/upload
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
- View build logs

## 🔄 Updating Your Application

### Automatic Updates
- Both Vercel and Render support automatic deployments
- Push changes to your GitHub repository
- Deployments will trigger automatically

### Manual Updates
1. **Make your changes locally**
2. **Test thoroughly**
3. **Push to GitHub**
4. **Monitor deployment logs**

## 🎉 Success!

Your ClaimSense application is now live with:
- **Frontend**: Vercel (fast, global CDN)
- **Backend**: Render (reliable Python hosting)
- **Chatbot**: Render (dedicated service)

### Live URLs
- **Frontend**: Your Vercel URL
- **Backend API**: `https://claimsense-backend.onrender.com`
- **Chatbot API**: `https://claimsense-chatbot.onrender.com`

### Next Steps
1. **Test all features thoroughly**
2. **Set up monitoring and alerts**
3. **Configure custom domain (optional)**
4. **Set up SSL certificates (automatic)**

---

**Need help?** Check the troubleshooting section or contact support! 