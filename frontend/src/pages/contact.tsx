import { useStaticContent } from "../hooks/useStaticContent";

const Contact = () => {
  const contactHtml = useStaticContent("contact");

  return (
    <main className="container mx-auto my-12 w-fit px-3">
      <div
        className="flex flex-col justify-center gap-5"
        dangerouslySetInnerHTML={{ __html: contactHtml ?? "" }}
      ></div>
    </main>
  );
};

export default Contact;
