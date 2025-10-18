import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import userRoutes from './handlers/users';
import productRoutes from './handlers/products';
import cartRoutes from './handlers/carts';
import itemRoutes from './handlers/items';

const app: express.Application = express();
const address = 'http://localhost:3000';

app.use(bodyParser.json());
app.use(userRoutes);
app.use(productRoutes);
app.use(cartRoutes);
app.use(itemRoutes);

app.get('/', async (req: Request, res: Response) => {
  res.send('Hello, CartFlow API is running!');
});

app.listen(3000, () => {
  console.log(`Server is running at ${address}`);
});