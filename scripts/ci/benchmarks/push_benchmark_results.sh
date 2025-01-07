#!/bin/bash
# The script parses benchmarks.txt file and sends benchmarks results to prometheus
# Usage: push_benchmark_results.sh <path_to_benchmarks.txt>

RESULT_FILE=$1

if [ -z "${RESULT_FILE}" ]
then
  echo "Usage: $0 <path_to_benchmarks.txt>"
  exit 1
fi


BENCHMARKS=$(cat ${RESULT_FILE} | grep Result | awk '{print $3}')

for benchmark in ${BENCHMARKS}
do
    # "/accounts/{accountId}/balance-info:" -> "accounts-{accountId}-balance-info"
    benchmark_name=$(echo ${benchmark} | cut -d ":" -f1 | sed 's/\///' | sed 's/\//-/g' )
    result=$(cat ${RESULT_FILE} | grep -A 20 ${benchmark} | grep "Avg RequestTime(Latency)" | awk '{print $3}')
    unit=${result: -2}
    result_value=${result::-2}
    echo "--------------------------------------------------------------------------"
    echo "Sending metrics for ${benchmark_name} with result: ${result_value} ${unit}"
    echo "Sending common metric"
    push_bench_result -t common -p $CI_PROJECT_NAME -n ${benchmark_name} -r ${result_value} -u ${unit} -s ${PROMETHEUS_URL}
    echo "Sending specific metric"
    push_bench_result -t specific -p $CI_PROJECT_NAME -n ${benchmark_name} -r ${result_value} -l 'commit="'${CI_COMMIT_SHORT_SHA}'"' -u ${unit} -s ${PROMETHEUS_URL}
    echo "--------------------------------------------------------------------------"
done
