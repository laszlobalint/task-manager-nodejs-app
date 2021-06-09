const app = require('./app');

app.listen(process.env.PORT, () => console.log(`Web Server has started on port ${process.env.PORT}!`));
