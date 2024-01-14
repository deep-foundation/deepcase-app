import dynamic from "next/dynamic";

// import Page from '../imports/_abc';
const Page = dynamic(() => import('../imports/cyber'), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export default function({ ...props }) {
  // @ts-ignore
  return <Page {...props}/>;
}