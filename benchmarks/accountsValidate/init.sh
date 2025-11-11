#!/bin/sh

wrk -d${WRK_TIME_LENGTH:-1m} -t${WRK_THREADS:-4} -c${WRK_CONNECTIONS:-6} --timeout ${WRK_TIMEOUT:-120s} --latency -s ./benchAccountsValidate.lua http://127.0.0.1:8080
