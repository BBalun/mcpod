const Button = ({
  type,
  children,
}: {
  type: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
  children: React.ReactNode;
}) => {
  return (
    <button
      type={type}
      className="ease focus:shadow-outline m-2 select-none rounded-md border border-gray-700 px-4 py-2 text-gray-700 transition duration-500 focus:outline-none"
    >
      {children}
    </button>
  );
};

export default Button;
