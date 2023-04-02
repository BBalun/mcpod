import Search from "../components/Search";

const Home = () => {
  return (
    <main className="flex h-[500px] items-center">
      <StarsBackground />
      <section className="mx-auto w-full sm:w-2/3 lg:w-1/2 lg:max-w-3xl">
        <Search />
      </section>
    </main>
  );
};

function StarsBackground() {
  return (
    <div className="star-bg absolute h-[500px] w-full overflow-hidden">
      <div id="stars"></div>
      <div id="stars2"></div>
      <div id="stars3"></div>
    </div>
  );
}

export default Home;
