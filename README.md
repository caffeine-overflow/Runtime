
# Runtime App

Runtime is a agile project management tool for software development. Now you don't have to open multiple applications to handle your software development process. "Plan, Build or Discuss" we provide solution for all problems in simple, single platform.

Crafted with essential features in a light, simple and mordern design. Almost every features of an "Agile Project Management Software" is included in the app. Along with that the app also have ability to link with github to handle organization level operations. Most of the daily used git operations are handled by just a simple click.

Chat feature is also included in the application so that the members don't have to go to different platforms to communicate. Any member can can message anyone within the organization. Along with messaging, video and group chat features are also supported by the application.

## Authors

- [@Danish Davis](https://github.com/caffeine-overflow)
- [@Prabin Gyawali](https://github.com/Prabin16)



## Demo

https://runtimeapp.herokuapp.com/


## Features

- Github integration
- Chatting
- Sprint planning
- Kanban board
- User management



## Roadmap

- Video Call Feature

- Advanced sprint management

- User notifications

- Additional browser support

- Add more integrations


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

### Backend


`db_connection="mongo db connection string goes here"`

`token_secret="secret key for jwt verification"`

`port="5000"`

`client_domain="http://localhost:3000/"`

`github_client_id="dev account client id"`

`github_client_secret="dev account client secret"`

`runtime_email="email address for sending email"`

`runtime_password="password"`

### Frontend

`REACT_APP_CLIENT_ID="github dev account client_id"`

`REACT_APP_CLIENT_SECRET="dev account client secret"`

`REACT_APP_SERVER="http://localhost:5000/"`

`REACT_APP_SOCKET="http://localhost:5000/"`
## Run Locally

Clone the project

```bash
  git clone https://github.com/caffeine-overflow/Runtime
```

Go to the project directory

```bash
  cd Runtime
```

Install dependencies

```bash
  npm install
```
```bash
  cd Frontend
  npm install
```



Start the server 

```bash
  npm run dev 
  //From the project directory (runs both Frontend and Backend concurrently)
```


## Contributing

Contributions are always welcome!

Contact danishdavis@hotmail.com

## Support

For support, email danishdavis@hotmail.com.


## License

[MIT](https://choosealicense.com/licenses/mit/)


## Badges

[![MIT License](https://img.shields.io/apm/l/atomic-design-ui.svg?)](https://github.com/tterb/atomic-design-ui/blob/master/LICENSEs)

