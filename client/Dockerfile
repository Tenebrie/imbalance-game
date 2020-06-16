FROM ubuntu:20.04

# Install Node.js
RUN apt-get update
RUN apt-get install --yes curl
RUN curl --silent --location https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get install --yes nodejs
RUN apt-get install --yes build-essential

ADD ./client /app/client
ADD ./shared /app/shared
COPY .eslintrc.json /app/client
COPY .eslintrc.json /app/shared

WORKDIR /app/shared
RUN npm install

WORKDIR /app/client
RUN npm install

# Expose server
EXPOSE 8080

