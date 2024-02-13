import dynamic from "next/dynamic";

// import '../background_worker';
// import '../db_worker';

// import Page from '../imports/_abc';
const Page = dynamic(() => import('../imports/cyber'), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export default function({ ...props }) {
  // @ts-ignore
  const page = <Page {...props}/>;
  return <>
    {page}
  </>;
}