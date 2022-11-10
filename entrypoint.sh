#!/bin/bash

echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc && \
echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc && \
source ~/.bashrc
bun run dev.ts