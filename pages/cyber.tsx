import dynamic from "next/dynamic";
// import os from 'os';
// import constants from '../imports/constants.json';
// import '../background_worker';

// @ts-ignore
// console.log('os', os);
// import('../background_worker').then(r => console.log('../background_worker', r));
// import '../db_worker';

const Page = dynamic(() => import('../imports/cyber'), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export default function({ ...props }) {
  // @ts-ignore
  // const page = <Page {...props}/>;
  // return <>
  //   {page}
  // </>;
  return <div/>
}