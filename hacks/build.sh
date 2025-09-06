# get shell path
SOURCE="$0"
while [ -h "$SOURCE"  ]; do
    DIR="$( cd -P "$( dirname "$SOURCE"  )" && pwd  )"
    SOURCE="$(readlink "$SOURCE")"
    [[ $SOURCE != /*  ]] && SOURCE="$DIR/$SOURCE"
done
DIR="$( cd -P "$( dirname "$SOURCE"  )" && pwd  )"

cd $DIR/../
yarn build:docker

tag=`date "+%Y-%m-%d-%H_%M"`

docker image tag substrate-api-sidecar 	registry.cn-hangzhou.aliyuncs.com/wetee_dao/substrate_sidecar:$tag
docker push 	registry.cn-hangzhou.aliyuncs.com/wetee_dao/substrate_sidecar:$tag
echo 	registry.cn-hangzhou.aliyuncs.com/wetee_dao/substrate_sidecar:$tag