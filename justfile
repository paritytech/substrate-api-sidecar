default_repo := 'parity'
image := 'substrate-api-sidecar'

# List available commands
_default:
    just --choose --chooser "fzf +s -x --tac --cycle"

# Shows the list of commands
help:
    just --list

# Build the docker image
docker-build repo=default_repo:
    #!/usr/bin/env bash
    echo Building {{image}} and taggin as {{repo}}:{{image}}
    docker build -t {{image}} .
    docker tag {{image}} {{repo}}/{{image}}
    docker images | grep {{image}}

# Publish the image after building it
docker-publish repo=default_repo: (docker-build repo)
    #!/usr/bin/env bash
    echo Publishing {{repo}}:{{image}}
    docker push {{repo}}:{{image}}

# A few simple security checks on the docker image
docker-test repo=default_repo:
    #!/usr/bin/env bash
    docker run -it -d --read-only --name {{image}} {{image}}
    sleep 1

    docker exec -it {{image}} sh -c 'if [[ $(whoami) = 'root' ]]; then echo "❌ Red wins"; else echo "✅ Red lost"; fi'
    docker exec -it {{image}} sh -c 'touch malicious 2>/dev/null; if test -f malicious; then echo "❌ Red wins"; else echo "✅ Red lost"; fi'
    docker exec -it {{image}} sh -c 'touch /tmp/malicious 2>/dev/null; if test -f /tmp/malicious; then echo "❌ Red wins"; else echo "✅ Red lost"; fi'
    docker exec -it {{image}} sh -c 'echo ";;" >> /usr/src/app/build/src/main.js 2>/dev/null; if [ $? -eq 0 ]; then echo "❌ Red wins"; else echo "✅ Red lost"; fi'
    docker exec -it {{image}} sh -c 'echo "<h1>pawned</h1>" >> /usr/src/app/index.html 2>/dev/null; if [ $? -eq 0 ]; then echo "❌ Red wins"; else echo "✅ Red lost"; fi'
    docker exec -it {{image}} sh -c 'if rm /bin/sh 2>/dev/null; then echo "❌ Red wins"; else echo "✅ Red lost"; fi'

    docker rm -f {{image}}
