#!/bin/bash

NOTICE_FILE="./NOTICE.txt"
LICENSES_FILE="./LICENSES.txt"

# Generate NOTICE.txt with list of dependencies and their license
# Limit to runtime dependencies
cat ./scripts/NOTICE_HEADER.txt > $NOTICE_FILE && yarn licenses list --production >> $NOTICE_FILE;

# Generate LICENSES.txt with list of full text version of the licenses that dependecies use
# Limit to runtime licenses
cat ./scripts/LICENSES_HEADER.txt > $LICENSES_FILE && yarn licenses generate-disclaimer --production >> $LICENSES_FILE;

exit 0;
