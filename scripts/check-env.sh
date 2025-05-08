
#!/bin/bash

# This script checks if essential environment variables are set.
# Add other critical variables here as needed.

MISSING_VARS=0

if [ -z "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" ]; then
  echo "🔴 ERROR: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set."
  echo "Please set it in your .env.local file. You can get your key from the Clerk Dashboard."
  MISSING_VARS=$((MISSING_VARS + 1))
fi

if [ -z "$CLERK_SECRET_KEY" ]; then
  echo "🔴 ERROR: CLERK_SECRET_KEY is not set."
  echo "Please set it in your .env.local file. You can get your key from the Clerk Dashboard."
  MISSING_VARS=$((MISSING_VARS + 1))
fi

if [ $MISSING_VARS -ne 0 ]; then
  echo "---------------------------------------------------------------------"
  echo "🔴 Found $MISSING_VARS missing critical environment variable(s)."
  echo "The application might not run correctly. Please resolve these issues."
  echo "---------------------------------------------------------------------"
  exit 1
else
  echo "✅ All checked environment variables are set."
fi

exit 0
