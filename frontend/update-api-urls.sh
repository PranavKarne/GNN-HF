#!/bin/bash

# Script to update all localhost:5000 references to use API config
# Run from frontend directory

echo "🔄 Updating API endpoints to use config..."

# Files to update
files=(
  "src/pages/SignupPage.tsx"
  "src/pages/dashboard/ProfilePage.tsx"
  "src/pages/dashboard/UploadPage.tsx"
  "src/pages/dashboard/DashboardPage.tsx"
  "src/pages/dashboard/HistoryPage.tsx"
)

# Add import statement if not present
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # Check if import already exists
    if ! grep -q "import.*API_ENDPOINTS.*from.*@/config/api" "$file"; then
      # Find the last import statement
      last_import_line=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)
      
      if [ ! -z "$last_import_line" ]; then
        # Add import after last import
        sed -i '' "${last_import_line}a\\
import { API_ENDPOINTS } from \"@/config/api\";\\
import { getAuthHeaders, getAuthHeadersForFormData } from \"@/config/apiUtils\";
" "$file"
        echo "✅ Added imports to $file"
      fi
    fi
  fi
done

echo "✨ Done! Remember to manually replace localhost URLs with API_ENDPOINTS constants"
echo ""
echo "Example replacements:"
echo "  http://localhost:5000/api/auth/signup → API_ENDPOINTS.SIGNUP"
echo "  http://localhost:5000/api/predict → API_ENDPOINTS.PREDICT"
echo "  http://localhost:5000/api/get-reports → API_ENDPOINTS.GET_REPORTS"
