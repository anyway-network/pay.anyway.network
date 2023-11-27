export default function Page() {
  return (
    <div className="flex justify-center items-center p-3 h-[100svh] w-full flex-col gap-2">
      <img src="/logo.svg" className="w-10 h-10 inline-block" alt="logo" />
      <div className="text-2xl font-bold font-logo text-[#5b9763]">
        AnyWay Network
      </div>
      <a
        href="https://anyway.network/"
        className="bg-[#5b9763] text-sm text-white rounded-lg px-4 py-2 hover:bg-[#4a7e4f] transition-colors duration-200 mt-6"
      >
        Home
      </a>
    </div>
  );
}
