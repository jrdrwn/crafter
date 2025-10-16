import parse from 'html-react-parser';

import Header from '../../components/shared/header';

export default async function Page() {
  const res = await fetch('http://localhost:3000/api/chat');
  const markdown = await res.json();
  return (
    <>
      <Header />
      <div className="mx-auto prose dark:prose-invert">
        {parse(markdown.result.bullets)}
      </div>
    </>
  );
}
