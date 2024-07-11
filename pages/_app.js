import 'normalize.css';
import 'xterm/css/xterm.css';
import '../imports/style.css';
import { appWithTranslation } from 'next-i18next';
import { Provider } from '../src/provider.tsx';

function App({ Component, pageProps }) {
  return (
    <>
      <Provider>
        <Component {...pageProps} />
      </Provider>
    </>
  );
}

export default appWithTranslation(App);
