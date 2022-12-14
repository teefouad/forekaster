/**
 * Dependency imports
 */
import type { AppProps } from 'next/app';
import { QueryClientProvider, QueryClient } from 'react-query';

/**
 * Local imports
 */
import '../styles/globals.scss';

/**
 * Init
 */
const queryClient = new QueryClient();

/**
 * App
 */
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}

export default MyApp;
