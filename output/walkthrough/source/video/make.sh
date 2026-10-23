#!/bin/sh
# make.sh <learner|company> [workers]: renders segments in parallel straight into ffmpeg, then joins them into one MP4.
set -e
name=$1; n=${2:-5}; fps=30
dur=$(node -e "global.window={}; eval(require('fs').readFileSync('tl-$name.js','utf8')); console.log(window.TL.duration)")
total=$(python3 -c "import math; print(math.ceil($dur*$fps))")
rm -f seg-$name-*.mp4
per=$(( (total + n - 1) / n ))
for i in $(seq 0 $((n-1))); do
  from=$((i*per)); to=$(( (i+1)*per )); [ $to -gt $total ] && to=$total
  node render.mjs $name pipe $fps $from $to > render-$name.$i.log 2>&1 &
done
wait
ls seg-$name-*.mp4 | sed "s/^/file '/; s/$/'/" > seg-$name.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i seg-$name.txt -c copy -movflags +faststart walkthrough-$name.mp4
rm -f seg-$name-*.mp4 seg-$name.txt
ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames:format=duration,size -of compact walkthrough-$name.mp4
echo "expected $total frames"
