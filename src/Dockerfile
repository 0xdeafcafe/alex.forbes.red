FROM microsoft/dotnet:latest

COPY . /app

WORKDIR /app

RUN ["dotnet", "restore"]

RUN ["dotnet", "build"]

EXPOSE 3000/tcp

CMD [ "dotnet", "run", "--server.urls", "http://*:3000" ]
