function Home() {
  return (
    <div className="min-h-screen bg-[#fffaf4] px-6 py-10">
      {/* NAVBAR */}
      <header className="flex items-center justify-between">
        {/* Left Logo Ribbon */}
        {/* Logo ribbon */}
        <div className="relative">
         {/* green shape */}
        <div className="w-56 h-16 bg-[#215c4c] [clip-path:polygon(0_0,100%_0,100%_60%,50%_100%,0_60%)]" />
  
        {/* centered text */}
        <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white font-semibold text-xl font-serif tracking-wide">
            MannSathi
        </span>
        </div>
</div>

        {/* NAV LINKS */}
        <nav className="flex items-center gap-10 text-[15px] font-medium text-neutral-800">
          <a className="hover:text-[#215c4c] cursor-pointer">Home</a>
          <a className="hover:text-[#215c4c] cursor-pointer">About Us</a>
          <a className="hover:text-[#215c4c] cursor-pointer">Services</a>

          {/* Search icon */}
          <div className="h-9 w-9 flex items-center justify-center rounded-full bg-white border shadow hover:shadow-md cursor-pointer">
            🔍
          </div>
        </nav>
      </header>

  
{/* HERO SECTION */}
<section className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-10 items-center px-4">

  {/* LEFT TEXT AREA */}
  <div className="ml-4">   {/* ← small shift only */}
    
    {/* pastel chips */}
    <div className="flex gap-4 mb-6">
      <div className="h-3 w-16 rounded-full bg-[#f7d8dd]" />
      <div className="h-3 w-16 rounded-full bg-[#f7e7a6]" />
    </div>

    {/* MAIN TEXT (bigger + cleaner) */}
    <p className="text-[24px] leading-[1.65] text-neutral-900 font-medium">
      Your <span className="font-semibold">Mental health</span> is just <br />
      as important as <br />
      your physical health, <br />
      take care of both.
    </p>

    {/* underline */}
    <div className="mt-4">
      <div className="h-[2px] w-28 rounded-full bg-[#d2c3b4]" />
      <div className="h-[1px] w-20 mt-1 rounded-full bg-[#e4d9cb]" />
    </div>

    {/* Buttons row */}
<div className="mt-6 flex gap-4">
  {/* Book Appointment */}
  <button className="inline-flex items-center rounded-full border border-[#89ad8f] bg-[#e3f3e6] px-8 py-3 text-[16px] font-semibold text-[#305b39] shadow-[0_4px_0_0_#89ad8f] hover:translate-y-[1px] hover:shadow-[0_3px_0_0_#89ad8f] transition">
    Book Appointment
  </button>

  {/* Login button – same style, slightly lighter */}
  <button className="inline-flex items-center rounded-full border border-[#89ad8f] bg-[#e3f3e6] px-8 py-3 text-[16px] font-semibold text-[#305b39] shadow-[0_4px_0_0_#89ad8f] hover:translate-y-[1px] hover:shadow-[0_3px_0_0_#89ad8f] transition">
    Login
  </button>
</div>

  </div>

{/* RIGHT ILLUSTRATION */}
<div className="flex justify-center md:justify-start ml-4">
  <div className="relative">

    {/* Outer white oval */}
    <div className="h-72 w-80 rounded-[50%] bg-white flex items-center justify-center shadow-sm">
      
      {/* Inner peach oval */}
      <div className="h-64 w-72 rounded-[50%] bg-[#ffe1d6] flex items-center justify-center overflow-hidden">

        {/* Avatar */}
        <img
          src="/src/assets/avatar1.jpg"
          alt="Avatar"
          className="h-full w-full object-contain bg-white"
        />
      </div>
    </div>

  </div>
</div>


</section>


     <section className="mt-24">
  <div className="overflow-x-auto scrollbar-hide pl-12"> 
    {/* pl-12 → pushes the whole card row to the RIGHT */}
    
    <div className="flex gap-10 snap-x snap-mandatory">

      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="snap-center min-w-[310px] bg-[#ffe5d6] rounded-xl border border-[#f3ccb3] shadow-lg"
        >

          {/* Titles */}
          <div className="flex justify-between items-start px-6 pt-6">
            <div>
              <p className="font-semibold text-lg text-neutral-900">
                Anger Management
              </p>
              <p className="text-sm text-neutral-600 mt-1">
                Improve communication
              </p>
            </div>

            {/* Status indicator */}
            <div className="h-7 w-7 flex items-center justify-center bg-white shadow rounded-full mt-1">
              <div className="h-3.5 w-3.5 rounded-full bg-[#24c5a7]" />
            </div>
          </div>

          {/* Image */}
          <img
            src="/src/assets/avatar2.jpg"
            className="mt-5 w-full h-72 object-cover rounded-b-xl"
            alt="therapy"
          />

        </div>
      ))}

    </div>
  </div>
</section>

    </div>
  );
}

export default Home;
