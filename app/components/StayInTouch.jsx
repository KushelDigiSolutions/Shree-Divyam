export default function StayInTouch() {
  return (
    <section className="bg-[#8a1d45] py-12 text-white">
      <div className="mx-auto max-w-[1220px] px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-[36px] font-medium">Let&apos;s Stay In Touch</h2>

        <form className="mx-auto grid max-w-[780px] gap-4 grid-cols-1 md:grid-cols-[1fr_1fr_160px]">
          <div>
            <label className="mb-2 block text-[12px] text-[#f1d9e4]">Full Name</label>
            <input
              type="text"
              placeholder="Enter your name..."
              className="h-11 w-full border border-[#c98aa3] bg-transparent px-4 text-[13px] outline-none placeholder:text-[#e0bfd0]"
            />
          </div>

          <div>
            <label className="mb-2 block text-[12px] text-[#f1d9e4]">Email Address</label>
            <input
              type="email"
              placeholder="Your email address..."
              className="h-11 w-full border border-[#c98aa3] bg-transparent px-4 text-[13px] outline-none placeholder:text-[#e0bfd0]"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="mt-2 md:mt-0 h-11 w-full border border-[#d8b071] bg-transparent text-[13px] font-medium text-white transition hover:bg-white/10"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}