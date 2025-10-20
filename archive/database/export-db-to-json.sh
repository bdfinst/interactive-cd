#!/bin/bash
# Export database to JSON file
# Usage: npm run db:export

set -e

echo "📦 Exporting database to JSON..."

psql -d interactive_cd -t -c "
SELECT json_build_object(
  'practices', (
    SELECT json_agg(
      json_build_object(
        'id', id,
        'name', name,
        'type', type,
        'category', category,
        'description', description,
        'requirements', requirements,
        'benefits', benefits
      )
      ORDER BY name
    )
    FROM practices
  ),
  'dependencies', (
    SELECT json_agg(
      json_build_object(
        'practice_id', practice_id,
        'depends_on_id', depends_on_id
      )
      ORDER BY practice_id, depends_on_id
    )
    FROM practice_dependencies
  ),
  'metadata', (
    SELECT json_object_agg(key, value)
    FROM metadata
  )
)
" | jq '.' > src/lib/data/cd-practices.json

echo "✅ Exported to src/lib/data/cd-practices.json"
echo ""
echo "📊 Summary:"
echo "  Practices: $(jq '.practices | length' src/lib/data/cd-practices.json)"
echo "  Dependencies: $(jq '.dependencies | length' src/lib/data/cd-practices.json)"
echo "  Version: $(jq -r '.metadata.version' src/lib/data/cd-practices.json)"
