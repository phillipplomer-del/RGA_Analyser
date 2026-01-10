#!/bin/bash
# Setup Git Hooks for RGA Analyser
#
# This script installs optional git hooks that enforce documentation completeness.
#
# Usage: ./scripts/setup-git-hooks.sh

set -e

echo "🔧 Setting up Git Hooks for RGA Analyser..."
echo ""

# Check if .git exists
if [ ! -d ".git" ]; then
  echo "❌ ERROR: Not a git repository. Run this from the project root."
  exit 1
fi

# Create pre-commit hook
PRE_COMMIT_HOOK=".git/hooks/pre-commit"

cat > "$PRE_COMMIT_HOOK" << 'EOF'
#!/bin/bash
# Pre-commit hook: Check feature documentation completeness
#
# This hook runs before each commit to ensure all features are properly documented.
# To bypass this check (emergency only), use: git commit --no-verify

echo "🔍 Checking feature documentation completeness..."

# Run feature completeness check
npm run check:features

# Capture exit code
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "❌ COMMIT BLOCKED: Feature documentation incomplete"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Please fix the errors above before committing."
  echo ""
  echo "If you need to commit anyway (emergency), use:"
  echo "  git commit --no-verify"
  echo ""
  exit 1
fi

echo "✅ Feature documentation check passed"
echo ""

exit 0
EOF

# Make executable
chmod +x "$PRE_COMMIT_HOOK"

echo "✅ Pre-commit hook installed: $PRE_COMMIT_HOOK"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 What happens now:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  ✅ Every commit will check feature documentation completeness"
echo "  ✅ Commits with errors will be blocked automatically"
echo "  ⚠️  To bypass (emergency only): git commit --no-verify"
echo ""
echo "  ℹ️  To remove hook: rm .git/hooks/pre-commit"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Setup complete!"
echo ""
