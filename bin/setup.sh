#!/bin/sh

# Set up dependencies for the project. Run this script immediately after cloning the codebase.

fn_exists()
{
  type $1 | grep -q 'shell function'
}

# Grab node version
node_version=$(<.nvmrc)

# Check for nodejs
if ! hash node 2>/dev/null; then
  echo >&2 "Please install nodejs v$node_version. We recommend using nvm. See https://github.com/creationix/nvm";
  exit 1;
fi

# Install node with nvm
fn_exists nvm || nvm install

fn_exists yarn || yarn run setup

echo "Setup complete!"
