#!/bin/bash

echo "🚀 ClaimSense Deployment Script"
echo "================================"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not in a git repository. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

# Check if we have a remote repository
if ! git remote get-url origin &> /dev/null; then
    echo "❌ No remote repository found. Please add your GitHub repository:"
    echo "   git remote add origin https://github.com/yourusername/your-repo-name.git"
    exit 1
fi

echo "✅ Git repository found"

# Check if we have uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  You have uncommitted changes. Please commit them first:"
    echo "   git add ."
    echo "   git commit -m 'Your commit message'"
    exit 1
fi

echo "✅ All changes committed"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub"
else
    echo "❌ Failed to push to GitHub"
    exit 1
fi

echo ""
echo "🎉 Ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Go to https://render.com and sign up/login"
echo "2. Click 'New +' → 'Blueprint'"
echo "3. Connect your GitHub repository"
echo "4. Set environment variable GEMINI_API_KEY with your API key"
echo "5. Click 'Create Blueprint Instance'"
echo ""
echo "Your application will be deployed to:"
echo "- Frontend: https://claimsense-frontend.onrender.com"
echo "- Backend: https://claimsense-backend.onrender.com"
echo "- Chatbot: https://claimsense-chatbot.onrender.com"
echo ""
echo "For detailed instructions, see DEPLOYMENT.md" 