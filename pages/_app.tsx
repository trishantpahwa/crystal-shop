import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/providers/AuthProvider";
import { CartProvider } from "@/providers/CartProvider";
import { OrderProvider } from "@/providers/OrderProvider";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <CartProvider>
        <OrderProvider>
          <Component {...pageProps} />
          <Toaster />
        </OrderProvider>
      </CartProvider>
    </AuthProvider>
  );
}
