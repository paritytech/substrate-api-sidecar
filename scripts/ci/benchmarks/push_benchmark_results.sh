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
    benchmark_name=$(echo ${benchmark} | cut -d ":" -f1)
    result=$(cat ${RESULT_FILE} | grep -A 20 ${benchmark} | grep "Avg RequestTime(Latency)" | awk '{print $3}')
    unit=${result: -2}
    result_value=${result::-2}
    echo ${benchmark_name} ${result_value} ${unit}
    push_bench_result -t common-p $CI_PROJECT_NAME -n sidecarb -r ${result_value} -u ${unit} -s ${PROMETHEUS_URL}
    push_bench_result -t specific -p $CI_PROJECT_NAME -n sidecar -r ${result_value} -l 'commit="'${CI_COMMIT_SHORT_SHA}'",benchmark_name="'${benchmark_name}'"' -u ${unit} -s ${PROMETHEUS_URL}
done
