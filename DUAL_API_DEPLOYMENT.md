# 🚀 Dual API Key Deployment Guide

This guide will help you deploy ClaimSense using Render Blueprint for backend services and Vercel for frontend, with separate API keys for each service.

## 📋 Prerequisites

- GitHub repository: `vandandalvi/insurance-claim-genai`
- **Two Google Gemini API keys**:
  - API Key 1: For main backend (`app.py`)
  - API Key 2: For chatbot (`appi.py`)
- Render account (free tier available)
- Vercel account (free tier available)

## 🎯 Deployment Architecture

- **Frontend**: Vercel (React + Vite)
- **Backend API**: Render (Flask) - Uses API Key 1
- **Chatbot API**: Render (Flask) - Uses API Key 2

## 🚀 Step 1: Deploy Backend Services with Render Blueprint

### 1.1 Create Blueprint Instance

1. **Go to [Render.com](https://render.com)** and sign up/login
2. **Click "New +" → "Blueprint"**
3. **Connect your GitHub repository**: `vandandalvi/insurance-claim-genai`
4. **Render will automatically detect the `render.yaml` file**

### 1.2 Configure Environment Variables

Before deploying, you need to set both API keys:

1. **In the Blueprint setup page**, you'll see environment variables section
2. **Add these environment variables:**

   **For Backend Service:**
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your first API key (for main backend)
   - **Description**: API key for main backend (app.py)

   **For Chatbot Service:**
   - **Key**: `GEMINI_API_KEY_CHATBOT`
   - **Value**: Your second API key (for chatbot)
   - **Description**: API key for chatbot (appi.py)

### 1.3 Deploy

1. **Click "Create Blueprint Instance"**
2. **Render will automatically create 2 services:**
   - ✅ `claimsense-backend` (Main API - uses API Key 1)
   - ✅ `claimsense-chatbot` (Chatbot API - uses API Key 2)

3. **Wait for deployment to complete** (5-10 minutes)

### 1.4 Get Your Backend URLs

Once deployment is complete, you'll get:
- **Backend API**: `https://claimsense-backend.onrender.com`
- **Chatbot API**: `https://claimsense-chatbot.onrender.com`

## 🚀 Step 2: Deploy Frontend to Vercel

### 2.1 Create Vercel Project

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

### 2.2 Configure Environment Variables

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

### 2.3 Deploy

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
GEMINI_API_KEY=your_first_api_key_here
FLASK_ENV=production
PYTHON_VERSION=3.11.7
```

### Render Chatbot Environment Variables
```env
GEMINI_API_KEY_CHATBOT=your_second_api_key_here
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
   - Verify `GEMINI_API_KEY` is set correctly
   - Ensure the API key is valid

2. **Chatbot Not Responding**
   - Check Render logs for errors
   - Verify `GEMINI_API_KEY_CHATBOT` is set correctly
   - Ensure the chatbot API key is valid

3. **Frontend Can't Connect to Backend**
   - Verify `VITE_API_URL` and `VITE_CHAT_URL` are correct
   - Check CORS settings in backend
   - Test backend URLs directly

4. **API Key Errors**
   - Ensure both API keys are different and valid
   - Check that each service is using the correct key
   - Verify environment variables are set in the right services

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
- Monitor both backend services
- View logs for each service separately
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
- **Dual API Keys**: Separate keys for better security and rate limiting

### Live URLs
- **Frontend**: Your Vercel URL
- **Backend API**: `https://claimsense-backend.onrender.com`
- **Chatbot API**: `https://claimsense-chatbot.onrender.com`

### Benefits of Dual API Keys
- ✅ **Better Security**: Separate keys for different services
- ✅ **Rate Limiting**: Each service has its own quota
- ✅ **Monitoring**: Track usage per service
- ✅ **Flexibility**: Can rotate keys independently

### Next Steps
1. **Test all features thoroughly**
2. **Set up monitoring and alerts**
3. **Configure custom domain (optional)**
4. **Set up SSL certificates (automatic)**

---

**Need help?** Check the troubleshooting section or contact support! 