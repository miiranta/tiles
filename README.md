# Tiles

SD + WEBDEV Project.

#### Setup and Run

- Create "environments" folder in "api/" and ".env" file inside it with the following content:

```typescript
MONGODB_CONNECTION_STRING = "mongodb://...";
JWT_SECRET = "senha_muito_secreta_e_segura";
PORT = 3000;
```


```typescript
// And if you  want to enable SSL, also add:
SSL='true'
DOMAIN='your-domain.com'
EMAIL='your-email@example.com'
```

- Then run the following commands in the terminal:

```bash
cd api
npm run setup 
```

```bash
npm start
```

- Open your browser and navigate to `http://localhost:3000` (or https://{DOMAIN}) to see the application in action.
