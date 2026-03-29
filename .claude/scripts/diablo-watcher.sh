#!/usr/bin/env bash
# diablo-watcher.sh — FileChanged hook for Diablo audit reports
# Exits 2 (asyncRewake) to wake Claude when a .diablo file lands.

# Parse file path from hook stdin JSON using node (always available in this project)
CHANGED_FILE=$(node -e "let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{ try{ console.log(JSON.parse(d).file_path||'') }catch(e){ console.log('') } })" 2>/dev/null)

# Only act on .diablo files; skip files we write ourselves
if [[ "$CHANGED_FILE" != *".diablo"* ]] || [[ "$CHANGED_FILE" == *".processed"* ]]; then
  exit 0
fi

# Resolve .diablo root (handle files inside remediations/ subdir)
DIABLO_DIR=$(dirname "$CHANGED_FILE")
if [[ "$DIABLO_DIR" == *"/remediations" ]] || [[ "$DIABLO_DIR" == *"\\remediations" ]]; then
  DIABLO_DIR=$(dirname "$DIABLO_DIR")
fi

# Gate status
GATE_STATUS="unknown"
if [[ -f "$DIABLO_DIR/gate.json" ]]; then
  GATE_STATUS=$(node -e "try{ const d=require('fs').readFileSync('$DIABLO_DIR/gate.json','utf8'); const j=JSON.parse(d); console.log(j.status||j.gate||'unknown') }catch(e){ console.log('unknown') }" 2>/dev/null)
fi

# List remediation files in priority order
REMED_LIST=$(ls "$DIABLO_DIR/remediations/"*.md 2>/dev/null | sort | sed 's/^/  - /' || echo "  (none yet)")

# Build context and emit hookSpecificOutput JSON
node -e "
const context = \`DIABLO AUDIT REPORT LANDED
===========================
File: ${CHANGED_FILE}
Gate: ${GATE_STATUS}
Root: ${DIABLO_DIR}

EXECUTE NOW:
1. Read ${DIABLO_DIR}/gate.json — overall pass/fail, scores, categories
2. Read ${DIABLO_DIR}/remediations/README.md — prioritised finding index
3. Work through each remediation file in order (critical first):
${REMED_LIST}
4. For each category: spin up a dedicated fix agent
5. After all fixes: npx tsc --noEmit, then commit + push + open PR
6. Update README.md marking each item fixed with the commit hash

Branch: fix/diablo-\$(new Date().toISOString().slice(0,10)) off master\`;

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'FileChanged',
    additionalContext: context
  }
}) + '\n');
"

exit 2
