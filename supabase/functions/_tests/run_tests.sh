#!/bin/bash

# =============================================================================
# Edge Function Test Runner
# =============================================================================
# 
# This script runs all Edge Function tests for the Sports Registration System.
# 
# Prerequisites:
#   1. Deno installed (https://deno.land)
#   2. Supabase project running (local or remote)
#   3. Environment variables set
#
# Usage:
#   ./run_tests.sh                    # Run all tests
#   ./run_tests.sh auth               # Run specific test file
#   ./run_tests.sh --filter "signup"  # Run tests matching filter
#
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Print header
echo -e "${BLUE}=================================================${NC}"
echo -e "${BLUE}  Sports Registration System - Edge Function Tests${NC}"
echo -e "${BLUE}=================================================${NC}"
echo ""

# Check for environment variables
check_env() {
    local missing=0
    
    if [ -z "$SUPABASE_URL" ]; then
        echo -e "${RED}ERROR: SUPABASE_URL is not set${NC}"
        missing=1
    fi
    
    if [ -z "$SUPABASE_ANON_KEY" ]; then
        echo -e "${RED}ERROR: SUPABASE_ANON_KEY is not set${NC}"
        missing=1
    fi
    
    if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        echo -e "${RED}ERROR: SUPABASE_SERVICE_ROLE_KEY is not set${NC}"
        missing=1
    fi
    
    if [ $missing -eq 1 ]; then
        echo ""
        echo -e "${YELLOW}Please set the required environment variables:${NC}"
        echo ""
        echo "  export SUPABASE_URL=https://your-project.supabase.co"
        echo "  export SUPABASE_ANON_KEY=your-anon-key"
        echo "  export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
        echo ""
        echo "Or load from .env file:"
        echo ""
        echo "  source .env"
        echo ""
        exit 1
    fi
    
    echo -e "${GREEN}Environment variables loaded${NC}"
    echo "  SUPABASE_URL: ${SUPABASE_URL:0:40}..."
}

# Check Deno installation
check_deno() {
    if ! command -v deno &> /dev/null; then
        echo -e "${RED}ERROR: Deno is not installed${NC}"
        echo ""
        echo "Install Deno from: https://deno.land"
        echo ""
        exit 1
    fi
    
    echo -e "${GREEN}Deno version: $(deno --version | head -n 1)${NC}"
}

# Run tests
run_tests() {
    local test_file="$1"
    local filter="$2"
    
    echo ""
    echo -e "${BLUE}Running tests...${NC}"
    echo ""
    
    local test_args=(
        "test"
        "--allow-net"
        "--allow-env"
        "--allow-read"
    )
    
    # Add filter if provided
    if [ -n "$filter" ]; then
        test_args+=("--filter" "$filter")
    fi
    
    # Add specific test file or all tests
    if [ -n "$test_file" ] && [ "$test_file" != "--filter" ]; then
        # Check if it's a full filename or just the module name
        if [[ "$test_file" == *"_test.ts" ]]; then
            test_args+=("$SCRIPT_DIR/$test_file")
        else
            test_args+=("$SCRIPT_DIR/${test_file}_test.ts")
        fi
    else
        # Run all tests
        test_args+=("$SCRIPT_DIR/")
    fi
    
    # Execute tests
    deno "${test_args[@]}"
}

# Global variables for parsed arguments
PARSED_TEST_FILE=""
PARSED_FILTER=""

# Parse arguments (sets global variables)
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --filter|-f)
                PARSED_FILTER="$2"
                shift 2
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            --list|-l)
                list_tests
                exit 0
                ;;
            *)
                PARSED_TEST_FILE="$1"
                shift
                ;;
        esac
    done
}

# Show help
show_help() {
    echo "Usage: ./run_tests.sh [options] [test_file]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -l, --list     List all test files"
    echo "  -f, --filter   Run only tests matching the filter"
    echo ""
    echo "Examples:"
    echo "  ./run_tests.sh                     # Run all tests"
    echo "  ./run_tests.sh auth                # Run auth tests only"
    echo "  ./run_tests.sh --filter 'signup'   # Run tests containing 'signup'"
    echo "  ./run_tests.sh sports --filter 'create'  # Run sports create tests"
    echo ""
    echo "Test Files:"
    echo "  auth            - Authentication and profile tests"
    echo "  sports          - Sports CRUD and admin actions"
    echo "  registrations   - Registration flow tests"
    echo "  payments        - Payment and refund tests"
    echo "  notifications   - Notification tests"
    echo "  analytics       - Analytics endpoint tests"
    echo "  admin           - Admin panel tests"
}

# List test files
list_tests() {
    echo "Available test files:"
    echo ""
    for file in "$SCRIPT_DIR"/*_test.ts; do
        if [ -f "$file" ]; then
            local basename=$(basename "$file")
            local count=$(grep -c "Deno.test" "$file" 2>/dev/null || echo "0")
            echo "  ${basename%.ts} ($count tests)"
        fi
    done
}

# Main execution
main() {
    # Parse arguments
    parse_args "$@"
    
    # Check prerequisites
    check_env
    check_deno
    
    # Run tests
    run_tests "$PARSED_TEST_FILE" "$PARSED_FILTER"
    
    echo ""
    echo -e "${GREEN}All tests completed!${NC}"
}

# Handle specific arguments before main
if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
    show_help
    exit 0
fi

if [[ "$1" == "--list" ]] || [[ "$1" == "-l" ]]; then
    list_tests
    exit 0
fi

main "$@"
