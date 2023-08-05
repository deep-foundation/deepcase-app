import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ColorModeScript } from '@chakra-ui/react';
import theme from '@deep-foundation/deepcase/imports/theme/theme';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps }
  }

  render() {
    const needAnalitics = !this.props.dangerousAsPath.includes('analitics=0');
    console.log('needAnalitics', needAnalitics);
    // (async () => {
    //   localStorage.logs = 0;
    //   if (typeof (window) !== undefined) {
    //     await import('aframe');
    //     localStorage.debug = localStorage.debug.replace('*:error,*:info,*:warn', '');
    //   }
    // })();
    return (
      <Html>
        <Head>
          <link href="https://fonts.googleapis.com/css2?family=Comfortaa&display=swap" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/css2?family=Comfortaa&display=swap" rel="stylesheet" />
          {!!needAnalitics && <>
            <script
              async
              src="https://www.googletagmanager.com/gtag/js?id=G-DC5RRWLRNV"
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'G-DC5RRWLRNV');
                `,
              }}
            />
          </>}
          {/* <script src="https://gftruj.github.io/hand.tracking.controls.extras/dist/aframe-hand-tracking-controls-extras.js"></script>
          <script src="https://gftruj.github.io/hand.tracking.controls.extras/components/dist/hand-tracking-controls-extras-components.js"> </script> */}
        </Head>
        <body>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument;
