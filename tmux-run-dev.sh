#!/bin/bash

name="el-plus-admin-backend"

if ! tmux ls | grep -q "^$name:"; then
	tmux new-session -ds $name
	tmux send-keys -t $name 'pnpm run dev' C-m
fi