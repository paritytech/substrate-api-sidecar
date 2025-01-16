#!/bin/bash
# The script parses benchmarks.txt file and creates file suitable for https://github.com/benchmark-action/github-action-benchmark
# Usage: generate_benchmark_result.sh <path_to_benchmarks.txt>

RESULT_FILE=$1

if [ -z "${RESULT_FILE}" ]
then
  echo "Usage: $0 <path_to_benchmarks.txt>"
  exit 1
fi


BENCHMARKS=$(cat ${RESULT_FILE} | grep Result | awk '{print $3}')
NBENCHMARKS=$(echo ${BENCHMARKS} | wc -w)
COUNTER=0
echo "["
for benchmark in ${BENCHMARKS}
do
    COUNTER=$((COUNTER+1))
    # "/accounts/{accountId}/balance-info:" -> "accounts-{accountId}-balance-info"
    benchmark_name=$(echo ${benchmark} | cut -d ":" -f1 | sed 's/\///' | sed 's/\//-/g' )
    result=$(cat ${RESULT_FILE} | grep -A 20 ${benchmark} | grep "Avg RequestTime(Latency)" | awk '{print $3}')
    unit=${result: -2}
    result_value=${result::-2}
    echo "  {"
    echo "    \"name\": \"${benchmark_name}\","
    echo "    \"value\": ${result_value},"
    echo "    \"unit\": \"${unit}\""
    if [ $COUNTER -eq $NBENCHMARKS ]
    then
        echo "  }"
    else
        echo "  },"
    fi
done
echo "]"
