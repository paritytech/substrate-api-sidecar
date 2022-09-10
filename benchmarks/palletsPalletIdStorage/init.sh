#!/bin/sh

wrk -d1m -t4 -c6 --timeout 120s --latency -s ./benchPalletsPalletIdStorage.lua http://127.0.0.1:8080
