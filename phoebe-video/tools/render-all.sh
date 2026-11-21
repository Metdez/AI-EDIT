#!/bin/zsh
# check + render every variant, then copy the result to out/ and the final-videos folder
cd "$(dirname "$0")/.."; FINAL="../Phoebe final videos"; mkdir -p out "$FINAL"
for d in videos/${1:-}*/; do n=$(basename $d); (cd $d && npx --yes hyperframes@0.9.72 check 2>&1 | grep -E "errors|Check" | tr '\n' ' ' && npx --yes hyperframes@0.9.72 render -o out/final.mp4 >/dev/null 2>&1 </dev/null); cp $d/out/final.mp4 out/phoebe-$n.mp4 && cp $d/out/final.mp4 "$FINAL/phoebe-$n.mp4"; echo "$n $(ffprobe -v error -show_entries format=duration -of csv=p=0 out/phoebe-$n.mp4)"; done
