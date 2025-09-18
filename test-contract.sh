#!/bin/bash

# Certificate Contract CLI Testing Script
# Usage: ./test-contract.sh [command] [args...]

CONTRACT_ADDRESS="0xb90c5b3fe62f463af697b6bc53ac579b0b2f0f2a"
NFT_CONTRACT_ADDRESS="0xde5b750ebbc0a92a53614f18081e72609f09bc69"
RPC_URL="https://api.avax-test.network/ext/bc/C/rpc"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Certificate Contract CLI Tester${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

print_usage() {
    echo "Usage: $0 [command] [args...]"
    echo ""
    echo "Commands:"
    echo "  issue <recipient_name> <recipient_address>  - Issue a new certificate"
    echo "  verify <certificate_id>                     - Verify a certificate"
    echo "  revoke <certificate_id>                     - Revoke a certificate"
    echo "  transfer <cert_id> <new_owner>              - Transfer certificate ownership"
    echo "  get <certificate_id>                        - Get certificate details"
    echo "  count                                       - Get total certificate count"
    echo "  test-all                                    - Run comprehensive tests"
    echo ""
    echo "Examples:"
    echo "  $0 issue \"John Doe\" 0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
    echo "  $0 verify 1"
    echo "  $0 get 1"
    echo ""
}

# Check if private key is set
check_private_key() {
    if [ -z "$PRIVATE_KEY" ]; then
        echo -e "${RED}Error: PRIVATE_KEY environment variable not set${NC}"
        echo "Please set your private key:"
        echo "export PRIVATE_KEY=your_private_key_here"
        exit 1
    fi
}

# Issue a certificate
issue_certificate() {
    local recipient_name="$1"
    local recipient_address="$2"

    if [ -z "$recipient_name" ] || [ -z "$recipient_address" ]; then
        echo -e "${RED}Error: Missing arguments${NC}"
        echo "Usage: $0 issue <recipient_name> <recipient_address>"
        exit 1
    fi

    check_private_key

    echo -e "${YELLOW}Issuing certificate to $recipient_name at $recipient_address...${NC}"

    # Call the issueCertificate function
    cast send $CONTRACT_ADDRESS \
        "issueCertificate(string,address)" \
        "$recipient_name" \
        "$recipient_address" \
        --private-key $PRIVATE_KEY \
        --rpc-url $RPC_URL \
        --gas-limit 500000

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Certificate issued successfully!${NC}"
    else
        echo -e "${RED}Failed to issue certificate${NC}"
    fi
}

# Verify a certificate
verify_certificate() {
    local cert_id="$1"

    if [ -z "$cert_id" ]; then
        echo -e "${RED}Error: Missing certificate ID${NC}"
        echo "Usage: $0 verify <certificate_id>"
        exit 1
    fi

    echo -e "${YELLOW}Verifying certificate ID: $cert_id${NC}"

    result=$(cast call $CONTRACT_ADDRESS \
        "verifyCertificate(uint256)" \
        $cert_id \
        --rpc-url $RPC_URL)

    if [ "$result" = "true" ]; then
        echo -e "${GREEN}✓ Certificate $cert_id is valid${NC}"
    elif [ "$result" = "false" ]; then
        echo -e "${RED}✗ Certificate $cert_id is invalid or revoked${NC}"
    else
        echo -e "${YELLOW}? Certificate $cert_id does not exist${NC}"
    fi
}

# Get certificate details
get_certificate() {
    local cert_id="$1"

    if [ -z "$cert_id" ]; then
        echo -e "${RED}Error: Missing certificate ID${NC}"
        echo "Usage: $0 get <certificate_id>"
        exit 1
    fi

    echo -e "${YELLOW}Getting certificate details for ID: $cert_id${NC}"

    result=$(cast call $CONTRACT_ADDRESS \
        "certificates(uint256)" \
        $cert_id \
        --rpc-url $RPC_URL)

    echo "Raw result: $result"

    # Parse the result (this is a simplified parsing)
    if [ "$result" != "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" ]; then
        echo -e "${GREEN}Certificate exists!${NC}"
        echo "Full data: $result"
    else
        echo -e "${RED}Certificate does not exist${NC}"
    fi
}

# Revoke a certificate
revoke_certificate() {
    local cert_id="$1"

    if [ -z "$cert_id" ]; then
        echo -e "${RED}Error: Missing certificate ID${NC}"
        echo "Usage: $0 revoke <certificate_id>"
        exit 1
    fi

    check_private_key

    echo -e "${YELLOW}Revoking certificate ID: $cert_id${NC}"

    cast send $CONTRACT_ADDRESS \
        "revokeCertificate(uint256)" \
        $cert_id \
        --private-key $PRIVATE_KEY \
        --rpc-url $RPC_URL \
        --gas-limit 200000

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Certificate revoked successfully!${NC}"
    else
        echo -e "${RED}Failed to revoke certificate${NC}"
    fi
}

# Transfer certificate
transfer_certificate() {
    local cert_id="$1"
    local new_owner="$2"

    if [ -z "$cert_id" ] || [ -z "$new_owner" ]; then
        echo -e "${RED}Error: Missing arguments${NC}"
        echo "Usage: $0 transfer <certificate_id> <new_owner_address>"
        exit 1
    fi

    check_private_key

    echo -e "${YELLOW}Transferring certificate $cert_id to $new_owner${NC}"

    cast send $CONTRACT_ADDRESS \
        "transferCertificate(uint256,address)" \
        $cert_id \
        $new_owner \
        --private-key $PRIVATE_KEY \
        --rpc-url $RPC_URL \
        --gas-limit 300000

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Certificate transferred successfully!${NC}"
    else
        echo -e "${RED}Failed to transfer certificate${NC}"
    fi
}

# Get certificate count
get_count() {
    echo -e "${YELLOW}Getting total certificate count...${NC}"

    result=$(cast call $CONTRACT_ADDRESS \
        "certificateCount()" \
        --rpc-url $RPC_URL)

    echo -e "${GREEN}Total certificates issued: $result${NC}"
}

# Run comprehensive tests
test_all() {
    echo -e "${BLUE}Running comprehensive contract tests...${NC}"
    echo ""

    # Test 1: Get current count
    echo -e "${YELLOW}Test 1: Getting certificate count${NC}"
    get_count
    echo ""

    # Test 2: Try to verify non-existent certificate
    echo -e "${YELLOW}Test 2: Verifying non-existent certificate${NC}"
    verify_certificate 999
    echo ""

    # Test 3: Get non-existent certificate
    echo -e "${YELLOW}Test 3: Getting non-existent certificate${NC}"
    get_certificate 999
    echo ""

    echo -e "${GREEN}Basic tests completed!${NC}"
    echo -e "${YELLOW}To run write tests, set PRIVATE_KEY and use:${NC}"
    echo "  $0 issue \"Test User\" 0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
}

# Main script logic
case "$1" in
    "issue")
        issue_certificate "$2" "$3"
        ;;
    "verify")
        verify_certificate "$2"
        ;;
    "revoke")
        revoke_certificate "$2"
        ;;
    "transfer")
        transfer_certificate "$2" "$3"
        ;;
    "get")
        get_certificate "$2"
        ;;
    "count")
        get_count
        ;;
    "test-all")
        test_all
        ;;
    *)
        print_header
        print_usage
        ;;
esac
