import App from './app';

const port = parseInt(process.env.PORT || '3000', 10);

new App().Listen(port);
