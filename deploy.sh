echo "🚀 ClaimSense Deployment Script"
echo "================================"
if ! command -v git &> /dev/null; then
    echo " Git is not installed. Please install Git first."
    exit 1
fi
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo " Not in a git repository. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi
if ! git remote get-url origin &> /dev/null; then
    echo " No remote repository found. Please add your GitHub repository:"
    echo "   git remote add origin https://github.com/yourusername/your-repo-name.git"
    exit 1
fi
echo "Git repository found"
if ! git diff-index --quiet HEAD --; then
    echo "⚠ You have uncommitted changes. Please commit them first:"
    echo "   git add ."
    echo "   git commit -m 'Your commit message'"
    exit 1
fi
echo " All changes committed"
echo " Pushing to GitHub..."
git push origin main
if [ $? -eq 0 ]; then
    echo "Successfully pushed to GitHub"
else
    echo " Failed to push to GitHub"
    exit 1
fi
