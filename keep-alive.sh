#!/bin/bash

# ClaimSense Keep-Alive Script
# This script pings the backend services to keep them alive on Render

# Configuration
BACKEND_URL="https://claimsense-backend.onrender.com"
CHATBOT_URL="https://claimsense-chatbot.onrender.com"
LOG_FILE="keep-alive.log"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to log with timestamp
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Function to ping a service
ping_service() {
    local name=$1
    local url=$2
    local endpoint=$3
    
    log "${BLUE}🔄 Pinging $name...${NC}"
    
    # Use curl with timeout and headers
    response=$(curl -s -w "%{http_code}" -o /dev/null --max-time 10 "$url$endpoint" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        if [ "$response" -ge 200 ] && [ "$response" -lt 300 ]; then
            log "${GREEN}✅ $name - Status: $response${NC}"
            return 0
        else
            log "${YELLOW}⚠️  $name - Status: $response${NC}"
            return 1
        fi
    else
        log "${RED}❌ $name - Connection failed${NC}"
        return 2
    fi
}

# Main execution
main() {
    log "${BLUE}🚀 Starting ClaimSense keep-alive ping${NC}"
    
    # Create log file if it doesn't exist
    touch "$LOG_FILE"
    
    # Ping main backend
    ping_service "Main Backend" "$BACKEND_URL" "/"
    backend_result=$?
    
    # Ping chatbot backend
    ping_service "Chatbot Backend" "$CHATBOT_URL" "/"
    chatbot_result=$?
    
    # Summary
    log "${BLUE}📈 Summary:${NC}"
    
    if [ $backend_result -eq 0 ]; then
        log "${GREEN}✅ Main Backend: Online${NC}"
    elif [ $backend_result -eq 1 ]; then
        log "${YELLOW}⚠️  Main Backend: Warning${NC}"
    else
        log "${RED}❌ Main Backend: Offline${NC}"
    fi
    
    if [ $chatbot_result -eq 0 ]; then
        log "${GREEN}✅ Chatbot Backend: Online${NC}"
    elif [ $chatbot_result -eq 1 ]; then
        log "${YELLOW}⚠️  Chatbot Backend: Warning${NC}"
    else
        log "${RED}❌ Chatbot Backend: Offline${NC}"
    fi
    
    log "${BLUE}✨ Keep-alive completed${NC}"
    log "----------------------------------------"
}

# Run the script
main 