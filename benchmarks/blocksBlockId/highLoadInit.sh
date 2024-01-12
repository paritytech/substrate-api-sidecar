#!/bin/sh

wrk -d$WRK_TIME_LENGTH -t4 -c6 --timeout 120s --latency -s ./benchHighLoadBlocks.lua http://127.0.0.1:8080
