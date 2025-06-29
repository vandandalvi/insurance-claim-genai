# ClaimSense Keep-Alive Cronjob Setup

This guide helps you set up automated keep-alive pings to prevent your Render backend services from going offline.

## 🚀 Why Use Keep-Alive?

Render's free tier services go to sleep after 15 minutes of inactivity. This causes:
- **Slow first requests** (cold start)
- **Timeout errors** for users
- **Poor user experience**

## 📋 Available Solutions

### 1. Node.js Script (Recommended)
- **File**: `keep-alive.js`
- **Features**: Detailed logging, error handling, multiple services
- **Usage**: `node keep-alive.js`

### 2. Bash Script
- **File**: `keep-alive.sh`
- **Features**: Simple, lightweight, works on most systems
- **Usage**: `./keep-alive.sh`

## 🔧 Setup Instructions

### Option 1: Using Node.js Script

#### 1. Install Node.js (if not already installed)
```bash
# On Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# On macOS
brew install node

# On Windows
# Download from https://nodejs.org/
```

#### 2. Test the script
```bash
node keep-alive.js
```

#### 3. Set up cronjob
```bash
# Open crontab editor
crontab -e

# Add this line to ping every 10 minutes
*/10 * * * * cd /path/to/your/project && node keep-alive.js >> keep-alive.log 2>&1
```

### Option 2: Using Bash Script

#### 1. Make script executable
```bash
chmod +x keep-alive.sh
```

#### 2. Test the script
```bash
./keep-alive.sh
```

#### 3. Set up cronjob
```bash
# Open crontab editor
crontab -e

# Add this line to ping every 10 minutes
*/10 * * * * cd /path/to/your/project && ./keep-alive.sh
```

## ⏰ Cronjob Timing Options

### Recommended Settings:
- **Every 10 minutes**: `*/10 * * * *` (Best for free tier)
- **Every 15 minutes**: `*/15 * * * *` (Minimum to prevent sleep)
- **Every 5 minutes**: `*/5 * * * *` (More frequent, higher reliability)

### Other Options:
- **Every hour**: `0 * * * *`
- **Every 30 minutes**: `*/30 * * * *`
- **Twice daily**: `0 9,18 * * *`

## 📊 Monitoring Your Services

### Check Logs
```bash
# View recent logs
tail -f keep-alive.log

# View last 50 lines
tail -50 keep-alive.log

# Search for errors
grep "❌" keep-alive.log
```

### Manual Testing
```bash
# Test main backend
curl https://claimsense-backend.onrender.com/

# Test chatbot backend
curl https://claimsense-chatbot.onrender.com/
```

## 🔍 Troubleshooting

### Common Issues:

#### 1. Script Permission Denied
```bash
chmod +x keep-alive.sh
```

#### 2. Node.js Not Found
```bash
# Install Node.js or use bash script instead
sudo apt install nodejs npm
```

#### 3. Cronjob Not Running
```bash
# Check cron service
sudo service cron status

# Check cron logs
sudo tail -f /var/log/cron
```

#### 4. Path Issues
```bash
# Use absolute paths in cronjob
*/10 * * * * cd /home/username/projects/hack && node keep-alive.js
```

## 🌐 Alternative Solutions

### 1. External Monitoring Services
- **UptimeRobot**: Free monitoring with 5-minute intervals
- **Pingdom**: Professional monitoring service
- **StatusCake**: Free tier available

### 2. GitHub Actions (Free)
```yaml
# .github/workflows/keep-alive.yml
name: Keep Alive
on:
  schedule:
    - cron: '*/10 * * * *'
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Backend
        run: |
          curl -s https://claimsense-backend-71pr.onrender.com/
          curl -s https://claimsense-chatbot-71pr.onrender.com/
```

### 3. Render Pro Plan
- **Always-on services** (no sleep)
- **Better performance**
- **Priority support**

## 📈 Performance Impact

### Benefits:
- ✅ **Faster response times** for users
- ✅ **No cold start delays**
- ✅ **Better reliability**
- ✅ **Improved user experience**

### Considerations:
- ⚠️ **Slight increase in costs** (more requests)
- ⚠️ **Log file growth** (manage with log rotation)

## 🔄 Log Rotation

To prevent log files from growing too large:

```bash
# Add to crontab to rotate logs weekly
0 0 * * 0 cd /path/to/your/project && mv keep-alive.log keep-alive.log.old && touch keep-alive.log
```

## 📞 Support

If you encounter issues:
1. Check the logs: `tail -f keep-alive.log`
2. Test manually: `node keep-alive.js`
3. Verify URLs are correct in the script
4. Check cron service: `sudo service cron status`

---

**Note**: This setup ensures your ClaimSense backend services stay responsive for your hackathon demo! 🎯 