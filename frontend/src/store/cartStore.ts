import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  stock: number;
  imagen_url: string;
}

interface CartState {
  items: CartItem[];
  agregar: (item: Omit<CartItem, 'cantidad'>, cantidad?: number) => void;
  quitar: (producto_id: number) => void;
  cambiarCantidad: (producto_id: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (producto, cantidad = 1) => {
        set((state) => {
          const existente = state.items.find(
            (i) => i.producto_id === producto.producto_id,
          );
          if (existente) {
            const nuevaCantidad = Math.min(
              existente.cantidad + cantidad,
              producto.stock,
            );
            return {
              items: state.items.map((i) =>
                i.producto_id === producto.producto_id
                  ? { ...i, cantidad: nuevaCantidad, stock: producto.stock }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                ...producto,
                cantidad: Math.min(cantidad, producto.stock),
              },
            ],
          };
        });
      },

      quitar: (producto_id) => {
        set((state) => ({
          items: state.items.filter((i) => i.producto_id !== producto_id),
        }));
      },

      cambiarCantidad: (producto_id, cantidad) => {
        if (cantidad <= 0) {
          get().quitar(producto_id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.producto_id === producto_id
              ? { ...i, cantidad: Math.min(cantidad, i.stock) }
              : i,
          ),
        }));
      },

      vaciar: () => set({ items: [] }),

      total: () =>
        get().items.reduce(
          (acc, item) => acc + item.precio_unitario * item.cantidad,
          0,
        ),
    }),
    {
      name: 'foodstore-cart',
    },
  ),
);