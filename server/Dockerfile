FROM ubuntu:20.04

# Install Node.js
RUN apt-get update
RUN apt-get install --yes curl
RUN curl --silent --location https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install --yes nodejs build-essential fonts-roboto
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update
RUN apt-get install --yes yarn
RUN DEBIAN_FRONTEND=noninteractive apt-get install --yes msttcorefonts

# Setting working directory. All the path will be relative to WORKDIR
WORKDIR /app/server

ADD ./client /app/client
ADD ./server /app/server
ADD ./shared /app/shared
COPY .eslintrc.js /app/server
COPY .eslintrc.js /app/shared
COPY .prettierrc.js /app/server
COPY .prettierrc.js /app/shared
RUN yarn

# Expose server
EXPOSE 3000

