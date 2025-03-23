export async function getServerSideProps() {
    const time = new Date().toISOString();
    return {
      props: {
        time,
      },
    };
  }
  
  export default function Home({ time }) {
    return (
      <main>
        <h1>Server-Side Rendered Page</h1>
        <p>Current Server Time: {time}</p>
      </main>
    );
  }
  