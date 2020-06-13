Task Manager Application

Used node js, express, mongodb, mongoose etc.

>Mongodb Server

Install mongodb database server in the folder `mongodb`
```
    - cd mongodb 
    - download and extract archive here.
    - There should be bin folder in the monbodb like mongodb/bin
```

>Run MongoDB server

Run script in the `npm` configuration to run mongoDB
```
    For linux
        npm run mongo
    For Windows
        npm run mongo-win

    - You can also run manually

    Linux   --> mkdir -p ./mongodb/data/db & ./mongodb/bin/mongod --dbpath=./mongodb/data/db

    Windows --> mkdir mongodb/data/db & mongodb/bin/mongod --dbpath=mongodb/data/db
```

>Dev Environment

To run `developlemnt` environment on your computer run command
```
    npm run dev
```

>Tests

To run test cases run command:
```
    npm run test
```

>Note In the *config*  folder exported postman environment and project that could be used to test API

>GIT Settings for development
```
    git init
    ssh-add <github key>
    git remote add origin git@github.com:armosam/taskmanager.git
    git fetch
    git pull origin master
    git push -u origin master
```