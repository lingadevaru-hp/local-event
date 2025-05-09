
#!/bin/bash

# This script checks if essential environment variables are set.
# Add other critical variables here as needed.

MISSING_VARS=0
INVALID_FORMAT_VARS=0

# Check NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
if [ -z "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" ]; then
  echo "🔴 ERROR: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set."
  echo "Please set it in your .env.local file. You can get your key from the Clerk Dashboard."
  MISSING_VARS=$((MISSING_VARS + 1))
else
  # Check if the key starts with pk_test_ or pk_live_ and does not end with $
  if ! [[ "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" =~ ^pk_(test|live)_ && ! "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" =~ \$ $ ]]; then
    echo "🔴 ERROR: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY format appears invalid: '$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'."
    echo "It should start with 'pk_test_' or 'pk_live_' and NOT end with a '$' or other special characters."
    echo "Please verify the key in your .env.local file and from the Clerk Dashboard."
    INVALID_FORMAT_VARS=$((INVALID_FORMAT_VARS + 1))
  fi
fi

# Check CLERK_SECRET_KEY
if [ -z "$CLERK_SECRET_KEY" ]; then
  echo "🔴 ERROR: CLERK_SECRET_KEY is not set."
  echo "Please set it in your .env.local file. You can get your key from the Clerk Dashboard."
  MISSING_VARS=$((MISSING_VARS + 1))
fi

# Check Firebase variables (add more as they become critical for app start)
if [ -z "$NEXT_PUBLIC_FIREBASE_API_KEY" ]; then
  echo "🟡 WARNING: NEXT_PUBLIC_FIREBASE_API_KEY is not set. Firebase features might not work."
fi
if [ -z "$NEXT_PUBLIC_FIREBASE_PROJECT_ID" ]; then
  echo "🟡 WARNING: NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set. Firebase features might not work."
fi


TOTAL_ERRORS=$((MISSING_VARS + INVALID_FORMAT_VARS))

if [ $TOTAL_ERRORS -ne 0 ]; then
  echo "---------------------------------------------------------------------"
  echo "🔴 Found $TOTAL_ERRORS critical environment variable issue(s)."
  echo "The application might not run correctly or at all. Please resolve these issues."
  echo "---------------------------------------------------------------------"
  exit 1
else
  echo "✅ All critical environment variables seem to be set and correctly formatted."
fi

exit 0
