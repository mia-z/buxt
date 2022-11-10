FROM frolvlad/alpine-glibc

WORKDIR /app

RUN apk update && \
    apk add curl bash unzip && \
    curl https://bun.sh/install > ./install.sh && \
    chmod a+x install.sh && \
    ./install.sh

SHELL ["/bin/bash", "-c"]

RUN touch ~/.bashrc && \
    echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc && \
    echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc && \
    source ~/.bashrc && \
    bun init -y && \
    bun a buxt && \
    bun install

COPY routes/ /app/routes
COPY dev.ts /app/dev.ts
COPY entrypoint.sh /app/entrypoint.sh

RUN chmod a+x entrypoint.sh

EXPOSE 3001

CMD ["bash", "entrypoint.sh"]