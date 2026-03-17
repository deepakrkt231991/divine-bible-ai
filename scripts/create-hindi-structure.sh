#!/bin/bash
# Creates Hindi file structure for all English chapters

for file in public/bible/split/*.json; do
  if [[ "$file" != *"hin-"* ]] && [[ "$file" != *"index.json"* ]]; then
    filename=$(basename "$file")
    hin_file="public/bible/split/hin-${filename}"
    
    if [ ! -f "$hin_file" ]; then
      # Copy structure, replace text with placeholder
      cp "$file" "$hin_file"
      
      # Add language field if not present
      if ! grep -q '"language"' "$hin_file"; then
        sed -i 's/"verses": \[/"language": "hin-hindi",\n  "verses": [/' "$hin_file"
      fi
      
      echo "✅ Created: hin-${filename}"
    fi
  fi
done

echo ""
echo "🎉 All Hindi file structures created!"
echo "📊 Total: $(ls public/bible/split/hin-*.json | wc -l) files"
