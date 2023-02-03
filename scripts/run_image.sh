#!/bin/bash
set -euo pipefail

DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ROOT="$( dirname "$DIR" )"

if ! [ -x "$(command -v docker)" ]; then
  echo 'Error: docker is not installed.' >&2
  exit 1
fi

if [[ "$(docker images -q abound-starter-node 2> /dev/null)" == "" ]]; then
  echo 'Error: The Docker image was not found.' >&2
  echo 'Error: Run `./scripts/build_image.sh` to build the image.' >&2
  exit 1
fi

ABOUND_CONFIG_PATH="$ROOT/example_input.json"
if [ -n "${1+set}" ]; then
  ABOUND_CONFIG_PATH="$(readlink "$1")"
fi

ABOUND_OUTPUT_PATH="$PWD/output.png"
if [ -n "${2+set}" ]; then
  ABOUND_OUTPUT_PATH="$(readlink "$2")"
fi
touch "$ABOUND_OUTPUT_PATH"

docker run --rm -it \
  --env ABOUND_CONFIG_PATH="/config/config.json" \
  --env ABOUND_OUTPUT_PATH="/out/output.png" \
  --volume "$ABOUND_CONFIG_PATH:/config/config.json:ro" \
  --volume "$ABOUND_OUTPUT_PATH:/out/output.png" \
  abound-starter-node