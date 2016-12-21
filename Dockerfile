FROM microsoft/dotnet:1-sdk-projectjson

COPY /src /app

WORKDIR /app

RUN ["dotnet", "restore"]

RUN ["dotnet", "build"]

EXPOSE 3000/tcp

CMD [ "dotnet", "run", "--server.urls", "http://*:3000" ]
