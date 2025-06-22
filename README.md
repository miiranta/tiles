# Tiles

SD + WEBDEV Project.

#### Setup and Run

- Create "environments" folder in "app/" and "environment.ts" file inside it with the following content:

```typescript
export const environment = {
  BASE_URL: "localhost",
  PORT: 3000,
};
```

- Create "environments" folder in "api/" and ".env" file inside it with the following content:

```typescript
MONGODB_CONNECTION_STRING = "mongodb://...";
JWT_SECRET = "senha_muito_secreta_e_segura";
PORT = 3000;
```


```typescript
// And if you  want to enable SSL, also add:
DOMAIN='your-domain.com'
EMAIL='your-email@example.com'
```

- Then run the following commands in the terminal:

```bash
cd api
npm run setup 
```

```bash
// With SSL -- ignores PORT and requires DOMAIN and EMAIL
npm start

// Without SSL
npm run dev
```

- Open your browser and navigate to `http://localhost:3000` to see the application in action.
