import '@/styles/globals.css';
import Layout from '@/components/Layout';
import { useState, useEffect } from 'react';
import SplashScreen from '@/components/SplashScreen';

export default function App({ Component, pageProps, router }) {
  const [splashFinished, setSplashFinished] = useState(false);

  return (
    <>
      {!splashFinished && <SplashScreen onComplete={() => setSplashFinished(true)} />}
      <Layout>
        <Component {...pageProps} key={router.route} />
      </Layout>
    </>
  );
}


