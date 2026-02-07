#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $0 <target>"
  echo "    target = none | win | linux | docker"
  exit 1
fi

TARGET="$1"

case "$TARGET" in
  none)
    ./scripts/build-plain.sh
    ;;

  win)
    ./scripts/build-win32-amd64.sh
    ;;
  
  linux)
    echo "Eseguo script per ambiente TEST"
    ./scripts/build-linux-amd64.sh
    ;;
  
  docker)
    echo "Eseguo script per ambiente PROD"
    ./scripts/build-docker.sh
    ;;
  
  *)
    echo "Invalid target: $TARGET"
    exit 1
    ;;
esac
