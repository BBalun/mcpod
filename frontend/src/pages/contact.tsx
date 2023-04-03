const Contact = () => {
  return (
    <main className="container mx-auto my-12 w-fit px-3">
      <div className="flex flex-col justify-center gap-5">
        <h1 className="text-3xl font-light">Credits</h1>
        <section>
          <h2 className="text-xl">Authors and Maintainers:</h2>
          <hr className="mb-2" />
          <ul className="list-inside list-disc">
            <li>
              Gabriel Szász{" "}
              <span className="font-light">
                (gszasz (at) physics (dot) muni (dot) cz)
              </span>
            </li>
            <li>
              Jan Janík{" "}
              <span className="font-light">
                (honza (at) physics (dot) muni (dot) cz)
              </span>
            </li>
            <li>
              Zdeněk Mikulášek{" "}
              <span className="font-light">
                (mikulas (at) physics (dot) muni (dot) cz)
              </span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl">Development Support:</h2>
          <hr className="mb-2" />
          <ul className="list-inside list-disc">
            <li>
              Gabriel Szász{" "}
              <span className="font-light">
                (gszasz (at) physics (dot) muni (dot) cz)
              </span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl">Data Mining:</h2>
          <hr className="mb-2" />
          <ul className="list-inside list-disc">
            <li>
              Jan Janík{" "}
              <span className="font-light">
                (honza (at) physics (dot) muni (dot) cz)
              </span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl">Suggestions and Testing:</h2>
          <hr className="mb-2" />
          <ul className="list-inside list-disc">
            <li>
              Jan Janík{" "}
              <span className="font-light">
                (honza (at) physics (dot) muni (dot) cz)
              </span>
            </li>
            <li>
              Miloslav Zejda{" "}
              <span className="font-light">
                (zejda (at) physics (dot) muni (dot) cz)
              </span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl">Financial Support:</h2>
          <hr className="mb-2" />
          <ul className="list-inside list-disc">
            <li>Grant Agency of AS CR (grant GA205/06/0217)</li>
          </ul>
        </section>
      </div>
    </main>
  );
};

export default Contact;
