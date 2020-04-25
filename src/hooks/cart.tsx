import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsData = await AsyncStorage.getItem('@GoMarkeplace');

      if (productsData) {
        setProducts(JSON.parse(productsData));
      }
    }

    loadProducts();
  }, []);

  const GetIndexOnProductArray = useCallback(
    (id: string): number => products.findIndex(a => a.id === id),
    [products],
  );

  const addToCart = useCallback(
    async product => {
      const productAddIndex = products.findIndex(a => a.id === product.id);

      if (productAddIndex >= 0) {
        const newArray = [...products];
        newArray[productAddIndex].quantity += 1;
      } else {
        setProducts(state => [...state, { ...product, quantity: 1 }]);
        await AsyncStorage.setItem(
          '@GoMarkeplace',
          JSON.stringify([...products, { ...product, quantity: 1 }]),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productAddIndex = GetIndexOnProductArray(id);
      const oldSate = [...products];

      if (productAddIndex >= 0) {
        oldSate[productAddIndex].quantity += 1;
      }

      setProducts(oldSate);

      await AsyncStorage.setItem('@GoMarkeplace', JSON.stringify(oldSate));
    },
    [products, GetIndexOnProductArray],
  );

  const decrement = useCallback(
    async id => {
      const productAddIndex = GetIndexOnProductArray(id);
      const oldSate = [...products];

      if (productAddIndex >= 0) {
        if (oldSate[productAddIndex].quantity - 1 >= 0) {
          oldSate[productAddIndex].quantity -= 1;
        }
      }
      setProducts(oldSate);

      await AsyncStorage.setItem('@GoMarkeplace', JSON.stringify(oldSate));
    },
    [products, GetIndexOnProductArray],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
