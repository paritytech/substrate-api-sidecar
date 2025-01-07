#!/bin/sh

for d in ./*/ ; do (cd "$d" && export WRK_TIME_LENGTH=30s; sh init.sh); done
